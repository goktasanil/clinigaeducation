import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configureSanitizeAudit,
  logSanitizeAudit,
} from "./sanitize-audit";
import { sanitizeHtmlWithReport } from "./sanitize-html";

const dangerous = sanitizeHtmlWithReport(`<p>x</p><script>alert(1)</script>`).report;
const cosmetic = sanitizeHtmlWithReport(`<p>unclosed`).report;

afterEach(() => {
  configureSanitizeAudit({});
  vi.restoreAllMocks();
});

describe("sanitize audit log level + sampling", () => {
  it("silent level logs nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    configureSanitizeAudit({ level: "silent" });
    logSanitizeAudit(dangerous, { source: "t" });
    logSanitizeAudit(cosmetic, { source: "t" });
    expect(warn).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });

  it("warn level keeps dangerous logs and drops cosmetic ones", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    configureSanitizeAudit({ level: "warn" });
    logSanitizeAudit(dangerous, { source: "t" });
    logSanitizeAudit(cosmetic, { source: "t" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(info).not.toHaveBeenCalled();
  });

  it("zero sample rate suppresses individual lines", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    configureSanitizeAudit({ normalizedSampleRate: 0, summaryEvery: 0 });
    for (let i = 0; i < 20; i++) logSanitizeAudit(cosmetic, { source: "t" });
    expect(info).not.toHaveBeenCalled();
  });

  it("emits an aggregated summary after enough suppressions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    configureSanitizeAudit({ normalizedSampleRate: 0, summaryEvery: 5 });
    for (let i = 0; i < 5; i++) logSanitizeAudit(cosmetic, { source: "t" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("html_sanitize_summary");
  });

  it("respects deterministic sampling boundaries", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    configureSanitizeAudit({ normalizedSampleRate: 0.1, summaryEvery: 0 });
    logSanitizeAudit(cosmetic, { source: "t" });
    expect(info).not.toHaveBeenCalled();
    configureSanitizeAudit({ normalizedSampleRate: 0.9, summaryEvery: 0 });
    logSanitizeAudit(cosmetic, { source: "t" });
    expect(info).toHaveBeenCalledTimes(1);
  });
});
