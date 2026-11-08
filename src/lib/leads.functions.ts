import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { submitLeadWithRpc } from "@/lib/lead-rpc";

const NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const normalizePhone = (value: string) => value.replace(/[()\s-]/g, "");

const quizAnswerSchema = z.object({
  step: z.number().int().min(0),
  question: z.string().max(500),
  answer: z.string().max(500),
  answerIndex: z.number().int().optional().nullable(),
  key: z.string().max(100).optional().nullable(),
  at: z.string().datetime().optional().nullable(),
});

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100).regex(NAME_REGEX),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .max(24)
    .transform(normalizePhone)
    .refine((value) => PHONE_REGEX.test(value)),
  level: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  service: z.string().max(200).optional().nullable(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .max(20)
    .refine((value) => value >= new Date().toISOString().slice(0, 10))
    .optional()
    .nullable(),
  message: z.string().trim().min(10).max(5000),
  language: z.string().max(10).optional().nullable(),
  appointmentAt: z.string().datetime().optional().nullable(),
  intent: z.string().max(50).optional().nullable(),
  source: z.string().max(50).optional().nullable(),
  quizAnswers: z.array(quizAnswerSchema).max(50).optional().nullable(),
  honeypot: z.string().max(200),
  startedAt: z.number().int().positive(),
});

function serverClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character] || character;
  });

async function sendLeadNotification(data: z.infer<typeof leadSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM || process.env.SANITIZE_ALERT_EMAIL_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO || "clinigaeducation@gmail.com";
  if (!apiKey || !from) return false;

  const rows = [
    ["Ad Soyad", data.name],
    ["E-posta", data.email],
    ["Telefon", data.phone],
    ["Hizmet", data.service || "—"],
    ["Ülke", data.country || "—"],
    ["Seviye", data.level || "—"],
    ["Hedef tarih", data.deadline || "—"],
    ["Dil", data.language || "—"],
  ];
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Yeni CliniGA Education talebi — ${data.service || data.name}`,
        html: `<h2>Yeni danışmanlık talebi</h2><table style="border-collapse:collapse;width:100%">${htmlRows}</table><h3>Mesaj</h3><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("[leads] notification email failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[leads] notification email failed", error);
    return false;
  }
}

async function fetchBookedAppointments() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("appointment_at")
    .not("appointment_at", "is", null)
    .gte("appointment_at", new Date().toISOString())
    .neq("status", "cancelled");
  if (error) {
    console.error("[leads] fetchBookedAppointments failed", error);
    return [] as string[];
  }
  return (data ?? []).map((row) => row.appointment_at).filter((v): v is string => Boolean(v));
}

async function userIsAdmin(
  supabase: ReturnType<typeof serverClient>,
  userId: string,
): Promise<boolean> {
  // user_roles SELECT policy allows reading own rows, so this works as authenticated user.
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    console.error("[leads] admin check failed", error);
    return false;
  }
  return !!data;
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const result = await submitLeadWithRpc(
      (name, args) => supabase.rpc(name as never, args as never),
      data,
    );
    if (!result.ok) return result;
    const notificationSent = await sendLeadNotification(data);
    return { ...result, notificationSent };
  });
export const getBookedSlots = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await fetchBookedAppointments();
  return { slots };
});

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await userIsAdmin(context.supabase, context.userId);
    if (!isAdmin) {
      throw new Error("Forbidden");
    }
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return { leads: data ?? [] };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "won", "lost", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const isAdmin = await userIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const updateLeadFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        followUpAt: z.string().datetime().nullable(),
        followUpNote: z.string().max(1000).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const isAdmin = await userIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase
      .from("leads")
      .update({
        follow_up_at: data.followUpAt,
        follow_up_note: data.followUpNote,
      } as never)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
