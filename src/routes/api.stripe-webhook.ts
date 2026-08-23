import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("stripe-signature");
        const { handleStripeWebhook } = await import("@/lib/stripe.server");
        return handleStripeWebhook(rawBody, signature);
      },
    },
  },
});
