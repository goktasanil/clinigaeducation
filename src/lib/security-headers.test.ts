import { describe, expect, it } from "vitest";
import { BASELINE_CSP, baselineCspMeta, buildBlogCsp } from "./csp";
import { withBaselineSecurityHeaders } from "./security-headers";
import { renderErrorPage } from "./error-page";

describe("response security boundaries", () => {
  it("preserves an error response while preventing framing and object embedding", async () => {
    const secured = withBaselineSecurityHeaders(
      new Response("missing", { status: 404, headers: { "x-audit-id": "example" } }),
      "https://www.clinigaeducation.com/missing",
    );
    expect(secured.status).toBe(404);
    expect(await secured.text()).toBe("missing");
    expect(secured.headers.get("x-audit-id")).toBe("example");
    expect(secured.headers.get("x-content-type-options")).toBe("nosniff");
    expect(secured.headers.get("x-frame-options")).toBe("DENY");
    expect(secured.headers.get("content-security-policy")).toContain("object-src 'none'");
    expect(secured.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  });

  it("retains the blog's restrictive source policy when applying baseline protection", () => {
    const blogPolicy = buildBlogCsp("https://example.supabase.co");
    const secured = withBaselineSecurityHeaders(
      new Response("article", { headers: { "Content-Security-Policy": blogPolicy } }),
      "https://clinigaeducation.com/blog/example",
    );
    const policies = secured.headers.get("content-security-policy")?.split(", ");
    expect(policies).toHaveLength(2);
    expect(policies?.[0]).toBe(blogPolicy);
    expect(policies?.[1]).toBe(`${BASELINE_CSP}; frame-ancestors 'none'`);
  });

  it("does not break editor framing on noncanonical preview hosts", () => {
    const secured = withBaselineSecurityHeaders(
      new Response("preview"),
      "https://example.lovable.app/",
    );
    expect(secured.headers.get("x-frame-options")).toBeNull();
    expect(secured.headers.get("content-security-policy")).toBe(BASELINE_CSP);
  });

  it("keeps the catastrophic error retry compatible with the event-attribute restriction", () => {
    const html = renderErrorPage("aud_0123456789abcdef");
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
    expect(html).toContain('id="retry-page"');
    expect(html).toContain('addEventListener("click"');
  });

  it("ships the supported browser protections to static pages without ineffective frame directives", () => {
    const meta = baselineCspMeta();
    expect(meta.httpEquiv).toBe("Content-Security-Policy");
    expect(meta.content).toContain("base-uri 'self'");
    expect(meta.content).toContain("script-src-attr 'none'");
    expect(meta.content).not.toContain("frame-ancestors");
    expect(meta.content).not.toContain("default-src");
  });
});
