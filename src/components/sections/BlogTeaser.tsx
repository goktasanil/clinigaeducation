import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { europeBlogPath, europeCountryName, isEuropeBlogLocale } from "@/lib/europe-blog";

const featured = [
  { countryCode: "DE", countryName: "Germany", slug: "germany-funding", topic: "funding" },
  { countryCode: "IT", countryName: "Italy", slug: "italy-admission", topic: "admission" },
  { countryCode: "FR", countryName: "France", slug: "france-arrival", topic: "arrival" },
] as const;

export function BlogTeaser({ limit = 3 }: { limit?: number }) {
  const { i18n } = useTranslation();
  const language = isEuropeBlogLocale(i18n.language) ? i18n.language : "tr";
  const copy = EUROPE_BLOG_COPY[language];
  return (
    <section className="container-prose py-20 md:py-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-teal">CliniGA Journal</p>
          <h2 className="education-section-heading mt-3">{copy.title}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{copy.intro}</p>
        </div>
        <a
          href={europeBlogPath(language)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
        >
          {copy.back}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {featured.slice(0, limit).map((guide) => (
          <a
            key={guide.slug}
            href={europeBlogPath(language, guide.slug)}
            className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-colors hover:border-teal/40"
          >
            <img
              src={`/blog-covers/${guide.slug}.svg`}
              alt=""
              width="1200"
              height="630"
              loading="lazy"
              decoding="async"
              className="aspect-[1200/630] w-full object-cover"
            />
            <div className="p-6">
              <p className="text-xs font-semibold text-teal">
                {europeCountryName(guide, language)}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug">
                {copy.titles[guide.topic].replace("{country}", europeCountryName(guide, language))}
              </h3>
              <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-teal">
                {copy.read}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
