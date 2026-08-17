// Threshold-based alerting for dangerous sanitization events.
//
// When the number of dangerous (blocked-markup) events inside a rolling window
// crosses a threshold, one notification is sent to Slack (incoming webhook)
// and/or e-mail (Resend), then a cooldown prevents alert spam.

export type SanitizeAlertConfig = {
  /** Dangerous events inside the window needed to fire. 0 disables alerting. */
  threshold: number;
  /** Rolling window length in minutes. */
  windowMinutes: number;
  /** Minimum minutes between two alerts. */
  cooldownMinutes: number;
  /** Extra delivery attempts after the first failure (0 disables retries). */
  maxRetries: number;
  /** Base delay for exponential backoff, in milliseconds. */
  retryBaseMs: number;
  /** Upper bound for a single backoff delay, in milliseconds. */
  retryMaxDelayMs: number;
};

export type SanitizeAlertPayload = {
  count: number;
  windowMinutes: number;
  threshold: number;
  firstAt: string;
  lastAt: string;
  samples: { source: string; postId?: string; lang?: string; auditId?: string }[];
  /** Most recent audit correlation IDs (newest first), de-duplicated. */
  auditIds: string[];
  /** How many triggering events each audit correlation ID contributed. */
  countsByAuditId: { auditId: string; count: number }[];
  /** How many triggering events each source contributed. */
  countsBySource: { source: string; count: number }[];
};

export type SanitizeAlertDelivery = {
  slack: "sent" | "not_configured" | "error";
  email: "sent" | "not_configured" | "error";
  slackError?: string;
  emailError?: string;
  slackAttempts?: number;
  emailAttempts?: number;
};

export type SanitizeAlertSink = (
  payload: SanitizeAlertPayload,
  delivery: SanitizeAlertDelivery,
) => void;

let sink: SanitizeAlertSink | null = null;

/** Register a persistence sink (server-only store). Pass null to disable. */
export function setSanitizeAlertSink(next: SanitizeAlertSink | null): void {
  sink = next;
}

const env = (): Record<string, string | undefined> =>
  typeof process !== "undefined" ? (process.env ?? {}) : {};

const int = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
};

let override: Partial<SanitizeAlertConfig> = {};

/** Runtime override (admin/tests); pass {} to fall back to env only. */
export function configureSanitizeAlerts(next: Partial<SanitizeAlertConfig>): void {
  override = { ...next };
}

export function getSanitizeAlertConfig(): SanitizeAlertConfig {
  const e = env();
  return {
    threshold: int(e["SANITIZE_ALERT_THRESHOLD"], 5),
    windowMinutes: int(e["SANITIZE_ALERT_WINDOW_MINUTES"], 15),
    cooldownMinutes: int(e["SANITIZE_ALERT_COOLDOWN_MINUTES"], 60),
    maxRetries: int(e["SANITIZE_ALERT_MAX_RETRIES"], 3),
    retryBaseMs: int(e["SANITIZE_ALERT_RETRY_BASE_MS"], 500),
    retryMaxDelayMs: int(e["SANITIZE_ALERT_RETRY_MAX_DELAY_MS"], 15_000),
    ...override,
  };
}

type Event = { at: number; source: string; postId?: string; lang?: string; auditId?: string };

const state: { events: Event[]; lastAlertAt: number } = { events: [], lastAlertAt: 0 };

/** Test helper. */
export function resetSanitizeAlertState(): void {
  state.events = [];
  state.lastAlertAt = 0;
}

type ChannelResult = {
  status: "sent" | "not_configured" | "error";
  error?: string;
  /** How many HTTP attempts were made (1 = succeeded first try). */
  attempts?: number;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** 408/429 and 5xx are transient; other 4xx are permanent (bad payload/token). */
const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

/**
 * POST with automatic retries and exponential backoff plus jitter.
 * Network errors and transient HTTP statuses are retried; permanent 4xx are not.
 */
async function postWithRetry(
  channel: "slack" | "email",
  request: () => Promise<Response>,
): Promise<ChannelResult> {
  const cfg = getSanitizeAlertConfig();
  const maxAttempts = Math.max(1, cfg.maxRetries + 1);
  let lastError = "unknown error";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let retryable = true;
    try {
      const res = await request();
      if (res.ok) {
        if (attempt > 1) {
          console.warn(`[sanitize-alert] ${channel} delivered after ${attempt} attempt(s)`);
        }
        return { status: "sent", attempts: attempt };
      }
      lastError = `HTTP ${res.status}`;
      retryable = isRetryableStatus(res.status);
      console.error(`[sanitize-alert] ${channel} failed [${res.status}] attempt ${attempt}/${maxAttempts}`);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[sanitize-alert] ${channel} error attempt ${attempt}/${maxAttempts}`, err);
    }

    if (!retryable || attempt === maxAttempts) {
      return {
        status: "error",
        error: `${lastError} (${attempt} deneme${retryable ? "" : ", kalıcı hata"})`,
        attempts: attempt,
      };
    }

    // Exponential backoff: base * 2^(attempt-1), capped, with up to 25% jitter.
    const raw = cfg.retryBaseMs * 2 ** (attempt - 1);
    const capped = Math.min(cfg.retryMaxDelayMs, raw);
    await sleep(Math.round(capped * (1 + Math.random() * 0.25)));
  }

  return { status: "error", error: lastError, attempts: maxAttempts };
}

async function slackNotify(payload: SanitizeAlertPayload): Promise<ChannelResult> {
  const url = env()["SLACK_WEBHOOK_URL"];
  if (!url) return { status: "not_configured" };
  const idLines = payload.countsByAuditId
    .map((c) => `• \`${c.auditId}\` — ${c.count} olay`)
    .join("\n");
  const sourceLines = payload.countsBySource
    .map((c) => `• ${c.source}: ${c.count}`)
    .join("\n");
  const lines = payload.samples
    .map((s) => `• ${s.source}${s.postId ? ` · post ${s.postId}` : ""}${s.lang ? ` · ${s.lang}` : ""}${s.auditId ? ` · ${s.auditId}` : ""}`)
    .join("\n");
  const text = [
    `:rotating_light: *Sanitization alert* — ${payload.count} dangerous HTML event(s) in ${payload.windowMinutes} min (threshold ${payload.threshold}).`,
    `Window: ${payload.firstAt} → ${payload.lastAt}`,
    payload.countsByAuditId.length ? `*Audit korelasyon ID'leri (tetikleyen örnek sayısı):*\n${idLines}` : "",
    sourceLines ? `*Kaynak dağılımı:*\n${sourceLines}` : "",
    lines ? `*Son örnekler:*\n${lines}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return postWithRetry("slack", () =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  );
}

async function emailNotify(payload: SanitizeAlertPayload): Promise<ChannelResult> {
  const e = env();
  const key = e["RESEND_API_KEY"];
  const to = e["SANITIZE_ALERT_EMAIL_TO"];
  const from = e["SANITIZE_ALERT_EMAIL_FROM"];
  if (!key || !to || !from) return { status: "not_configured" };
  const rows = payload.samples
    .map(
      (s) =>
        `<li>${s.source}${s.postId ? ` · post ${s.postId}` : ""}${s.lang ? ` · ${s.lang}` : ""}${s.auditId ? ` · <code>${s.auditId}</code>` : ""}</li>`,
    )
    .join("");
  const idRows = payload.countsByAuditId
    .map((c) => `<li><code>${c.auditId}</code> — ${c.count} olay</li>`)
    .join("");
  const sourceRows = payload.countsBySource
    .map((c) => `<li>${c.source}: ${c.count}</li>`)
    .join("");
  return postWithRetry("email", () =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to: to.split(",").map((x) => x.trim()),
        subject: `[CliniGA] ${payload.count} tehlikeli HTML olayı (${payload.windowMinutes} dk)`,
        html: `<p><strong>${payload.count}</strong> dangerous HTML event(s) blocked in the last ${payload.windowMinutes} minutes (threshold ${payload.threshold}).</p>
<p>${payload.firstAt} → ${payload.lastAt}</p>
${idRows ? `<p><strong>Audit korelasyon ID'leri (tetikleyen örnek sayısı)</strong></p><ul>${idRows}</ul>` : ""}
${sourceRows ? `<p><strong>Kaynak dağılımı</strong></p><ul>${sourceRows}</ul>` : ""}
<p><strong>Son örnekler</strong></p><ul>${rows}</ul>`,
      }),
    }),
  );
}

/**
 * Record one dangerous sanitization event. Returns the alert payload when the
 * threshold was crossed (and notifications were dispatched), otherwise null.
 */
export function recordDangerousSanitizeEvent(
  ctx: { source: string; postId?: string; lang?: string; auditId?: string },
  now: number = Date.now(),
): SanitizeAlertPayload | null {
  const cfg = getSanitizeAlertConfig();
  if (cfg.threshold <= 0) return null;

  const windowMs = cfg.windowMinutes * 60_000;
  state.events.push({ at: now, ...ctx });
  state.events = state.events.filter((ev) => now - ev.at <= windowMs).slice(-500);

  if (state.events.length < cfg.threshold) return null;
  if (now - state.lastAlertAt < cfg.cooldownMinutes * 60_000) return null;
  state.lastAlertAt = now;

  const triggering = state.events;
  const tally = <T extends string>(values: (T | undefined)[]): { key: string; count: number }[] => {
    const map = new Map<string, number>();
    for (const v of values) if (v) map.set(v, (map.get(v) ?? 0) + 1);
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  };
  const auditIds = [
    ...new Set([...triggering].reverse().map((ev) => ev.auditId).filter((x): x is string => !!x)),
  ].slice(0, 10);

  const payload: SanitizeAlertPayload = {
    count: state.events.length,
    windowMinutes: cfg.windowMinutes,
    threshold: cfg.threshold,
    firstAt: new Date(state.events[0]!.at).toISOString(),
    lastAt: new Date(now).toISOString(),
    samples: state.events.slice(-5).map(({ source, postId, lang, auditId }) => ({
      source,
      postId,
      lang,
      auditId,
    })),
    auditIds,
    countsByAuditId: tally(triggering.map((ev) => ev.auditId))
      .slice(0, 10)
      .map((c) => ({ auditId: c.key, count: c.count })),
    countsBySource: tally(triggering.map((ev) => ev.source))
      .slice(0, 10)
      .map((c) => ({ source: c.key, count: c.count })),
  };
  state.events = [];

  console.warn(
    `[sanitize-alert] threshold exceeded ${JSON.stringify({
      event: "html_sanitize_alert",
      ...payload,
    })}`,
  );

  // Fire-and-forget: alerting must never block or fail a page render.
  void Promise.all([slackNotify(payload), emailNotify(payload)]).then(
    ([slack, email]) => {
      if (slack.status === "not_configured" && email.status === "not_configured") {
        console.warn(
          "[sanitize-alert] no channel configured (SLACK_WEBHOOK_URL / RESEND_API_KEY + SANITIZE_ALERT_EMAIL_TO + SANITIZE_ALERT_EMAIL_FROM)",
        );
      }
      const delivery: SanitizeAlertDelivery = {
        slack: slack.status,
        email: email.status,
        ...(slack.error ? { slackError: slack.error } : {}),
        ...(email.error ? { emailError: email.error } : {}),
        ...(slack.attempts ? { slackAttempts: slack.attempts } : {}),
        ...(email.attempts ? { emailAttempts: email.attempts } : {}),
      };
      try {
        sink?.(payload, delivery);
      } catch (err) {
        console.error("[sanitize-alert] sink error", err);
      }
    },
  );

  return payload;
}
