import { supabase } from "@/integrations/supabase/client";
import { CREDIT_PACKS, PORTAL_PLANS } from "@/data/portal";
import {
  getPortalCommerceHealth,
  startCreditCheckoutEdge,
  startMembershipCheckoutEdge,
} from "@/lib/stripe-edge";

export type PaymentCurrency = "EUR" | "TRY";
export type PaymentProvider = "iyzico" | "stripe";
export type MembershipPlan = "basic" | "plus" | "pro";
export type CreditPack = "credits-25" | "credits-75" | "credits-200";
export type PortalCheckoutSelection =
  | { kind: "membership"; plan: MembershipPlan; yearly: boolean; currency: PaymentCurrency }
  | { kind: "credits"; pack: CreditPack; currency: PaymentCurrency };
export type PortalBillingDetails = {
  name: string;
  surname: string;
  gsmNumber: string;
  identityNumber: string;
  billingAddress: {
    address: string;
    contactName: string;
    city: string;
    country: string;
    zipCode?: string;
  };
};
export type IyzicoPrice = {
  plan: MembershipPlan;
  yearly: boolean;
  currency: PaymentCurrency;
  amountMinor: number;
};
export type IyzicoCreditPrice = {
  pack: CreditPack;
  currency: PaymentCurrency;
  amountMinor: number;
};
export type IyzicoHealth = {
  configured: boolean;
  mode: "live" | "sandbox" | "disabled";
  readyCurrencies: PaymentCurrency[];
  prices: IyzicoPrice[];
  creditPrices: IyzicoCreditPrice[];
  capabilities: { membership: boolean; credits: boolean; cancellation: boolean };
};
export type PortalPaymentHealth = { iyzico: IyzicoHealth; stripeConfigured: boolean };
export type PortalPaymentQuote = {
  provider: PaymentProvider | null;
  currency: PaymentCurrency;
  amountMinor: number | null;
};
export type IyzicoSubscription = {
  subscriptionReferenceCode: string;
  plan: MembershipPlan;
  status: "pending" | "active" | "past_due" | "cancelled" | "expired" | "inactive";
  currency: PaymentCurrency;
  yearly: boolean;
  amountMinor: number;
  currentPeriodEnd: string | null;
  renewalsStopped: boolean;
};
export type IyzicoCheckout = {
  provider: "iyzico";
  orderId: string;
  formContent: string;
  expiresAt: string;
  currency: PaymentCurrency;
  amountMinor: number;
};

const disabledIyzico = (): IyzicoHealth => ({
  configured: false,
  mode: "disabled",
  readyCurrencies: [],
  prices: [],
  creditPrices: [],
  capabilities: { membership: false, credits: false, cancellation: false },
});
const currencies = new Set(["EUR", "TRY"]);
const plans = new Set(["basic", "plus", "pro"]);
const packs = new Set(["credits-25", "credits-75", "credits-200"]);
const orderIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function config() {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("PAYMENT_UNAVAILABLE");
  return { url, key };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeIyzicoHealth(input: unknown): IyzicoHealth {
  if (!isRecord(input) || input.ok !== true || input.provider !== "iyzico") return disabledIyzico();
  const validAmount = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value > 0;
  const prices = (Array.isArray(input.prices) ? input.prices : []).filter(
    (value): value is IyzicoPrice =>
      isRecord(value) &&
      typeof value.plan === "string" &&
      plans.has(value.plan) &&
      typeof value.yearly === "boolean" &&
      typeof value.currency === "string" &&
      currencies.has(value.currency) &&
      validAmount(value.amountMinor),
  );
  const creditPrices = (Array.isArray(input.creditPrices) ? input.creditPrices : []).filter(
    (value): value is IyzicoCreditPrice =>
      isRecord(value) &&
      typeof value.pack === "string" &&
      packs.has(value.pack) &&
      typeof value.currency === "string" &&
      currencies.has(value.currency) &&
      validAmount(value.amountMinor),
  );
  const capabilities = isRecord(input.capabilities) ? input.capabilities : {};
  return {
    configured: input.configured === true,
    mode: input.mode === "live" || input.mode === "sandbox" ? input.mode : "disabled",
    readyCurrencies: (Array.isArray(input.readyCurrencies) ? input.readyCurrencies : []).filter(
      (value): value is PaymentCurrency => typeof value === "string" && currencies.has(value),
    ),
    prices,
    creditPrices,
    capabilities: {
      membership: capabilities.membership === true,
      credits: capabilities.credits === true,
      cancellation: capabilities.cancellation === true,
    },
  };
}

async function getIyzicoHealth(): Promise<IyzicoHealth> {
  try {
    const { url, key } = config();
    const response = await fetch(`${url}/functions/v1/iyzico-health`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok ? normalizeIyzicoHealth(await response.json()) : disabledIyzico();
  } catch {
    return disabledIyzico();
  }
}

export async function getPortalPaymentHealth(): Promise<PortalPaymentHealth> {
  const [iyzico, stripe] = await Promise.all([getIyzicoHealth(), getPortalCommerceHealth()]);
  return { iyzico, stripeConfigured: stripe.configured === true };
}

export function portalPaymentQuote(
  health: PortalPaymentHealth | undefined,
  selection: PortalCheckoutSelection,
): PortalPaymentQuote {
  const iyzico = health?.iyzico;
  const serverPrice =
    selection.kind === "membership"
      ? iyzico?.prices.find(
          (price) =>
            price.plan === selection.plan &&
            price.yearly === selection.yearly &&
            price.currency === selection.currency,
        )
      : iyzico?.creditPrices.find(
          (price) => price.pack === selection.pack && price.currency === selection.currency,
        );
  if (
    iyzico?.configured &&
    iyzico.mode === "live" &&
    iyzico.readyCurrencies.includes(selection.currency) &&
    iyzico.capabilities[selection.kind] &&
    serverPrice
  ) {
    return {
      provider: "iyzico",
      currency: selection.currency,
      amountMinor: serverPrice.amountMinor,
    };
  }
  const catalogPrice =
    selection.currency === "EUR"
      ? selection.kind === "membership"
        ? (() => {
            const plan = PORTAL_PLANS.find((item) => item.id === selection.plan);
            return plan ? Math.round((selection.yearly ? plan.yearly : plan.monthly) * 100) : null;
          })()
        : (() => {
            const pack = CREDIT_PACKS.find((item) => item.id === selection.pack);
            return pack ? Math.round(pack.price * 100) : null;
          })()
      : null;
  if (health?.stripeConfigured && selection.currency === "EUR" && catalogPrice !== null) {
    return { provider: "stripe", currency: selection.currency, amountMinor: catalogPrice };
  }
  return {
    provider: null,
    currency: selection.currency,
    amountMinor: serverPrice?.amountMinor ?? catalogPrice,
  };
}

export function formatPortalPayment(
  amountMinor: number | null,
  currency: PaymentCurrency,
  locale = "tr",
) {
  return amountMinor === null
    ? "—"
    : new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountMinor / 100);
}

export function safePortalPaymentUrl(value: unknown, provider: PaymentProvider): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (
      provider === "iyzico" &&
      url.hostname === "www.clinigaeducation.com" &&
      url.pathname === "/portal/checkout" &&
      orderIdPattern.test(url.searchParams.get("session") || "") &&
      url.searchParams.getAll("session").length === 1 &&
      [...url.searchParams.keys()].every((key) => key === "session") &&
      !url.hash
    )
      return url.href;
    const allowed = provider === "iyzico" ? ["iyzipay.com", "iyzico.com"] : ["stripe.com"];
    return allowed.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export async function portalPaymentAccountEmail(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) throw new Error("AUTH_REQUIRED");
  return data.user.email;
}

async function invokeIyzico(body: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("AUTH_REQUIRED");
  const { url, key } = config();
  const response = await fetch(`${url}/functions/v1/iyzico-commerce`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${data.session.access_token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("PAYMENT_UNAVAILABLE");
  }
  if (!response.ok) {
    const code =
      isRecord(result) && typeof result.error === "string" && /^[A-Z0-9_]{1,80}$/.test(result.error)
        ? result.error
        : "PAYMENT_UNAVAILABLE";
    throw new Error(code);
  }
  return result;
}

export async function startPortalCheckout(
  selection: PortalCheckoutSelection,
  billing?: PortalBillingDetails,
  expected?: Pick<PortalPaymentQuote, "provider" | "amountMinor">,
) {
  const health = await getPortalPaymentHealth();
  const quote = portalPaymentQuote(health, selection);
  if (!quote.provider || quote.amountMinor === null) throw new Error("PAYMENT_UNAVAILABLE");
  if (
    expected &&
    (expected.provider !== quote.provider || expected.amountMinor !== quote.amountMinor)
  )
    throw new Error("PAYMENT_PRICE_CHANGED");
  if (quote.provider === "iyzico" && !billing) throw new Error("BILLING_DATA_REQUIRED");
  const requestId = crypto.randomUUID();
  const result =
    quote.provider === "stripe"
      ? selection.kind === "membership"
        ? await startMembershipCheckoutEdge({
            plan: selection.plan,
            yearly: selection.yearly,
            requestId,
          })
        : await startCreditCheckoutEdge({ pack: selection.pack, requestId })
      : await invokeIyzico(
          selection.kind === "membership"
            ? {
                action: "membership",
                plan: selection.plan,
                yearly: selection.yearly,
                currency: selection.currency,
                billing,
                requestId,
              }
            : {
                action: "credits",
                pack: selection.pack,
                currency: selection.currency,
                billing,
                requestId,
              },
        );
  const safeUrl = safePortalPaymentUrl(isRecord(result) ? result.url : null, quote.provider);
  if (!safeUrl) throw new Error("PAYMENT_URL_INVALID");
  return { url: safeUrl, provider: quote.provider };
}

export async function getIyzicoSubscription(): Promise<IyzicoSubscription | null> {
  const result = await invokeIyzico({ action: "status" });
  if (!isRecord(result) || result.provider !== "iyzico") throw new Error("PAYMENT_UNAVAILABLE");
  if (result.subscription === null) return null;
  const sub = result.subscription;
  const statuses = new Set(["pending", "active", "past_due", "cancelled", "expired", "inactive"]);
  if (
    !isRecord(sub) ||
    typeof sub.subscriptionReferenceCode !== "string" ||
    !sub.subscriptionReferenceCode.trim() ||
    typeof sub.plan !== "string" ||
    !plans.has(sub.plan) ||
    typeof sub.status !== "string" ||
    !statuses.has(sub.status) ||
    typeof sub.currency !== "string" ||
    !currencies.has(sub.currency) ||
    typeof sub.yearly !== "boolean" ||
    typeof sub.amountMinor !== "number" ||
    !Number.isSafeInteger(sub.amountMinor) ||
    sub.amountMinor < 0 ||
    (sub.currentPeriodEnd !== null &&
      (typeof sub.currentPeriodEnd !== "string" ||
        !Number.isFinite(Date.parse(sub.currentPeriodEnd)))) ||
    typeof sub.renewalsStopped !== "boolean"
  )
    throw new Error("PAYMENT_UNAVAILABLE");
  return sub as unknown as IyzicoSubscription;
}

export async function cancelIyzicoSubscription(subscriptionReferenceCode: string) {
  const result = await invokeIyzico({ action: "cancel", subscriptionReferenceCode });
  if (
    !isRecord(result) ||
    result.provider !== "iyzico" ||
    result.subscriptionReferenceCode !== subscriptionReferenceCode ||
    result.renewalsStopped !== true
  )
    throw new Error("PAYMENT_UNAVAILABLE");
  return { renewalsStopped: true as const };
}

export async function getIyzicoCheckout(orderId: string): Promise<IyzicoCheckout> {
  if (!orderIdPattern.test(orderId)) throw new Error("PAYMENT_UNAVAILABLE");
  const result = await invokeIyzico({ action: "checkout", orderId });
  if (
    !isRecord(result) ||
    result.provider !== "iyzico" ||
    result.orderId !== orderId ||
    typeof result.formContent !== "string" ||
    !result.formContent.trim() ||
    result.formContent.length > 1_000_000 ||
    typeof result.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(result.expiresAt)) ||
    Date.parse(result.expiresAt) <= Date.now() ||
    typeof result.currency !== "string" ||
    !currencies.has(result.currency) ||
    typeof result.amountMinor !== "number" ||
    !Number.isSafeInteger(result.amountMinor) ||
    result.amountMinor <= 0
  )
    throw new Error("PAYMENT_UNAVAILABLE");
  return result as unknown as IyzicoCheckout;
}
