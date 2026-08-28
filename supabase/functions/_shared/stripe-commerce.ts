import Stripe from "npm:stripe@22.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.110.2";

type PortalPlan = "basic" | "plus" | "pro";
type CreditPack = "credits-25" | "credits-75" | "credits-200";

export type CommerceAction =
  | { action: "health" }
  | { action: "membership"; plan: PortalPlan; yearly: boolean; requestId: string }
  | { action: "credits"; pack: CreditPack; requestId: string }
  | { action: "customer_portal" }
  | { action: "connect" }
  | { action: "marketplace"; listingId: string; requestId: string };

const PLAN_CREDITS: Record<PortalPlan, number> = { basic: 10, plus: 30, pro: 80 };
const CREDIT_PACK_AMOUNTS: Record<CreditPack, number> = {
  "credits-25": 25,
  "credits-75": 75,
  "credits-200": 200,
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let stripeClient: Stripe | undefined;
let adminClient: ReturnType<typeof createClient> | undefined;

function env(name: string) {
  return Deno.env.get(name)?.trim() || "";
}

export function commerceConfigured() {
  return Boolean(
    env("SUPABASE_URL") &&
      env("SUPABASE_SERVICE_ROLE_KEY") &&
      (env("STRIPE_RESTRICTED_KEY") || env("STRIPE_SECRET_KEY")),
  );
}

export function webhookConfigured() {
  return commerceConfigured() && Boolean(env("STRIPE_WEBHOOK_SECRET"));
}

export function getStripeClient() {
  if (stripeClient) return stripeClient;
  const apiKey = env("STRIPE_RESTRICTED_KEY") || env("STRIPE_SECRET_KEY");
  if (!apiKey) throw new Error("STRIPE_NOT_CONFIGURED");
  stripeClient = new Stripe(apiKey, {
    apiVersion: "2026-07-29.dahlia",
    appInfo: { name: "CliniGA Education Portal Edge", version: "1.0.0" },
    typescript: true,
  });
  return stripeClient;
}

export function getAdminClient() {
  if (adminClient) return adminClient;
  const url = env("SUPABASE_URL");
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED");
  adminClient = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

function siteUrl() {
  return (env("SITE_URL") || "https://www.clinigaeducation.com").replace(/\/$/, "");
}

function priceId(key: string) {
  const value = env(key);
  if (!value.startsWith("price_")) throw new Error(`MISSING_${key}`);
  return value;
}

function membershipPrice(plan: PortalPlan, yearly: boolean) {
  return priceId(`STRIPE_PRICE_${plan.toUpperCase()}_${yearly ? "YEARLY" : "MONTHLY"}`);
}

function creditPrice(pack: CreditPack) {
  const suffix = pack.replace("credits-", "CREDITS_");
  return priceId(`STRIPE_PRICE_${suffix}`);
}

function integrationIdentifier(prefix: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${prefix}_${suffix}`;
}

function toMinorUnits(amount: number) {
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
    throw new Error("INVALID_MARKETPLACE_AMOUNT");
  }
  return Math.round(amount * 100);
}

function calculateApplicationFee(amountMinor: number) {
  if (!Number.isInteger(amountMinor) || amountMinor < 100) {
    throw new Error("INVALID_MARKETPLACE_AMOUNT");
  }
  const marginBps = Number(env("STRIPE_PLATFORM_MARGIN_BPS") || 500);
  const reserveBps = Number(env("STRIPE_PROCESSING_RESERVE_BPS") || 350);
  const reserveFixed = Number(env("STRIPE_PROCESSING_RESERVE_FIXED_CENTS") || 25);
  const percentageFee = Math.ceil((amountMinor * (marginBps + reserveBps)) / 10_000);
  return Math.min(amountMinor - 1, percentageFee + reserveFixed);
}

function validateRequestId(value: unknown) {
  if (typeof value !== "string" || !UUID_RE.test(value)) throw new Error("INVALID_REQUEST_ID");
  return value;
}

export function parseCommerceAction(value: unknown): CommerceAction {
  if (!value || typeof value !== "object") throw new Error("INVALID_REQUEST");
  const input = value as Record<string, unknown>;
  if (input.action === "health") return { action: "health" };
  if (input.action === "membership") {
    if (!(["basic", "plus", "pro"] as unknown[]).includes(input.plan)) {
      throw new Error("INVALID_PLAN");
    }
    if (typeof input.yearly !== "boolean") throw new Error("INVALID_BILLING_PERIOD");
    return {
      action: "membership",
      plan: input.plan as PortalPlan,
      yearly: input.yearly,
      requestId: validateRequestId(input.requestId),
    };
  }
  if (input.action === "credits") {
    if (!(["credits-25", "credits-75", "credits-200"] as unknown[]).includes(input.pack)) {
      throw new Error("INVALID_CREDIT_PACK");
    }
    return {
      action: "credits",
      pack: input.pack as CreditPack,
      requestId: validateRequestId(input.requestId),
    };
  }
  if (input.action === "customer_portal") return { action: "customer_portal" };
  if (input.action === "connect") return { action: "connect" };
  if (input.action === "marketplace") {
    if (typeof input.listingId !== "string" || !UUID_RE.test(input.listingId)) {
      throw new Error("INVALID_LISTING_ID");
    }
    return {
      action: "marketplace",
      listingId: input.listingId,
      requestId: validateRequestId(input.requestId),
    };
  }
  throw new Error("UNKNOWN_ACTION");
}

export async function requireUser(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw new Error("AUTH_REQUIRED");
  const token = match[1];
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_REQUIRED");
  return data.user;
}

export async function createMembershipCheckout(args: {
  userId: string;
  email?: string;
  plan: PortalPlan;
  yearly: boolean;
  requestId: string;
}) {
  const session = await getStripeClient().checkout.sessions.create(
    {
      mode: "subscription",
      client_reference_id: args.userId,
      customer_email: args.email || undefined,
      line_items: [{ price: membershipPrice(args.plan, args.yearly), quantity: 1 }],
      subscription_data: { metadata: { user_id: args.userId, plan: args.plan } },
      metadata: { type: "membership", user_id: args.userId, plan: args.plan },
      integration_identifier: integrationIdentifier("cliniga_membership"),
      consent_collection: { terms_of_service: "required" },
      success_url: `${siteUrl()}/portal/panel?payment=membership-success`,
      cancel_url: `${siteUrl()}/portal?payment=cancelled#uyelik`,
    },
    { idempotencyKey: `membership:${args.userId}:${args.requestId}` },
  );
  if (!session.url) throw new Error("CHECKOUT_URL_NOT_CREATED");
  return { url: session.url };
}

export async function createCreditCheckout(args: {
  userId: string;
  email?: string;
  pack: CreditPack;
  requestId: string;
}) {
  const session = await getStripeClient().checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: args.userId,
      customer_email: args.email || undefined,
      line_items: [{ price: creditPrice(args.pack), quantity: 1 }],
      metadata: {
        type: "credit_pack",
        user_id: args.userId,
        credit_pack: args.pack,
        credits: String(CREDIT_PACK_AMOUNTS[args.pack]),
      },
      integration_identifier: integrationIdentifier("cliniga_credits"),
      consent_collection: { terms_of_service: "required" },
      success_url: `${siteUrl()}/portal/panel?payment=credits-success`,
      cancel_url: `${siteUrl()}/portal?payment=cancelled#uyelik`,
    },
    { idempotencyKey: `credits:${args.userId}:${args.requestId}` },
  );
  if (!session.url) throw new Error("CHECKOUT_URL_NOT_CREATED");
  return { url: session.url };
}

export async function createCustomerPortalSession(userId: string) {
  const { data } = await getAdminClient()
    .from("portal_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.stripe_customer_id) throw new Error("NO_STRIPE_CUSTOMER");
  const session = await getStripeClient().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${siteUrl()}/portal/panel`,
  });
  return { url: session.url };
}

export async function createConnectOnboarding(args: {
  userId: string;
  email?: string;
  displayName: string;
  countryCode: string;
}) {
  const db = getAdminClient();
  const { data: existing } = await db
    .from("portal_connect_accounts")
    .select("stripe_account_id")
    .eq("user_id", args.userId)
    .maybeSingle();

  let accountId = existing?.stripe_account_id as string | undefined;
  const stripe = getStripeClient();
  if (!accountId) {
    const account = await (stripe as any).v2.core.accounts.create(
      {
        contact_email: args.email,
        display_name: args.displayName,
        dashboard: "express",
        identity: { country: args.countryCode.toLowerCase(), entity_type: "individual" },
        configuration: {
          recipient: {
            capabilities: { stripe_balance: { stripe_transfers: { requested: true } } },
          },
        },
        defaults: {
          currency: "eur",
          locales: ["tr-TR", "en"],
          profile: {
            business_url: "https://www.clinigaeducation.com/portal",
            product_description: "Verified student marketplace listings and services",
          },
          responsibilities: { fees_collector: "application", losses_collector: "application" },
        },
        metadata: { portal_user_id: args.userId },
        include: ["configuration.recipient", "requirements"],
      },
      { idempotencyKey: `connect-account:${args.userId}` },
    );
    accountId = account.id;
    const { error } = await db.from("portal_connect_accounts").upsert({
      user_id: args.userId,
      stripe_account_id: accountId,
      country_code: args.countryCode.toUpperCase(),
      status: "onboarding",
    });
    if (error) throw error;
  }

  const link = await (stripe as any).v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["recipient"],
        collection_options: { fields: "eventually_due", future_requirements: "include" },
        refresh_url: `${siteUrl()}/portal/panel?stripe=refresh`,
        return_url: `${siteUrl()}/portal/panel?stripe=return`,
      },
    },
  });
  if (!link?.url) throw new Error("CONNECT_ONBOARDING_URL_NOT_CREATED");
  return { url: String(link.url) };
}

export async function createMarketplaceCheckout(args: {
  buyerId: string;
  email?: string;
  listingId: string;
  requestId: string;
}) {
  const db = getAdminClient();
  const { data: existingOrder } = await db
    .from("portal_marketplace_orders")
    .select("id, stripe_checkout_session_id")
    .eq("idempotency_key", args.requestId)
    .eq("buyer_id", args.buyerId)
    .maybeSingle();
  if (existingOrder?.stripe_checkout_session_id) {
    const previous = await getStripeClient().checkout.sessions.retrieve(
      existingOrder.stripe_checkout_session_id,
    );
    if (previous.url) return { url: previous.url };
  }

  const { data: listing, error: listingError } = await db
    .from("portal_listings")
    .select("id, owner_id, title, kind, status, verified, price_amount, currency")
    .eq("id", args.listingId)
    .maybeSingle();
  if (listingError || !listing) throw new Error("LISTING_NOT_FOUND");
  if (listing.status !== "active" || !listing.verified) throw new Error("LISTING_NOT_AVAILABLE");
  if (listing.owner_id === args.buyerId) throw new Error("CANNOT_BUY_OWN_LISTING");

  const amountMinor = toMinorUnits(Number(listing.price_amount));
  const currency = String(listing.currency || "EUR").toLowerCase();
  if (currency !== "eur") throw new Error("UNSUPPORTED_MARKETPLACE_CURRENCY");

  const { data: seller } = await db
    .from("portal_connect_accounts")
    .select("stripe_account_id, status, payouts_enabled")
    .eq("user_id", listing.owner_id)
    .maybeSingle();
  if (!seller?.stripe_account_id || seller.status !== "active" || !seller.payouts_enabled) {
    throw new Error("SELLER_PAYMENT_ACCOUNT_NOT_READY");
  }

  const platformFee = calculateApplicationFee(amountMinor);
  let orderId = existingOrder?.id as string | undefined;
  if (!orderId) {
    const { data: order, error: orderError } = await db
      .from("portal_marketplace_orders")
      .insert({
        listing_id: listing.id,
        buyer_id: args.buyerId,
        seller_id: listing.owner_id,
        amount_minor: amountMinor,
        currency,
        platform_fee_minor: platformFee,
        status: "pending",
        idempotency_key: args.requestId,
      })
      .select("id")
      .single();
    if (orderError) throw orderError;
    orderId = order.id;
  }
  if (!orderId) throw new Error("MARKETPLACE_ORDER_NOT_CREATED");

  const session = await getStripeClient().checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: args.buyerId,
      customer_email: args.email || undefined,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountMinor,
            product_data: { name: listing.title, metadata: { listing_id: listing.id } },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: seller.stripe_account_id },
        metadata: {
          type: "marketplace_order",
          order_id: orderId,
          listing_id: listing.id,
          buyer_id: args.buyerId,
          seller_id: listing.owner_id,
        },
      },
      metadata: { type: "marketplace_order", order_id: orderId, listing_id: listing.id },
      integration_identifier: integrationIdentifier("cliniga_marketplace"),
      consent_collection: { terms_of_service: "required" },
      success_url: `${siteUrl()}/portal/panel?payment=marketplace-success&order=${orderId}`,
      cancel_url: `${siteUrl()}/portal?payment=cancelled`,
    },
    { idempotencyKey: `marketplace:${args.buyerId}:${args.requestId}` },
  );
  if (!session.url) throw new Error("CHECKOUT_URL_NOT_CREATED");
  const { error: updateError } = await db
    .from("portal_marketplace_orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", orderId);
  if (updateError) throw updateError;
  return { url: session.url };
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const value =
    (subscription as unknown as { current_period_end?: number }).current_period_end ||
    subscription.items.data[0]?.current_period_end;
  return value ? new Date(value * 1000).toISOString() : null;
}

function portalSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "cancelled";
  return "inactive";
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;
  const plan = metadata.plan as PortalPlan | undefined;
  if (!userId || !plan || !PLAN_CREDITS[plan]) return;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const { error } = await getAdminClient().from("portal_subscriptions").upsert({
    user_id: userId,
    plan,
    status: portalSubscriptionStatus(subscription.status),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id || null,
    current_period_end: subscriptionPeriodEnd(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
  if (error) throw error;
}

async function grantCredits(args: {
  userId: string;
  amount: number;
  reason: "membership" | "credit_pack";
  providerEventId: string;
  metadata?: Record<string, unknown>;
}) {
  if (!args.userId || !Number.isInteger(args.amount) || args.amount <= 0) {
    throw new Error("INVALID_CREDIT_GRANT");
  }
  const { error } = await getAdminClient().rpc("portal_grant_stripe_credits", {
    p_user_id: args.userId,
    p_amount: args.amount,
    p_reason: args.reason,
    p_provider_event_id: args.providerEventId,
    p_metadata: args.metadata || {},
  });
  if (error) throw error;
}

async function processCheckoutSession(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  if (metadata.type === "membership" && typeof session.subscription === "string") {
    await upsertSubscription(await getStripeClient().subscriptions.retrieve(session.subscription));
    return;
  }
  if (metadata.type === "credit_pack") {
    await grantCredits({
      userId: metadata.user_id,
      amount: Number(metadata.credits),
      reason: "credit_pack",
      providerEventId: session.id,
      metadata: { credit_pack: metadata.credit_pack },
    });
    return;
  }
  if (metadata.type === "marketplace_order" && metadata.order_id) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    let chargeId: string | null = null;
    if (paymentIntentId) {
      const intent = await getStripeClient().paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge"],
      });
      chargeId =
        typeof intent.latest_charge === "string"
          ? intent.latest_charge
          : intent.latest_charge?.id || null;
    }
    const { error } = await getAdminClient()
      .from("portal_marketplace_orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: paymentIntentId || null,
        stripe_charge_id: chargeId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", metadata.order_id);
    if (error) throw error;
  }
}

async function processInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceRecord = invoice as any;
  const subscriptionId =
    typeof invoiceRecord.subscription === "string"
      ? invoiceRecord.subscription
      : invoiceRecord.parent?.subscription_details?.subscription;
  if (!subscriptionId) return;
  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription);
  const plan = subscription.metadata.plan as PortalPlan;
  const userId = subscription.metadata.user_id;
  if (userId && PLAN_CREDITS[plan]) {
    await grantCredits({
      userId,
      amount: PLAN_CREDITS[plan],
      reason: "membership",
      providerEventId: invoice.id,
      metadata: { plan, subscription_id: subscription.id },
    });
  }
}

async function processAccountUpdated(account: Stripe.Account) {
  const transferStatus = account.capabilities?.transfers || "inactive";
  const active = account.payouts_enabled && transferStatus === "active";
  const { error } = await getAdminClient()
    .from("portal_connect_accounts")
    .update({
      status: active ? "active" : account.details_submitted ? "pending" : "onboarding",
      payouts_enabled: Boolean(account.payouts_enabled),
      details_submitted: Boolean(account.details_submitted),
      capabilities: account.capabilities || {},
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", account.id);
  if (error) throw error;
}

async function syncConnectV2Account(accountId: string) {
  const account = await (getStripeClient() as any).v2.core.accounts.retrieve(accountId, {
    include: ["configuration.recipient", "requirements"],
  });
  const stripeBalance = account.configuration?.recipient?.capabilities?.stripe_balance;
  const transferStatus = stripeBalance?.stripe_transfers?.status || "pending";
  const payoutStatus = stripeBalance?.payouts?.status || "pending";
  const active = transferStatus === "active" && payoutStatus === "active";
  const hasUserRequirements = Boolean(
    account.requirements?.entries?.some((entry: any) => entry.awaiting_action_from === "user"),
  );
  const restricted = transferStatus === "restricted" || payoutStatus === "restricted";
  const { error } = await getAdminClient()
    .from("portal_connect_accounts")
    .update({
      status: active ? "active" : restricted ? "restricted" : "pending",
      payouts_enabled: active,
      details_submitted: !hasUserRequirements,
      capabilities: { stripe_transfers: transferStatus, payouts: payoutStatus },
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", accountId);
  if (error) throw error;
}

async function processDispute(dispute: Stripe.Dispute, eventId: string) {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
  const stripe = getStripeClient();
  const charge = await stripe.charges.retrieve(chargeId);
  const transferId =
    typeof charge.transfer === "string" ? charge.transfer : charge.transfer?.id || null;
  if (transferId) {
    await stripe.transfers.createReversal(
      transferId,
      {},
      { idempotencyKey: `dispute-reversal:${eventId}` },
    );
  }
  const { error } = await getAdminClient()
    .from("portal_marketplace_orders")
    .update({
      status: "disputed",
      stripe_dispute_id: dispute.id,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_charge_id", chargeId);
  if (error) throw error;
}

export async function processStripeEvent(event: Stripe.Event) {
  const thinEvent = event as unknown as {
    type: string;
    related_object?: { id?: string; type?: string } | null;
  };
  if (
    (thinEvent.type.startsWith("v2.core.account.") || thinEvent.type.startsWith("v2.core.account[")) &&
    thinEvent.related_object?.id
  ) {
    await syncConnectV2Account(thinEvent.related_object.id);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await processCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case "invoice.paid":
      await processInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
    case "account.updated":
      await processAccountUpdated(event.data.object as Stripe.Account);
      break;
    case "charge.dispute.created":
      await processDispute(event.data.object as Stripe.Dispute, event.id);
      break;
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const { error } = await getAdminClient()
        .from("portal_marketplace_orders")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("stripe_charge_id", charge.id);
      if (error) throw error;
      break;
    }
    default:
      break;
  }
}

export async function claimStripeEvent(event: Stripe.Event) {
  const db = getAdminClient();
  const { data: known } = await db
    .from("portal_stripe_events")
    .select("status")
    .eq("event_id", event.id)
    .maybeSingle();
  if (known?.status === "processed") return false;
  const { error } = await db.from("portal_stripe_events").upsert({
    event_id: event.id,
    event_type: event.type,
    status: "processing",
    last_error: null,
  });
  if (error) throw error;
  return true;
}

export async function markStripeEventProcessed(eventId: string) {
  const { error } = await getAdminClient()
    .from("portal_stripe_events")
    .update({ status: "processed", processed_at: new Date().toISOString(), last_error: null })
    .eq("event_id", eventId);
  if (error) throw error;
}

export async function markStripeEventFailed(eventId: string, errorMessage: string) {
  const { error } = await getAdminClient()
    .from("portal_stripe_events")
    .update({ status: "failed", last_error: errorMessage.slice(0, 1000) })
    .eq("event_id", eventId);
  if (error) throw error;
}

export function stripeWebhookSecret() {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("STRIPE_WEBHOOK_NOT_CONFIGURED");
  return secret;
}
