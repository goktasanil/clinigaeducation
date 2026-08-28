import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@22.4.0";

import {
  claimStripeEvent,
  getStripeClient,
  markStripeEventFailed,
  markStripeEventProcessed,
  processStripeEvent,
  stripeWebhookSecret,
  webhookConfigured,
} from "../_shared/stripe-commerce.ts";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!webhookConfigured()) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  let event;
  try {
    event = await getStripeClient().webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeWebhookSecret(),
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    console.error("stripe-webhook-signature", error instanceof Error ? error.message : error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const shouldProcess = await claimStripeEvent(event);
    if (!shouldProcess) return new Response("ok", { status: 200 });
    await processStripeEvent(event);
    await markStripeEventProcessed(event.id);
    return new Response("ok", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("stripe-webhook-processing", event.id, message);
    try {
      await markStripeEventFailed(event.id, message);
    } catch (markError) {
      console.error(
        "stripe-webhook-mark-failed",
        markError instanceof Error ? markError.message : markError,
      );
    }
    return new Response("Webhook processing failed", { status: 500 });
  }
});
