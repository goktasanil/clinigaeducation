import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("commerce Edge Function keeps Stripe and service-role secrets server-side", async () => {
  const shared = await read("supabase/functions/_shared/stripe-commerce.ts");
  assert.match(shared, /STRIPE_RESTRICTED_KEY|STRIPE_SECRET_KEY/);
  assert.match(shared, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(shared, /createMembershipCheckout/);
  assert.match(shared, /createCreditCheckout/);
  assert.match(shared, /createCustomerPortalSession/);
  assert.match(shared, /createConnectOnboarding/);
  assert.match(shared, /createMarketplaceCheckout/);
  assert.match(shared, /portal_grant_stripe_credits/);
});

test("authenticated commerce gateway verifies users and restricts browser origins", async () => {
  const source = await read("supabase/functions/portal-commerce/index.ts");
  assert.match(source, /requireUser\(req\)/);
  assert.match(source, /https:\/\/www\.clinigaeducation\.com/);
  assert.match(source, /ORIGIN_NOT_ALLOWED/);
  assert.match(source, /Cache-Control/);
  assert.match(source, /customer_portal/);
  assert.match(source, /marketplace/);
});

test("Stripe webhook verifies the raw signed payload and is idempotent", async () => {
  const webhook = await read("supabase/functions/stripe-webhook/index.ts");
  const shared = await read("supabase/functions/_shared/stripe-commerce.ts");
  assert.match(webhook, /req\.text\(\)/);
  assert.match(webhook, /stripe-signature/);
  assert.match(webhook, /Stripe\.createSubtleCryptoProvider\(\)/);
  assert.match(webhook, /constructEventAsync/);
  assert.match(webhook, /claimStripeEvent/);
  assert.match(shared, /portal_stripe_events/);
  assert.match(shared, /markStripeEventProcessed/);
  assert.match(shared, /markStripeEventFailed/);
});

test("Supabase function config uses platform JWT auth for commerce and signature auth for webhooks", async () => {
  const config = await read("supabase/config.toml");
  assert.match(config, /\[functions\.portal-commerce\][\s\S]*verify_jwt\s*=\s*true/);
  assert.match(config, /\[functions\.portal-commerce-health\][\s\S]*verify_jwt\s*=\s*false/);
  assert.match(config, /\[functions\.stripe-webhook\][\s\S]*verify_jwt\s*=\s*false/);
});

test("browser commerce adapter sends only publishable config and the signed-in user token", async () => {
  const client = await read("src/lib/stripe-edge.ts");
  assert.match(client, /VITE_SUPABASE_URL/);
  assert.match(client, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(client, /data\.session\.access_token/);
  assert.match(client, /portal-commerce/);
  assert.doesNotMatch(client, /SERVICE_ROLE/);
  assert.doesNotMatch(client, /STRIPE_(?:SECRET|RESTRICTED|WEBHOOK)/);
});

test("static portal activates Edge checkout from the payment-safe public listing view", async () => {
  const route = await read("src/routes/portal.tsx");
  const pricing = await read("src/components/portal/PortalStaticFallback.tsx");
  const feed = await read("src/components/portal/PortalStaticCommunityFeed.tsx");
  assert.match(route, /PortalStaticCommunityFeed/);
  assert.match(pricing, /startMembershipCheckoutEdge/);
  assert.match(pricing, /startCreditCheckoutEdge/);
  assert.match(feed, /startMarketplaceCheckoutEdge/);
  assert.match(feed, /portal_public_listings/);
  assert.doesNotMatch(feed, /\.from\("portal_listings"\)/);
});

test("static account route exposes billing and Connect through Edge only", async () => {
  const account = await read("src/routes/_authenticated/portal.account.tsx");
  const guard = await read("src/routes/_authenticated/route.tsx");
  const renderer = await read("scripts/render-github-pages.mjs");
  assert.match(account, /getPortalDashboardClient/);
  assert.match(account, /startCustomerPortalEdge/);
  assert.match(account, /startConnectOnboardingEdge/);
  assert.doesNotMatch(account, /useServerFn/);
  assert.match(guard, /"\/portal\/account"/);
  assert.match(renderer, /"\/portal\/account"/);
});
