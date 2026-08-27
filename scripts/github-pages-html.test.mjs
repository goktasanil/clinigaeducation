import assert from "node:assert/strict";
import test from "node:test";

import { buildNotFoundHtml } from "./github-pages-html.mjs";

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
