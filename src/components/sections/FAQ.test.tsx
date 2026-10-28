import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import tr from "@/i18n/locales/tr.json";
import { FAQ } from "./FAQ";

describe("FAQ disclosures", () => {
  it("keeps every answer under its question in the server HTML before JavaScript loads", () => {
    const markup = renderToStaticMarkup(
      createElement(I18nextProvider, { i18n }, createElement(FAQ)),
    );
    const disclosures = [...markup.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/g)].map(
      ([block]) => block,
    );

    expect(disclosures).toHaveLength(tr.faq.items.length);
    for (const [index, item] of tr.faq.items.entries()) {
      expect(disclosures[index]).toContain(`<h3>${item.q}</h3>`);
      expect(disclosures[index]).toContain(item.a);
      expect(disclosures[index]).toMatch(/<summary\b/);
      expect(disclosures[index]).not.toMatch(/<details[^>]*\sopen(?:[\s=>])/);
    }
    expect(disclosures[3]).toContain('id="akademik-etik"');
  });
});
