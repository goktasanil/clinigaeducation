export const EUROPE_BLOG_LOCALES = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
  "it",
  "hi",
  "ar",
  "ru",
  "zh",
] as const;
export type EuropeBlogLocale = (typeof EUROPE_BLOG_LOCALES)[number];
export const EUROPE_GUIDE_TOPICS = ["study", "admission", "funding", "arrival"] as const;
export type EuropeGuideTopic = (typeof EUROPE_GUIDE_TOPICS)[number];
export type EuropeSource = { id: string; label: string; url: string; checkedAt: string };
export type EuropeCountryProfile = {
  code: string;
  slug: string;
  name: string;
  kind?: "country" | "destination";
  sources: EuropeSource[];
  topics: Record<
    EuropeGuideTopic,
    {
      sourceIds: string[];
      /** Complete native-language country-specific editorial brief. No English fallback. */
      copy: Record<EuropeBlogLocale, string>;
    }
  >;
};
