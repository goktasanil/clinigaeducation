import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set([
  "https://www.clinigaeducation.com",
  "https://clinigaeducation.com",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const REQUIRED_COMMERCE_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASIC_MONTHLY",
  "STRIPE_PRICE_BASIC_YEARLY",
  "STRIPE_PRICE_PLUS_MONTHLY",
  "STRIPE_PRICE_PLUS_YEARLY",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_YEARLY",
  "STRIPE_PRICE_CREDITS_25",
  "STRIPE_PRICE_CREDITS_75",
  "STRIPE_PRICE_CREDITS_200",
] as const;

function env(name: string) {
  return Deno.env.get(name)?.trim() || "";
}

function commerceReady() {
  const stripeKey = env("STRIPE_RESTRICTED_KEY") || env("STRIPE_SECRET_KEY");
  if (!stripeKey) return false;
  return REQUIRED_COMMERCE_ENV.every((name) => {
    const value = env(name);
    if (name.startsWith("STRIPE_PRICE_")) return value.startsWith("price_");
    return Boolean(value);
  });
}

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
    return new Response(JSON.stringify({ ok: false, configured: false }), {
      status: 403,
      headers: headers(null),
    });
  }
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, configured: false }), {
      status: 405,
      headers: headers(origin),
    });
  }
  return new Response(
    JSON.stringify({ ok: true, configured: commerceReady(), service: "portal-commerce" }),
    { status: 200, headers: headers(origin) },
  );
});
