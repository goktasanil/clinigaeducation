import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronDown, Globe2, Mail, Menu, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SITE, buildConsultationEmailLink } from "@/data/site";
import logo from "@/assets/cliniga-logo.png.asset.json";

const primaryLinks = [
  { to: "/", key: "home" },
  { to: "/hizmetler", key: "services" },
  { to: "/paketler", key: "packages" },
  { to: "/hakkimizda", key: "about" },
  { to: "/iletisim", key: "contact" },
] as const;

const mobileLinks = [
  ...primaryLinks,
  { to: "/surec", key: "process" },
  { to: "/quiz", key: "quiz" },
] as const;

const countries = [
  ["İtalya", "İtalya"],
  ["Almanya", "Almanya"],
  ["İngiltere", "İngiltere"],
  ["Kanada", "Kanada"],
  ["ABD", "ABD"],
  ["Hollanda", "Hollanda"],
] as const;

const topics = [
  ["Vize ve oturum", "Vize"],
  ["Konaklama", "Konaklama"],
  ["Burs ve finans", "Burs"],
  ["Başvuru belgeleri", "SOP"],
  ["Tez ve istatistik", "Tez"],
] as const;

function BlogDropdown() {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t("nav.blog")}
          <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64 p-2">
        <DropdownMenuItem asChild>
          <Link to="/blog" search={{ q: "", cat: "", page: 1 }} className="font-semibold">
            <BookOpen className="h-4 w-4 text-teal" />
            {t("blog.allCategories", { defaultValue: "Tüm yazılar" })}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe2 className="h-4 w-4 text-teal" />
            {t("blog.byCountry", { defaultValue: "Ülkeye göre" })}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {countries.map(([label, q]) => (
              <DropdownMenuItem key={q} asChild>
                <Link to="/blog" search={{ q, cat: "", page: 1 }}>
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BookOpen className="h-4 w-4 text-teal" />
            {t("blog.byTopic", { defaultValue: "Konuya göre" })}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            {topics.map(([label, q]) => (
              <DropdownMenuItem key={q} asChild>
                <Link to="/blog" search={{ q, cat: "", page: 1 }}>
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t("blog.menuHint", {
            defaultValue: "Ülke, vize, konaklama ve başvuru rehberleri",
          })}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const emailHref = buildConsultationEmailLink();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="container-prose flex h-[4.5rem] items-center justify-between gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-navy" aria-label={SITE.brand}>
          <img
            src={logo.url}
            alt="CliniGA Clinical Research"
            className="h-12 w-32 object-contain object-left sm:w-40"
            width={160}
            height={48}
            fetchPriority="high"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-lg font-semibold tracking-tight">
              {SITE.brandShort}
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-teal">
              Education
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Ana menü">
          {primaryLinks.slice(0, 3).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active text-foreground" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
          <BlogDropdown />
          {primaryLinks.slice(3).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active text-foreground" }}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <Button
            asChild
            size="sm"
            className="hidden bg-gold text-gold-foreground hover:bg-gold/90 lg:inline-flex"
          >
            <a href={emailHref}>
              <Mail className="mr-1.5 h-4 w-4" />
              {t("cta.primary")}
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden border-navy/20 text-navy hover:bg-navy hover:text-white md:inline-flex"
          >
            <Link to="/portal">
              <Sparkles className="mr-1.5 h-4 w-4 text-gold" />
              {t("nav.portal")}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,90vw)]">
              <div className="mt-8 flex items-center gap-3 border-b pb-5">
                <img src={logo.url} alt="CliniGA Clinical Research" className="h-12 w-36 object-contain object-left" width={144} height={48} />
                <div>
                  <p className="font-display font-semibold text-navy">{SITE.brand}</p>
                  <p className="text-xs text-muted-foreground">{t("brand.tagline")}</p>
                </div>
              </div>
              <nav className="mt-5 flex flex-col gap-1" aria-label="Mobil menü">
                <Link
                  to="/portal"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center rounded-xl bg-navy px-4 py-3 font-semibold text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-gold" />
                  {t("nav.portal")}
                </Link>
                {mobileLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
                <div className="my-3 border-t" />
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("nav.blog")}
                </p>
                <div className="grid grid-cols-2 gap-1 px-1 py-2">
                  {topics.slice(0, 4).map(([label, q]) => (
                    <Link
                      key={q}
                      to="/blog"
                      search={{ q, cat: "", page: 1 }}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-navy"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <Button asChild className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90">
                  <a href={emailHref} onClick={() => setOpen(false)}>
                    <Mail className="mr-1.5 h-4 w-4" />
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
