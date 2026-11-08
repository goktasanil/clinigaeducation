import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const prepare = read("../migrations/20261108234455_prepare_public_lead_rpc.sql");
const cutover = read("../migrations/20261108234456_require_public_lead_rpc.sql");
const schema = read("./lead-schema.sql");
const payload = (email = "person@example.invalid") => ({
  name: "Synthetic Applicant",
  email,
  phone: "+12345678901",
  message: "Synthetic request for validation.",
  source: "contact_form",
  startedAt: Date.now() - 3000,
  honeypot: "",
});
let db;
async function submit(value = payload()) {
  return db.query("select * from public.submit_education_lead($1)", [value]);
}
const code = (expected) => (error) => error.code === expected;
test.before(async () => {
  db = new PGlite();
  await db.exec(schema);
  await db.exec(prepare);
  await db.exec(cutover);
});
test.after(async () => {
  await db.close();
});
test.beforeEach(async () => {
  await db.exec(
    "reset role;select set_config('request.jwt.claim.sub','',false);truncate public.leads;set role service_role;",
  );
});

for (const role of ["anon", "authenticated"])
  test(`${role} can call only the bounded form RPC and receives only its new receipt`, async () => {
    await db.exec(`reset role;set role ${role}`);
    const result = await submit();
    assert.deepEqual(Object.keys(result.rows[0]).sort(), ["appointment_at", "confirmation_code"]);
    assert.match(result.rows[0].confirmation_code, /^CG-[A-F0-9]{8}$/);
    assert.deepEqual((await db.query("select email from public.leads")).rows, []);
    await assert.rejects(
      db.query(
        "insert into public.leads(name,email,phone,message) values('Synthetic Applicant','person@example.invalid','+12345678901','Synthetic request')",
      ),
      code("42501"),
    );
  });
test("RPC uses explicit client EXECUTE, definer authority and an empty search path", async () => {
  const { rows } = await db.query(
    "select p.prosecdef,p.proconfig,has_function_privilege('anon',p.oid,'execute') anon_exec,has_function_privilege('authenticated',p.oid,'execute') auth_exec from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='submit_education_lead'",
  );
  assert.deepEqual(rows, [
    { prosecdef: true, proconfig: ['search_path=""'], anon_exec: true, auth_exec: true },
  ]);
});
test("unknown privilege, identity and state fields are rejected rather than silently accepted", async () => {
  await db.exec("reset role;set role anon");
  for (const field of [
    "user_id",
    "role",
    "status",
    "confirmation_code",
    "created_at",
    "id",
    "p_email_hash",
  ])
    await assert.rejects(
      submit({ ...payload(), [field]: "synthetic-forged-value" }),
      code("PT400"),
    );
});
test("required scalar types, field lengths, byte size, honeypot and timing are server enforced", async () => {
  for (const change of [
    { name: 2 },
    { email: "invalid" },
    { phone: "bad" },
    { message: "short" },
    { message: "x".repeat(5001) },
    { honeypot: "bot" },
    { honeypot: null },
    { startedAt: undefined },
    { startedAt: Date.now() },
    { startedAt: 1 },
    { startedAt: 3.14 },
    { service: {} },
    { source: "admin_import" },
    { message: "x".repeat(70000) },
    { deadline: "2030-02-30" },
  ]) {
    await assert.rejects(submit({ ...payload(), ...change }), code("PT400"));
  }
  assert.equal((await db.query("select count(*)::int n from public.leads")).rows[0].n, 0);
});
test("bounded quiz answers are accepted and nested objects or unsupported fields are rejected", async () => {
  const valid = {
    ...payload(),
    source: "quiz",
    quizAnswers: [
      {
        step: 0,
        question: "Synthetic question",
        answer: "Synthetic answer",
        answerIndex: 1,
        key: "intent",
        at: new Date().toISOString(),
      },
    ],
  };
  assert.equal((await submit(valid)).rows.length, 1);
  for (const answers of [
    {},
    Array.from({ length: 51 }, () => valid.quizAnswers[0]),
    [{ ...valid.quizAnswers[0], question: { nested: "x" } }],
    [{ ...valid.quizAnswers[0], user_id: "forged" }],
    [{ ...valid.quizAnswers[0], answer: "x".repeat(501) }],
  ])
    await assert.rejects(submit({ ...payload(), quizAnswers: answers }), code("PT400"));
});
test("normalized UTF-8 JSON is bounded even when escapes or multibyte text inflate serialized size", async () => {
  for (const character of ["\u0001", "😀"]) {
    const quizAnswers = Array.from({ length: 50 }, (_, step) => ({
      step,
      question: character.repeat(500),
      answer: character.repeat(500),
    }));
    await assert.rejects(submit({ ...payload(), source: "quiz", quizAnswers }), code("PT400"));
  }
  assert.equal((await db.query("select count(*)::int n from public.leads")).rows[0].n, 0);
});
test("the normalized email allowance is three per rolling hour across all caller roles", async () => {
  for (let i = 0; i < 3; i++) {
    await db.exec(`reset role;set role ${i % 2 ? "authenticated" : "anon"}`);
    await submit(payload(i % 2 ? " PERSON@EXAMPLE.INVALID " : "person@example.invalid"));
  }
  await assert.rejects(
    submit(),
    (error) => error.code === "PT429" && error.message === "Please try again later.",
  );
  await db.exec("reset role");
  assert.equal((await db.query("select count(*)::int n from public.leads")).rows[0].n, 3);
});
test("the global sixty-per-hour limit cannot be bypassed by rotating email or role", async () => {
  await db.exec("reset role");
  for (let i = 0; i < 60; i++)
    await db.query(
      "insert into public.leads(name,email,phone,message) values('Synthetic Applicant',$1,'+12345678901','Synthetic request')",
      [`synthetic${i}@example.invalid`],
    );
  await db.exec("set role anon");
  await assert.rejects(submit(), code("PT429"));
});
test("expired rows do not consume the rolling window", async () => {
  await db.exec(
    "reset role;insert into public.leads(name,email,phone,message,created_at) select 'Synthetic Applicant','person@example.invalid','+12345678901','Synthetic request',now()-interval '61 minutes' from generate_series(1,60);set role anon;",
  );
  assert.equal((await submit()).rows.length, 1);
});
test("a future permissive INSERT policy or grant cannot bypass restrictive cutover RLS", async () => {
  await db.exec(
    "reset role;grant insert on public.leads to authenticated;create policy accidental_insert on public.leads for insert to authenticated with check(true);set role authenticated;",
  );
  try {
    await assert.rejects(
      db.query(
        "insert into public.leads(name,email,phone,message) values('Synthetic Applicant','person@example.invalid','+12345678901','Synthetic request')",
      ),
      code("42501"),
    );
  } finally {
    await db.exec(
      "reset role;drop policy accidental_insert on public.leads;revoke insert on public.leads from authenticated;",
    );
  }
});
test("count and insert keep the advisory transaction lock and stale isolation fails closed", async () => {
  await db.exec("set role anon;begin");
  await submit();
  assert.equal(
    (
      await db.query(
        "select count(*)::int n from pg_locks where locktype='advisory' and pid=pg_backend_pid() and granted",
      )
    ).rows[0].n,
    1,
  );
  await db.exec("rollback");
  await db.exec("begin isolation level repeatable read");
  await assert.rejects(submit(), code("PT503"));
  await db.exec("rollback");
});
test("appointment validation and uniqueness return generic errors without a duplicate lead", async () => {
  await db.exec("reset role;set role anon");
  for (const appointmentAt of ["invalid", "infinity", new Date(Date.now() - 1000).toISOString()])
    await assert.rejects(submit({ ...payload(), appointmentAt }), code("PT400"));
  const appointmentAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await submit({ ...payload(), appointmentAt });
  await assert.rejects(
    submit({ ...payload("second@example.invalid"), appointmentAt }),
    (error) => error.code === "PT409" && error.message === "This appointment is unavailable.",
  );
  await db.exec("reset role");
  assert.equal((await db.query("select count(*)::int n from public.leads")).rows[0].n, 1);
});
test("phase one keeps the old form working until frontend deployment and explicit cutover", async () => {
  const staged = new PGlite();
  try {
    await staged.exec(schema);
    await staged.exec(prepare);
    await staged.exec(
      "set role anon;insert into public.leads(name,email,phone,message) values('Synthetic Legacy Client','person@example.invalid','+12345678901','Synthetic request');reset role;",
    );
    await staged.exec(cutover);
    await staged.exec("set role anon");
    await assert.rejects(
      staged.exec(
        "insert into public.leads(name,email,phone,message) values('Synthetic Legacy Client','person@example.invalid','+12345678901','Synthetic request')",
      ),
      code("42501"),
    );
  } finally {
    await staged.close();
  }
});
test("administrator read/update policies remain intact after cutover", async () => {
  await submit();
  await db.exec(
    "reset role;select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);set role authenticated;",
  );
  assert.deepEqual(
    (await db.query("update public.leads set status='contacted' returning status")).rows,
    [{ status: "contacted" }],
  );
  await db.exec(
    "reset role;select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);set role authenticated;",
  );
  assert.deepEqual((await db.query("select email from public.leads")).rows, []);
});
