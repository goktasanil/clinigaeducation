import type { ReactNode } from "react";
import { ArrowUpRight, Globe2 } from "lucide-react";
import educationLogo from "@/assets/cliniga-education-logo.png";
import { EUROPE_BLOG_COPY } from "@/data/europe-blog/copy";
import { EUROPE_BLOG_LOCALES, type EuropeBlogLocale } from "@/data/europe-blog/types";
import { europeBlogPath } from "@/lib/europe-blog";

export function EuropeBlogShell({
  language,
  slug,
  languagePaths,
  children,
}: {
  language: EuropeBlogLocale;
  slug?: string;
  languagePaths?: Partial<Record<EuropeBlogLocale, string>>;
  children: ReactNode;
}) {
  const copy = EUROPE_BLOG_COPY[language];
  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen bg-[#f5f8fb] text-navy"
    >
      <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur-xl">
        <div className="container-prose flex min-h-19 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <a
            href="/"
            aria-label="CliniGA Education"
            className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-teal"
          >
            <img
              src={educationLogo}
              alt="CliniGA Education"
              width="180"
              height="49"
              className="h-11 w-auto max-w-44 object-contain"
            />
          </a>
          <nav
            aria-label={copy.title}
            className="flex items-center gap-4 text-sm font-semibold md:gap-7"
          >
            <a href={europeBlogPath(language)} className="text-teal hover:underline">
              {copy.back}
            </a>
            <a href="/portal" className="hidden items-center gap-1 hover:text-teal sm:inline-flex">
              {copy.portal}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a
              href="/iletisim"
              className="rounded-full bg-navy px-4 py-2.5 text-white hover:bg-teal"
            >
              {copy.contact}
            </a>
          </nav>
        </div>
      </header>
      <div className="border-b border-navy/10 bg-white">
        <nav
          aria-label="Language"
          className="container-prose flex items-center gap-1 overflow-x-auto py-2"
        >
          <Globe2 className="me-2 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
          {EUROPE_BLOG_LOCALES.filter((code) => !languagePaths || languagePaths[code]).map(
            (code) => (
              <a
                key={code}
                href={languagePaths?.[code] || europeBlogPath(code, slug)}
                hrefLang={code}
                lang={code}
                onClick={() => {
                  try {
                    window.localStorage.setItem("lang", code);
                  } catch {
                    /* Optional preference storage. */
                  }
                }}
                aria-current={code === language ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-teal ${code === language ? "bg-teal text-white" : "text-navy/70 hover:bg-teal/10"}`}
              >
                {EUROPE_BLOG_COPY[code].name}
              </a>
            ),
          )}
        </nav>
      </div>
      {children}
      <footer className="mt-16 border-t border-navy/10 bg-white py-10">
        <div className="container-prose flex flex-wrap items-center justify-between gap-6 text-sm">
          <p className="font-semibold">
            CliniGA Education{" "}
            <span className="ms-2 font-normal text-muted-foreground">
              © {new Date().getFullYear()}
            </span>
          </p>
          <nav className="flex flex-wrap gap-5" aria-label="CliniGA Education">
            <a href="/portal" className="hover:text-teal">
              {copy.portal}
            </a>
            <a href="/hizmetler" className="hover:text-teal">
              {copy.services}
            </a>
            <a href="/iletisim" className="hover:text-teal">
              {copy.contact}
            </a>
            <a href="/gizlilik" className="hover:text-teal">
              {copy.privacy}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
