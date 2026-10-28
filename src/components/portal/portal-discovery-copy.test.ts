import { describe, expect, it } from "vitest";

import { formatPortalDiscoveryCopy, getPortalDiscoveryCopy } from "./portal-discovery-copy";

const languages = ["tr", "en", "de", "fr", "it", "es", "ar", "ru", "zh", "pt"];
const placeholders = (value: string) =>
  [...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();

describe("discovery language content", () => {
  it("provides complete native copy with consistent interpolation in every supported language", () => {
    const reference = getPortalDiscoveryCopy("tr");
    const keys = Object.keys(reference).sort();
    for (const language of languages) {
      const copy = getPortalDiscoveryCopy(language);
      expect(Object.keys(copy).sort()).toEqual(keys);
      for (const key of keys as Array<keyof typeof reference>) {
        expect(copy[key].trim().length).toBeGreaterThan(0);
        expect(placeholders(copy[key])).toEqual(placeholders(reference[key]));
      }
      if (language !== "tr") expect(copy.description).not.toEqual(reference.description);
      expect(
        formatPortalDiscoveryCopy(copy, "noPrograms", { institution: "Example University" }),
      ).toContain("Example University");
      expect(formatPortalDiscoveryCopy(copy, "citySuggestions", { count: 12 })).toContain("12");
    }
  });

  it("normalizes regional locales and rejects prototype property names", () => {
    expect(getPortalDiscoveryCopy("en-US")).toBe(getPortalDiscoveryCopy("en"));
    expect(getPortalDiscoveryCopy("__proto__")).toBe(getPortalDiscoveryCopy("tr"));
    expect(getPortalDiscoveryCopy("constructor")).toBe(getPortalDiscoveryCopy("tr"));
  });
});
