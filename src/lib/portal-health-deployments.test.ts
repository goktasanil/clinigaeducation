import { afterEach, describe, expect, it, vi } from "vitest";
import deployments from "@/data/portal-health-deployments.json";
import { isKnownUndeployedPortalHealth } from "./portal-health-deployments";
import { getPortalCommerceHealth } from "./stripe-edge";
import { getPortalPaymentHealth, portalPaymentQuote } from "./portal-payments";

const production = "https://brxntrrfbodanpckhfgm.supabase.co";
const anotherProject = "https://synthetic-project.example.test";
const unavailable = { ok: false, configured: false };
const stripeReady = { ok: true, configured: true, service: "portal-commerce" };
const iyzicoReady = {
  ok: true,
  provider: "iyzico",
  configured: true,
  mode: "live",
  readyCurrencies: ["EUR"],
  prices: [{ plan: "basic", yearly: false, currency: "EUR", amountMinor: 499 }],
  creditPrices: [],
  capabilities: { membership: true, credits: false, cancellation: false },
};
const selection = { kind: "membership", plan: "basic", yearly: false, currency: "EUR" } as const;
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function configure(url = anotherProject) {
  vi.stubEnv("VITE_SUPABASE_URL", url);
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_synthetic");
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("reviewed portal health deployment boundary", () => {
  it("records only the two observed missing endpoints, with a version and observation date", () => {
    expect(deployments.schemaVersion).toBe(1);
    expect(deployments.projectRef).toBe("brxntrrfbodanpckhfgm");
    expect(Number.isFinite(Date.parse(deployments.observedAt))).toBe(true);
    expect(Object.keys(deployments.functions).sort()).toEqual([
      "iyzico-health",
      "portal-commerce-health",
    ]);
    for (const entry of Object.values(deployments.functions)) {
      expect(["not_deployed", "deployed"]).toContain(entry.deployment);
      expect(entry.observedHttpStatus).toBe(entry.deployment === "not_deployed" ? 404 : 200);
      expect(entry.observedPreflightStatus).toBe(entry.deployment === "not_deployed" ? 404 : 204);
    }
  });
  it("does not probe the known missing production endpoints or fabricate readiness", async () => {
    configure(production);
    const fetchMock = vi.fn().mockRejectedValue(new Error("Unexpected request"));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getPortalPaymentHealth();
    expect(result.stripeConfigured).toBe(false);
    expect(result.iyzico.configured).toBe(false);
    expect(portalPaymentQuote(result, selection).provider).toBeNull();
    expect(await getPortalCommerceHealth()).toEqual(unavailable);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    anotherProject,
    "https://brxntrrfbodanpckhfgm.supabase.co.evil.test",
    "http://brxntrrfbodanpckhfgm.supabase.co",
    production + ":444",
    production + "/unrelated",
    production + "?project=other",
    production + "#other",
    "https://username@brxntrrfbodanpckhfgm.supabase.co",
    "invalid",
  ])("does not apply production deployment metadata to another origin/path: %s", (url) => {
    expect(isKnownUndeployedPortalHealth(url, "iyzico-health")).toBe(false);
  });
  it("permits a verified deployment to use real health while leaving the other missing endpoint unavailable", () => {
    const snapshot = {
      ...deployments,
      functions: {
        "iyzico-health": { deployment: "not_deployed" },
        "portal-commerce-health": { deployment: "deployed" },
      },
    };
    expect(isKnownUndeployedPortalHealth(production + "/", "iyzico-health", snapshot)).toBe(true);
    expect(isKnownUndeployedPortalHealth(production, "portal-commerce-health", snapshot)).toBe(
      false,
    );
    expect(
      isKnownUndeployedPortalHealth(production, "iyzico-health", { ...snapshot, schemaVersion: 2 }),
    ).toBe(false);
  });
});

describe("strict independent provider readiness", () => {
  it.each([
    { ok: false, configured: true, service: "portal-commerce" },
    { ok: true, configured: true, service: "another-service" },
    { ok: true, configured: true },
    { ok: true, configured: "true", service: "portal-commerce" },
    { configured: true, service: "portal-commerce" },
    null,
    [],
  ])("rejects malformed or unsuccessful Stripe health: %j", async (body) => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json(body)),
    );
    expect(await getPortalCommerceHealth()).toEqual(unavailable);
  });
  it("uses real Stripe health on another project and retains its valid quote when iyzico is unavailable", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("iyzico-health") ? json({}, 404) : json(stripeReady),
      ),
    );
    const result = await getPortalPaymentHealth();
    expect(result.iyzico.configured).toBe(false);
    expect(result.stripeConfigured).toBe(true);
    expect(portalPaymentQuote(result, selection).provider).toBe("stripe");
  });
  it("retains a valid live iyzico quote when Stripe is unavailable", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("iyzico-health") ? json(iyzicoReady) : json({}, 404),
      ),
    );
    const result = await getPortalPaymentHealth();
    expect(result.stripeConfigured).toBe(false);
    expect(portalPaymentQuote(result, selection)).toMatchObject({
      provider: "iyzico",
      amountMinor: 499,
    });
  });
  it("does not promote an HTTP 200 ok:false Stripe body into a configured provider", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("iyzico-health") ? json({}, 404) : json({ ...stripeReady, ok: false }),
      ),
    );
    const result = await getPortalPaymentHealth();
    expect(result.stripeConfigured).toBe(false);
    expect(portalPaymentQuote(result, selection).provider).toBeNull();
  });
  it.each(["iyzico-health", "portal-commerce-health"])(
    "bounds a stalled %s without disabling the other provider",
    async (stalled) => {
      configure();
      const controllers = new Map<AbortSignal, AbortController>();
      const budget = vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
        expect(milliseconds).toBe(8_000);
        const controller = new AbortController();
        controllers.set(controller.signal, controller);
        return controller.signal;
      });
      let stalledSignal: AbortSignal | undefined;
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string, options: RequestInit) => {
          if (!url.endsWith(stalled))
            return Promise.resolve(json(url.endsWith("iyzico-health") ? iyzicoReady : stripeReady));
          stalledSignal = options.signal as AbortSignal;
          return new Promise<Response>((_resolve, reject) =>
            stalledSignal!.addEventListener("abort", () =>
              reject(new DOMException("Timed out", "TimeoutError")),
            ),
          );
        }),
      );
      const pending = getPortalPaymentHealth();
      await vi.waitFor(() => expect(stalledSignal).toBeDefined());
      controllers.get(stalledSignal!)!.abort();
      const result = await pending;
      expect(budget).toHaveBeenCalledTimes(2);
      expect(portalPaymentQuote(result, selection).provider).toBe(
        stalled === "iyzico-health" ? "stripe" : "iyzico",
      );
    },
  );
});
