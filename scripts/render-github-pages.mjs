import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const workerModule = await import("../.output/server/index.mjs");
const worker = workerModule.default ?? workerModule;

if (!worker || typeof worker.fetch !== "function") {
  throw new Error("Built worker does not expose a fetch handler.");
}

const routes = [
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
  if (/\.[a-z0-9]+$/i.test(route)) {
    return join(".output/public", route.slice(1));
  }
  return join(".output/public", route.slice(1), "index.html");
}

for (const route of routes) {
  const request = new Request(`https://www.clinigaeducation.com${route}`, {
    headers: { accept: route.endsWith(".xml") ? "application/xml" : "text/html" },
  });
  const response = await worker.fetch(request, {}, context);
  if (!response.ok) {
    throw new Error(`SSR capture failed for ${route}: ${response.status} ${response.statusText}`);
  }

  const target = outputPath(route);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  console.log(`Rendered ${route} -> ${target}`);
}

await Promise.allSettled(pending);
await copyFile(".output/public/index.html", ".output/public/404.html");
