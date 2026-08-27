import { supabase } from "@/integrations/supabase/client";

export const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

export type StaticLeadInput = {
  name: string;
  email: string;
  phone: string;
  level: string;
  country: string;
  service: string;
  deadline: string;
  message: string;
  language: string;
  appointmentAt: string | null;
};

export type StaticLeadResult =
  | {
      ok: true;
      confirmationCode: string;
      appointmentAt: string | null;
    }
  | {
      ok: false;
      error: "insert_failed";
    };

function createConfirmationCode() {
  const randomPart = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 8)
    : Math.random().toString(16).slice(2, 10).padEnd(8, "0");

  return `CG-${randomPart.toUpperCase()}`;
}

/**
 * GitHub Pages has no server runtime, so TanStack server functions cannot receive
 * browser POSTs after the pre-rendered page is deployed. The leads table already
 * grants tightly length-checked INSERT access to the publishable Supabase role.
 * Use that existing policy only for the static deployment and keep the normal
 * server function path everywhere else.
 */
export async function submitStaticLead(input: StaticLeadInput): Promise<StaticLeadResult> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const confirmationCode = createConfirmationCode();
    const { error } = await supabase.from("leads").insert({
      confirmation_code: confirmationCode,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      level: input.level,
      country: input.country,
      service: input.service,
      deadline: input.deadline,
      message: input.message.trim(),
      language: input.language,
      appointment_at: input.appointmentAt,
      source: "contact_form",
    });

    if (!error) {
      return {
        ok: true,
        confirmationCode,
        appointmentAt: input.appointmentAt,
      };
    }

    const collision =
      error.code === "23505" &&
      `${error.message} ${error.details ?? ""}`.toLocaleLowerCase().includes("confirmation_code");
    if (collision) continue;

    console.error("[contact] static lead insert failed", error);
    return { ok: false, error: "insert_failed" };
  }

  return { ok: false, error: "insert_failed" };
}
