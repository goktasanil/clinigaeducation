// Server-side audit logging for HTML sanitization.
// Logs land in the worker/server function logs so the protection can be reviewed.

import { recordDangerousSanitizeEvent } from "./sanitize-alert";
import {
  reportHasRemovals,
  sanitizeHtmlWithReport,
  type SanitizeReport,
} from "./sanitize-html";

export type SanitizeAuditContext = {
  /** Where the HTML came from, e.g. "ai-translation". */
  source: string;
  postId?: string;
  lang?: string;
  /** Correlation id shared with the page response (see lib/audit-id.ts). */
  auditId?: string;
};


const compact = (bag: Record<string, number>): Record<string, number> | undefined =>
  Object.keys(bag).length ? bag : undefined;

/** Verbosity floor for audit logs. */
export type SanitizeAuditLevel = "silent" | "warn" | "info" | "debug";

export type SanitizeAuditConfig = {
  /** Lowest level that gets written. "warn" drops cosmetic info lines. */
  level: SanitizeAuditLevel;
  /** 0..1 — share of dangerous (warn) events that get logged. */
  dangerousSampleRate: number;
  /** 0..1 — share of cosmetic (info) events that get logged. */
  normalizedSampleRate: number;
  /** Emit an aggregated summary of suppressed events every N suppressions (0 = off). */
  summaryEvery: number;
};

const LEVEL_ORDER: Record<SanitizeAuditLevel, number> = {
  silent: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const num = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
};

const int = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
};

const isLevel = (v: string | undefined): v is SanitizeAuditLevel =>
  !!v && v in LEVEL_ORDER;

// Read env lazily so worker env injection at request time is picked up.
function envConfig(): SanitizeAuditConfig {
  const env = typeof process !== "undefined" ? (process.env ?? {}) : {};
  const level = env["SANITIZE_AUDIT_LEVEL"]?.toLowerCase();
  return {
    level: isLevel(level) ? level : "info",
    dangerousSampleRate: num(env["SANITIZE_AUDIT_DANGEROUS_SAMPLE_RATE"], 1),
    normalizedSampleRate: num(env["SANITIZE_AUDIT_SAMPLE_RATE"], 1),
    summaryEvery: int(env["SANITIZE_AUDIT_SUMMARY_EVERY"], 100),
  };
}

let override: Partial<SanitizeAuditConfig> = {};

/** Runtime override (admin/tests); pass {} to fall back to env only. */
export function configureSanitizeAudit(next: Partial<SanitizeAuditConfig>): void {
  override = { ...next };
}

export function getSanitizeAuditConfig(): SanitizeAuditConfig {
  return { ...envConfig(), ...override };
}

// Aggregated counters for events we chose not to log individually.
const suppressed = { warn: 0, info: 0, total: 0 };

export function getSuppressedAuditCounts(): { warn: number; info: number } {
  return { warn: suppressed.warn, info: suppressed.info };
}

function noteSuppressed(kind: "warn" | "info", cfg: SanitizeAuditConfig): void {
  suppressed[kind] += 1;
  suppressed.total += 1;
  if (cfg.summaryEvery > 0 && suppressed.total >= cfg.summaryEvery) {
    console.warn(
      `[sanitize-audit] sampled-out summary ${JSON.stringify({
        event: "html_sanitize_summary",
        suppressedDangerous: suppressed.warn,
        suppressedNormalized: suppressed.info,
        sampling: {
          dangerous: cfg.dangerousSampleRate,
          normalized: cfg.normalizedSampleRate,
        },
      })}`,
    );
    suppressed.warn = 0;
    suppressed.info = 0;
    suppressed.total = 0;
  }
}

const sampled = (rate: number): boolean =>
  rate >= 1 ? true : rate <= 0 ? false : Math.random() < rate;

/** One audit event, as handed to an optional persistence sink. */
export type SanitizeAuditEvent = {
  auditId?: string;
  source: string;
  postId?: string;
  lang?: string;
  dangerous: boolean;
  altered: boolean;
  inputLength: number;
  outputLength: number;
  report: SanitizeReport;
};

let sink: ((event: SanitizeAuditEvent) => void) | null = null;

/**
 * Register a persistence sink (server-only, e.g. the database writer).
 * Pass null to unregister. Sinks must never throw.
 */
export function setSanitizeAuditSink(
  next: ((event: SanitizeAuditEvent) => void) | null,
): void {
  sink = next;
}


export function logSanitizeAudit(
  report: SanitizeReport,
  ctx: SanitizeAuditContext,
): void {
  if (!report.altered && !reportHasRemovals(report)) return;

  const entry = {
    event: "html_sanitize",
    auditId: ctx.auditId,
    source: ctx.source,
    postId: ctx.postId,
    lang: ctx.lang,

    altered: report.altered,
    inputLength: report.inputLength,
    outputLength: report.outputLength,
    bytesRemoved: report.inputLength - report.outputLength,
    blockedUrls: report.blockedUrls || undefined,
    removedComments: report.removedComments || undefined,
    autoClosedTags: report.autoClosedTags || undefined,
    removedDangerousElements: compact(report.removedDangerousElements),
    removedTags: compact(report.removedTags),
    removedAttributes: compact(report.removedAttributes),
  };

  // Anything actively dangerous is a warning; cosmetic normalization is info.
  const dangerous =
    !!entry.removedDangerousElements || !!entry.blockedUrls || !!entry.removedAttributes;
  const cfg = getSanitizeAuditConfig();
  const kind: "warn" | "info" = dangerous ? "warn" : "info";

  // Persist every event (sampling only affects log lines, not the audit trail).
  sink?.({ ...entry, dangerous, report });

  // Threshold alerting counts every dangerous event, even sampled-out ones.
  if (dangerous) {
    recordDangerousSanitizeEvent({
      source: ctx.source,
      postId: ctx.postId,
      lang: ctx.lang,
      auditId: ctx.auditId,
    });
  }


  if (LEVEL_ORDER[cfg.level] < LEVEL_ORDER[kind]) return;
  const rate = dangerous ? cfg.dangerousSampleRate : cfg.normalizedSampleRate;
  if (!sampled(rate)) {
    noteSuppressed(kind, cfg);
    return;
  }


  const line = JSON.stringify(entry);
  if (dangerous) {
    console.warn(`[sanitize-audit] blocked unsafe markup ${line}`);
  } else {
    console.info(`[sanitize-audit] normalized markup ${line}`);
  }
}


/** Sanitize and log in one step. */
export function sanitizeAndAudit(html: string, ctx: SanitizeAuditContext): string {
  const { html: clean, report } = sanitizeHtmlWithReport(html);
  logSanitizeAudit(report, ctx);
  return clean;
}

/** Strips markdown code fences the model sometimes wraps HTML in. */
export function stripCodeFences(raw: string): string {
  return raw
    .replace(/^```(?:html)?\s*\n/i, "")
    .replace(/\n```\s*$/i, "")
    .trim();
}

/**
 * Full translated-HTML pipeline: unwrap fences, sanitize, audit,
 * and fall back to the sanitized original when the model output is empty.
 */
export function prepareTranslatedHtml(
  modelOutput: string,
  originalHtml: string,
  ctx: SanitizeAuditContext,
): string {
  const raw = stripCodeFences(modelOutput ?? "") || originalHtml;
  const { html: clean, report } = sanitizeHtmlWithReport(raw);
  logSanitizeAudit(report, ctx);
  return clean || sanitizeAndAudit(originalHtml, { ...ctx, source: `${ctx.source}-fallback` });
}
