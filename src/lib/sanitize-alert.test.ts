import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configureSanitizeAlerts,
  recordDangerousSanitizeEvent,
  resetSanitizeAlertState,
} from "./sanitize-alert";
import { configureSanitizeAudit, logSanitizeAudit } from "./sanitize-audit";
import { sanitizeHtmlWithReport } from "./sanitize-html";

const dangerous = sanitizeHtmlWithReport(`<p>x</p><script>alert(1)</script>`).report;
const cosmetic = sanitizeHtmlWithReport(`<p>unclosed`).report;

afterEach(() => {
  configureSanitizeAlerts({});
  configureSanitizeAudit({});
  resetSanitizeAlertState();
  vi.restoreAllMocks();
});

describe("dangerous-event threshold alerting", () => {
  it("stays quiet below the threshold", () => {
    configureSanitizeAlerts({ threshold: 3, windowMinutes: 15, cooldownMinutes: 60 });
    expect(recordDangerousSanitizeEvent({ source: "t" })).toBeNull();
    expect(recordDangerousSanitizeEvent({ source: "t" })).toBeNull();
  });

  it("fires once the threshold is reached", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    configureSanitizeAlerts({ threshold: 3, windowMinutes: 15, cooldownMinutes: 60 });
    recordDangerousSanitizeEvent({ source: "t" });
    recordDangerousSanitizeEvent({ source: "t" });
    const alert = recordDangerousSanitizeEvent({ source: "t", auditId: "aud_1" });
    expect(alert?.count).toBe(3);
    expect(alert?.samples.at(-1)?.auditId).toBe("aud_1");
  });

  it("drops events that fell out of the rolling window", () => {
    configureSanitizeAlerts({ threshold: 2, windowMinutes: 10, cooldownMinutes: 0 });
    const t0 = 1_000_000;
    expect(recordDangerousSanitizeEvent({ source: "t" }, t0)).toBeNull();
    expect(
      recordDangerousSanitizeEvent({ source: "t" }, t0 + 11 * 60_000),
    ).toBeNull();
  });

  it("respects the cooldown between alerts", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    configureSanitizeAlerts({ threshold: 1, windowMinutes: 15, cooldownMinutes: 30 });
    const t0 = 2_000_000;
    expect(recordDangerousSanitizeEvent({ source: "t" }, t0)).not.toBeNull();
    expect(recordDangerousSanitizeEvent({ source: "t" }, t0 + 60_000)).toBeNull();
    expect(
      recordDangerousSanitizeEvent({ source: "t" }, t0 + 31 * 60_000),
    ).not.toBeNull();
  });

  it("threshold 0 disables alerting", () => {
    configureSanitizeAlerts({ threshold: 0 });
    expect(recordDangerousSanitizeEvent({ source: "t" })).toBeNull();
  });

  it("counts dangerous audit events even when logs are sampled out", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    configureSanitizeAudit({ dangerousSampleRate: 0, summaryEvery: 0 });
    configureSanitizeAlerts({ threshold: 2, windowMinutes: 15, cooldownMinutes: 60 });
    logSanitizeAudit(dangerous, { source: "t" });
    logSanitizeAudit(dangerous, { source: "t" });
    const alertLines = warn.mock.calls.filter((c) =>
      String(c[0]).includes("html_sanitize_alert"),
    );
    expect(alertLines).toHaveLength(1);
  });

  it("ignores cosmetic-only events", () => {
    configureSanitizeAlerts({ threshold: 1, windowMinutes: 15, cooldownMinutes: 0 });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    logSanitizeAudit(cosmetic, { source: "t" });
    expect(
      warn.mock.calls.filter((c) => String(c[0]).includes("html_sanitize_alert")),
    ).toHaveLength(0);
  });
});
