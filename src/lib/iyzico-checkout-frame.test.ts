import { describe, expect, it } from "vitest";
import {
  buildIyzicoFrameCsp,
  checkoutSearchSchema,
  IYZICO_FRAME_SANDBOX,
} from "./iyzico-checkout-frame";

describe("checkout session search boundary", () => {
  const session = "b4fb4cf4-a5dc-4d7d-9d48-e606dd734661";
  it("accepts only a session UUID and rejects payment success or price markers", () => {
    expect(checkoutSearchSchema.parse({ session })).toEqual({ session });
    for (const input of [
      {},
      { session: "https://evil.example" },
      { session: session + "#paid" },
      { session, success: "true" },
      { session, price: "1" },
    ]) {
      expect(checkoutSearchSchema.safeParse(input).success).toBe(false);
    }
  });
});

describe("isolated provider frame policy", () => {
  it("keeps the frame opaque and popups sandboxed", () => {
    const permissions = IYZICO_FRAME_SANDBOX.split(" ");
    expect(permissions).not.toContain("allow-same-origin");
    expect(permissions).not.toContain("allow-popups-to-escape-sandbox");
    expect(permissions).not.toContain("allow-top-navigation");
    expect(permissions).toContain("allow-top-navigation-by-user-activation");
  });
  it("permits exact official hosts and hashes without wildcard or arbitrary inline scripts", () => {
    const hash = "sha256-" + "A".repeat(43) + "=";
    const csp = buildIyzicoFrameCsp([hash]);
    const script = csp.split("; ").find((part) => part.startsWith("script-src ")) || "";
    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toContain("*");
    expect(script).toContain(`'${hash}'`);
    expect(script).not.toContain("unsafe-inline");
    expect(script).not.toContain("unsafe-eval");
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("base-uri 'none'");
  });
  it("rejects injected CSP hash text", () => {
    expect(() => buildIyzicoFrameCsp(["sha256-test; script-src https://evil.example"])).toThrow();
  });
  it("allows only the configured exact Supabase callback path as an extra form target", () => {
    expect(
      buildIyzicoFrameCsp([], "https://example-project.supabase.co/functions/v1/iyzico-callback"),
    ).toContain("https://example-project.supabase.co/functions/v1/iyzico-callback");
    for (const callback of [
      "https://evil.example/functions/v1/iyzico-callback",
      "http://example.supabase.co/functions/v1/iyzico-callback",
      "https://example.supabase.co/functions/v1/other",
      "https://example.supabase.co/functions/v1/iyzico-callback?redirect=evil",
    ]) {
      expect(() => buildIyzicoFrameCsp([], callback)).toThrow();
    }
  });
});
