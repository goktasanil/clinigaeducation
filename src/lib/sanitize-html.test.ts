import { describe, expect, it } from "vitest";

import { sanitizeHtml, sanitizeHtmlWithReport } from "./sanitize-html";

describe("sanitizeHtml — XSS vectors", () => {
  it("preserves bounded table spans and header scope without trusting arbitrary attributes", () => {
    const html = sanitizeHtml(
      '<table><tr><th colspan="2" rowspan="3" scope="colgroup" style="color:red" onclick="bad()">Header</th><td colspan="100" rowspan="1">Cell</td></tr></table>',
    );
    expect(html).toContain('<th colspan="2" rowspan="3" scope="colgroup">Header</th>');
    expect(html).toContain('<td colspan="100" rowspan="1">Cell</td>');
    expect(html).not.toContain("style=");
    expect(html).not.toContain("onclick=");
    const unsafe = sanitizeHtmlWithReport(
      '<table><tr><th colspan="101" rowspan="0" scope="javascript:bad">X</th><td colspan="-1" rowspan="2.5" scope="row">Y</td><td colspan="1e2" rowspan="2 onclick=bad()">Z</td></tr></table>',
    );
    expect(unsafe.html).toBe("<table><tr><th>X</th><td>Y</td><td>Z</td></tr></table>");
    expect(unsafe.report.removedAttributes).toMatchObject({
      "th.colspan": 1,
      "th.rowspan": 1,
      "th.scope": 1,
      "td.colspan": 2,
      "td.rowspan": 2,
      "td.scope": 1,
    });
  });
  const vectors: [string, string][] = [
    ["script tag", `<p>hi</p><script>alert(1)</script>`],
    ["inline handler", `<img src="https://x.test/a.png" onerror="alert(1)">`],
    ["javascript: href", `<a href="javascript:alert(1)">x</a>`],
    ["data: image", `<img src="data:text/html;base64,PHNjcmlwdD4=">`],
    ["svg onload", `<svg onload="alert(1)"></svg>`],
    ["iframe", `<iframe src="https://evil.test"></iframe>`],
    ["style tag", `<style>body{background:url(javascript:alert(1))}</style>`],
    ["object/embed", `<object data="x.swf"></object><embed src="x.swf">`],
    ["form hijack", `<form action="https://evil.test"><input name="a"></form>`],
    ["obfuscated handler", `<div ONMouseOver = "alert(1)">x</div>`],
    ["encoded js scheme", `<a href="java\u0000script:alert(1)">x</a>`],
    ["meta refresh", `<meta http-equiv="refresh" content="0;url=https://evil.test">`],
    ["base tag", `<base href="https://evil.test/">`],
    ["comment breakout", `<!--<script>alert(1)</script>-->`],
    ["srcdoc", `<iframe srcdoc="<script>alert(1)</script>"></iframe>`],
  ];

  for (const [name, payload] of vectors) {
    it(`neutralizes ${name}`, () => {
      const out = sanitizeHtml(payload).toLowerCase();
      expect(out).not.toMatch(/<script/);
      expect(out).not.toMatch(/<iframe/);
      expect(out).not.toMatch(/<svg/);
      expect(out).not.toMatch(/<style/);
      expect(out).not.toMatch(/<object|<embed|<form|<meta|<base/);
      expect(out).not.toMatch(/\son[a-z]+\s*=/);
      expect(out).not.toMatch(/javascript:/);
      expect(out).not.toMatch(/data:text\/html/);
    });
  }

  it("keeps safe editorial markup intact", () => {
    const html = `<h2>Başlık</h2><p><strong>Bold</strong> ve <a href="https://x.test" title="t">link</a></p><ul><li>a</li></ul><img src="/i.png" alt="alt">`;
    const out = sanitizeHtml(html);
    expect(out).toContain("<h2>Başlık</h2>");
    expect(out).toContain(`href="https://x.test"`);
    expect(out).toContain(`alt="alt"`);
    expect(out).toContain("<li>a</li>");
  });

  it("forces safe rel/target on external links", () => {
    const out = sanitizeHtml(`<a href="https://x.test" target="_top">x</a>`);
    expect(out).toContain(`target="_blank"`);
    expect(out).toContain(`rel="noopener noreferrer"`);
  });

  it("closes unbalanced tags", () => {
    const out = sanitizeHtml(`<div><p>text`);
    expect(out).toBe(`<div><p>text</p></div>`);
  });

  it("reports what it removed", () => {
    const { report } = sanitizeHtmlWithReport(
      `<script>1</script><img src="javascript:1" onerror="x"><!--c--><div>`,
    );
    expect(report.altered).toBe(true);
    expect(report.removedDangerousElements.script).toBe(1);
    expect(report.blockedUrls).toBe(1);
    expect(report.removedAttributes["img.onerror"]).toBe(1);
    expect(report.removedComments).toBe(1);
    expect(report.autoClosedTags).toBe(1);
  });

  it("handles empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
