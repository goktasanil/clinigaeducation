import { useMemo, useState } from "react";
import { Archive, ArrowDown, ArrowUpRight, BookOpen, Search } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { EUROPE_GUIDE_TOPICS, type EuropeBlogLocale } from "@/data/europe-blog/types";
import { WIX_ARCHIVE_COPY } from "@/data/wix-archive/copy";
import { WIX_ARCHIVE_LOCALES, type WixArchiveSummary } from "@/data/wix-archive/types";
import {
  isWixArchiveLocale,
  wixArchiveCountryCodes,
  wixArchiveCardImageUrl,
  wixArchiveCountryOptions,
  wixArchiveDate,
  wixArchivePath,
} from "@/lib/wix-archive";
import {
  europeBlogPath,
  europeCountryName,
  europeGuideExcerpt,
  europeGuideTitle,
  type EuropeGuide,
} from "@/lib/europe-blog";
import { EuropeBlogShell } from "./EuropeBlogShell";

export function EuropeBlogLibrary({
  language,
  guides,
  archivePosts = [],
}: {
  language: EuropeBlogLocale;
  guides: EuropeGuide[];
  archivePosts?: WixArchiveSummary[];
}) {
  const copy = EUROPE_BLOG_COPY[language];
  const archive = WIX_ARCHIVE_COPY[language];
  const [view, setView] = useState<"all" | "guides" | "archive">("all");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(24);
  const countries = useMemo(
    () => [...new Map(guides.map((guide) => [guide.countryCode, guide])).values()],
    [guides],
  );
  const archiveCountries = useMemo(
    () => new Map(archivePosts.map((post) => [post.id, wixArchiveCountryCodes(post)])),
    [archivePosts],
  );
  const countryOptions = useMemo(
    () => wixArchiveCountryOptions(language, countries, [...archiveCountries.values()].flat()),
    [language, countries, archiveCountries],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase(language);
    const guideResults =
      view === "archive"
        ? []
        : guides.filter(
            (guide) =>
              (!country || guide.countryCode === country) &&
              (!topic || guide.topic === topic) &&
              (!needle ||
                `${europeGuideTitle(guide, language)} ${guide.countryName} ${guide.brief}`
                  .toLocaleLowerCase(language)
                  .includes(needle)),
          );
    const archiveResults =
      view === "guides" || topic
        ? []
        : archivePosts.filter(
            (post) =>
              (!country || archiveCountries.get(post.id)?.includes(country)) &&
              (!needle ||
                `${post.title} ${post.excerpt}`.toLocaleLowerCase(language).includes(needle)),
          );
    const results: (
      { kind: "guide"; guide: EuropeGuide } | { kind: "archive"; post: WixArchiveSummary }
    )[] = [];
    for (let index = 0; index < Math.max(guideResults.length, archiveResults.length); index++) {
      if (archiveResults[index]) results.push({ kind: "archive", post: archiveResults[index] });
      if (guideResults[index]) results.push({ kind: "guide", guide: guideResults[index] });
    }
    return results;
  }, [guides, archivePosts, archiveCountries, country, topic, search, language, view]);
  const topicLabel = (key: (typeof EUROPE_GUIDE_TOPICS)[number]) =>
    copy.titles[key].replace(/\{country\}[:：]?\s*/g, "");
  return (
    <EuropeBlogShell language={language}>
      <section className="overflow-hidden border-b border-navy/10 bg-[#e9f1f4] py-14 md:py-20">
        <div className="container-prose grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-teal">
              <BookOpen size={16} aria-hidden="true" /> CliniGA Journal · Europe
            </div>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy/70">{copy.intro}</p>
          </div>
          <p
            className="font-display text-7xl font-medium tracking-tight text-teal/75"
            aria-label={`${guides.length + archivePosts.length} ${archive.all}`}
          >
            {new Intl.NumberFormat(language).format(guides.length + archivePosts.length)}
            <span className="mt-2 block font-sans text-xs font-semibold uppercase tracking-[.16em] text-navy/60">
              {archive.all}
            </span>
          </p>
        </div>
      </section>
      <section className="container-prose py-10 md:py-14" aria-label={copy.back}>
        <div id="previous-articles" className="mb-8 border-s-4 border-teal ps-5">
          <h2 className="font-display text-2xl font-semibold">
            {isWixArchiveLocale(language) ? archive.title : archive.availableTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {isWixArchiveLocale(language) ? archive.intro : archive.availableBody}
          </p>
          {!isWixArchiveLocale(language) && (
            <nav aria-label={archive.availableTitle} className="mt-4 flex flex-wrap gap-3">
              {WIX_ARCHIVE_LOCALES.map((code) => (
                <a
                  key={code}
                  href={`${europeBlogPath(code)}#previous-articles`}
                  hrefLang={code}
                  lang={code}
                  className="rounded-full border border-teal/30 bg-white px-4 py-2 text-sm text-teal hover:bg-teal/10 focus-visible:outline-2 focus-visible:outline-teal"
                >
                  {EUROPE_BLOG_COPY[code].name}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="mb-5 flex flex-wrap gap-2" aria-label={archive.all}>
          {(
            [
              ["all", archive.all, guides.length + archivePosts.length],
              ["guides", archive.guides, guides.length],
              ["archive", archive.previous, archivePosts.length],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => {
                setView(value);
                setLimit(24);
                setCountry("");
                setTopic("");
              }}
              className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${view === value ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy/70 hover:border-teal/50"}`}
            >
              {label}{" "}
              <span className="ms-1 opacity-70">
                {new Intl.NumberFormat(language).format(count)}
              </span>
            </button>
          ))}
        </div>
        <div
          className={`grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 md:p-5 ${view === "archive" ? "md:grid-cols-[1.4fr_1fr]" : "md:grid-cols-[1.4fr_1fr_1fr]"}`}
        >
          <label className="text-xs font-semibold text-navy/65">
            {archive.search}
            <span className="relative mt-2 block">
              <Search size={17} className="absolute start-3 top-3.5 text-teal" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setLimit(24);
                }}
                className="min-h-11 w-full rounded-lg border border-navy/15 bg-[#f8fafc] pe-3 ps-10 text-sm font-normal text-navy focus:outline-2 focus:outline-teal"
              />
            </span>
          </label>
          <label className="text-xs font-semibold text-navy/65">
            {copy.country}
            <select
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                setLimit(24);
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-navy/15 bg-[#f8fafc] px-3 text-sm font-normal text-navy focus:outline-2 focus:outline-teal"
            >
              <option value="">{copy.all}</option>
              {countryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          {view !== "archive" && (
            <label className="text-xs font-semibold text-navy/65">
              {archive.guides}: {copy.topic}
              <select
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setLimit(24);
                }}
                className="mt-2 min-h-11 w-full rounded-lg border border-navy/15 bg-[#f8fafc] px-3 text-sm font-normal text-navy focus:outline-2 focus:outline-teal"
              >
                <option value="">{copy.all}</option>
                {EUROPE_GUIDE_TOPICS.map((key) => (
                  <option key={key} value={key}>
                    {topicLabel(key)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p role="status" aria-live="polite" className="mb-6 mt-4 text-sm text-muted-foreground">
          {new Intl.NumberFormat(language).format(filtered.length)} /{" "}
          {new Intl.NumberFormat(language).format(
            view === "guides"
              ? guides.length
              : view === "archive"
                ? archivePosts.length
                : guides.length + archivePosts.length,
          )}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, limit).map((item) =>
            item.kind === "guide" ? (
              <EuropeGuideCard key={item.guide.slug} guide={item.guide} language={language} />
            ) : (
              <a
                key={`archive-${item.post.id}`}
                href={wixArchivePath(item.post.language, item.post.slug)}
                className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-teal/40 focus-visible:outline-2 focus-visible:outline-teal motion-reduce:transform-none"
              >
                {wixArchiveCardImageUrl(item.post.coverImage) ? (
                  <img
                    src={wixArchiveCardImageUrl(item.post.coverImage) || undefined}
                    alt=""
                    width="640"
                    height="336"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[1200/630] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[1200/630] items-center justify-center bg-[#e9f1f4] text-teal/50">
                    <Archive size={52} strokeWidth={1.25} aria-hidden="true" />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold text-teal">{archive.previous}</p>
                  <h2 className="mt-3 text-xl font-semibold leading-snug">{item.post.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.post.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {archive.published}:{" "}
                    <time dateTime={item.post.publishedAt}>
                      {wixArchiveDate(item.post.publishedAt, language)}
                    </time>
                  </p>
                  <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-teal">
                    {archive.read}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </a>
            ),
          )}
        </div>
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center">
            <p>
              {view === "archive" && !isWixArchiveLocale(language)
                ? archive.availableBody
                : archive.noResults}
            </p>
            {view === "archive" && !isWixArchiveLocale(language) && (
              <nav
                aria-label={archive.availableTitle}
                className="mt-4 flex flex-wrap justify-center gap-4"
              >
                {WIX_ARCHIVE_LOCALES.map((code) => (
                  <a
                    key={code}
                    href={`${europeBlogPath(code)}#previous-articles`}
                    hrefLang={code}
                    lang={code}
                    className="text-teal underline underline-offset-4"
                  >
                    {EUROPE_BLOG_COPY[code].name}
                  </a>
                ))}
              </nav>
            )}
            <button
              onClick={() => {
                setSearch("");
                setCountry("");
                setTopic("");
                setView("all");
              }}
              className="mt-5 rounded-full border border-teal px-5 py-2 text-sm text-teal"
            >
              {copy.clear}
            </button>
          </div>
        )}
        {filtered.length > limit && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setLimit((value) => value + 24)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white hover:bg-teal"
            >
              {copy.all} <ArrowDown size={16} aria-hidden="true" /> ({filtered.length - limit})
            </button>
          </div>
        )}
        <nav className="mt-16 border-t border-navy/15 pt-10" aria-label={copy.country}>
          <h2 className="font-display text-2xl font-semibold">{copy.country}</h2>
          <div className="mt-6 grid items-start gap-x-7 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((item) => (
              <details
                key={item.countryCode}
                className="rounded-lg border border-navy/10 bg-white p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold">
                  {europeCountryName(item, language)}
                </summary>
                <ul className="mt-3 space-y-3 border-t border-navy/10 pt-3">
                  {guides
                    .filter((guide) => guide.countryCode === item.countryCode)
                    .map((guide) => (
                      <li key={guide.slug}>
                        <a
                          href={europeBlogPath(language, guide.slug)}
                          className="text-sm leading-relaxed text-teal hover:underline"
                        >
                          {europeGuideTitle(guide, language)}
                        </a>
                      </li>
                    ))}
                </ul>
              </details>
            ))}
          </div>
        </nav>
      </section>
    </EuropeBlogShell>
  );
}

function EuropeGuideCard({ guide, language }: { guide: EuropeGuide; language: EuropeBlogLocale }) {
  const copy = EUROPE_BLOG_COPY[language];
  return (
    <a
      href={europeBlogPath(language, guide.slug)}
      className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-teal/40 focus-visible:outline-2 focus-visible:outline-teal motion-reduce:transform-none"
    >
      <img
        src={guide.coverImage}
        alt=""
        width="1200"
        height="630"
        loading="lazy"
        decoding="async"
        className="aspect-[1200/630] w-full object-cover"
      />
      <div className="p-6">
        <p className="text-xs font-semibold text-teal">
          {WIX_ARCHIVE_COPY[language].guides} · {europeCountryName(guide, language)}
          {guide.kind === "destination" ? ` · ${copy.destination}` : ""}
        </p>
        <h2 className="mt-3 text-xl font-semibold leading-snug">
          {europeGuideTitle(guide, language)}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {europeGuideExcerpt(guide)}
        </p>
        <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-teal">
          {copy.read}
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
