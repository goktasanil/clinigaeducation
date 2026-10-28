export const WIX_ARCHIVE_LOCALES = ["tr", "en", "de", "es", "it"] as const;
export type WixArchiveLocale = (typeof WIX_ARCHIVE_LOCALES)[number];

export type WixArchiveTranslation = {
  postId: string;
  language: WixArchiveLocale;
};

/** Original published Wix content; no inferred translation relationships. */
export type WixArchiveSummary = {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  excerpt: string;
  language: WixArchiveLocale;
  translationId: string | null;
  translations?: WixArchiveTranslation[];
  publishedAt: string;
  updatedAt: string;
  sourceUrl: string;
  coverImage: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  minutesToRead: number | null;
  categoryIds?: string[];
  author?: string;
};

export type WixArchivePost = WixArchiveSummary & { html: string };
export const WIX_ARCHIVE_FORMATTED_AT = "2026-10-28";
