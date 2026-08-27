const ROBOTS_META = /<meta name="robots" content="[^"]*"\s*\/?>/i;
const HOME_CANONICAL =
  /\s*<link rel="canonical" href="https:\/\/www\.clinigaeducation\.com\/"\s*\/?>/i;

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
