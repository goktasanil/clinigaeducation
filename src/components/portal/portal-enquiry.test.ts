import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { SITE } from "@/data/site";
import { StaticPortalPricing } from "./PortalStaticFallback";

const readiness = vi.hoisted(() => ({ ready: false, loading: false }));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: { stripeConfigured: readiness.ready },
    isLoading: readiness.loading,
  }),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/lib/stripe-edge", () => ({
  getPortalCommerceHealth: vi.fn(),
  startCreditCheckoutEdge: vi.fn(),
  startMembershipCheckoutEdge: vi.fn(),
}));
vi.mock("./PortalBillingDialog", () => ({ PortalBillingDialog: () => null }));

function pricingHtml() {
  return renderToStaticMarkup(
    createElement(I18nextProvider, { i18n }, createElement(StaticPortalPricing)),
  );
}

function enquiryUrls(html: string) {
  return [...html.matchAll(/href="(mailto:[^"]+)"/g)].map(
    (match) => new URL(match[1].replaceAll("&amp;", "&")),
  );
}

afterEach(async () => {
  readiness.ready = false;
  readiness.loading = false;
  await i18n.changeLanguage("tr");
});

describe("portal enquiry fallback", () => {
  it("keeps an email path with the selected plan or pack in every supported language", async () => {
    for (const language of ["tr", "en", "de", "fr", "it", "es", "ar", "ru", "zh", "pt"]) {
      await i18n.changeLanguage(language);
      const urls = enquiryUrls(pricingHtml());
      expect(urls).toHaveLength(5);
      for (const url of urls) {
        expect(url.pathname).toBe(SITE.email);
        expect(url.searchParams.get("body")).toContain("EUR");
        expect(url.searchParams.get("body")).not.toContain("undefined");
      }
      expect(urls[0].searchParams.get("subject")).toContain("Basic");
      expect(urls[1].searchParams.get("body")).toContain("Plus");
      expect(urls[2].searchParams.get("body")).toContain("25");
      expect(urls[3].searchParams.get("body")).toContain("75");
      expect(urls[4].searchParams.get("body")).toContain("200");
    }
  });

  it("retains checkout actions when the selected currency is configured", () => {
    readiness.ready = true;
    const html = pricingHtml();
    expect(enquiryUrls(html)).toHaveLength(0);
    expect(html.match(/Güvenli ödemeye devam et/g)).toHaveLength(5);
  });

  it("waits for the initial readiness check before offering an alternative", () => {
    readiness.loading = true;
    expect(enquiryUrls(pricingHtml())).toHaveLength(0);
  });
});
