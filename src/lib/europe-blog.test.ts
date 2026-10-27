import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { EUROPE_BLOG_LOCALES } from "@/data/europe-blog/types";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { EuropeBlogArticle } from "@/components/blog/EuropeBlogArticle";
import {
  europeBlogAlternates,
  europeBlogHead,
  europeBlogLocaleForPath,
  europeBlogPath,
  isEuropeBlogLocale,
  type EuropeGuide,
} from "./europe-blog";

const fixture: EuropeGuide = {
  slug: "poland-funding",
  countryCode: "PL",
  countrySlug: "poland",
  countryName: "Poland",
  kind: "country",
  topic: "funding",
  brief:
    "यह पात्रता की जाँच करने के लिए एक परीक्षण पाठ है। आवेदन से पहले आधिकारिक संस्था से जानकारी लें।",
  sources: [
    {
      id: "source",
      label: "Official institution",
      url: "https://nawa.gov.pl/en/",
      checkedAt: "2026-10-27",
    },
  ],
  checkedAt: "2026-10-27",
  coverImage: "/blog-covers/poland-funding.svg",
};

describe("native Europe article URLs and metadata", () => {
  it("keeps all ten languages explicit, rejects unsupported shells, and parses only blog paths", () => {
    expect(EUROPE_BLOG_LOCALES).toHaveLength(10);
    for (const language of EUROPE_BLOG_LOCALES) {
      expect(isEuropeBlogLocale(language)).toBe(true);
      expect(europeBlogLocaleForPath(europeBlogPath(language, fixture.slug))).toBe(language);
      expect(europeBlogLocaleForPath(`/${language}/blogging`)).toBeNull();
    }
    expect(isEuropeBlogLocale("xx")).toBe(false);
    expect(europeBlogLocaleForPath("/xx/blog/poland-funding")).toBeNull();
  });

  it("creates reciprocal self-canonical ten-language clusters with a real default", () => {
    for (const language of EUROPE_BLOG_LOCALES) {
      const links = europeBlogAlternates(language, fixture.slug);
      expect(links.filter((link) => link.rel === "canonical")).toEqual([
        {
          rel: "canonical",
          href: `https://www.clinigaeducation.com/${language}/blog/poland-funding`,
        },
      ]);
      const alternates = links.filter((link) => link.rel === "alternate");
      expect(alternates).toHaveLength(11);
      expect(new Set(alternates.map((link) => link.hrefLang)).size).toBe(11);
      expect(
        alternates
          .find((link) => link.hrefLang === "x-default")
          ?.href.endsWith("/tr/blog/poland-funding"),
      ).toBe(true);
    }
  });

  it("renders a complete native Hindi reader, linked primary sources and one main headline", () => {
    const html = renderToStaticMarkup(
      createElement(EuropeBlogArticle, { language: "hi", guide: fixture, related: [] }),
    );
    expect(html).toContain(fixture.brief);
    expect(html).toContain(EUROPE_BLOG_COPY.hi.intros.funding);
    expect(html).toContain('lang="hi"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('href="https://nawa.gov.pl/en/"');
    expect(html).toContain("https://wa.me/393446759253?text=");
    expect(html).not.toContain(EUROPE_BLOG_COPY.tr.ctaBody);
  });

  it("keeps JSON-LD bound to the article and prevents a brief from ending its script", () => {
    const head = europeBlogHead("hi", {
      ...fixture,
      brief: `${fixture.brief} </script><script>unexpected</script>`,
    });
    const source = head.scripts[0].children;
    expect(source).not.toContain("</script>");
    const graph = JSON.parse(source)["@graph"];
    expect(graph[0].inLanguage).toBe("hi");
    expect(graph[0].mainEntityOfPage).toBe(
      "https://www.clinigaeducation.com/hi/blog/poland-funding",
    );
    expect(graph[0].citation).toEqual(["https://nawa.gov.pl/en/"]);
  });
});
