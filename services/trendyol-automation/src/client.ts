import { TrendyolClient } from "trendyol-sdk";

export type ReadonlyConfig = {
  sellerId: string;
  apiKey: string;
  apiSecret: string;
  environment: "stage" | "production";
};

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): ReadonlyConfig {
  if (env.TRENDYOL_ALLOW_WRITES?.toLowerCase() === "true") {
    throw new Error("Read-only adapter refuses to start while TRENDYOL_ALLOW_WRITES=true");
  }
  const sellerId = env.TRENDYOL_SELLER_ID?.trim();
  const apiKey = env.TRENDYOL_API_KEY?.trim();
  const apiSecret = env.TRENDYOL_API_SECRET?.trim();
  if (!sellerId || !apiKey || !apiSecret) {
    throw new Error("Missing TRENDYOL_SELLER_ID, TRENDYOL_API_KEY or TRENDYOL_API_SECRET");
  }
  return {
    sellerId,
    apiKey,
    apiSecret,
    environment: env.TRENDYOL_ENV === "production" ? "production" : "stage",
  };
}

export function createReadonlyClient(
  config: ReadonlyConfig,
  fetchOverride?: typeof globalThis.fetch,
): TrendyolClient {
  return new TrendyolClient({
    sellerId: config.sellerId,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    environment: config.environment,
    integrator: "CliniGA-ReadOnly",
    ...(fetchOverride ? { fetch: fetchOverride } : {}),
  });
}

export async function listProducts(config: ReadonlyConfig, fetchOverride?: typeof fetch) {
  return createReadonlyClient(config, fetchOverride).products.listApproved({ page: 0, size: 50 });
}

export async function listOrders(config: ReadonlyConfig, fetchOverride?: typeof fetch) {
  return createReadonlyClient(config, fetchOverride).orders.list({ page: 0, size: 50 });
}
