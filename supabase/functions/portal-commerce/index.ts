import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
  commerceConfigured,
  createConnectOnboarding,
  createCreditCheckout,
  createCustomerPortalSession,
  createMarketplaceCheckout,
  createMembershipCheckout,
  getAdminClient,
  parseCommerceAction,
  requireUser,
} from "../_shared/stripe-commerce.ts";

const LOCAL_ORIGINS = new Set(["http://localhost:3000", "http://localhost:5173"]);

function configuredOrigins() {
  const origins = new Set([
    "https://www.clinigaeducation.com",
    "https://clinigaeducation.com",
    ...LOCAL_ORIGINS,
  ]);
  const siteUrl = Deno.env.get("SITE_URL")?.trim().replace(/\/$/, "");
  if (siteUrl) origins.add(siteUrl);
  return origins;
}

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && configuredOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function errorStatus(message: string) {
  if (message === "AUTH_REQUIRED") return 401;
  if (message.includes("NOT_CONFIGURED") || message.startsWith("MISSING_STRIPE_PRICE_")) return 503;
  if (
    message.startsWith("INVALID_") ||
    message === "UNKNOWN_ACTION" ||
    message === "PROFILE_COUNTRY_REQUIRED"
  ) {
    return 400;
  }
  if (
    message === "NO_STRIPE_CUSTOMER" ||
    message === "VERIFIED_ACCOUNT_REQUIRED" ||
    message === "LISTING_NOT_FOUND" ||
    message === "LISTING_NOT_AVAILABLE" ||
    message === "CANNOT_BUY_OWN_LISTING" ||
    message === "SELLER_PAYMENT_ACCOUNT_NOT_READY"
  ) {
    return 409;
  }
  return 500;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin && !configuredOrigins().has(origin)) {
    return jsonResponse({ error: "ORIGIN_NOT_ALLOWED" }, 403, null);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
  }

  let action;
  try {
    action = parseCommerceAction(await req.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "INVALID_REQUEST";
    return jsonResponse({ error: message }, errorStatus(message), origin);
  }

  if (action.action === "health") {
    return jsonResponse(
      { ok: true, configured: commerceConfigured(), service: "portal-commerce" },
      200,
      origin,
    );
  }

  if (!commerceConfigured()) {
    return jsonResponse({ error: "PORTAL_COMMERCE_NOT_CONFIGURED" }, 503, origin);
  }

  try {
    const user = await requireUser(req);
    let result: { url: string };

    switch (action.action) {
      case "membership":
        result = await createMembershipCheckout({
          userId: user.id,
          email: user.email,
          plan: action.plan,
          yearly: action.yearly,
          requestId: action.requestId,
        });
        break;
      case "credits":
        result = await createCreditCheckout({
          userId: user.id,
          email: user.email,
          pack: action.pack,
          requestId: action.requestId,
        });
        break;
      case "customer_portal":
        result = await createCustomerPortalSession(user.id);
        break;
      case "connect": {
        const { data: profile, error } = await getAdminClient()
          .from("portal_profiles")
          .select("display_name, country_code, verification_status")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (profile?.verification_status !== "verified") {
          throw new Error("VERIFIED_ACCOUNT_REQUIRED");
        }
        if (!profile.display_name || !profile.country_code) {
          throw new Error("PROFILE_COUNTRY_REQUIRED");
        }
        result = await createConnectOnboarding({
          userId: user.id,
          email: user.email,
          displayName: profile.display_name,
          countryCode: profile.country_code,
        });
        break;
      }
      case "marketplace":
        result = await createMarketplaceCheckout({
          buyerId: user.id,
          email: user.email,
          listingId: action.listingId,
          requestId: action.requestId,
        });
        break;
    }

    return jsonResponse(result, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PORTAL_COMMERCE_FAILED";
    console.error("portal-commerce", message);
    return jsonResponse({ error: message }, errorStatus(message), origin);
  }
});
