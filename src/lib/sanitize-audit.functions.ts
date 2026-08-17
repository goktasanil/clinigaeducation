import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SanitizeAuditRow = {
  id: string;
  audit_id: string | null;
  source: string;
  post_id: string | null;
  lang: string | null;
  dangerous: boolean;
  altered: boolean;
  input_length: number;
  output_length: number;
  blocked_urls: number;
  removed_comments: number;
  auto_closed_tags: number;
  removed_dangerous_elements: Record<string, number>;
  removed_tags: Record<string, number>;
  removed_attributes: Record<string, number>;
  created_at: string;
};

export type SanitizeAuditList = {
  rows: SanitizeAuditRow[];
  total: number;
  stats: { total: number; dangerous: number; cosmetic: number };
};

function escapeCsv(value: unknown): string {
  const text =
    value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function bagString(map: Record<string, number> | null | undefined): string {
  const entries = Object.entries(map ?? {});
  if (!entries.length) return "";
  return entries.map(([k, v]) => `${k}×${v}`).join("; ");
}

function sinceForDays(days: number): string {
  const d = Math.min(365, Math.max(1, days));
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

export const listSanitizeAuditEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      days?: number;
      kind?: "all" | "dangerous" | "cosmetic";
      search?: string;
      page?: number;
      pageSize?: number;
    }) => input ?? {},
  )
  .handler(async ({ data, context }): Promise<SanitizeAuditList> => {
    const days = Math.min(365, Math.max(1, data.days ?? 30));
    const pageSize = Math.min(200, Math.max(10, data.pageSize ?? 50));
    const page = Math.max(0, data.page ?? 0);
    const since = sinceForDays(days);

    const base = () => {
      let q = context.supabase
        .from("sanitize_audit_events")
        .select("*", { count: "exact" })
        .gte("created_at", since);
      if (data.kind === "dangerous") q = q.eq("dangerous", true);
      if (data.kind === "cosmetic") q = q.eq("dangerous", false);
      const s = data.search?.trim();
      if (s) {
        q = q.or(
          `source.ilike.%${s}%,post_id.ilike.%${s}%,audit_id.ilike.%${s}%,lang.ilike.%${s}%`,
        );
      }
      return q;
    };

    const { data: rows, count, error } = await base()
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw new Error(error.message);

    const [{ count: dangerousCount }, { count: totalCount }] = await Promise.all([
      context.supabase
        .from("sanitize_audit_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .eq("dangerous", true),
      context.supabase
        .from("sanitize_audit_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
    ]);

    const total = totalCount ?? 0;
    const dangerous = dangerousCount ?? 0;
    return {
      rows: (rows ?? []) as unknown as SanitizeAuditRow[],
      total: count ?? 0,
      stats: { total, dangerous, cosmetic: total - dangerous },
    };
  });

export const exportSanitizeAuditEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      days?: number;
      kind?: "all" | "dangerous" | "cosmetic";
      search?: string;
    }) => input ?? {},
  )
  .handler(async ({ data, context }): Promise<{ csv: string; count: number }> => {
    const MAX_ROWS = 10_000;
    const since = sinceForDays(data.days ?? 30);

    let q = context.supabase
      .from("sanitize_audit_events")
      .select("*", { count: "exact" })
      .gte("created_at", since);
    if (data.kind === "dangerous") q = q.eq("dangerous", true);
    if (data.kind === "cosmetic") q = q.eq("dangerous", false);
    const s = data.search?.trim();
    if (s) {
      q = q.or(
        `source.ilike.%${s}%,post_id.ilike.%${s}%,audit_id.ilike.%${s}%,lang.ilike.%${s}%`,
      );
    }

    const { data: rows, error } = await q
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);
    if (error) throw new Error(error.message);

    const headers = [
      "Zaman",
      "Tur",
      "Kaynak",
      "Post ID",
      "Dil",
      "Tehlikeli",
      "Degistirildi",
      "Girdi Bayt",
      "Cikti Bayt",
      "Bayt Farki",
      "Engellenen URL",
      "Kaldirilan Yorum",
      "Otomatik Kapatilan Etiket",
      "Kaldirilan Tehlikeli Etiketler",
      "Kaldirilan Etiketler",
      "Kaldirilan Ozellikler",
      "Audit ID",
    ];

    const lines: string[] = [headers.join(",")];
    for (const r of (rows ?? []) as unknown as SanitizeAuditRow[]) {
      lines.push(
        [
          escapeCsv(format(new Date(r.created_at), "dd.MM.yyyy HH:mm:ss")),
          escapeCsv(r.dangerous ? "Tehlikeli" : "Kozmetik"),
          escapeCsv(r.source),
          escapeCsv(r.post_id ?? ""),
          escapeCsv(r.lang ?? ""),
          escapeCsv(r.dangerous ? "Evet" : "Hayir"),
          escapeCsv(r.altered ? "Evet" : "Hayir"),
          escapeCsv(r.input_length),
          escapeCsv(r.output_length),
          escapeCsv(r.input_length - r.output_length),
          escapeCsv(r.blocked_urls),
          escapeCsv(r.removed_comments),
          escapeCsv(r.auto_closed_tags),
          escapeCsv(bagString(r.removed_dangerous_elements)),
          escapeCsv(bagString(r.removed_tags)),
          escapeCsv(bagString(r.removed_attributes)),
          escapeCsv(r.audit_id ?? ""),
        ].join(","),
      );
    }

    return { csv: lines.join("\n"), count: lines.length - 1 };
  });
