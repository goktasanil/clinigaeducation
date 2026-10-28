import { ArrowLeft, ArrowUpRight, Archive, ExternalLink, Globe2 } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import type { EuropeBlogLocale } from "@/data/europe-blog/types";
import { WIX_ARCHIVE_COPY } from "@/data/wix-archive/copy";
import {
  WIX_ARCHIVE_FORMATTED_AT,
  type WixArchivePost,
  type WixArchiveSummary,
} from "@/data/wix-archive/types";
import { buildWhatsAppLink } from "@/data/site";
import {
  EUROPE_BLOG_ORIGIN,
  europeBlogPath,
  europeGuideTitle,
  type EuropeGuide,
} from "@/lib/europe-blog";
import {
  resolveWixArchiveTranslations,
  sanitizeArchiveHtml,
  wixArchiveDate,
  wixArchivePath,
} from "@/lib/wix-archive";
import { EuropeBlogShell } from "./EuropeBlogShell";

export function WixArchiveArticle({
  post,
  translations,
  related,
}: {
  post: WixArchivePost;
  translations: WixArchiveSummary[];
  related: EuropeGuide[];
}) {
  const language = post.language;
  const copy = EUROPE_BLOG_COPY[language];
  const archive = WIX_ARCHIVE_COPY[language];
  const languagePaths = Object.fromEntries(
    resolveWixArchiveTranslations(post, translations).map((item) => [
      item.language,
      wixArchivePath(item.language, item.slug),
    ]),
  ) as Partial<Record<EuropeBlogLocale, string>>;
  return (
    <EuropeBlogShell language={language} languagePaths={languagePaths}>
      <article>
        <header className="border-b border-navy/10 bg-white py-10 md:py-16">
          <div className="container-prose">
            <a
              href={europeBlogPath(language)}
              className="inline-flex items-center gap-2 text-sm text-teal hover:underline focus-visible:outline-2 focus-visible:outline-teal"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {archive.all}
            </a>
            <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-teal">
              <Archive size={16} aria-hidden="true" />
              {archive.previous}
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                {archive.published}:{" "}
                <time dateTime={post.publishedAt}>
                  {wixArchiveDate(post.publishedAt, language)}
                </time>
              </span>
              {post.minutesToRead && (
                <span>
                  {post.minutesToRead} {archive.minutes}
                </span>
              )}
              {post.author && (
                <span>
                  {archive.author}: {post.author}
                </span>
              )}
            </div>
          </div>
        </header>
        <div className="container-prose grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 lg:py-10">
          <div className="min-w-0">
            <aside
              aria-labelledby="archive-context"
              className="mb-8 border-s-4 border-teal bg-[#e9f1f4] p-5 md:p-6"
            >
              <h2 id="archive-context" className="text-base font-semibold">
                {archive.noticeTitle}
              </h2>
              <p className="mt-2 text-sm leading-7 text-navy/75">{archive.noticeBody}</p>
            </aside>
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt=""
                width={post.coverWidth || undefined}
                height={post.coverHeight || undefined}
                fetchPriority="high"
                className="mb-9 max-h-[36rem] w-full rounded-2xl border border-navy/10 object-contain"
              />
            )}
            <div
              className="max-w-none break-words text-base leading-8 text-navy/85 [&_p]:my-5 [&_h2]:mb-5 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:my-5 [&_h4]:text-lg [&_h4]:font-semibold [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-teal [&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:my-2 [&_li_p]:my-2 [&_figure]:my-8 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_blockquote]:my-6 [&_blockquote]:border-s-4 [&_blockquote]:border-teal/40 [&_blockquote]:ps-5 [&_table]:my-7 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_th]:border [&_th]:border-navy/20 [&_th]:bg-navy/5 [&_th]:p-3 [&_th]:text-start [&_td]:border [&_td]:border-navy/20 [&_td]:p-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-navy/5 [&_pre]:p-4 [&_hr]:my-9 [&_hr]:border-navy/15"
              dangerouslySetInnerHTML={{ __html: sanitizeArchiveHtml(post.html) }}
            />
            <section
              className="mt-10 border-t border-navy/15 pt-6 text-sm leading-7 text-muted-foreground"
              aria-label={archive.formatLabel}
            >
              <p>
                {archive.formatLabel}:{" "}
                <time dateTime={WIX_ARCHIVE_FORMATTED_AT}>
                  {wixArchiveDate(WIX_ARCHIVE_FORMATTED_AT, language)}
                </time>
              </p>
              <p className="mt-2">{archive.formatNote}</p>
              {post.updatedAt !== post.publishedAt && (
                <p className="mt-2">
                  {archive.updated}:{" "}
                  <time dateTime={post.updatedAt}>{wixArchiveDate(post.updatedAt, language)}</time>
                </p>
              )}
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 break-all text-teal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal"
              >
                {archive.source}
                <ExternalLink size={15} className="shrink-0" aria-hidden="true" />
              </a>
            </section>
          </div>
          <aside className="min-w-0">
            <div className="space-y-6 lg:sticky lg:top-36">
              <section className="rounded-2xl border border-navy/10 bg-white p-6">
                <h2 className="font-display text-xl font-semibold">
                  {related.length ? archive.related : archive.allGuides}
                </h2>
                <nav aria-label={archive.allGuides} className="mt-5 space-y-4 text-sm">
                  {related.map((guide) => (
                    <a
                      key={guide.slug}
                      href={europeBlogPath(language, guide.slug)}
                      className="flex items-start justify-between gap-3 text-teal hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                    >
                      <span>{europeGuideTitle(guide, language)}</span>
                      <ArrowUpRight size={16} className="mt-1 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                  <a
                    href={europeBlogPath(language)}
                    className="inline-flex items-center gap-2 font-semibold text-teal hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    {archive.allGuides}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </nav>
              </section>
              <section className="rounded-2xl bg-navy p-7 text-white">
                <Globe2 size={28} className="text-gold" aria-hidden="true" />
                <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">
                  {copy.cta}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/75">{copy.ctaBody}</p>
                <a
                  href={buildWhatsAppLink(
                    `${copy.message}\n${post.title}\n${EUROPE_BLOG_ORIGIN}${wixArchivePath(language, post.slug)}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  WhatsApp
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </section>
            </div>
          </aside>
        </div>
      </article>
    </EuropeBlogShell>
  );
}
