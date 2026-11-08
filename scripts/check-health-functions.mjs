import { pathToFileURL } from "node:url";

const backend = "https://brxntrrfbodanpckhfgm.supabase.co/functions/v1";
const origins = ["https://www.clinigaeducation.com", "https://clinigaeducation.com"];

export async function checkHealthFunctions(fetchImpl = fetch) {
  const checks = [];
  for (const name of ["iyzico-health", "portal-commerce-health"]) {
    for (const origin of origins) {
      const response = await fetchImpl(`${backend}/${name}`, {
        headers: { Origin: origin }, signal: AbortSignal.timeout(30_000),
      });
      if (response.status !== 200 || response.headers.get("access-control-allow-origin") !== origin) {
        throw new Error(`${name}: GET/origin boundary failed (HTTP ${response.status})`);
      }
      const value = await response.json();
      if (value.ok !== true || typeof value.configured !== "boolean") {
        throw new Error(`${name}: invalid readiness response`);
      }
      // Missing provider configuration is an honest readiness result, not a
      // request to provision products, prices, credentials or payment endpoints.
      checks.push({ name, method: "GET", status: response.status, configured: value.configured });
    }
    for (const [method, origin, expected] of [
      ["OPTIONS", origins[0], 204],
      ["POST", origins[0], 405],
      ["GET", "https://unrelated.example", 403],
    ]) {
      const response = await fetchImpl(`${backend}/${name}`, {
        method, headers: { Origin: origin }, signal: AbortSignal.timeout(30_000),
      });
      if (response.status !== expected) throw new Error(`${name}: ${method} expected ${expected}, got ${response.status}`);
      checks.push({ name, method, status: response.status });
    }
  }
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await checkHealthFunctions())); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
