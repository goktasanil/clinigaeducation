/**
 * Real, disposable PostgreSQL execution via PGlite. No project URL or credentials.
 * Optional dependency is deliberately kept outside the application dependency tree:
 * npm install --prefix /tmp/cliniga-sql-validation --no-audit --no-fund @electric-sql/pglite@0.3.15
 * PGLITE_PACKAGE_ROOT=/tmp/cliniga-sql-validation/node_modules/@electric-sql/pglite node --test scripts/iyzico-local-db.test.mjs
 *
 * The mocks below model only auth claims, users, storage metadata and API roles.
 * They do not model GoTrue, PostgREST, Edge Functions, provider APIs or webhooks.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = process.env.PGLITE_PACKAGE_ROOT;
const pgliteModule = packageRoot
  ? pathToFileURL(resolve(packageRoot, "dist/index.js")).href
  : "@electric-sql/pglite";
const pgcryptoModule = packageRoot
  ? pathToFileURL(resolve(packageRoot, "dist/contrib/pgcrypto.js")).href
  : "@electric-sql/pglite/contrib/pgcrypto";
let db;

before(
  async () => {
    const [{ PGlite }, { pgcrypto }] = await Promise.all([
      import(pgliteModule),
      import(pgcryptoModule),
    ]);
    db = new PGlite({ extensions: { pgcrypto } });
    await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create schema storage;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.jwt() returns jsonb language sql stable
      as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
    create function auth.role() returns text language sql stable
      as $$ select auth.jwt()->>'role' $$;
    grant usage on schema auth to anon,authenticated,service_role;
    grant execute on all functions in schema auth to anon,authenticated,service_role;
    create table storage.buckets(id text primary key, name text, public boolean,
      file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable
      as $$ select string_to_array(name,'/') $$;
    grant usage on schema storage to anon,authenticated,service_role;
  `);
    const files = (await readdir(resolve(projectRoot, "supabase/migrations")))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    assert.ok(files.includes("20261027123000_iyzico_provider_commerce.sql"));
    assert.ok(files.includes("20261027124000_provider_event_ledger_uniqueness.sql"));
    for (const file of files) {
      const sql = await readFile(resolve(projectRoot, "supabase/migrations", file), "utf8");
      try {
        // Intentionally execute the committed migrations verbatim, including pgcrypto.
        await db.exec(sql);
      } catch (error) {
        throw new Error(`Local migration failed: ${file}`, { cause: error });
      }
    }
    console.log(`Applied ${files.length} repository migrations verbatim in disposable PostgreSQL.`);
  },
  { timeout: 60_000 },
);

after(async () => {
  await db?.close();
});

test("SQL entitlements are idempotent, paid cancellation preserves access and two users can debit listings", async () => {
  await db.exec(
    await readFile(resolve(projectRoot, "scripts/iyzico-entitlements.integration.sql"), "utf8"),
  );
  const { rows } = await db.query("select count(*)::integer as count from auth.users");
  assert.equal(rows[0].count, 0, "fixture must roll back all synthetic users");
  const ready = await db.query("select public.portal_iyzico_schema_ready() as version");
  assert.equal(ready.rows[0].version, 20261028);
});

test("real authenticated and anonymous roles cannot read foreign subscriptions or grant/mutate paid state", async () => {
  await db.exec(
    await readFile(resolve(projectRoot, "scripts/iyzico-privileges.integration.sql"), "utf8"),
  );
  const { rows } = await db.query("select count(*)::integer as count from auth.users");
  assert.equal(rows[0].count, 0, "role probes must roll back all synthetic users");
});
