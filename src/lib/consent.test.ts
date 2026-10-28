import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("optional advertising consent", () => {
  const saved = new Map<string, string>();
  const dispatchEvent = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    saved.clear();
    dispatchEvent.mockClear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => saved.get(key) ?? null,
        setItem: (key: string, value: string) => saved.set(key, value),
      },
      dispatchEvent,
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("does not authorize advertising without an explicit valid choice", async () => {
    const consent = await import("./consent");
    expect(consent.hasMarketingConsent()).toBe(false);
    saved.set(consent.CONSENT_STORAGE_KEY, "true");
    expect(consent.hasMarketingConsent()).toBe(false);
  });

  it("persists acceptance and lets withdrawal remove advertising permission", async () => {
    const consent = await import("./consent");
    consent.writeConsent("accepted");
    expect(consent.hasMarketingConsent()).toBe(true);
    consent.writeConsent("essential");
    expect(consent.hasMarketingConsent()).toBe(false);
    expect(saved.get(consent.CONSENT_STORAGE_KEY)).toBe("essential");
    expect(dispatchEvent.mock.calls.map(([event]) => event.detail)).toEqual([
      "accepted",
      "essential",
    ]);
  });

  it("keeps the site usable and honors the current-tab choice when storage is blocked", async () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("storage blocked");
      },
      dispatchEvent,
    });
    const consent = await import("./consent");
    expect(consent.hasMarketingConsent()).toBe(false);
    expect(() => consent.writeConsent("accepted")).not.toThrow();
    expect(consent.hasMarketingConsent()).toBe(true);
    consent.writeConsent("essential");
    expect(consent.hasMarketingConsent()).toBe(false);
  });

  it("reopens preferences without changing the stored choice", async () => {
    const consent = await import("./consent");
    consent.writeConsent("essential");
    consent.openConsentSettings();
    expect(
      dispatchEvent.mock.calls.some(([event]) => event.type === consent.CONSENT_OPEN_EVENT),
    ).toBe(true);
    expect(consent.readConsent()).toBe("essential");
  });

  it("withdraws permission even if an old accepted value is readable but cannot be overwritten", async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => "accepted",
        setItem: () => {
          throw new Error("quota exceeded");
        },
      },
      dispatchEvent,
    });
    const consent = await import("./consent");
    expect(consent.hasMarketingConsent()).toBe(false);
    consent.writeConsent("accepted");
    expect(consent.hasMarketingConsent()).toBe(true);
    consent.writeConsent("essential");
    expect(consent.hasMarketingConsent()).toBe(false);
  });

  it("removes a quota-blocked old acceptance before reloading", async () => {
    let oldValue: string | null = "accepted";
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => oldValue,
        setItem: () => {
          throw new Error("quota exceeded");
        },
        removeItem: () => {
          oldValue = null;
        },
      },
      dispatchEvent,
    });
    const consent = await import("./consent");
    consent.writeConsent("essential");
    vi.resetModules();
    expect((await import("./consent")).hasMarketingConsent()).toBe(false);
  });

  it("protects the reload when both updating and removing an old acceptance are blocked", async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => "accepted",
        setItem: () => {
          throw new Error("read only");
        },
        removeItem: () => {
          throw new Error("read only");
        },
      },
      dispatchEvent,
    });
    const consent = await import("./consent");
    expect(consent.hasMarketingConsent()).toBe(false);
    consent.writeConsent("accepted");
    expect(consent.hasMarketingConsent()).toBe(true);
    consent.writeConsent("essential");
    expect(consent.hasMarketingConsent()).toBe(false);
    vi.resetModules();
    expect((await import("./consent")).hasMarketingConsent()).toBe(false);
  });
});
