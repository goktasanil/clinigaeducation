import { mkdir, writeFile } from "node:fs/promises";

const workerModule = await import("../.output/server/index.mjs");
const worker = workerModule.default ?? workerModule;

if (!worker || typeof worker.fetch !== "function") {
  throw new Error("Built worker does not expose a fetch handler.");
}

const pending = [];
const response = await worker.fetch(
  new Request("https://www.clinigaeducation.com/", {
    headers: { accept: "text/html" },
  }),
  {},
  {
    waitUntil(promise) {
      pending.push(Promise.resolve(promise));
    },
    passThroughOnException() {},
  },
);

if (!response.ok) {
  throw new Error(`Homepage render failed: ${response.status} ${response.statusText}`);
}

await mkdir(".output/public", { recursive: true });
await writeFile(".output/public/index.html", Buffer.from(await response.arrayBuffer()));
await Promise.allSettled(pending);
console.log("Rendered Lighthouse homepage -> .output/public/index.html");
