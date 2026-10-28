import assert from "node:assert/strict";
import test from "node:test";

import { buildNotFoundHtml, buildRedirectHtml } from "./github-pages-html.mjs";

test("marks the GitHub Pages fallback noindex and removes the homepage canonical", () => {
  const homepageHtml = `<!doctype html><html><head>
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.clinigaeducation.com/" />
  </head><body><div id="root"></div></body></html>`;

  const notFoundHtml = buildNotFoundHtml(homepageHtml);

  assert.match(notFoundHtml, /<meta name="robots" content="noindex, follow">/);
  assert.doesNotMatch(notFoundHtml, /rel="canonical"/);
  assert.match(notFoundHtml, /<div id="root"><\/div>/);
});

test("fails closed when the expected homepage SEO tags change", () => {
  assert.throws(
    () => buildNotFoundHtml("<html><head></head></html>"),
    /missing the expected robots meta tag/,
  );
});

test("static legacy aliases redirect without hydrating the destination at the old URL", () => {
  const target = "/tr/blog/archive/%C3%A7ekya-rehberi";
  const html = buildRedirectHtml(target, "tr");
  assert.match(html, /<html lang="tr">/);
  assert.ok(html.includes(`href="https://www.clinigaeducation.com${target}"`));
  assert.ok(html.includes(`content="0;url=${target}"`));
  assert.ok(
    html.includes(`location.replace(${JSON.stringify(target)}+location.search+location.hash)`),
  );
  assert.match(html, /noindex, follow/);
  assert.doesNotMatch(html, /react|module|hydrate|__TSR/i);
});

test("static redirects reject external targets and safely encode HTML attributes", () => {
  assert.throws(() => buildRedirectHtml("//evil.example/path"), /canonical site/);
  assert.throws(() => buildRedirectHtml("https://evil.example/path"), /canonical site/);
  assert.throws(() => buildRedirectHtml("javascript:alert(1)"), /canonical site/);
  const html = buildRedirectHtml('/en/blog/archive/a&b<test>"', "en");
  assert.ok(html.includes("a&amp;b%3Ctest%3E%22"));
  assert.doesNotMatch(html, /<test>/);
});
