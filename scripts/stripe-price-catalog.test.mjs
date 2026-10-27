import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import {
  PORTAL_STRIPE_CATALOG,
  assertNoExistingPaidMembership,
  assertPortalStripePrice,
  readPortalPaidAccess,
  stripeCheckoutIsPaid,
  stripeInvoiceIsPaid,
} from "../supabase/functions/_shared/stripe-price-catalog.mjs";

const monthly = PORTAL_STRIPE_CATALOG.find((item) => item.plan === "basic" && !item.yearly);
const credits = PORTAL_STRIPE_CATALOG.find((item) => item.pack === "credits-25");
const fixture = (expected = monthly) => ({
  id: "price_synthetic_fixture",
  object: "price",
  active: true,
  currency: "eur",
  unit_amount: expected.amountMinor,
  unit_amount_decimal: String(expected.amountMinor),
  type: expected.type,
  billing_scheme: "per_unit",
  custom_unit_amount: null,
  transform_quantity: null,
  product: { id: "prod_synthetic_fixture", object: "product", active: true },
  recurring:
    expected.type === "recurring"
      ? { interval: expected.interval, interval_count: 1, usage_type: "licensed" }
      : null,
});

test("server catalog equals the actual displayed EUR student/advertiser and credit catalog", async () => {
  // Evaluate only the actual exported catalog initializers. Unrelated browser
  // imports (country-name JSON, aliases) must not become Node test dependencies,
  // and no duplicated price fixture can hide frontend/backend catalog drift.
  const source = await readFile(new URL("../src/data/portal.ts", import.meta.url), "utf8");
  const ast = ts.createSourceFile("portal.ts", source, ts.ScriptTarget.Latest, true);
  const wanted = new Set(["PORTAL_PLANS", "CREDIT_PACKS"]);
  const catalogs = [];
  for (const statement of ast.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !wanted.has(declaration.name.text)) continue;
      assert.ok(declaration.initializer, `${declaration.name.text} must have an initializer`);
      catalogs.push(
        `export const ${declaration.name.text} = ${declaration.initializer.getText(ast)};`,
      );
      wanted.delete(declaration.name.text);
    }
  }
  assert.equal(wanted.size, 0, "Both displayed price catalogs must remain exported variables");
  const js = ts.transpileModule(catalogs.join("\n"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const { PORTAL_PLANS, CREDIT_PACKS } = await import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
  const displayed = [
    ...PORTAL_PLANS.flatMap((plan) => [
      {
        env: `STRIPE_PRICE_${plan.id.toUpperCase()}_MONTHLY`,
        amount: Math.round(plan.monthly * 100),
      },
      {
        env: `STRIPE_PRICE_${plan.id.toUpperCase()}_YEARLY`,
        amount: Math.round(plan.yearly * 100),
      },
    ]),
    ...CREDIT_PACKS.map((pack) => ({
      env: `STRIPE_PRICE_${pack.id.replace("credits-", "CREDITS_")}`,
      amount: Math.round(pack.price * 100),
    })),
  ];
  assert.equal(PORTAL_STRIPE_CATALOG.length, displayed.length);
  for (const expected of displayed) {
    const actual = PORTAL_STRIPE_CATALOG.find((item) => item.env === expected.env);
    assert.equal(actual?.amountMinor, expected.amount, expected.env);
    assert.equal(actual?.currency, "eur");
  }
});

test("accepts exactly the active fixed recurring and one-time Stripe Prices requested", () => {
  for (const entry of PORTAL_STRIPE_CATALOG) {
    assert.equal(
      assertPortalStripePrice(fixture(entry), entry, "price_synthetic_fixture"),
      "price_synthetic_fixture",
    );
  }
});

test("only confirmed no-paid-access permits membership checkout across providers", async () => {
  let checks = 0;
  await assertNoExistingPaidMembership(async () => {
    checks++;
    return { data: false, error: null };
  });
  assert.equal(checks, 1);
  await assert.rejects(
    () => assertNoExistingPaidMembership(async () => ({ data: true, error: null })),
    /ACTIVE_MEMBERSHIP_EXISTS/,
  );
  assert.equal(await readPortalPaidAccess(async () => ({ data: true, error: null })), true);
});

test("missing, failed or malformed paid-access checks never permit a new membership", async () => {
  for (const response of [
    null,
    {},
    { data: null, error: null },
    { data: "false", error: null },
    { data: 0, error: null },
    { data: [], error: null },
    { data: false },
    { data: false, error: { code: "PGRST202" } },
    { data: true, error: { code: "42501" } },
  ]) {
    await assert.rejects(
      () => assertNoExistingPaidMembership(async () => response),
      /MEMBERSHIP_CHECK_UNAVAILABLE/,
    );
  }
  await assert.rejects(
    () =>
      assertNoExistingPaidMembership(async () => {
        throw new Error("offline");
      }),
    /MEMBERSHIP_CHECK_UNAVAILABLE/,
  );
});

test("wrong amount/currency/active/type/identity or quantity model fails closed", () => {
  const good = fixture();
  const invalid = [
    null,
    {},
    { ...good, id: "price_other" },
    { ...good, active: false },
    { ...good, currency: "try" },
    { ...good, unit_amount: 500 },
    { ...good, unit_amount: "499" },
    { ...good, unit_amount_decimal: "499.1" },
    { ...good, unit_amount_decimal: "4.99e2" },
    { ...good, type: "one_time" },
    { ...good, billing_scheme: "tiered" },
    { ...good, custom_unit_amount: { enabled: true } },
    { ...good, transform_quantity: { divide_by: 100, round: "up" } },
    { ...good, product: "prod_unexpanded" },
    { ...good, product: { ...good.product, active: false } },
    { ...good, product: { ...good.product, deleted: true } },
  ];
  for (const value of invalid)
    assert.throws(
      () => assertPortalStripePrice(value, monthly, good.id),
      /STRIPE_PRICE_NOT_CONFIGURED/,
    );
});

test("recurring interval/count/metering and one-time billing cannot be swapped", () => {
  const good = fixture();
  for (const recurring of [
    null,
    { ...good.recurring, interval: "year" },
    { ...good.recurring, interval_count: 12 },
    { ...good.recurring, usage_type: "metered" },
  ]) {
    assert.throws(
      () => assertPortalStripePrice({ ...good, recurring }, monthly, good.id),
      /STRIPE_PRICE_NOT_CONFIGURED/,
    );
  }
  const oneTime = fixture(credits);
  assert.throws(
    () => assertPortalStripePrice({ ...oneTime, recurring: good.recurring }, credits, oneTime.id),
    /STRIPE_PRICE_NOT_CONFIGURED/,
  );
});

test("unpaid, pending, zero-payment and incomplete checkout events never activate entitlements", () => {
  const settled = { object: "checkout.session", status: "complete", payment_status: "paid" };
  assert.equal(stripeCheckoutIsPaid(settled), true);
  for (const session of [
    null,
    {},
    { ...settled, payment_status: "unpaid" },
    { ...settled, payment_status: "no_payment_required" },
    { ...settled, status: "open" },
    { ...settled, status: "expired" },
    { ...settled, payment_status: true },
  ]) {
    assert.equal(stripeCheckoutIsPaid(session), false);
  }
});

test("invoice guard accepts current settled invoices without obsolete paid flag, not unpaid invoices", () => {
  const paid = { object: "invoice", status: "paid", amount_remaining: 0 };
  assert.equal(stripeInvoiceIsPaid(paid), true);
  assert.equal(stripeInvoiceIsPaid({ ...paid, paid: true }), true);
  for (const invoice of [
    null,
    { ...paid, paid: false },
    { ...paid, status: "open", paid: true },
    { ...paid, amount_remaining: 499 },
    { ...paid, status: "draft" },
  ]) {
    assert.equal(stripeInvoiceIsPaid(invoice), false);
  }
});

test("validation and paid guards are wired before checkout creation and grant paths", async () => {
  const source = await readFile(
    new URL("../supabase/functions/_shared/stripe-commerce.ts", import.meta.url),
    "utf8",
  );
  for (const name of ["createMembershipCheckout", "createCreditCheckout"]) {
    const block = source.slice(source.indexOf(`export async function ${name}`));
    assert.ok(block.indexOf("validatedCatalogPrice(") < block.indexOf("checkout.sessions.create("));
  }
  const membership = source.slice(
    source.indexOf("export async function createMembershipCheckout"),
    source.indexOf("export async function createCreditCheckout"),
  );
  assert.ok(membership.indexOf("assertNoExistingPaidMembership(") >= 0);
  assert.ok(
    membership.indexOf("assertNoExistingPaidMembership(") <
      membership.indexOf("validatedCatalogPrice("),
  );
  assert.match(membership, /rpc\("portal_has_paid_access", \{ p_user_id: args\.userId \}\)/);
  const readiness = source.slice(
    source.indexOf("export async function stripeCatalogConfigured"),
    source.indexOf("function integrationIdentifier"),
  );
  assert.ok(readiness.indexOf("readPortalPaidAccess(") >= 0);
  assert.ok(
    readiness.indexOf("readPortalPaidAccess(") <
      readiness.indexOf("validatedCatalogPrice(entry.env)"),
  );
  assert.match(readiness, /rpc\("portal_has_paid_access"/);
  assert.match(
    source,
    /processCheckoutSession\([^)]*\)\s*\{\s*if \(!stripeCheckoutIsPaid\(session\)\) return;/,
  );
  assert.match(
    source,
    /processInvoicePaid\([^)]*\)\s*\{\s*if \(!stripeInvoiceIsPaid\(invoice\)\) return;/,
  );
  assert.match(source, /case "checkout\.session\.async_payment_succeeded"/);
  const health = await readFile(
    new URL("../supabase/functions/portal-commerce-health/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(health, /await stripeCatalogConfigured\(\)/);
});
