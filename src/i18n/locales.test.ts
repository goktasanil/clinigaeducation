import { describe, expect, it } from "vitest";
import { LANGUAGES, setLanguage } from "@/i18n";
import i18n from "@/i18n";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

function leaves(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.assign(
    {},
    ...Object.entries(value as object).map(([key, item]) => leaves(item, `${prefix}.${key}`)),
  );
}

describe("ten-language interface", () => {
  it("adds complete Portuguese copy with the same interpolation and rich-text slots", () => {
    const reference = leaves(en),
      translated = leaves(pt);
    expect(LANGUAGES).toHaveLength(10);
    expect(new Set(LANGUAGES.map((l) => l.code)).size).toBe(10);
    expect(Object.keys(translated).sort()).toEqual(Object.keys(reference).sort());
    for (const [key, value] of Object.entries(reference)) {
      const tokens = (text: string) => text.match(/\{\{\w+\}\}|<\/?\d+>/g)?.sort() ?? [];
      expect(tokens(translated[key]), key).toEqual(tokens(value));
      if (value) expect(translated[key].trim().length, key).toBeGreaterThan(0);
    }
  });
  it("loads Portuguese region codes and returns to Arabic and Turkish", async () => {
    await setLanguage("pt-PT");
    expect(i18n.resolvedLanguage).toBe("pt");
    expect(i18n.t("nav.portal")).toBe("Portal do estudante");
    await setLanguage("ar");
    expect(i18n.dir()).toBe("rtl");
    await setLanguage("tr");
    expect(i18n.dir()).toBe("ltr");
  });
});
