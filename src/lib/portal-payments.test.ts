import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/stripe-edge", () => ({
  getPortalCommerceHealth: vi.fn(),
  startCreditCheckoutEdge: vi.fn(),
  startMembershipCheckoutEdge: vi.fn(),
}));

import {
  normalizeIyzicoHealth,
  portalPaymentQuote,
  safePortalPaymentUrl,
  type PortalPaymentHealth,
} from "./portal-payments";

function health(overrides: Record<string, unknown> = {}): PortalPaymentHealth {
  return {
    stripeConfigured: false,
    iyzico: normalizeIyzicoHealth({
      ok: true,
      provider: "iyzico",
      configured: true,
      mode: "live",
      readyCurrencies: ["EUR"],
      prices: [{ plan: "basic", yearly: false, currency: "EUR", amountMinor: 499 }],
      creditPrices: [],
      capabilities: { membership: true, credits: false, cancellation: true },
      ...overrides,
    }),
  };
}

const monthly = { kind: "membership", plan: "basic", yearly: false, currency: "EUR" } as const;

describe("payment readiness and quoted amounts", () => {
  it("enables a live server-configured membership using the server amount", () => {
    const configured = health({
      prices: [{ plan: "basic", yearly: false, currency: "EUR", amountMinor: 799 }],
    });
    expect(portalPaymentQuote(configured, monthly)).toEqual({
      provider: "iyzico",
      currency: "EUR",
      amountMinor: 799,
    });
  });

  it("never opens production checkout from absent, disabled or sandbox readiness", () => {
    expect(portalPaymentQuote(undefined, monthly).provider).toBeNull();
    for (const readiness of [
      health({ configured: false }),
      health({ mode: "sandbox" }),
      health({ capabilities: { membership: false } }),
      health({ readyCurrencies: [] }),
    ]) {
      expect(portalPaymentQuote(readiness, monthly).provider).toBeNull();
    }
  });

  it("does not invent TRY prices, annual amounts or credit-pack prices", () => {
    expect(portalPaymentQuote(health(), { ...monthly, currency: "TRY" })).toEqual({
      provider: null,
      currency: "TRY",
      amountMinor: null,
    });
    expect(portalPaymentQuote(health(), { ...monthly, yearly: true }).provider).toBeNull();
    expect(
      portalPaymentQuote(health(), { kind: "credits", pack: "credits-25", currency: "EUR" })
        .provider,
    ).toBeNull();
  });

  it("preserves configured Stripe EUR checkout without exposing unsupported TRY checkout", () => {
    const configured = { ...health({ configured: false }), stripeConfigured: true };
    expect(portalPaymentQuote(configured, monthly)).toEqual({
      provider: "stripe",
      currency: "EUR",
      amountMinor: 499,
    });
    expect(portalPaymentQuote(configured, { ...monthly, currency: "TRY" }).provider).toBeNull();
  });

  it("rejects malformed provider health and invalid price records", () => {
    for (const input of [
      null,
      [],
      "configured",
      { ok: true, provider: "other", configured: true },
    ]) {
      expect(normalizeIyzicoHealth(input).configured).toBe(false);
    }
    const normalized = health({
      prices: [
        { plan: "basic", yearly: false, currency: "EUR", amountMinor: -1 },
        { plan: "pro", yearly: false, currency: "TRY", amountMinor: 12.5 },
        { plan: "constructor", yearly: true, currency: "EUR", amountMinor: 100 },
        { plan: "basic", yearly: "false", currency: "EUR", amountMinor: 499 },
      ],
    });
    expect(normalized.iyzico.prices).toEqual([]);
    expect(portalPaymentQuote(normalized, monthly).provider).toBeNull();
  });
});

describe("payment redirect boundaries", () => {
  const session = "123e4567-e89b-42d3-a456-426614174000";
  const internal = `https://www.clinigaeducation.com/portal/checkout?session=${session}`;

  it("accepts the exact authenticated merchant handoff and official provider checkout domains", () => {
    expect(safePortalPaymentUrl(internal, "iyzico")).toBe(internal);
    expect(safePortalPaymentUrl("https://cpp.iyzipay.com/?token=example", "iyzico")).not.toBeNull();
    expect(
      safePortalPaymentUrl("https://checkout.stripe.com/c/pay/example", "stripe"),
    ).not.toBeNull();
  });

  it("rejects credential-bearing, insecure and unrelated redirects", () => {
    for (const url of [
      "javascript:alert(1)",
      "http://cpp.iyzipay.com/",
      "https://u:p@cpp.iyzipay.com/",
      "https://cpp.iyzipay.com:8443/",
      "https://iyzipay.com.evil.test/",
      "https://stripe.com.evil.test/",
      "//cpp.iyzipay.com/",
      "https://example.com/checkout",
    ]) {
      expect(safePortalPaymentUrl(url, "iyzico")).toBeNull();
    }
  });

  it("does not turn the internal checkout route into an open redirect or accept ambiguous sessions", () => {
    for (const url of [
      internal + "&next=https://evil.test",
      internal + `&session=${session}`,
      internal + "#fragment",
      "https://www.clinigaeducation.com/portal/checkout?session=not-a-uuid",
      `https://www.clinigaeducation.com/portal%2Fcheckout?session=${session}`,
      `https://www.clinigaeducation.com.evil.test/portal/checkout?session=${session}`,
    ]) {
      expect(safePortalPaymentUrl(url, "iyzico")).toBeNull();
    }
    expect(safePortalPaymentUrl(internal, "stripe")).toBeNull();
  });
});
