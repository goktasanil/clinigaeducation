// Pure protocol logic shared by Edge handlers and offline Node tests.
const encoder = new TextEncoder();
export const EUR_PRICES = Object.freeze({
  basic_monthly: 499, basic_yearly: 4900, plus_monthly: 899, plus_yearly: 8900,
  pro_monthly: 1999, pro_yearly: 19900, "credits-25": 999, "credits-75": 2499,
  "credits-200": 5499,
});
export const PLAN_CREDITS = Object.freeze({ basic: 10, plus: 30, pro: 80 });
export const PACK_CREDITS = Object.freeze({ "credits-25": 25, "credits-75": 75, "credits-200": 200 });
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function fail(code) { throw new Error(code); }
export function text(value, min = 1, max = 200) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) return null;
  return value.trim();
}
export function ref(value) {
  const valueText = text(value, 4, 128);
  if (!valueText || !/^[a-z0-9_-]+$/i.test(valueText)) fail("INVALID_PROVIDER_REFERENCE");
  return valueText;
}
export function decimalMinor(value) {
  const input = String(value);
  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(input)) fail("INVALID_AMOUNT");
  const [whole, fraction = ""] = input.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || result <= 0 || result > 100_000_000) fail("INVALID_AMOUNT");
  return result;
}
export function decimalAmount(minor) {
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > 100_000_000) fail("INVALID_AMOUNT");
  return (minor / 100).toFixed(2);
}
export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, "0")).join("");
}
export async function sha256(value) {
  const result = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, "0")).join("");
}
export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = encoder.encode(left), b = encoder.encode(right);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}
export async function authorization(apiKey, secret, randomKey, path, body = "") {
  const signature = await hmacHex(secret, randomKey + path + body);
  return "IYZWSv2 " + btoa("apiKey:" + apiKey + "&randomKey:" + randomKey + "&signature:" + signature);
}
// Official V3 examples define a different signed field sequence for HPP and subscriptions.
export async function verifyV3(secret, merchantId, payload, signature) {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  let message;
  if (Object.hasOwn(payload, "subscriptionReferenceCode")) {
    if (String(payload.merchantId) !== String(merchantId)) return false;
    const names = ["eventType", "subscriptionReferenceCode", "orderReferenceCode", "customerReferenceCode"];
    if (names.some(name => !text(String(payload[name] ?? ""), 1, 128))) return false;
    message = String(payload.merchantId) + secret + payload.eventType + payload.subscriptionReferenceCode + payload.orderReferenceCode + payload.customerReferenceCode;
  } else {
    const names = ["iyziEventType", "iyziPaymentId", "token", "paymentConversationId", "status"];
    if (names.some(name => !text(String(payload[name] ?? ""), 1, name === "token" ? 1024 : 128))) return false;
    if (payload.merchantId !== undefined && String(payload.merchantId) !== String(merchantId)) return false;
    message = secret + payload.iyziEventType + payload.iyziPaymentId + payload.token + payload.paymentConversationId + payload.status;
  }
  return constantTimeEqual(await hmacHex(secret, message), signature.toLowerCase());
}
export function parseCatalog(raw) {
  let input;
  try { input = JSON.parse(raw || "{}"); } catch { fail("INVALID_PRICE_CONFIGURATION"); }
  const plans = [], packs = [], seen = new Set();
  for (const row of input.plans || []) {
    if (!Object.hasOwn(PLAN_CREDITS, row.plan) || typeof row.yearly !== "boolean" || !["EUR", "TRY"].includes(row.currency)) fail("INVALID_PRICE_CONFIGURATION");
    const key = row.plan + "_" + (row.yearly ? "yearly" : "monthly");
    const amountMinor = row.amountMinor;
    decimalAmount(amountMinor);
    if (row.currency === "EUR" && amountMinor !== EUR_PRICES[key]) fail("EUR_PRICE_CHANGED");
    const identity = key + ":" + row.currency;
    if (seen.has(identity)) fail("DUPLICATE_PRICE_CONFIGURATION");
    seen.add(identity);
    plans.push({ plan: row.plan, yearly: row.yearly, currency: row.currency, amountMinor, referenceCode: ref(row.referenceCode) });
  }
  for (const row of input.creditPacks || []) {
    if (!Object.hasOwn(PACK_CREDITS, row.pack) || !["EUR", "TRY"].includes(row.currency)) fail("INVALID_PRICE_CONFIGURATION");
    decimalAmount(row.amountMinor);
    if (row.currency === "EUR" && row.amountMinor !== EUR_PRICES[row.pack]) fail("EUR_PRICE_CHANGED");
    const identity = row.pack + ":" + row.currency;
    if (seen.has(identity)) fail("DUPLICATE_PRICE_CONFIGURATION");
    seen.add(identity);
    packs.push({ pack: row.pack, currency: row.currency, amountMinor: row.amountMinor });
  }
  return { plans, packs };
}
export const BILLING_FIELDS = Object.freeze(["name", "surname", "gsmNumber", "identityNumber", "billingAddress.address", "billingAddress.contactName", "billingAddress.city", "billingAddress.country"]);
export function billingCustomer(input, authenticatedEmail) {
  const missing = [];
  const root = input && typeof input === "object" ? input : {};
  for (const path of BILLING_FIELDS) {
    const value = path.split(".").reduce((object, key) => object?.[key], root);
    if (!text(value, 1, path === "billingAddress.address" ? 500 : 200)) missing.push(path);
  }
  if (!text(authenticatedEmail, 3, 254) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(authenticatedEmail)) missing.push("email");
  if (missing.length) return { missing };
  if (!/^\+[1-9]\d{6,14}$/.test(root.gsmNumber.trim())) return { missing: ["gsmNumber"] };
  const billingAddress = {
    address: root.billingAddress.address.trim(), contactName: root.billingAddress.contactName.trim(),
    city: root.billingAddress.city.trim(), country: root.billingAddress.country.trim(),
  };
  if (text(root.billingAddress.zipCode, 1, 20)) billingAddress.zipCode = root.billingAddress.zipCode.trim();
  return { customer: {
    name: root.name.trim(), surname: root.surname.trim(), email: authenticatedEmail,
    gsmNumber: root.gsmNumber.trim(), identityNumber: root.identityNumber.trim(), billingAddress,
  }, missing: [] };
}
export function validateProviderPlan(actual, expected) {
  if (!actual || actual.referenceCode !== expected.referenceCode || actual.currencyCode !== expected.currency ||
      decimalMinor(actual.price) !== expected.amountMinor || actual.paymentInterval !== (expected.yearly ? "YEARLY" : "MONTHLY") ||
      Number(actual.paymentIntervalCount) !== 1 || actual.planPaymentType !== "RECURRING" ||
      Number(actual.trialPeriodDays || 0) !== 0 || actual.status !== "ACTIVE") fail("PROVIDER_PLAN_MISMATCH");
}
export function paidPeriods(subscription, expected) {
  if (!subscription || subscription.referenceCode !== expected.subscriptionReferenceCode ||
      subscription.pricingPlanReferenceCode !== expected.referenceCode ||
      subscription.customerReferenceCode !== expected.customerReferenceCode) fail("PROVIDER_SUBSCRIPTION_MISMATCH");
  const periods = [], seen = new Set();
  for (const order of subscription.orders || []) {
    if (order.orderStatus !== "SUCCESS") continue;
    const success = (order.paymentAttempts || []).some(attempt => attempt.paymentStatus === "SUCCESS" && attempt.paymentId);
    if (!success) continue;
    if (order.currencyCode !== expected.currency || decimalMinor(order.price) !== expected.amountMinor) fail("PROVIDER_AMOUNT_MISMATCH");
    const start = Number(order.startPeriod), end = Number(order.endPeriod);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end <= start) fail("INVALID_PAID_PERIOD");
    const reference = ref(order.referenceCode);
    if (seen.has(reference)) continue;
    seen.add(reference);
    periods.push({ reference, start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  }
  return periods;
}
export function subscriptionState(status) {
  const states = { ACTIVE: "active", PENDING: "pending", UNPAID: "past_due", UPGRADED: "inactive", CANCELED: "cancelled", EXPIRED: "expired" };
  if (!Object.hasOwn(states, status)) fail("UNKNOWN_SUBSCRIPTION_STATUS");
  return states[status];
}
export function hostedPaymentUrl(input, mode) {
  let value;
  try { value = new URL(input); } catch { fail("INVALID_PROVIDER_CHECKOUT_URL"); }
  const hosts = mode === "live" ? ["cpp.iyzipay.com"] : ["sandbox-cpp.iyzipay.com"];
  if (value.protocol !== "https:" || !hosts.includes(value.hostname) || value.username || value.password || value.port) fail("INVALID_PROVIDER_CHECKOUT_URL");
  return value.href;
}
export function isolatedCheckoutBase(input) {
  let value;
  try { value = new URL(input); } catch { fail("HOSTED_FORM_ORIGIN_REQUIRED"); }
  if (value.protocol !== "https:" || value.username || value.password || value.search || value.hash ||
      value.hostname.endsWith(".supabase.co") || ["www.clinigaeducation.com", "clinigaeducation.com"].includes(value.hostname)) fail("ISOLATED_HOSTED_FORM_ORIGIN_REQUIRED");
  return value.href.replace(/\/$/, "");
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export function providerFormHtml(input) {
 let html=text(input,20,200000);
 if(!html)fail("INVALID_PROVIDER_FORM");
 if(!html.trim().startsWith("<")){
  try { html=new TextDecoder().decode(Uint8Array.from(atob(html),char=>char.charCodeAt(0))); }
  catch { fail("INVALID_PROVIDER_FORM"); }
 }
 if(!/<script[\s>]/i.test(html) || !html.includes("iyziInit"))fail("INVALID_PROVIDER_FORM");
 return html;
}
