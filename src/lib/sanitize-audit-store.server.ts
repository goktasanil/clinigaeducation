// Server-only sink that stores sanitization audit events in the database so the
// admin panel can list them instead of digging through worker logs.

import { setSanitizeAuditSink, type SanitizeAuditEvent } from "./sanitize-audit";

const compact = (bag: Record<string, number>): Record<string, number> =>
  Object.keys(bag).length ? bag : {};

async function insertEvent(event: SanitizeAuditEvent): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("sanitize_audit_events").insert({
      audit_id: event.auditId ?? null,
      source: event.source,
      post_id: event.postId ?? null,
      lang: event.lang ?? null,
      dangerous: event.dangerous,
      altered: event.altered,
      input_length: event.inputLength,
      output_length: event.outputLength,
      blocked_urls: event.report.blockedUrls,
      removed_comments: event.report.removedComments,
      auto_closed_tags: event.report.autoClosedTags,
      removed_dangerous_elements: compact(event.report.removedDangerousElements),
      removed_tags: compact(event.report.removedTags),
      removed_attributes: compact(event.report.removedAttributes),
    });
    if (error) console.error("[sanitize-audit] db insert failed", error.message);
  } catch (err) {
    console.error("[sanitize-audit] db insert error", err);
  }
}

let installed = false;

/** Idempotently wire the database sink; safe to call on every request. */
export function installSanitizeAuditStore(): void {
  if (installed) return;
  installed = true;
  setSanitizeAuditSink((event) => {
    // Fire-and-forget: auditing must never block or fail a render.
    void insertEvent(event);
  });
}
