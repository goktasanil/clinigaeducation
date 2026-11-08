import type { Json } from "@/integrations/supabase/types";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  startedAt: number;
  honeypot: string;
  level?: string | null;
  country?: string | null;
  service?: string | null;
  deadline?: string | null;
  language?: string | null;
  appointmentAt?: string | null;
  intent?: string | null;
  source?: string | null;
  quizAnswers?:
    | {
        step: number;
        question: string;
        answer: string;
        answerIndex?: number | null;
        key?: string | null;
        at?: string | null;
      }[]
    | null;
};

export type LeadResult =
  | { ok: true; confirmationCode: string; appointmentAt: string | null }
  | { ok: false; error: "invalid_request" | "rate_limited" | "slot_taken" | "insert_failed" };

type LeadRpcCall = (
  name: "submit_education_lead",
  args: { p_payload: Json },
) => PromiseLike<{ data: unknown; error: { code?: string } | null }>;

/** Both browser and server submissions use the same database-enforced quota. */
export async function submitLeadWithRpc(rpc: LeadRpcCall, input: LeadInput): Promise<LeadResult> {
  try {
    const { data, error } = await rpc("submit_education_lead", {
      p_payload: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        startedAt: input.startedAt,
        honeypot: input.honeypot,
        level: input.level,
        country: input.country,
        service: input.service,
        deadline: input.deadline,
        language: input.language,
        appointmentAt: input.appointmentAt,
        intent: input.intent,
        source: input.source ?? "contact_form",
        quizAnswers:
          input.quizAnswers?.map(({ step, question, answer, answerIndex, key, at }) => ({
            step,
            question,
            answer,
            answerIndex,
            key,
            at,
          })) ?? null,
      },
    });
    if (error) {
      const mapped = {
        PT400: "invalid_request",
        PT429: "rate_limited",
        PT409: "slot_taken",
      } as const;
      return { ok: false, error: mapped[error.code as keyof typeof mapped] ?? "insert_failed" };
    }
    // Only accept the receipt returned by this insertion, never fabricate a code.
    if (!Array.isArray(data) || data.length !== 1) return { ok: false, error: "insert_failed" };
    const row = data[0] as Record<string, unknown> | null;
    if (
      !row ||
      typeof row.confirmation_code !== "string" ||
      !/^CG-[A-F0-9]{8}$/.test(row.confirmation_code) ||
      !(
        row.appointment_at === null ||
        (typeof row.appointment_at === "string" && Number.isFinite(Date.parse(row.appointment_at)))
      )
    )
      return { ok: false, error: "insert_failed" };
    return { ok: true, confirmationCode: row.confirmation_code, appointmentAt: row.appointment_at };
  } catch {
    // Database/transport details may contain submitted personal data.
    return { ok: false, error: "insert_failed" };
  }
}
