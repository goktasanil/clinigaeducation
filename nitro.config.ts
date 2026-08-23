import { defineConfig } from "nitro";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(
  isGitHubPages
    ? {
        preset: "static",
        prerender: {
          routes: [
            "/",
            "/blog",
            "/blog/almanya-bloke-hesap-sperrkonto-rehberi",
            "/gizlilik",
            "/hakkimizda",
            "/hizmetler",
            "/iletisim",
            "/kullanim-kosullari",
            "/paketler",
            "/portal",
            "/quiz",
            "/surec",
            "/sitemap.xml",
          ],
          crawlLinks: true,
          failOnError: true,
          ignore: ["/auth", "/admin", "/portal/panel", "/portal/verify"],
        },
      }
    : {},
);
