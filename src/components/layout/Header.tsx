import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, CalendarCheck2, ChevronDown, Globe2, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SITE } from "@/data/site";
import educationLogo from "@/assets/cliniga-education-logo.png";
import { europeBlogPath, isEuropeBlogLocale } from "@/lib/europe-blog";

const journalEntry = (value: string) => {
  const language = value.split("-")[0];
  return europeBlogPath(isEuropeBlogLocale(language) ? language : "tr");
};

const primaryLinks = [
  { to: "/hizmetler", key: "services" },
  { to: "/paketler", key: "packages" },
  { to: "/hakkimizda", key: "about" },
  { to: "/iletisim", key: "contact" },
] as const;
const mobileLinks = [
  { to: "/", key: "home" },
  ...primaryLinks,
  { to: "/surec", key: "process" },
  { to: "/quiz", key: "quiz" },
] as const;
const countries = ["IT", "DE", "FR", "ES", "CZ", "NL"] as const;
const topics = [
  ["visa", "arrival"],
  ["sop", "professional"],
  ["statistics", "professional"],
  ["thesis", "professional"],
  ["scholarship", "funding"],
] as const;
const MENU_LABELS: Record<string, { open: string; close: string; main: string }> = {
  tr: { open: "Menüyü aç", close: "Menüyü kapat", main: "Ana menü" },
  en: { open: "Open menu", close: "Close menu", main: "Main navigation" },
  de: { open: "Menü öffnen", close: "Menü schließen", main: "Hauptnavigation" },
  fr: { open: "Ouvrir le menu", close: "Fermer le menu", main: "Navigation principale" },
  it: { open: "Apri menu", close: "Chiudi menu", main: "Navigazione principale" },
  es: { open: "Abrir menú", close: "Cerrar menú", main: "Navegación principal" },
  ar: { open: "فتح القائمة", close: "إغلاق القائمة", main: "التنقل الرئيسي" },
  ru: { open: "Открыть меню", close: "Закрыть меню", main: "Главная навигация" },
  hi: { open: "मेन्यू खोलें", close: "मेन्यू बंद करें", main: "मुख्य नेविगेशन" },
  zh: { open: "打开菜单", close: "关闭菜单", main: "主导航" },
};

function BlogDropdown() {
  const { t, i18n } = useTranslation();
  const blogPath = journalEntry(i18n.resolvedLanguage || i18n.language || "tr");
  const display = new Intl.DisplayNames([i18n.resolvedLanguage || "tr", "en"], { type: "region" });
  return (
    <div className="inline-flex items-center rounded-lg">
      <a
        href={blogPath}
        className="inline-flex min-h-11 items-center rounded-s-lg ps-3 pe-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        {t("nav.blog")}
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-9 items-center justify-center rounded-e-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            aria-label={`${t("nav.blog")}: ${t("blog.allCategories")}`}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64 rounded-xl p-2">
          <DropdownMenuItem asChild>
            <a href={blogPath} className="font-semibold">
              <BookOpen className="h-4 w-4 text-teal" />
              {t("blog.allCategories")}
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe2 className="h-4 w-4 text-teal" />
              {t("blog.byCountry")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {countries.map((code) => (
                <DropdownMenuItem key={code} asChild>
                  <a href={`${blogPath}?country=${code}`}>{display.of(code) || code}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BookOpen className="h-4 w-4 text-teal" />
              {t("blog.byTopic")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
              {topics.map(([key, topic]) => (
                <DropdownMenuItem key={key} asChild>
                  <a href={`${blogPath}?topic=${topic}`}>{t(`blog.categories.${key}`)}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Header() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const labels = MENU_LABELS[i18n.resolvedLanguage || "tr"] || MENU_LABELS.en;
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy/10 bg-white/95 backdrop-blur-xl">
      <div className="container-prose flex h-19 items-center justify-between gap-3">
        <Link to="/" className="flex shrink-0 items-center text-navy" aria-label={SITE.brand}>
          <img
            src={educationLogo}
            alt="CliniGA Education"
            className="h-14 w-36 object-contain object-left sm:h-16 sm:w-40"
            width={160}
            height={64}
            fetchPriority="high"
          />
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label={labels.main}>
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy [&.active]:bg-[#e8f3f2] [&.active]:text-teal"
              activeProps={{ className: "active" }}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
          <BlogDropdown />
        </nav>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="hidden min-h-11 rounded-lg px-3 text-navy hover:bg-muted 2xl:inline-flex"
          >
            <a href="/iletisim#randevu">
              <CalendarCheck2 className="me-1.5 h-4 w-4" />
              {t("cta.primary")}
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden min-h-11 rounded-xl border-navy/20 px-4 text-navy hover:bg-muted md:inline-flex"
          >
            <Link to="/portal">
              <Globe2 className="me-2 h-4 w-4 text-teal" />
              {t("nav.portal")}
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 xl:hidden"
                aria-label={open ? labels.close : labels.open}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side={i18n.dir() === "rtl" ? "left" : "right"}
              className="w-[min(22rem,90vw)] overflow-y-auto"
            >
              <SheetTitle className="sr-only">{SITE.brand}</SheetTitle>
              <div className="mt-8 border-b pb-5">
                <img
                  src={educationLogo}
                  alt="CliniGA Education"
                  className="h-16 w-40 object-contain object-left"
                  width={160}
                  height={64}
                />
              </div>
              <nav className="mt-5 flex flex-col gap-1" aria-label={labels.main}>
                <Link
                  to="/portal"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex min-h-12 items-center rounded-xl border border-navy/20 px-4 py-3 font-semibold text-navy hover:bg-muted"
                >
                  <Globe2 className="me-2 h-4 w-4 text-teal" />
                  {t("nav.portal")}
                </Link>
                {mobileLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-navy transition-colors hover:bg-muted"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
                <a
                  href={journalEntry(i18n.resolvedLanguage || i18n.language || "tr")}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-navy hover:bg-muted"
                >
                  {t("nav.blog")}
                </a>
                <Button
                  asChild
                  className="mt-4 min-h-12 rounded-xl bg-teal text-white hover:bg-navy"
                >
                  <a href="/iletisim#randevu" onClick={() => setOpen(false)}>
                    <CalendarCheck2 className="me-2 h-4 w-4" />
                    {t("cta.primary")}
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
