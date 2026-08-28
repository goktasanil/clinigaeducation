import { supabase } from "@/integrations/supabase/client";

type PortalPlan = "basic" | "plus" | "pro";
type CreditPack = "credits-25" | "credits-75" | "credits-200";

type CommerceHealth = {
  ok: boolean;
  configured: boolean;
  service?: string;
};

type CommerceResponse = { url: string };

function env() {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("SUPABASE_CLIENT_NOT_CONFIGURED");
  return { url, publishableKey };
}

function functionUrl(name: string) {
  return `${env().url}/functions/v1/${name}`;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" ? body.error : `HTTP_${response.status}`;
  } catch {
    return `HTTP_${response.status}`;
  }
}

export async function getPortalCommerceHealth(): Promise<CommerceHealth> {
  try {
    const { publishableKey } = env();
    const response = await fetch(functionUrl("portal-commerce-health"), {
      method: "GET",
      headers: { apikey: publishableKey },
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, configured: false };
    const data = (await response.json()) as Partial<CommerceHealth>;
    return {
      ok: data.ok === true,
      configured: data.configured === true,
      service: typeof data.service === "string" ? data.service : undefined,
    };
  } catch {
    return { ok: false, configured: false };
  }
}

async function invokeCommerce(body: Record<string, unknown>): Promise<CommerceResponse> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("AUTH_REQUIRED");
  const { publishableKey } = env();
  const response = await fetch(functionUrl("portal-commerce"), {
    method: "POST",
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${data.session.access_token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  const result = (await response.json()) as Partial<CommerceResponse>;
  if (typeof result.url !== "string" || !/^https:\/\//i.test(result.url)) {
    throw new Error("COMMERCE_URL_NOT_CREATED");
  }
  return { url: result.url };
}

export function startMembershipCheckoutEdge(args: {
  plan: PortalPlan;
  yearly: boolean;
  requestId: string;
}) {
  return invokeCommerce({ action: "membership", ...args });
}

export function startCreditCheckoutEdge(args: { pack: CreditPack; requestId: string }) {
  return invokeCommerce({ action: "credits", ...args });
}

export function startCustomerPortalEdge() {
  return invokeCommerce({ action: "customer_portal" });
}

export function startConnectOnboardingEdge() {
  return invokeCommerce({ action: "connect" });
}

export function startMarketplaceCheckoutEdge(args: { listingId: string; requestId: string }) {
  return invokeCommerce({ action: "marketplace", ...args });
}
