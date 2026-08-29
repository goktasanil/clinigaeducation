import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const installed = {
  trendyolSdk: Boolean(require.resolve("trendyol-sdk")),
  n8nTrendyol: Boolean(require.resolve("n8n-nodes-trendyol")),
};
const credentialsConfigured = [
  process.env.TRENDYOL_SELLER_ID,
  process.env.TRENDYOL_API_KEY,
  process.env.TRENDYOL_API_SECRET,
].every((value) => Boolean(value?.trim()));

console.log(
  JSON.stringify(
    {
      installed,
      credentialsConfigured,
      environment: process.env.TRENDYOL_ENV === "production" ? "production" : "stage",
      mode: "read-only",
    },
    null,
    2,
  ),
);
