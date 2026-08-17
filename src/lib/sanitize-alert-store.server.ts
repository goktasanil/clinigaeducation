// Server-only sink that persists fired sanitization alerts so the admin panel
// can show an alert history (timestamp, dangerous count, delivery status).

import {
  setSanitizeAlertSink,
  type SanitizeAlertDelivery,
  type SanitizeAlertPayload,
} from "./sanitize-alert";

async function insertAlert(
  payload: SanitizeAlertPayload,
  delivery: SanitizeAlertDelivery,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("sanitize_alerts").insert({
      dangerous_count: payload.count,
      threshold: payload.threshold,
      window_minutes: payload.windowMinutes,
      first_event_at: payload.firstAt,
      last_event_at: payload.lastAt,
      audit_ids: payload.auditIds,
      counts_by_audit_id: payload.countsByAuditId,
      counts_by_source: payload.countsBySource,
      samples: payload.samples,
      slack_status: delivery.slack,
      slack_error: delivery.slackError ?? null,
      email_status: delivery.email,
      email_error: delivery.emailError ?? null,
    });
    if (error) console.error("[sanitize-alert] db insert failed", error.message);
  } catch (err) {
    console.error("[sanitize-alert] db insert error", err);
  }
}

let installed = false;

/** Idempotently wire the alert history sink; safe to call on every request. */
export function installSanitizeAlertStore(): void {
  if (installed) return;
  installed = true;
  setSanitizeAlertSink((payload, delivery) => {
    void insertAlert(payload, delivery);
  });
}
