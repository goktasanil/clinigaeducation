import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkHealthFunctions } from "./check-health-functions.mjs";

test("health deployment names only the two read-only functions and fixed production backend", async () => {
  const workflow = await readFile(new URL("../.github/workflows/supabase-health.yml", import.meta.url), "utf8");
  assert.match(workflow, /functions deploy iyzico-health portal-commerce-health\s+--remote=brxntrrfbodanpckhfgm --use-api --no-verify-jwt --yes/);
  assert.doesNotMatch(workflow, /secrets set|db push|migration up|STRIPE_SECRET|STRIPE_RESTRICTED|api\.stripe|webhook_endpoints|--prune|supabase-production\.yml/);
  assert.match(workflow, /Missing repository secret SUPABASE_ACCESS_TOKEN/);
  assert.match(workflow, /branches: \[main\]/);
});

test("readiness checks accept configured=false without financial activation", async () => {
  const calls = [];
  const result = await checkHealthFunctions(async (url, init) => {
    calls.push({ url, method: init.method || "GET" });
    const origin = init.headers.Origin;
    const status = origin === "https://unrelated.example" ? 403 : init.method === "OPTIONS" ? 204 : init.method === "POST" ? 405 : 200;
    return new Response(status === 204 ? null : JSON.stringify({ ok: true, configured: false }), {
      status, headers: { "Access-Control-Allow-Origin": origin },
    });
  });
  assert.equal(result.length, 10);
  assert.ok(calls.every(({ url }) => /^https:\/\/brxntrrfbodanpckhfgm\.supabase\.co\/functions\/v1\/(iyzico-health|portal-commerce-health)$/.test(url)));
  assert.ok(result.filter(({ method, status }) => method === "GET" && status === 200).every(({ configured }) => configured === false));
});

test("a missing function fails deployment verification instead of reporting ready", async () => {
  await assert.rejects(checkHealthFunctions(async () => new Response(null, { status: 404 })), /HTTP 404/);
});
