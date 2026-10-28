import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { buildNotFoundHtml, buildRedirectHtml } from "./github-pages-html.mjs";

const workerModule = await import("../.output/server/index.mjs");
const worker = workerModule.default ?? workerModule;

if (!worker || typeof worker.fetch !== "function") {
  throw new Error("Built worker does not expose a fetch handler.");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const cityGuideSource = await readFile(
  new URL("../src/data/european-city-guides.ts", import.meta.url),
  "utf8",
);
const cityGuideRoutes = Array.from(
  cityGuideSource.matchAll(/\[\s*"([^"]+)"\s*,\s*"[^"]+"\s*,\s*"[A-Z]{2}"/g),
  (match) => `/sehir-rehberleri/${slugify(match[1])}`,
);

const serviceDetailSource = await readFile(
  new URL("../src/data/serviceDetails.ts", import.meta.url),
  "utf8",
);
const serviceDetailRoutes = Array.from(
  serviceDetailSource.matchAll(/slug:\s*"([^"]+)"/g),
  (match) => `/hizmetler/${match[1]}`,
);

const blogPostSource = await readFile(new URL("../src/data/posts.ts", import.meta.url), "utf8");
const blogPostRoutes = Array.from(
  blogPostSource.matchAll(/slug:\s*"([^"]+)"/g),
  (match) => `/blog/${match[1]}`,
);

const europeCatalog = JSON.parse(
  await readFile(
    new URL("../src/data/europe-blog/generated/catalog.json", import.meta.url),
    "utf8",
  ),
);
if (!Array.isArray(europeCatalog) || europeCatalog.length !== 52)
  throw new Error("Generate and validate all 52 Europe blog destinations before rendering.");
const europeBlogLanguages = ["tr", "en", "de", "fr", "es", "it", "hi", "ar", "ru", "zh"];
const europeBlogRoutes = europeBlogLanguages.flatMap((language) => [
  `/${language}/blog`,
  ...europeCatalog.flatMap(({ slug }) =>
    ["study", "admission", "funding", "arrival"].map(
      (topic) => `/${language}/blog/${slug}-${topic}`,
    ),
  ),
]);

const archiveCatalog = JSON.parse(
  await readFile(
    new URL("../src/data/wix-archive/generated/catalog.json", import.meta.url),
    "utf8",
  ),
);
if (!Array.isArray(archiveCatalog) || archiveCatalog.length !== 710)
  throw new Error("Generate all 710 original Wix publications before rendering.");
const archiveRoutes = archiveCatalog.map((post) => post.path);
const archiveAliases = JSON.parse(
  await readFile(
    new URL("../src/data/wix-archive/generated/aliases.json", import.meta.url),
    "utf8",
  ),
);
const staticRedirects = new Map([
  ["/blog", { path: "/tr/blog", language: "tr" }],
  ...archiveAliases.map((post) => [
    `/blog/${encodeURIComponent(post.slug)}`,
    { path: post.path, language: post.language },
  ]),
]);

const routes = [
  ...new Set([
    "/",
    "/auth",
    "/blog",
    ...blogPostRoutes,
    ...europeBlogRoutes,
    ...archiveRoutes,
    ...archiveAliases.map((post) => `/blog/${encodeURIComponent(post.slug)}`),
    "/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular",
    "/blog/almanya-bloke-hesap-sperrkonto-rehberi",
    "/gizlilik",
    "/hakkimizda",
    "/hizmetler",
    ...serviceDetailRoutes,
    "/iletisim",
    "/kullanim-kosullari",
    "/paketler",
    "/portal",
    "/portal/account",
    "/portal/checkout",
    "/portal/panel",
    "/portal/workspace",
    "/portal/verify",
    "/quiz",
    "/sehir-rehberleri",
    ...cityGuideRoutes,
    "/surec",
    "/sitemap.xml",
  ]),
];

const pending = [];
const context = {
  waitUntil(promise) {
    pending.push(Promise.resolve(promise));
  },
  passThroughOnException() {},
};

function outputPath(route) {
  if (route === "/") return ".output/public/index.html";
  if (route === "/sitemap.xml") {
    return join(".output/public", route.slice(1));
  }
  // GitHub Pages decodes the URL before locating a directory. Keep Unicode
  // slugs as Unicode filenames; percent encoding can exceed NAME_MAX.
  return join(".output/public", decodeURIComponent(route.slice(1)), "index.html");
}

async function render(route) {
  let currentUrl = new URL(route, "https://www.clinigaeducation.com");
  let response;

  for (let redirectCount = 0; redirectCount < 5; redirectCount += 1) {
    const request = new Request(currentUrl, {
      headers: { accept: route.endsWith(".xml") ? "application/xml" : "text/html" },
      redirect: "manual",
    });
    response = await worker.fetch(request, {}, context);
    if (response.status < 300 || response.status >= 400) break;

    const location = response.headers.get("location");
    if (!location) break;
    currentUrl = new URL(location, currentUrl);
    console.log(`Following ${route} redirect -> ${currentUrl.pathname}`);
  }

  if (!response?.ok) {
    const location = response?.headers.get("location") ?? "";
    throw new Error(
      `SSR capture failed for ${route}: ${response?.status} ${response?.statusText ?? ""} ${location}`,
    );
  }
  return response;
}

for (const [index, route] of routes.entries()) {
  const target = outputPath(route);
  await mkdir(dirname(target), { recursive: true });
  const redirect = staticRedirects.get(route);
  if (redirect) {
    await writeFile(target, buildRedirectHtml(redirect.path, redirect.language));
  } else {
    const response = await render(route);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
  }
  if (
    index === 0 ||
    (index + 1) % 50 === 0 ||
    index === routes.length - 1 ||
    /^\/[a-z]{2}\/blog$/.test(route)
  ) {
    console.log(`Rendered ${index + 1}/${routes.length}: ${route}`);
  }
}

await Promise.allSettled(pending);
const homepageHtml = await readFile(".output/public/index.html", "utf8");
await writeFile(".output/public/404.html", buildNotFoundHtml(homepageHtml));
