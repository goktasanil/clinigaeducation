import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DeliveryStatus = "sent" | "not_configured" | "error";

export type SanitizeAlertRow = {
  id: string;
  fired_at: string;
  dangerous_count: number;
  threshold: number;
  window_minutes: number;
  first_event_at: string | null;
  last_event_at: string | null;
  audit_ids: string[];
  counts_by_audit_id: { auditId: string; count: number }[];
  counts_by_source: { source: string; count: number }[];
  samples: { source: string; postId?: string; lang?: string; auditId?: string }[];
  slack_status: DeliveryStatus;
  slack_error: string | null;
  email_status: DeliveryStatus;
  email_error: string | null;
};

export type SanitizeAlertList = {
  rows: SanitizeAlertRow[];
  total: number;
  stats: {
    alerts: number;
    dangerousEvents: number;
    delivered: number;
    failed: number;
  };
};

export const listSanitizeAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { days?: number; limit?: number } | undefined) => input ?? {},
  )
  .handler(async ({ data, context }): Promise<SanitizeAlertList> => {
    const days = Math.min(365, Math.max(1, data.days ?? 30));
    const limit = Math.min(200, Math.max(5, data.limit ?? 50));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const { data: rows, count, error } = await context.supabase
      .from("sanitize_alerts")
      .select("*", { count: "exact" })
      .gte("fired_at", since)
      .order("fired_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);

    const list = (rows ?? []) as unknown as SanitizeAlertRow[];
    return {
      rows: list,
      total: count ?? list.length,
      stats: {
        alerts: count ?? list.length,
        dangerousEvents: list.reduce((sum, r) => sum + (r.dangerous_count ?? 0), 0),
        delivered: list.filter(
          (r) => r.slack_status === "sent" || r.email_status === "sent",
        ).length,
        failed: list.filter(
          (r) => r.slack_status === "error" || r.email_status === "error",
        ).length,
      },
    };
  });
