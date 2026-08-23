import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requestId = z.string().uuid();

function emailFromClaims(claims: unknown) {
  const email = (claims as { email?: unknown } | null)?.email;
  return typeof email === "string" ? email : undefined;
}

export const startMembershipCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        plan: z.enum(["basic", "plus", "pro"]),
        yearly: z.boolean(),
        requestId,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createMembershipCheckout } = await import("@/lib/stripe.server");
    return createMembershipCheckout({
      userId: context.userId,
      email: emailFromClaims(context.claims),
      ...data,
    });
  });

export const startCreditCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ pack: z.enum(["credits-25", "credits-75", "credits-200"]), requestId }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createCreditCheckout } = await import("@/lib/stripe.server");
    return createCreditCheckout({
      userId: context.userId,
      email: emailFromClaims(context.claims),
      ...data,
    });
  });

export const startCustomerPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { createCustomerPortalSession } = await import("@/lib/stripe.server");
    return createCustomerPortalSession(context.userId);
  });

export const startConnectOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // The portal profile table is newer than the generated Supabase client types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = context.supabase as any;
    const { data: profile } = await db
      .from("portal_profiles")
      .select("display_name, country_code, verification_status")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (profile?.verification_status !== "verified") throw new Error("VERIFIED_ACCOUNT_REQUIRED");
    if (!profile?.display_name || !profile?.country_code)
      throw new Error("PROFILE_COUNTRY_REQUIRED");
    const { createConnectOnboarding } = await import("@/lib/stripe.server");
    return createConnectOnboarding({
      userId: context.userId,
      email: emailFromClaims(context.claims),
      displayName: profile.display_name,
      countryCode: profile.country_code,
    });
  });

export const startMarketplaceCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ listingId: z.string().uuid(), requestId }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createMarketplaceCheckout } = await import("@/lib/stripe.server");
    return createMarketplaceCheckout({
      buyerId: context.userId,
      email: emailFromClaims(context.claims),
      ...data,
    });
  });
