import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stripeSubscription: true,
  iyzicoSubscription: null as null | Record<string, unknown>,
  health: undefined as unknown,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({
    isLoading: false,
    isFetching: false,
    isError: queryKey[0] === "portal-iyzico-subscription" && !state.iyzicoSubscription,
    refetch: vi.fn(),
    data:
      queryKey[0] === "portal-dashboard-browser"
        ? {
            subscription: state.stripeSubscription
              ? { status: "active", plan: "plus", stripe_subscription_id: "sub_synthetic_fixture" }
              : { status: "inactive", plan: "basic" },
            // The new own-entitlement RPC is unavailable before its migration.
            paidAccess: null,
            wallet: { balance: 20 },
            profile: { verification_status: "verified" },
          }
        : queryKey[0] === "portal-iyzico-subscription"
          ? state.iyzicoSubscription
          : state.health,
  }),
}));
vi.mock("@/components/layout/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));
vi.mock("@/components/portal/portal-copy", () => ({
  usePortalCopy: () => ({
    copy: { nav: { account: "Account", overview: "Overview" }, tagline: "Portal" },
  }),
}));
vi.mock("@/components/portal/portal-public-copy", () => ({
  usePortalPublicCopy: () => ({
    commerce: { plans: "Membership", creditPacks: "Credits", plansTitle: "Plans" },
  }),
}));
vi.mock("@/components/portal/portal-payments-copy", () => ({
  usePortalPaymentsCopy: () => ({
    locale: "en",
    copy: {
      noSubscription: "No verified active membership",
      manage: "Manage billing",
      cancelRenewal: "Stop renewals",
      pending: "Payment setup is being completed",
      pendingDescription: "Purchases remain unavailable.",
      statusUnavailable: "Status unavailable",
      statuses: { active: "Active", inactive: "Inactive", past_due: "Past due" },
    },
  }),
}));

import { Route } from "@/routes/_authenticated/portal.account";

const renderAccount = () =>
  renderToStaticMarkup(createElement(Route.options.component as ComponentType));
const matchingButton = (html: string, label: string) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<button\\b[^>]*>${escaped}</button>`))?.[0];
};

describe("existing billing management is independent of new-checkout readiness", () => {
  beforeEach(() => {
    state.stripeSubscription = true;
    state.iyzicoSubscription = null;
    state.health = undefined;
  });

  it("keeps legacy Stripe management enabled when health is unavailable and the paid-access RPC is missing", () => {
    const html = renderAccount();
    const button = matchingButton(html, "Stripe · Manage billing");
    expect(button).toBeDefined();
    expect(button).not.toMatch(/\sdisabled(?:=|[\s>])/);
    expect(html).toContain("No verified active membership");
    expect(html).toContain("Payment setup is being completed");
  });

  it("does not gate Stripe management on disabled provider catalogs", () => {
    state.health = { stripeConfigured: false, iyzico: { configured: false, mode: "disabled" } };
    const button = matchingButton(renderAccount(), "Stripe · Manage billing");
    expect(button).toBeDefined();
    expect(button).not.toMatch(/\sdisabled(?:=|[\s>])/);
  });

  it("offers no Stripe management entry without an existing Stripe subscription", () => {
    state.stripeSubscription = false;
    expect(matchingButton(renderAccount(), "Stripe · Manage billing")).toBeUndefined();
  });

  it("keeps owner-scoped iyzico cancellation available with checkout disabled", () => {
    state.stripeSubscription = false;
    state.health = { stripeConfigured: false, iyzico: { configured: false, mode: "disabled" } };
    state.iyzicoSubscription = {
      subscriptionReferenceCode: "synthetic_iyzico_reference",
      status: "past_due",
      renewalsStopped: false,
    };
    const button = matchingButton(renderAccount(), "iyzico · Stop renewals");
    expect(button).toBeDefined();
    expect(button).not.toMatch(/\sdisabled(?:=|[\s>])/);
  });
});
