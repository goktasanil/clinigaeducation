import { describe, expect, it } from "vitest";

import { buildSitemapXml, buildEuropeBlogSitemapEntries, type SitemapEntry } from "./sitemap";

const entry = (path: string, lastmod?: string): SitemapEntry => ({
  path,
  priority: "0.8",
  changefreq: "monthly",
  lastmod,
});

describe("buildSitemapXml", () => {
  it("normalizes and deduplicates equivalent paths", () => {
    const xml = buildSitemapXml(
      [entry("/blog"), entry("/blog/"), entry("blog")],
      "https://www.clinigaeducation.com/",
    );
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(locs).toEqual(["https://www.clinigaeducation.com/blog"]);
  });

  it("escapes unsafe XML values", () => {
    const xml = buildSitemapXml(
      [entry("/blog/a&b", "2026-08-23&draft")],
      "https://www.clinigaeducation.com",
    );
    expect(xml).toContain("/blog/a&amp;b");
    expect(xml).toContain("<lastmod>2026-08-23&amp;draft</lastmod>");
  });

  it("publishes reciprocal locale clusters for every guide and blog index", () => {
    const languages = ["tr", "en", "de", "fr", "es", "it", "hi", "ar", "ru", "zh"];
    const entries = buildEuropeBlogSitemapEntries(
      [{ slug: "italy" }, { slug: "germany" }],
      languages,
    );
    expect(entries).toHaveLength((2 * 4 + 1) * 10);
    const cluster = entries.filter((candidate) => candidate.path.endsWith("/italy-funding"));
    expect(cluster).toHaveLength(10);
    for (const candidate of cluster) {
      expect(candidate.alternates).toHaveLength(11);
      expect(candidate.alternates).toContainEqual({
        language: "hi",
        path: "/hi/blog/italy-funding",
      });
      expect(candidate.alternates).toContainEqual({
        language: "x-default",
        path: "/tr/blog/italy-funding",
      });
      expect(candidate.alternates).toContainEqual({
        language: candidate.path.split("/")[1],
        path: candidate.path,
      });
      expect(candidate.alternates).toEqual(cluster[0].alternates);
    }
    const xml = buildSitemapXml(entries, "https://www.clinigaeducation.com");
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="hi" href="https://www.clinigaeducation.com/hi/blog/italy-funding"/>',
    );
  });
});
