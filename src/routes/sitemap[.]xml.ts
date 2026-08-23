import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { listWixPosts } from "@/lib/wix-blog.functions";
import { buildSitemapXml, type SitemapEntry } from "@/lib/sitemap";
import { EUROPEAN_CITY_GUIDES } from "@/data/european-city-guides";

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
            path: "/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular",
            priority: "0.9",
            changefreq: "monthly",
            lastmod: "2026-08-23",
          },
          {
            path: "/blog/almanya-bloke-hesap-sperrkonto-rehberi",
            priority: "0.7",
            changefreq: "monthly",
          },
          { path: "/sehir-rehberleri", priority: "0.9", changefreq: "weekly" },
          ...EUROPEAN_CITY_GUIDES.map((city) => ({
            path: `/sehir-rehberleri/${city.slug}`,
            priority: city.featured ? "0.8" : "0.6",
            changefreq: "monthly",
            lastmod: "2026-08-23",
          })),
          { path: "/hakkimizda", priority: "0.6", changefreq: "yearly" },
          { path: "/iletisim", priority: "0.8", changefreq: "yearly" },
          { path: "/gizlilik", priority: "0.3", changefreq: "yearly" },
          { path: "/kullanim-kosullari", priority: "0.3", changefreq: "yearly" },
        ];

        let postPaths: SitemapEntry[] = [];
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

        const xml = buildSitemapXml([...staticPaths, ...postPaths], BASE_URL);

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
