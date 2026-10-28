import { ArrowLeft, ArrowUpRight, CheckCheck, ExternalLink, Globe2 } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import {
  EUROPE_COMMUNITY_DIRECTORIES,
  EUROPE_COMMUNITY_LINKS,
} from "@/data/europe-blog/community-links";
import type { EuropeBlogLocale } from "@/data/europe-blog/types";
import { buildWhatsAppLink } from "@/data/site";
import {
  europeBlogPath,
  europeCountryName,
  europeGuideTitle,
  type EuropeGuide,
} from "@/lib/europe-blog";
import { EuropeBlogShell } from "./EuropeBlogShell";
import { JournalPhotoCredit } from "./JournalPhotoCredit";

export function EuropeBlogArticle({
  language,
  guide,
  related,
}: {
  language: EuropeBlogLocale;
  guide: EuropeGuide;
  related: EuropeGuide[];
}) {
  const copy = EUROPE_BLOG_COPY[language];
  const title = europeGuideTitle(guide, language);
  const communities = EUROPE_COMMUNITY_LINKS.filter(
    (link) => link.countryCode === guide.countryCode,
  );
  const directories = EUROPE_COMMUNITY_DIRECTORIES.filter(
    (link) => !link.countryCode || link.countryCode === guide.countryCode,
  );
  const date = new Date(`${guide.checkedAt}T12:00:00Z`).toLocaleDateString(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const sourceLinks = [
    ...guide.sources,
    ...(guide.topic === "funding"
      ? [
          {
            id: "erasmus-mundus",
            label: "European Commission · Erasmus Mundus Joint Masters",
            url: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
            checkedAt: guide.checkedAt,
          },
        ]
      : []),
  ];
  return (
    <EuropeBlogShell language={language} slug={guide.slug}>
      <article>
        <header className="border-b border-navy/10 bg-white py-10 md:py-16">
          <div className="container-prose">
            <a
              href={europeBlogPath(language)}
              className="inline-flex items-center gap-2 text-sm text-teal hover:underline"
            >
              <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
              {copy.back}
            </a>
            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-teal">
              {europeCountryName(guide, language)} · CliniGA Journal
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>{copy.editorial}</span>
              <span>
                {copy.checked}: <time dateTime={guide.checkedAt}>{date}</time>
              </span>
            </div>
          </div>
        </header>
        <div className="container-prose grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0">
            <figure className="mb-9">
              <img
                src={guide.coverImage}
                alt=""
                width="1200"
                height="630"
                fetchPriority="high"
                className="aspect-[16/9] w-full rounded-2xl border border-navy/10 object-cover"
              />
              <JournalPhotoCredit photo={guide.photoCredit} />
            </figure>
            <p className="text-lg leading-relaxed text-navy/75">{copy.intros[guide.topic]}</p>
            <section className="mt-8 border-s-4 border-teal ps-6" aria-labelledby="local-context">
              <h2 id="local-context" className="font-display text-2xl font-semibold">
                {europeCountryName(guide, language)}
              </h2>
              {guide.brief.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index} className="mt-4 whitespace-pre-line text-base leading-8">
                  {paragraph}
                </p>
              ))}
            </section>
            <section
              id="action-plan"
              className="mt-10 rounded-2xl border border-teal/15 bg-[#eaf3f3] p-6 md:p-8"
            >
              <h2 className="flex items-center gap-3 font-display text-2xl font-semibold">
                <CheckCheck size={24} className="shrink-0 text-teal" aria-hidden="true" />
                {copy.checklist}
              </h2>
              <ul className="mt-6 space-y-5">
                {copy.steps[guide.topic].map((step, index) => (
                  <li key={`${guide.slug}-${index}`}>
                    <label className="flex cursor-pointer items-start gap-3 leading-7">
                      <input
                        type="checkbox"
                        className="mt-1.5 h-4 w-4 shrink-0 accent-teal focus-visible:outline-2 focus-visible:outline-teal"
                      />
                      <span>{step}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
            <section id="sources" className="mt-10">
              <h2 className="font-display text-2xl font-semibold">{copy.sources}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.sourcesNote}</p>
              <ul className="mt-5 divide-y divide-navy/10 rounded-xl border border-navy/10 bg-white px-5">
                {sourceLinks.map((source) => (
                  <li key={source.id} className="py-4">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 font-medium text-teal hover:underline"
                    >
                      <span>
                        {source.label}
                        <span className="mt-1 block break-all text-xs font-normal text-muted-foreground">
                          {new URL(source.url).hostname}
                        </span>
                      </span>
                      <ExternalLink size={16} className="mt-1 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <section id="communities" className="mt-10 border-t border-navy/15 pt-9">
              <h2 className="font-display text-2xl font-semibold">{copy.communities}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.communityNote}</p>
              {communities.length > 0 && (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {communities.map((link) => (
                    <li key={link.id} className="rounded-xl border border-navy/10 bg-white p-5">
                      <p className="text-xs font-semibold text-teal">
                        {link.platform === "whatsapp" ? "WhatsApp" : "Telegram"} · {link.city}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer external"
                        className="mt-2 inline-flex items-center gap-2 font-semibold hover:text-teal"
                      >
                        {link.title}
                        <ArrowUpRight size={15} className="shrink-0" aria-hidden="true" />
                      </a>
                      <p className="mt-2 text-xs text-muted-foreground">{link.operator}</p>
                      <a
                        href={link.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block text-xs text-teal underline underline-offset-4"
                      >
                        {copy.source}
                      </a>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {copy.checked}: {link.sourceCheckedAt}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 space-y-3">
                {directories.map((entry) => (
                  <a
                    key={entry.id}
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white p-4 text-sm text-teal"
                  >
                    <span>{entry.countryCode ? entry.title : copy.directory}</span>
                    <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
            <p className="mt-9 border-t border-navy/10 pt-5 text-xs leading-6 text-muted-foreground">
              {copy.note}
            </p>
          </div>
          <aside className="min-w-0">
            <div className="space-y-6 lg:sticky lg:top-36">
              <nav
                className="rounded-2xl border border-navy/10 bg-white p-6"
                aria-label={copy.contents}
              >
                <h2 className="text-sm font-semibold">{copy.contents}</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>
                    <a href="#local-context" className="hover:text-teal">
                      {europeCountryName(guide, language)}
                    </a>
                  </li>
                  <li>
                    <a href="#action-plan" className="hover:text-teal">
                      {copy.checklist}
                    </a>
                  </li>
                  <li>
                    <a href="#sources" className="hover:text-teal">
                      {copy.sources}
                    </a>
                  </li>
                  <li>
                    <a href="#communities" className="hover:text-teal">
                      {copy.communities}
                    </a>
                  </li>
                </ul>
              </nav>
              <section className="rounded-2xl bg-navy p-7 text-white">
                <Globe2 size={28} className="text-gold" aria-hidden="true" />
                <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">
                  {copy.cta}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/75">{copy.ctaBody}</p>
                <a
                  href={buildWhatsAppLink(
                    `${copy.message}\n${title}\nhttps://www.clinigaeducation.com${europeBlogPath(language, guide.slug)}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-navy hover:bg-white"
                >
                  WhatsApp
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a
                  href="/portal"
                  className="mt-4 block text-center text-sm font-medium text-white underline underline-offset-4"
                >
                  {copy.portal}
                </a>
              </section>
              <section className="rounded-2xl border border-navy/10 bg-white p-6">
                <h2 className="text-sm font-semibold">{copy.related}</h2>
                <ul className="mt-4 space-y-4">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <a
                        href={europeBlogPath(language, item.slug)}
                        className="text-sm leading-6 text-teal hover:underline"
                      >
                        {europeGuideTitle(item, language)}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </article>
    </EuropeBlogShell>
  );
}
