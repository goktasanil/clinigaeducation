import { describe, expect, it } from "vitest";

import { buildSitemapXml, type SitemapEntry } from "./sitemap";

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
});
