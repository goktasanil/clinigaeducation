import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { StudentResources } from "@/components/sections/StudentResources";
import { LANGUAGES, setLanguage } from "@/i18n";
import { STUDENT_RESOURCES, STUDENT_RESOURCE_COPY } from "./student-resources";

afterEach(async () => {
  await setLanguage("tr");
});

describe("student resources", () => {
  it.each(LANGUAGES)("renders complete resource information in $code", async ({ code }) => {
    await setLanguage(code);
    const html = renderToStaticMarkup(createElement(StudentResources));
    const copy = STUDENT_RESOURCE_COPY[code];
    expect(html).toContain(copy.title.replaceAll("'", "&#x27;"));
    expect(html).toContain(copy.disclosure.replaceAll("'", "&#x27;"));
    for (const resource of STUDENT_RESOURCES) {
      expect(html).toContain(`href="${resource.url}"`);
      expect(html).toContain(copy.cards[resource.id].category.replaceAll("'", "&#x27;"));
      expect(html).toContain(copy.cards[resource.id].description.replaceAll("'", "&#x27;"));
      expect(html).toContain(copy.cards[resource.id].check.replaceAll("'", "&#x27;"));
    }
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("<img");
  });

  it("shows housing only in the housing placement and education resources in admissions", () => {
    const housing = renderToStaticMarkup(createElement(StudentResources, { scope: "housing" }));
    const education = renderToStaticMarkup(createElement(StudentResources, { scope: "education" }));
    for (const resource of STUDENT_RESOURCES) {
      const link = `href="${resource.url}"`;
      if (resource.id === "spotahome") {
        expect(housing).toContain(link);
        expect(education).not.toContain(link);
      } else {
        expect(education).toContain(link);
        expect(housing).not.toContain(link);
      }
    }
  });

  it("links the homepage introduction to the full resource section", () => {
    const html = renderToStaticMarkup(createElement(StudentResources, { teaser: true }));
    expect(html).toContain('href="/hizmetler#ogrenci-kaynaklari"');
    expect(html).not.toContain('target="_blank"');
  });
});
