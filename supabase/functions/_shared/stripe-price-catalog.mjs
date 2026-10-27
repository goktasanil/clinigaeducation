// Server-authoritative EUR prices displayed by CliniGA Education's portal.
// No Stripe credentials or network calls belong in this pure validation module.
export const PORTAL_STRIPE_CATALOG = Object.freeze(
  [
    {
      env: "STRIPE_PRICE_BASIC_MONTHLY",
      plan: "basic",
      yearly: false,
      amountMinor: 499,
      type: "recurring",
      interval: "month",
    },
    {
      env: "STRIPE_PRICE_BASIC_YEARLY",
      plan: "basic",
      yearly: true,
      amountMinor: 4900,
      type: "recurring",
      interval: "year",
    },
    {
      env: "STRIPE_PRICE_PLUS_MONTHLY",
      plan: "plus",
      yearly: false,
      amountMinor: 899,
      type: "recurring",
      interval: "month",
    },
    {
      env: "STRIPE_PRICE_PLUS_YEARLY",
      plan: "plus",
      yearly: true,
      amountMinor: 8900,
      type: "recurring",
      interval: "year",
    },
    {
      env: "STRIPE_PRICE_PRO_MONTHLY",
      plan: "pro",
      yearly: false,
      amountMinor: 1999,
      type: "recurring",
      interval: "month",
    },
    {
      env: "STRIPE_PRICE_PRO_YEARLY",
      plan: "pro",
      yearly: true,
      amountMinor: 19900,
      type: "recurring",
      interval: "year",
    },
    {
      env: "STRIPE_PRICE_CREDITS_25",
      pack: "credits-25",
      amountMinor: 999,
      type: "one_time",
      interval: null,
    },
    {
      env: "STRIPE_PRICE_CREDITS_75",
      pack: "credits-75",
      amountMinor: 2499,
      type: "one_time",
      interval: null,
    },
    {
      env: "STRIPE_PRICE_CREDITS_200",
      pack: "credits-200",
      amountMinor: 5499,
      type: "one_time",
      interval: null,
    },
  ].map((entry) => Object.freeze({ ...entry, currency: "eur" })),
);

const mismatch = () => {
  throw new Error("STRIPE_PRICE_NOT_CONFIGURED");
};
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Require an authoritative boolean from the cross-provider paid-access RPC.
 * A missing migration, RPC error, or unexpected response must never authorize
 * a new subscription or make checkout health appear ready.
 * @param {() => PromiseLike<{data: unknown, error: unknown}>} lookup
 * @returns {Promise<boolean>}
 */
export async function readPortalPaidAccess(lookup) {
  try {
    const result = await lookup();
    if (record(result) && result.error === null && typeof result.data === "boolean")
      return result.data;
  } catch {
    // Transport/permission failures are configuration failures, not no-access.
  }
  throw new Error("MEMBERSHIP_CHECK_UNAVAILABLE");
}

/** @param {() => PromiseLike<{data: unknown, error: unknown}>} lookup */
export async function assertNoExistingPaidMembership(lookup) {
  if (await readPortalPaidAccess(lookup)) throw new Error("ACTIVE_MEMBERSHIP_EXISTS");
}

/**
 * The expanded Stripe Product is required as well as an active Price: an active
 * price on an archived product must not turn public checkout readiness green.
 * @param {unknown} value
 * @param {{env:string,amountMinor:number,type:string,interval:string|null,currency:string}} expected
 * @param {string} expectedId
 */
export function assertPortalStripePrice(value, expected, expectedId) {
  if (
    !record(value) ||
    value.object !== "price" ||
    value.id !== expectedId ||
    value.active !== true ||
    value.currency !== expected.currency ||
    !Number.isSafeInteger(value.unit_amount) ||
    value.unit_amount !== expected.amountMinor ||
    value.type !== expected.type ||
    value.billing_scheme !== "per_unit" ||
    value.custom_unit_amount != null ||
    value.transform_quantity != null ||
    !record(value.product) ||
    value.product.object !== "product" ||
    value.product.active !== true ||
    value.product.deleted === true
  )
    mismatch();
  if (
    value.unit_amount_decimal != null &&
    (typeof value.unit_amount_decimal !== "string" ||
      !/^\d+(?:\.0+)?$/.test(value.unit_amount_decimal) ||
      Number(value.unit_amount_decimal) !== expected.amountMinor)
  )
    mismatch();
  if (expected.type === "recurring") {
    if (
      !record(value.recurring) ||
      value.recurring.interval !== expected.interval ||
      value.recurring.interval_count !== 1 ||
      value.recurring.usage_type !== "licensed"
    )
      mismatch();
  } else if (value.recurring != null) mismatch();
  return expectedId;
}

/** Only completed, provider-paid sessions may grant credits/access or mark revenue paid. */
export function stripeCheckoutIsPaid(session) {
  return (
    record(session) &&
    session.object === "checkout.session" &&
    session.status === "complete" &&
    session.payment_status === "paid"
  );
}

/** A failed or incomplete invoice must never trigger membership credit grants. */
export function stripeInvoiceIsPaid(invoice) {
  // Current Stripe Invoice versions expose status/amount_remaining; the legacy
  // `paid` flag may be absent. A present contradictory flag must fail closed.
  return (
    record(invoice) &&
    invoice.object === "invoice" &&
    invoice.status === "paid" &&
    invoice.amount_remaining === 0 &&
    (invoice.paid == null || invoice.paid === true)
  );
}
