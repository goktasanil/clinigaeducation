import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { commerceConfigured } from "../_shared/stripe-commerce.ts";

const ALLOWED_ORIGINS = new Set([
  "https://www.clinigaeducation.com",
  "https://clinigaeducation.com",
  "http://localhost:3000",
  "http://localhost:5173",
]);

function headers(origin: string | null) {
  const result: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, x-client-info",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) result["Access-Control-Allow-Origin"] = origin;
  return result;
}

Deno.serve((req: Request) => {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ ok: false }), { status: 403, headers: headers(null) });
  }
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers: headers(origin) });
  }
  return new Response(
    JSON.stringify({ ok: true, configured: commerceConfigured(), service: "portal-commerce" }),
    { status: 200, headers: headers(origin) },
  );
});
