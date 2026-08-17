import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Menu, X, Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SITE, openCalendly } from "@/data/site";
import logo from "@/assets/cliniga-education-logo.png.asset.json";

const links = [
  { to: "/", key: "home" },
  { to: "/portal", key: "portal" },
  { to: "/hizmetler", key: "services" },
  { to: "/paketler", key: "packages" },
  { to: "/surec", key: "process" },
  { to: "/quiz", key: "quiz" },
  { to: "/blog", key: "blog" },
  { to: "/hakkimizda", key: "about" },
  { to: "/iletisim", key: "contact" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-prose flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-navy">
          <img
            src={logo.url}
            alt={`${SITE.brand} logo`}
            className="h-11 w-auto"
            width={44}
            height={44}
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

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((link) => {
            const deferOnLaptop = link.key === "process" || link.key === "about";
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`${deferOnLaptop ? "hidden 2xl:inline-flex " : ""}${
                  link.key === "portal"
                    ? "inline-flex items-center rounded-full bg-navy px-3 py-2 text-sm font-semibold text-gold shadow-sm transition hover:-translate-y-0.5 hover:bg-navy/90"
                    : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:text-foreground"
                }`}
                activeProps={{ className: "active text-foreground" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.key === "portal" && (
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                )}
                {t(`nav.${link.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            size="sm"
            onClick={openCalendly}
            className="hidden bg-gold text-gold-foreground hover:bg-gold/90 md:inline-flex"
          >
            <Calendar className="mr-1.5 h-4 w-4" />
            {t("cta.primary")}
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
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      {link.key === "portal" && (
                        <Sparkles className="h-4 w-4 text-gold" />
                      )}
                      {t(`nav.${link.key}`)}
                    </span>
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setOpen(false);
                    openCalendly();
                  }}
                  className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <Calendar className="mr-1.5 h-4 w-4" />
                  {t("cta.primary")}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
