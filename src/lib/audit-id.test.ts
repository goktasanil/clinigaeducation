import { describe, expect, it, vi } from "vitest";

import { auditIdForPath, blogAuditId, isAuditId } from "./audit-id";
import { logSanitizeAudit } from "./sanitize-audit";
import { sanitizeHtmlWithReport } from "./sanitize-html";

describe("audit correlation ids", () => {
  it("produces well-formed, deterministic ids", () => {
    const a = blogAuditId("erasmus-rehberi", "en", "2026-08-11");
    expect(isAuditId(a)).toBe(true);
    expect(blogAuditId("erasmus-rehberi", "en", "2026-08-11")).toBe(a);
  });

  it("varies by slug, language and day", () => {
    const base = blogAuditId("a", "en", "2026-08-11");
    expect(blogAuditId("b", "en", "2026-08-11")).not.toBe(base);
    expect(blogAuditId("a", "de", "2026-08-11")).not.toBe(base);
    expect(blogAuditId("a", "en", "2026-08-12")).not.toBe(base);
  });

  it("reuses a valid incoming id and rejects junk", () => {
    const incoming = blogAuditId("a", "en", "2026-08-11");
    expect(auditIdForPath("/blog/a", incoming)).toBe(incoming);
    expect(auditIdForPath("/blog/a", "<script>")).not.toBe("<script>");
    expect(isAuditId(auditIdForPath("/blog/a", null))).toBe(true);
  });

  it("writes the id into the sanitize audit log line", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { report } = sanitizeHtmlWithReport(`<p>x</p><script>alert(1)</script>`);
    const auditId = blogAuditId("a", "en", "2026-08-11");
    logSanitizeAudit(report, { source: "ai-translation", auditId });
    expect(String(warn.mock.calls[0]?.[0])).toContain(auditId);
    warn.mockRestore();
  });
});
