import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { FEATURED_EUROPE_GUIDES } from "@/data/europe-blog/featured";
import featuredPhotos from "@/data/europe-blog/generated/featured-photography.json";
import { europeBlogPath, europeCountryName, isEuropeBlogLocale } from "@/lib/europe-blog";
import { JournalPhotoCredit } from "@/components/blog/JournalPhotoCredit";

export function BlogTeaser({ limit = 3 }: { limit?: number }) {
  const { t, i18n } = useTranslation();
  const isPortuguese = i18n.resolvedLanguage === "pt";
  const language = isEuropeBlogLocale(i18n.language) ? i18n.language : isPortuguese ? "en" : "tr";
  const copy = EUROPE_BLOG_COPY[language];
  return (
    <section className="container-prose py-20 md:py-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-teal">CliniGA Journal</p>
          <h2 className="education-section-heading mt-3">
            {isPortuguese ? t("blog.title") : copy.title}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {isPortuguese ? t("blog.subtitle") : copy.intro}
          </p>
        </div>
        <a
          href={europeBlogPath(language)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
        >
          {isPortuguese ? "Explorar artigos em inglês" : copy.back}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <div
        className="atlas-journal-list mt-12 grid gap-6 md:grid-cols-3"
        data-sc-in
        data-sc-stagger="60"
      >
        {FEATURED_EUROPE_GUIDES.slice(0, limit).map((guide) => (
          <figure
            key={guide.slug}
            className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-colors hover:border-teal/40 [&>figcaption]:mx-6 [&>figcaption]:mb-5"
          >
            <a
              href={europeBlogPath(language, guide.slug)}
              className="block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-teal"
            >
              <img
                src={featuredPhotos[guide.slug].url}
                alt={`${europeCountryName(guide, language)} — ${featuredPhotos[guide.slug].description}`}
                width={featuredPhotos[guide.slug].width}
                height={featuredPhotos[guide.slug].height}
                loading="lazy"
                decoding="async"
                className="aspect-[1200/630] w-full object-cover"
              />
              <div className="p-6" lang={language}>
                <p className="text-xs font-semibold text-teal">
                  {europeCountryName(guide, language)}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug">
                  {copy.titles[guide.topic].replace(
                    "{country}",
                    europeCountryName(guide, language),
                  )}
                </h3>
                <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-teal">
                  {copy.read}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </div>
            </a>
            <JournalPhotoCredit photo={featuredPhotos[guide.slug]} />
          </figure>
        ))}
      </div>
    </section>
  );
}
