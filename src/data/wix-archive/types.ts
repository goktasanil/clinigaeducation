import { EUROPE_BLOG_LOCALES, type EuropeBlogLocale } from "../europe-blog/types";
import type { JournalPhoto } from "../journal/types";

export const WIX_ARCHIVE_LOCALES = EUROPE_BLOG_LOCALES;
export type WixArchiveLocale = EuropeBlogLocale;

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
  authorType?: "Person" | "Organization";
  topic?: string;
  countryCodes?: string[];
  editorialTopicKey?: string;
  photoCredit?: JournalPhoto;
  editorialSources?: { label: string; url: string; checkedAt: string }[];
};

export type WixArchiveCardSummary = Pick<
  WixArchiveSummary,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "language"
  | "publishedAt"
  | "updatedAt"
  | "coverImage"
  | "topic"
  | "countryCodes"
  | "editorialTopicKey"
  | "translationId"
>;
export type WixArchiveTranslationReference = Pick<
  WixArchiveSummary,
  "id" | "slug" | "language" | "translationId" | "editorialTopicKey" | "translations"
>;
export type WixArchivePost = WixArchiveSummary & {
  html: string;
  nativeRefs?: WixArchiveTranslationReference[];
};
export const WIX_ARCHIVE_FORMATTED_AT = "2026-10-28";
