export const SITE_ORIGIN = "https://www.clinigaeducation.com";

/** GitHub Pages serves these public pages from directories ending in a slash. */
export function canonicalPagePath(path: string): string {
  const segments = path.replace(/^\/+|\/+$/g, "");
  return segments ? `/${segments}/` : "/";
}

export function canonicalPageUrl(path: string): string {
  return `${SITE_ORIGIN}${canonicalPagePath(path)}`;
}
