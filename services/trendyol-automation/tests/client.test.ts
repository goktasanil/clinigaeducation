import assert from "node:assert/strict";
import test from "node:test";

import { configFromEnv, listProducts } from "../src/client.js";

test("defaults to stage and never exposes secrets", () => {
  const config = configFromEnv({
    TRENDYOL_SELLER_ID: "123",
    TRENDYOL_API_KEY: "key",
    TRENDYOL_API_SECRET: "secret",
  });
  assert.equal(config.environment, "stage");
  assert.equal(JSON.stringify({ environment: config.environment }).includes("secret"), false);
});

test("refuses to start when write mode is enabled", () => {
  assert.throws(
    () =>
      configFromEnv({
        TRENDYOL_SELLER_ID: "123",
        TRENDYOL_API_KEY: "key",
        TRENDYOL_API_SECRET: "secret",
        TRENDYOL_ALLOW_WRITES: "true",
      }),
    /refuses/,
  );
});

test("product adapter performs a GET against the stage gateway", async () => {
  let observed: Request | undefined;
  const fakeFetch: typeof fetch = async (input, init) => {
    observed = new Request(input, init);
    return new Response(JSON.stringify({ content: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const result = await listProducts(
    { sellerId: "123", apiKey: "key", apiSecret: "secret", environment: "stage" },
    fakeFetch,
  );
  assert.deepEqual(result, { content: [] });
  assert.equal(observed?.method, "GET");
  assert.equal(observed?.url.startsWith("https://stageapigw.trendyol.com/"), true);
});
