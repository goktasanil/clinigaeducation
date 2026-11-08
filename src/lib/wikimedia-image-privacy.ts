const WIKIMEDIA_IMAGE_ORIGINS = new Set([
  "https://upload.wikimedia.org",
  "https://thumb.wikimedia.org",
]);

/** Only the two verified public-image origins opt into credential-free CORS. */
export function wikimediaImagePrivacyProps(src: string | null | undefined): {
  crossOrigin?: "anonymous";
  referrerPolicy?: "no-referrer";
} {
  if (!src) return {};
  try {
    const url = new URL(src);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !WIKIMEDIA_IMAGE_ORIGINS.has(url.origin)
    )
      return {};
    return { crossOrigin: "anonymous", referrerPolicy: "no-referrer" };
  } catch {
    return {};
  }
}
