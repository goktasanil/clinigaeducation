import countryNames from "@/data/generated/country-names.json";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import type { EuropeBlogLocale } from "@/data/europe-blog/types";
import {
  WIX_ARCHIVE_LOCALES,
  type WixArchiveLocale,
  type WixArchivePost,
  type WixArchiveSummary,
} from "@/data/wix-archive/types";
import {
  EUROPE_BLOG_ORIGIN,
  europeBlogPath,
  europeCountryName,
  type EuropeGuide,
} from "./europe-blog";
import { sanitizeArchiveHtml } from "./wix-archive-content";

export { sanitizeArchiveHtml } from "./wix-archive-content";
export const isWixArchiveLocale = (value: string): value is WixArchiveLocale =>
  WIX_ARCHIVE_LOCALES.includes(value as WixArchiveLocale);

export const wixArchivePath = (language: WixArchiveLocale, slug: string) =>
  `/${language}/blog/archive/${encodeURIComponent(slug)}`;

// Separate lazy modules keep all article HTML out of the library's initial data.
const summaryLoaders = import.meta.glob<{ default: WixArchiveSummary[] }>(
  "../data/wix-archive/generated/index-*.json",
);
const detailLoaders = import.meta.glob<{ default: WixArchivePost[] }>(
  "../data/wix-archive/generated/detail-*.json",
);

export async function loadWixArchiveSummaries(
  language: EuropeBlogLocale,
): Promise<WixArchiveSummary[]> {
  if (!isWixArchiveLocale(language)) return [];
  const loader = summaryLoaders[`../data/wix-archive/generated/index-${language}.json`];
  if (!loader) throw new Error(`Missing generated archive index: ${language}`);
  return (await loader()).default;
}

export async function loadWixArchivePost(language: WixArchiveLocale, slug: string) {
  const loader = detailLoaders[`../data/wix-archive/generated/detail-${language}.json`];
  if (!loader) throw new Error(`Missing generated archive articles: ${language}`);
  const post = (await loader()).default.find(
    (item) => item.language === language && item.slug === slug,
  );
  return post ? { ...post, html: sanitizeArchiveHtml(post.html) } : undefined;
}

/** Translation identity comes only from Wix metadata, never a title or slug. */
export function resolveWixArchiveTranslations(
  post: WixArchiveSummary,
  candidates: WixArchiveSummary[],
): WixArchiveSummary[] {
  const linked = candidates.filter((candidate) => {
    if (candidate.id === post.id && candidate.language === post.language) return false;
    const sameGroup =
      post.editorialTopicKey && candidate.editorialTopicKey
        ? candidate.editorialTopicKey === post.editorialTopicKey
        : !!post.translationId && candidate.translationId === post.translationId;
    const outbound = post.translations?.some(
      (ref) => ref.postId === candidate.id && ref.language === candidate.language,
    );
    const inbound = candidate.translations?.some(
      (ref) => ref.postId === post.id && ref.language === post.language,
    );
    return sameGroup || (outbound && inbound);
  });
  return WIX_ARCHIVE_LOCALES.flatMap((language) => {
    if (language === post.language) return [post];
    const matches = linked.filter((candidate) => candidate.language === language);
    // Ambiguous source metadata must not produce multiple hreflangs for a locale.
    return matches.length === 1 ? matches : [];
  });
}

export async function loadWixArchiveTranslations(post: WixArchiveSummary) {
  const languages =
    post.editorialTopicKey || post.translationId
      ? [...WIX_ARCHIVE_LOCALES]
      : [...new Set([post.language, ...(post.translations ?? []).map((ref) => ref.language)])];
  const summaries = await Promise.all(languages.map(loadWixArchiveSummaries));
  return resolveWixArchiveTranslations(post, summaries.flat());
}

export function wixArchiveAlternates(post: WixArchiveSummary, translations: WixArchiveSummary[]) {
  const actual = resolveWixArchiveTranslations(post, translations);
  const preferred =
    actual.find((item) => item.language === "tr") ||
    actual.find((item) => item.language === "en") ||
    post;
  return [
    { rel: "canonical", href: `${EUROPE_BLOG_ORIGIN}${wixArchivePath(post.language, post.slug)}` },
    ...actual.map((item) => ({
      rel: "alternate",
      hrefLang: item.language,
      href: `${EUROPE_BLOG_ORIGIN}${wixArchivePath(item.language, item.slug)}`,
    })),
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: `${EUROPE_BLOG_ORIGIN}${wixArchivePath(preferred.language, preferred.slug)}`,
    },
  ];
}

export function wixArchiveHead(post: WixArchivePost, translations: WixArchiveSummary[]) {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${EUROPE_BLOG_ORIGIN}${wixArchivePath(post.language, post.slug)}`;
  const image = post.coverImage || `${EUROPE_BLOG_ORIGIN}/og-cover.png`;
  return {
    meta: [
      { title: `${title} | CliniGA Education` },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "article" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      ...(post.coverWidth
        ? [{ property: "og:image:width", content: String(post.coverWidth) }]
        : []),
      ...(post.coverHeight
        ? [{ property: "og:image:height", content: String(post.coverHeight) }]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { property: "article:published_time", content: post.publishedAt },
      { property: "article:modified_time", content: post.updatedAt },
    ],
    links: wixArchiveAlternates(post, translations),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              mainEntityOfPage: url,
              headline: post.title,
              description,
              inLanguage: post.language,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              image,
              ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
              publisher: {
                "@type": "Organization",
                name: "CliniGA Education",
                url: EUROPE_BLOG_ORIGIN,
              },
              isBasedOn: post.sourceUrl,
              ...(post.editorialSources?.length
                ? { citation: post.editorialSources.map((source) => source.url) }
                : {}),
              articleBody: sanitizeArchiveHtml(post.html)
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim(),
            },
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
                  name: EUROPE_BLOG_COPY[post.language].title,
                  item: `${EUROPE_BLOG_ORIGIN}${europeBlogPath(post.language)}`,
                },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
          ],
        }).replace(/</g, "\\u003c"),
      },
    ],
  };
}

export function wixArchiveDate(value: string, language: EuropeBlogLocale) {
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
}

const searchable = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const countryAliases = new Map<string, Set<string>>();
// These names also mean a Spanish city and a common Turkish adjective.
// Leave ambiguous standalone mentions searchable without assigning a country.
const ambiguousCountryAliases = new Set(["GD:granada", "ML:mali"]);
for (const countries of Object.values(countryNames)) {
  for (const country of countries) {
    const aliases = countryAliases.get(country.code) || new Set<string>();
    const alias = searchable(country.name);
    if (!ambiguousCountryAliases.has(`${country.code}:${alias}`)) aliases.add(alias);
    countryAliases.set(country.code, aliases);
  }
}
const extraAliases: Record<string, string[]> = {
  GB: ["İngiltere", "England", "Großbritannien", "UK"],
  TR: ["Türkiye", "Turkey"],
  IT: ["İtalya", "Italy", "Italia", "Italien"],
};
for (const [code, aliases] of Object.entries(extraAliases)) {
  const values = countryAliases.get(code) || new Set<string>();
  aliases.forEach((alias) => values.add(searchable(alias)));
  countryAliases.set(code, values);
}

export function wixArchiveCountryCodes(
  post: Pick<WixArchiveSummary, "title" | "excerpt" | "countryCodes">,
) {
  if (post.countryCodes?.length) return post.countryCodes;
  const text = ` ${searchable(`${post.title} ${post.excerpt}`)} `;
  return [...countryAliases]
    .filter(([, aliases]) => [...aliases].some((alias) => text.includes(` ${alias} `)))
    .map(([code]) => code);
}

/** Preserve guide ordering; append real archive destinations in the shipped locale order. */
export function wixArchiveCountryOptions(
  language: EuropeBlogLocale,
  guides: EuropeGuide[],
  archiveCodes: Iterable<string>,
) {
  const guideCountries = [...new Map(guides.map((guide) => [guide.countryCode, guide])).values()];
  const guideCodes = new Set(guideCountries.map((guide) => guide.countryCode));
  const actualArchiveCodes = new Set(archiveCodes);
  return [
    ...guideCountries.map((guide) => ({
      code: guide.countryCode,
      name: europeCountryName(guide, language),
    })),
    ...countryNames[language].filter(
      (country) => actualArchiveCodes.has(country.code) && !guideCodes.has(country.code),
    ),
  ];
}

/** Small card derivative only; full article and source URLs remain unchanged. */
export function wixArchiveCardImageUrl(original: string | null) {
  if (!original) return null;
  let url: URL;
  try {
    url = new URL(original);
  } catch {
    return original;
  }
  if (url.username || url.password) return null;
  if (url.protocol !== "https:" || url.hostname !== "static.wixstatic.com" || url.port)
    return original;
  const rawPath = /^[a-z]+:\/\/[^/?#]+([^?#]*)/i.exec(original)?.[1];
  if (!rawPath || /[\\%]/.test(rawPath) || /(?:^|\/)\.{1,2}(?:\/|$)/.test(rawPath)) return original;
  const match = /^\/media\/([A-Za-z0-9_~.-]+)(?:\/v1\/[A-Za-z0-9_,./~-]+)?$/.exec(url.pathname);
  if (!match || match[1].includes("..") || !/\.(?:png|jpe?g|webp|avif|gif)$/i.test(match[1]))
    return original;
  return `https://static.wixstatic.com/media/${match[1]}/v1/fill/w_640,h_336/archive-card.webp`;
}

export function wixArchiveRelatedGuides(post: WixArchiveSummary, guides: EuropeGuide[]) {
  const codes = wixArchiveCountryCodes(post);
  return guides.filter((guide) => codes.includes(guide.countryCode)).slice(0, 4);
}
