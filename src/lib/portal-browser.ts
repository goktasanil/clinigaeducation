/* eslint-disable @typescript-eslint/no-explicit-any -- Portal tables are newer than generated Supabase types. */
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  countryCode: z.string().trim().length(2).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  institution: z.string().trim().max(200).optional().nullable(),
  program: z.string().trim().max(200).optional().nullable(),
});

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

const catalogRequestSchema = z.object({
  institutionExternalId: z
    .string()
    .trim()
    .transform((value) => value.split("/").pop() || value)
    .refine((value) => /^I\d+$/.test(value), "Geçersiz kurum kimliği."),
  institutionName: z.string().trim().min(2).max(200),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  city: z.string().trim().max(100).optional().nullable(),
  officialUrl: z.string().url().max(500).optional().nullable(),
});

async function requirePortalUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error || new Error("Oturum bulunamadı.");
  return data.user;
}

export async function getPortalDashboardClient() {
  const user = await requirePortalUser();
  const db = supabase as any;
  const results = await Promise.all([
    db.from("portal_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    db.from("portal_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    db
      .from("portal_credit_wallets")
      .select("balance, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    db
      .from("portal_verification_requests")
      .select("id, requested_role, status, submitted_at, reviewed_at")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // owner_id is intentionally not readable by browser roles. Paid listing
    // creation remains available through the authenticated, audited RPC, while
    // private listing history stays server-only.
    Promise.resolve({ data: [], error: null }),
    db
      .from("portal_saved_items")
      .select("id, item_type, item_id, title, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("portal_messages")
      .select("id, sender_id, recipient_id, body, read_at, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("portal_connect_accounts")
      .select(
        "stripe_account_id, country_code, status, payouts_enabled, details_submitted, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    db
      .from("portal_marketplace_orders")
      .select("id, listing_id, buyer_id, seller_id, amount_minor, currency, status, created_at")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const failures = results.filter((result) => result.error);
  if (failures.length > 0) {
    console.warn(`[Portal] ${failures.length} dashboard module(s) could not be loaded.`);
  }
  const [
    profile,
    subscription,
    wallet,
    verificationRequest,
    listings,
    saved,
    messages,
    connect,
    orders,
  ] = results;
  return {
    profile: profile.data || null,
    subscription: subscription.data || { plan: "basic", status: "inactive" },
    wallet: wallet.data || { balance: 0 },
    verificationRequest: verificationRequest.data || null,
    listings: listings.data || [],
    saved: saved.data || [],
    messages: messages.data || [],
    connectAccount: connect.data || null,
    orders: orders.data || [],
  };
}

export async function ensurePortalProfileClient(input: z.infer<typeof profileSchema>) {
  const data = profileSchema.parse(input);
  const user = await requirePortalUser();
  const db = supabase as any;
  const existing = await db
    .from("portal_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { ok: true as const, created: false as const };

  const { error } = await db.from("portal_profiles").insert({
    user_id: user.id,
    display_name: data.displayName,
    country_code: data.countryCode?.toUpperCase() || null,
    city: data.city || null,
    institution: data.institution || null,
    program: data.program || null,
  });
  if (error) throw error;
  return { ok: true as const, created: true as const };
}

export async function requestInstitutionProgramCatalogClient(input: {
  institutionExternalId: string;
  institutionName: string;
  countryCode: string;
  city?: string | null;
  officialUrl?: string | null;
}) {
  const data = catalogRequestSchema.parse(input);
  const user = await requirePortalUser();
  const db = supabase as any;
  const { error } = await db.from("portal_program_catalog_requests").upsert(
    {
      user_id: user.id,
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
}

export async function createPortalListingClient(input: z.infer<typeof listingSchema>) {
  const data = listingSchema.parse(input);
  await requirePortalUser();
  const db = supabase as any;
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
}
