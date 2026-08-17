import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

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
  phone: z.string().trim().regex(PHONE_REGEX).max(20),
  level: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  service: z.string().max(200).optional().nullable(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => value >= new Date().toISOString().slice(0, 10))
    .max(20)
    .optional()
    .nullable(),
  message: z.string().trim().min(10).max(5000),
  language: z.string().max(10).optional().nullable(),
  appointmentAt: z.string().datetime().optional().nullable(),
  intent: z.string().max(50).optional().nullable(),
  source: z.string().max(50).optional().nullable(),
  quizAnswers: z.array(quizAnswerSchema).max(50).optional().nullable(),
  honeypot: z.string().max(200).optional().nullable(),
  startedAt: z.number().int().positive().optional().nullable(),
});

function serverClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
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
  return (data ?? [])
    .map((row) => row.appointment_at)
    .filter((v): v is string => Boolean(v));
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
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Anti-spam: honeypot must be empty
    if (data.honeypot && data.honeypot.trim().length > 0) {
      console.warn("[leads] honeypot triggered");
      return { ok: false as const, error: "spam" };
    }
    // Anti-spam: form must be filled for >= 2 seconds
    if (data.startedAt && Date.now() - data.startedAt < 2000) {
      return { ok: false as const, error: "too_fast" };
    }

    const supabase = serverClient();


    // If appointment requested, verify it's not already booked
    if (data.appointmentAt) {
      const target = new Date(data.appointmentAt).getTime();
      const latestAllowed = Date.now() + 45 * 24 * 60 * 60 * 1000;
      if (
        !Number.isFinite(target) ||
        target <= Date.now() + 5 * 60 * 1000 ||
        target > latestAllowed
      ) {
        return { ok: false as const, error: "invalid_appointment" };
      }
      const booked = await fetchBookedAppointments();
      const isBooked = booked.some(
        (slot) => new Date(slot).getTime() === target,
      );
      if (isBooked) {
        return { ok: false as const, error: "slot_taken" };
      }
    }

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        level: data.level ?? null,
        country: data.country ?? null,
        service: data.service ?? null,
        deadline: data.deadline || null,
        message: data.message,
        language: data.language ?? null,
        appointment_at: data.appointmentAt ?? null,
        intent: data.intent ?? null,
        source: data.source ?? "contact_form",
        quiz_answers: data.quizAnswers ?? null,
      })
      .select("confirmation_code, appointment_at")
      .single();

    if (error || !inserted) {
      console.error("[leads] insert failed", error);
      return { ok: false as const, error: "insert_failed" };
    }

    return {
      ok: true as const,
      confirmationCode: inserted.confirmation_code,
      appointmentAt: inserted.appointment_at,
    };
  });

export const getBookedSlots = createServerFn({ method: "GET" }).handler(
  async () => {
    const slots = await fetchBookedAppointments();
    return { slots };
  },
);

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
  .inputValidator((input: unknown) =>
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
  .inputValidator((input: unknown) =>
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

