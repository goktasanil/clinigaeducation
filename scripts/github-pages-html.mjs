const ROBOTS_META = /<meta name="robots" content="[^"]*"\s*\/?>/i;
const HOME_CANONICAL =
  /\s*<link rel="canonical" href="https:\/\/www\.clinigaeducation\.com\/"\s*\/?>/i;

/** Static aliases redirect before any application hydration starts. */
export function buildRedirectHtml(path, language = "tr") {
  const origin = "https://www.clinigaeducation.com";
  const target = new URL(path, origin);
  if (target.origin !== origin || target.username || target.password || !path.startsWith("/"))
    throw new Error("Static redirects must stay on the canonical site.");
  const labels = {
    tr: "Yazıya yönlendiriliyorsunuz",
    en: "Continue to the article",
    de: "Weiter zum Artikel",
    es: "Continuar al artículo",
    it: "Vai all’articolo",
  };
  const locale = Object.hasOwn(labels, language) ? language : "tr";
  const escape = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const relative = target.pathname;
  const scriptPath = JSON.stringify(relative).replaceAll("<", "\\u003c");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${labels[locale]} | CliniGA Education</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${escape(origin + relative)}"><meta http-equiv="refresh" content="0;url=${escape(relative)}"><script>location.replace(${scriptPath}+location.search+location.hash)</script></head><body><p><a href="${escape(relative)}">${labels[locale]}</a></p></body></html>`;
}

/**
 * Keep the GitHub Pages SPA fallback useful for client-side routing without
 * advertising unknown URLs as an indexable copy of the homepage.
 */
export function buildNotFoundHtml(homepageHtml) {
  if (!ROBOTS_META.test(homepageHtml)) {
    throw new Error("Homepage HTML is missing the expected robots meta tag.");
  }
  if (!HOME_CANONICAL.test(homepageHtml)) {
    throw new Error("Homepage HTML is missing the expected canonical link.");
  }

  return homepageHtml
    .replace(ROBOTS_META, '<meta name="robots" content="noindex, follow">')
    .replace(HOME_CANONICAL, "");
}
