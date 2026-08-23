/* eslint-disable @typescript-eslint/no-explicit-any -- Portal tables are newer than generated Supabase types. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const listingSchema = z.object({
  kind: z.enum([
    "housing",
    "dormitory",
    "scholarships",
    "marketplace",
    "roommates",
    "community",
    "jobs",
    "services",
  ]),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(3000),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  city: z.string().trim().min(2).max(100),
  institution: z.string().trim().max(200).optional().nullable(),
  institutionId: z.string().trim().max(250).optional().nullable(),
  program: z.string().trim().max(200).optional().nullable(),
  price: z.number().min(1).max(1_000_000).optional().nullable(),
  currency: z.literal("EUR").default("EUR"),
});

export const getPortalDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as any;
    const [
      profile,
      subscription,
      wallet,
      verificationRequest,
      listings,
      saved,
      messages,
      connectAccount,
      orders,
    ] = await Promise.all([
      db.from("portal_profiles").select("*").eq("user_id", context.userId).maybeSingle(),
      db.from("portal_subscriptions").select("*").eq("user_id", context.userId).maybeSingle(),
      db
        .from("portal_credit_wallets")
        .select("balance, updated_at")
        .eq("user_id", context.userId)
        .maybeSingle(),
      db
        .from("portal_verification_requests")
        .select("id, requested_role, status, submitted_at, reviewed_at")
        .eq("user_id", context.userId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from("portal_listings")
        .select("id, kind, title, city, status, verified, created_at")
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("portal_saved_items")
        .select("id, item_type, item_id, title, metadata, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("portal_messages")
        .select("id, sender_id, recipient_id, body, read_at, created_at")
        .or("sender_id.eq." + context.userId + ",recipient_id.eq." + context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("portal_connect_accounts")
        .select(
          "stripe_account_id, country_code, status, payouts_enabled, details_submitted, updated_at",
        )
        .eq("user_id", context.userId)
        .maybeSingle(),
      db
        .from("portal_marketplace_orders")
        .select("id, listing_id, buyer_id, seller_id, amount_minor, currency, status, created_at")
        .or("buyer_id.eq." + context.userId + ",seller_id.eq." + context.userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    return {
      profile: profile.data || null,
      subscription: subscription.data || { plan: "basic", status: "inactive" },
      wallet: wallet.data || { balance: 0 },
      verificationRequest: verificationRequest.data || null,
      listings: listings.data || [],
      saved: saved.data || [],
      messages: messages.data || [],
      connectAccount: connectAccount.data || null,
      orders: orders.data || [],
    };
  });

export const savePortalProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        displayName: z.string().trim().min(2).max(80),
        countryCode: z.string().trim().length(2).optional().nullable(),
        city: z.string().trim().max(100).optional().nullable(),
        institution: z.string().trim().max(200).optional().nullable(),
        program: z.string().trim().max(200).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { error } = await db.from("portal_profiles").upsert({
      user_id: context.userId,
      display_name: data.displayName,
      country_code: data.countryCode || null,
      city: data.city || null,
      institution: data.institution || null,
      program: data.program || null,
    });
    if (error) throw error;
    return { ok: true as const };
  });

export const requestInstitutionProgramCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        institutionExternalId: z
          .string()
          .trim()
          .regex(/^I\d+$/),
        institutionName: z.string().trim().min(2).max(200),
        countryCode: z
          .string()
          .trim()
          .length(2)
          .transform((value) => value.toUpperCase()),
        city: z.string().trim().max(100).optional().nullable(),
        officialUrl: z.string().url().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { error } = await db.from("portal_program_catalog_requests").upsert(
      {
        user_id: context.userId,
        institution_external_id: data.institutionExternalId,
        institution_name: data.institutionName,
        country_code: data.countryCode,
        city: data.city || null,
        official_url: data.officialUrl || null,
        status: "pending",
      },
      { onConflict: "user_id,institution_external_id" },
    );
    if (error) throw error;
    return { ok: true as const };
  });

export const createPortalListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { data: listingId, error } = await db.rpc("portal_create_paid_listing_v2", {
      p_kind: data.kind,
      p_title: data.title,
      p_description: data.description,
      p_country_code: data.countryCode,
      p_city: data.city,
      p_institution: data.institution || null,
      p_program: data.program || null,
      p_price_amount: data.price ?? null,
      p_currency: data.currency,
      p_idempotency_key: crypto.randomUUID(),
    });
    if (error) throw error;
    return { ok: true as const, id: String(listingId) };
  });

export const savePortalItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        itemType: z.enum(["institution", "program", "listing", "guide"]),
        itemId: z.string().trim().min(1).max(250),
        title: z.string().trim().min(1).max(250),
        metadata: z.record(z.unknown()).optional().default({}),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as any;
    const { error } = await db.from("portal_saved_items").upsert(
      {
        user_id: context.userId,
        item_type: data.itemType,
        item_id: data.itemId,
        title: data.title,
        metadata: data.metadata,
      },
      { onConflict: "user_id,item_type,item_id" },
    );
    if (error) throw error;
    return { ok: true as const };
  });
