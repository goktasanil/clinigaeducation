import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { listWixPosts } from "@/lib/wix-blog.functions";

const BASE_URL = "https://www.clinigaeducation.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/portal", priority: "1.0", changefreq: "weekly" },
          { path: "/hizmetler", priority: "0.9", changefreq: "monthly" },
          { path: "/paketler", priority: "0.9", changefreq: "monthly" },
          { path: "/surec", priority: "0.7", changefreq: "yearly" },
          { path: "/quiz", priority: "0.8", changefreq: "monthly" },
          { path: "/blog", priority: "0.8", changefreq: "weekly" },
          {
            path: "/blog/almanya-bloke-hesap-sperrkonto-rehberi",
            priority: "0.7",
            changefreq: "monthly",
          },
          { path: "/hakkimizda", priority: "0.6", changefreq: "yearly" },
          { path: "/iletisim", priority: "0.8", changefreq: "yearly" },
          { path: "/gizlilik", priority: "0.3", changefreq: "yearly" },
          { path: "/kullanim-kosullari", priority: "0.3", changefreq: "yearly" },
        ];

        let postPaths: { path: string; priority: string; changefreq: string; lastmod?: string }[] = [];
        try {
          const { posts } = await listWixPosts({ data: { limit: 100, offset: 0 } });
          postPaths = posts.map((p) => ({
            path: `/blog/${p.slug}`,
            priority: "0.6",
            changefreq: "monthly",
            lastmod: p.publishedDate || undefined,
          }));
        } catch {
          // if Wix is temporarily unavailable, still ship the static sitemap
        }

        const all = [...staticPaths, ...postPaths];

        const urls = all
          .map((p) => {
            const lastmod = "lastmod" in p && p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : "";
            return `  <url><loc>${BASE_URL}${p.path}</loc>${lastmod}<changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
