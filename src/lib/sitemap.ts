export type SitemapEntry = {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildSitemapXml = (
  entries: SitemapEntry[],
  baseUrl: string,
): string => {
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
      const lastmod = entry.lastmod
        ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : "";
      return `  <url><loc>${escapeXml(`${normalizedBaseUrl}${entry.path}`)}</loc>${lastmod}<changefreq>${escapeXml(entry.changefreq)}</changefreq><priority>${escapeXml(entry.priority)}</priority></url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};
