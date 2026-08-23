import { describe, expect, it } from "vitest";

import { GOOGLE_SITE_VERIFICATION_TOKENS } from "./site-verification";

describe("Search Console verification", () => {
  it("keeps every known verification token unique and non-empty", () => {
    expect(GOOGLE_SITE_VERIFICATION_TOKENS).toContain("t7h-yMQGYmM2pUL_OePRiZMHWQSGRQVEVND-uINtF5Y");
    expect(GOOGLE_SITE_VERIFICATION_TOKENS).toContain("sGq-4FiWi2OgH9p9S4T1geqq-AifVkyJtwpeLSQWjcc");
    expect(new Set(GOOGLE_SITE_VERIFICATION_TOKENS).size).toBe(
      GOOGLE_SITE_VERIFICATION_TOKENS.length,
    );
    for (const token of GOOGLE_SITE_VERIFICATION_TOKENS) {
      expect(token.trim()).toBe(token);
      expect(token.length).toBeGreaterThan(20);
    }
  });
});
