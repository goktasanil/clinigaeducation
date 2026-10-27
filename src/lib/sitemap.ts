export type SitemapEntry = {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  alternates?: { language: string; path: string }[];
};

/** Every localized guide and index belongs to a reciprocal language cluster. */
export const buildEuropeBlogSitemapEntries = (
  destinations: readonly { slug: string }[],
  languages: readonly string[],
): SitemapEntry[] => {
  const uniqueLanguages = [...new Set(languages)];
  const topics = ["study", "admission", "funding", "arrival"];
  const suffixes = [
    "",
    ...destinations.flatMap(({ slug }) => topics.map((topic) => `/${slug}-${topic}`)),
  ];
  return suffixes.flatMap((suffix) => {
    const alternates = [
      ...uniqueLanguages.map((language) => ({ language, path: `/${language}/blog${suffix}` })),
      { language: "x-default", path: `/tr/blog${suffix}` },
    ];
    return uniqueLanguages.map((language) => ({
      path: `/${language}/blog${suffix}`,
      priority: suffix ? "0.7" : "0.8",
      changefreq: "monthly",
      lastmod: "2026-10-27",
      alternates,
    }));
  });
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildSitemapXml = (entries: SitemapEntry[], baseUrl: string): string => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const seenPaths = new Set<string>();
  const uniqueEntries: SitemapEntry[] = [];

  for (const entry of entries) {
    const withLeadingSlash = entry.path.startsWith("/") ? entry.path : `/${entry.path}`;
    const path = withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/+$/, "");
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    uniqueEntries.push({ ...entry, path });
  }

  const urls = uniqueEntries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      const alternates = (entry.alternates ?? [])
        .map(
          ({ language, path }) =>
            `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(`${normalizedBaseUrl}${path}`)}"/>`,
        )
        .join("");
      return `  <url><loc>${escapeXml(`${normalizedBaseUrl}${entry.path}`)}</loc>${lastmod}${alternates}<changefreq>${escapeXml(entry.changefreq)}</changefreq><priority>${escapeXml(entry.priority)}</priority></url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${uniqueEntries.some((entry) => entry.alternates?.length) ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ""}>
${urls}
</urlset>`;
};
