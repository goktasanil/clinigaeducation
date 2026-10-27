import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import countryNames from "@/data/generated/country-names.json";
import {
  EUROPE_BLOG_LOCALES,
  type EuropeBlogLocale,
  type EuropeGuideTopic,
  type EuropeSource,
} from "@/data/europe-blog/types";

export const EUROPE_BLOG_ORIGIN = "https://www.clinigaeducation.com";
export type EuropeGuide = {
  slug: string;
  countryCode: string;
  countrySlug: string;
  countryName: string;
  countryLabel?: string;
  kind: "country" | "destination";
  topic: EuropeGuideTopic;
  brief: string;
  sources: EuropeSource[];
  checkedAt: string;
  coverImage: string;
};
export const isEuropeBlogLocale = (value: string): value is EuropeBlogLocale =>
  EUROPE_BLOG_LOCALES.includes(value as EuropeBlogLocale);
export function europeBlogLocaleForPath(pathname: string): EuropeBlogLocale | null {
  const match = /^\/([a-z]{2})\/blog(?:\/|$)/.exec(pathname);
  return match && isEuropeBlogLocale(match[1]) ? match[1] : null;
}
export const europeBlogPath = (language: EuropeBlogLocale, slug?: string) =>
  `/${language}/blog${slug ? `/${slug}` : ""}`;

const loaders = {
  tr: () => import("@/data/europe-blog/generated/tr.json"),
  en: () => import("@/data/europe-blog/generated/en.json"),
  de: () => import("@/data/europe-blog/generated/de.json"),
  fr: () => import("@/data/europe-blog/generated/fr.json"),
  es: () => import("@/data/europe-blog/generated/es.json"),
  it: () => import("@/data/europe-blog/generated/it.json"),
  hi: () => import("@/data/europe-blog/generated/hi.json"),
  ar: () => import("@/data/europe-blog/generated/ar.json"),
  ru: () => import("@/data/europe-blog/generated/ru.json"),
  zh: () => import("@/data/europe-blog/generated/zh.json"),
};
export async function loadEuropeBlog(language: EuropeBlogLocale): Promise<EuropeGuide[]> {
  return (await loaders[language]()).default as EuropeGuide[];
}
export function europeCountryName(
  guide: Pick<EuropeGuide, "countryCode" | "countryName" | "countryLabel">,
  language: EuropeBlogLocale,
) {
  return (
    guide.countryLabel ||
    countryNames[language].find((country) => country.code === guide.countryCode)?.name ||
    guide.countryName
  );
}
export function europeGuideTitle(guide: EuropeGuide, language: EuropeBlogLocale) {
  return EUROPE_BLOG_COPY[language].titles[guide.topic].replace(
    "{country}",
    europeCountryName(guide, language),
  );
}
export function europeGuideExcerpt(guide: EuropeGuide) {
  const characters = Array.from(guide.brief);
  return characters.length > 175 ? `${characters.slice(0, 172).join("").trimEnd()}…` : guide.brief;
}
export function europeBlogAlternates(language: EuropeBlogLocale, slug?: string) {
  return [
    { rel: "canonical", href: `${EUROPE_BLOG_ORIGIN}${europeBlogPath(language, slug)}` },
    ...EUROPE_BLOG_LOCALES.map((code) => ({
      rel: "alternate",
      hrefLang: code,
      href: `${EUROPE_BLOG_ORIGIN}${europeBlogPath(code, slug)}`,
    })),
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: `${EUROPE_BLOG_ORIGIN}${europeBlogPath("tr", slug)}`,
    },
  ];
}
export function europeBlogHead(language: EuropeBlogLocale, guide?: EuropeGuide) {
  const copy = EUROPE_BLOG_COPY[language];
  const title = guide ? europeGuideTitle(guide, language) : copy.title;
  const description = guide ? europeGuideExcerpt(guide) : copy.intro;
  const url = `${EUROPE_BLOG_ORIGIN}${europeBlogPath(language, guide?.slug)}`;
  const image = `${EUROPE_BLOG_ORIGIN}/og-cover.png`;
  return {
    meta: [
      { title: `${title} | CliniGA Education` },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: guide ? "article" : "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      ...(guide
        ? [
            { property: "article:published_time", content: `${guide.checkedAt}T00:00:00Z` },
            { property: "article:modified_time", content: `${guide.checkedAt}T00:00:00Z` },
          ]
        : []),
    ],
    links: europeBlogAlternates(language, guide?.slug),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            guide
              ? {
                  "@type": "BlogPosting",
                  "@id": `${url}#article`,
                  mainEntityOfPage: url,
                  headline: title,
                  description,
                  inLanguage: language,
                  datePublished: guide.checkedAt,
                  dateModified: guide.checkedAt,
                  image: `${EUROPE_BLOG_ORIGIN}${guide.coverImage}`,
                  author: {
                    "@type": "Organization",
                    name: "CliniGA Education",
                    url: EUROPE_BLOG_ORIGIN,
                  },
                  publisher: { "@id": `${EUROPE_BLOG_ORIGIN}/#organization` },
                  citation: guide.sources.map((source) => source.url),
                  articleBody: [
                    copy.intros[guide.topic],
                    guide.brief,
                    ...copy.steps[guide.topic],
                  ].join("\n\n"),
                }
              : { "@type": "CollectionPage", name: title, description, url, inLanguage: language },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "CliniGA Education",
                  item: `${EUROPE_BLOG_ORIGIN}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: copy.title,
                  item: `${EUROPE_BLOG_ORIGIN}${europeBlogPath(language)}`,
                },
                ...(guide ? [{ "@type": "ListItem", position: 3, name: title, item: url }] : []),
              ],
            },
          ],
        }).replace(/</g, "\\u003c"),
      },
    ],
  };
}
