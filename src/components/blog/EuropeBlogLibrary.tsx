import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Search } from "lucide-react";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { EUROPE_GUIDE_TOPICS, type EuropeBlogLocale } from "@/data/europe-blog/types";
import { WIX_ARCHIVE_COPY } from "@/data/wix-archive/copy";
import type { WixArchiveCardSummary } from "@/data/wix-archive/types";
import {
  wixArchiveCountryCodes,
  wixArchiveCardImageUrl,
  wixArchiveCountryOptions,
  wixArchiveDate,
  wixArchivePath,
} from "@/lib/wix-archive";
import {
  europeBlogPath,
  europeGuideExcerpt,
  europeGuideTitle,
  type EuropeGuide,
} from "@/lib/europe-blog";
import { EuropeBlogShell } from "./EuropeBlogShell";

type Entry = {
  key: string;
  title: string;
  excerpt: string;
  href: string;
  photo: string | null;
  countryCodes: string[];
  topic: string;
  updatedAt: string;
};

export function EuropeBlogLibrary({
  language,
  guides,
  archivePosts = [],
}: {
  language: EuropeBlogLocale;
  guides: EuropeGuide[];
  archivePosts?: WixArchiveCardSummary[];
}) {
  const copy = EUROPE_BLOG_COPY[language];
  const journal = WIX_ARCHIVE_COPY[language];
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(24);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const countryCode = query.get("country") || "";
    const topicCode = query.get("topic") || "";
    if (/^(?:[A-Z]{2}|GLOBAL)$/.test(countryCode)) setCountry(countryCode);
    if ([...EUROPE_GUIDE_TOPICS, "professional"].includes(topicCode)) setTopic(topicCode);
    setSearch((query.get("q") || "").slice(0, 120));
  }, []);
  const entries = useMemo<Entry[]>(
    () => [
      ...guides.map((guide) => ({
        key: guide.slug,
        title: europeGuideTitle(guide, language),
        excerpt: europeGuideExcerpt(guide),
        href: europeBlogPath(language, guide.slug),
        photo: guide.coverImage,
        countryCodes: [guide.countryCode],
        topic: guide.topic,
        updatedAt: guide.checkedAt,
      })),
      ...archivePosts.map((post) => ({
        key: post.id,
        title: post.title,
        excerpt: post.excerpt,
        href: wixArchivePath(post.language, post.slug),
        photo: wixArchiveCardImageUrl(post.coverImage),
        countryCodes: wixArchiveCountryCodes(post),
        topic: post.topic || "arrival",
        updatedAt: post.updatedAt,
      })),
    ],
    [guides, archivePosts, language],
  );
  const options = useMemo(() => {
    const actual = entries.flatMap((entry) => entry.countryCodes);
    return [
      ...wixArchiveCountryOptions(language, guides, actual),
      ...(actual.includes("GLOBAL") ? [{ code: "GLOBAL", name: journal.global }] : []),
    ];
  }, [entries, guides, language, journal.global]);
  const names = useMemo(() => new Map(options.map((item) => [item.code, item.name])), [options]);
  const counts = useMemo(
    () =>
      new Map(
        options.map((item) => [
          item.code,
          entries.filter((entry) => entry.countryCodes.includes(item.code)).length,
        ]),
      ),
    [entries, options],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase(language);
    return entries.filter(
      (entry) =>
        (!country || entry.countryCodes.includes(country)) &&
        (!topic || entry.topic === topic) &&
        (!needle ||
          [entry.title, entry.excerpt, ...entry.countryCodes.map((code) => names.get(code))]
            .join(" ")
            .toLocaleLowerCase(language)
            .includes(needle)),
    );
  }, [entries, country, topic, search, language, names]);
  const groups = useMemo(() => {
    const visible = filtered.slice(0, limit);
    return options.flatMap((option) => {
      const articles = visible.filter(
        (entry) => (country || entry.countryCodes[0]) === option.code,
      );
      return articles.length ? [{ ...option, articles }] : [];
    });
  }, [filtered, limit, options, country]);
  const topicLabel = (key: string) =>
    key === "professional"
      ? journal.professional
      : copy.titles[key as (typeof EUROPE_GUIDE_TOPICS)[number]].replace(
          /\{country\}[:：]?\s*/g,
          "",
        );
  const selectCountry = (code: string) => {
    setCountry(code);
    setLimit(24);
  };
  return (
    <EuropeBlogShell language={language}>
      <section data-sc-act="flow" className="relative isolate overflow-hidden bg-navy text-white">
        <img
          data-sc-parallax="-0.55"
          src="/journal/education-journal-hero.webp"
          alt=""
          width="1600"
          height="800"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_50%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/95 via-navy/75 to-navy/15 rtl:bg-gradient-to-l" />
        <div className="container-prose grid min-h-[26rem] items-end gap-8 py-12 md:min-h-[30rem] md:grid-cols-[1fr_auto] md:py-16">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[#a9e7dd]">
              <BookOpen size={16} aria-hidden="true" /> CliniGA Journal
            </p>
            <h1 className="mt-5 max-w-2xl text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              {copy.intro}
            </p>
          </div>
          <p className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
            {new Intl.NumberFormat(language).format(entries.length)}
            <span className="mt-2 block text-xs font-medium uppercase tracking-[.14em] text-white/70">
              {journal.all}
            </span>
          </p>
        </div>
      </section>
      <section className="container-prose py-10 md:py-14" aria-label={journal.all}>
        <div className="mb-7 flex flex-wrap items-center gap-2" aria-label={journal.countryExplore}>
          <span className="me-3 text-sm font-semibold">{journal.countryExplore}</span>
          {[
            { code: "", name: copy.all },
            ...["IT", "DE", "FR", "ES", "CZ", "NL"].flatMap((code) =>
              names.has(code) ? [{ code, name: names.get(code)! }] : [],
            ),
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              aria-pressed={country === item.code}
              onClick={() => selectCountry(item.code)}
              className={[
                "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
                country === item.code
                  ? "border-teal bg-teal text-white"
                  : "border-navy/15 bg-white text-navy/75 hover:border-teal",
              ].join(" ")}
            >
              {item.name}
              {item.code && <span className="ms-2 opacity-65">{counts.get(item.code)}</span>}
            </button>
          ))}
        </div>
        <div className="grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="text-xs font-semibold text-navy/65">
            {journal.search}
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
              onChange={(event) => selectCountry(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-navy/15 bg-[#f8fafc] px-3 text-sm font-normal text-navy focus:outline-2 focus:outline-teal"
            >
              <option value="">{copy.all}</option>
              {options.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} ({counts.get(item.code)})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-navy/65">
            {copy.topic}
            <select
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setLimit(24);
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-navy/15 bg-[#f8fafc] px-3 text-sm font-normal text-navy focus:outline-2 focus:outline-teal"
            >
              <option value="">{copy.all}</option>
              {[...EUROPE_GUIDE_TOPICS, "professional"].map((key) => (
                <option key={key} value={key}>
                  {topicLabel(key)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status" aria-live="polite" className="mt-5 text-sm text-muted-foreground">
          {new Intl.NumberFormat(language).format(filtered.length)} /{" "}
          {new Intl.NumberFormat(language).format(entries.length)}
        </p>
        {groups.map((group) => (
          <section
            key={group.code}
            className="mt-10"
            aria-labelledby={"journal-country-" + group.code}
          >
            <div className="mb-6 flex items-end justify-between gap-5 border-b border-navy/15 pb-4">
              <h2
                id={"journal-country-" + group.code}
                className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
              >
                {group.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {new Intl.NumberFormat(language).format(counts.get(group.code) || 0)}{" "}
                {journal.articles}
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.articles.map((entry) => (
                <a
                  key={entry.key}
                  href={entry.href}
                  className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-xl hover:shadow-navy/5 focus-visible:outline-2 focus-visible:outline-teal motion-reduce:transform-none"
                >
                  <div className="overflow-hidden bg-[#dce9e8]">
                    {entry.photo && (
                      <img
                        src={entry.photo}
                        alt=""
                        width="960"
                        height="540"
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transform-none"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold text-teal">{topicLabel(entry.topic)}</p>
                    <h3 className="mt-3 text-xl font-semibold leading-snug text-navy">
                      {entry.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {entry.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {journal.updated}:{" "}
                      <time dateTime={entry.updatedAt}>
                        {wixArchiveDate(entry.updatedAt, language)}
                      </time>
                    </p>
                    <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-teal">
                      {journal.read}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
        {!filtered.length && (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center">
            <p>{journal.noResults}</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCountry("");
                setTopic("");
                setLimit(24);
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
              type="button"
              onClick={() => setLimit((value) => value + 24)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white hover:bg-teal"
            >
              {journal.more}
              <ArrowDown size={16} aria-hidden="true" /> ({filtered.length - limit})
            </button>
          </div>
        )}
        <nav className="mt-16 border-t border-navy/15 pt-10" aria-label={journal.countryExplore}>
          <h2 className="font-display text-2xl font-semibold">{journal.countryExplore}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {options.map((item) => (
              <details
                key={item.code}
                className="self-start rounded-xl border border-navy/10 bg-white p-4 open:border-teal/30"
              >
                <summary className="cursor-pointer text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal">
                  {item.name}{" "}
                  <span className="ms-2 font-normal text-muted-foreground">
                    ({counts.get(item.code)})
                  </span>
                </summary>
                <ul className="mt-4 space-y-3 border-t border-navy/10 pt-4">
                  {entries
                    .filter((entry) => entry.countryCodes.includes(item.code))
                    .map((entry) => (
                      <li key={entry.key}>
                        <a
                          href={entry.href}
                          className="text-sm leading-6 text-teal hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                        >
                          {entry.title}
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
