import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import { SITE, buildWhatsAppLink } from "@/data/site";
import educationLogo from "@/assets/cliniga-education-logo.png";
import { openConsentSettings } from "@/lib/consent";

const COOKIES: Record<string, string> = {
  tr: "Çerez ayarları",
  en: "Cookie settings",
  de: "Cookie-Einstellungen",
  fr: "Paramètres des cookies",
  it: "Impostazioni cookie",
  es: "Configuración de cookies",
  ar: "إعدادات ملفات تعريف الارتباط",
  ru: "Настройки файлов cookie",
  zh: "Cookie 设置",
};
const LINKS = [
  { to: "/portal", key: "portal" },
  { to: "/hizmetler", key: "services" },
  { to: "/paketler", key: "packages" },
  { to: "/surec", key: "process" },
  { to: "/quiz", key: "quiz" },
  { to: "/blog", key: "blog" },
  { to: "/hakkimizda", key: "about" },
  { to: "/iletisim", key: "contact" },
] as const;

export function Footer() {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-16 overflow-hidden bg-navy text-white">
      <div className="h-1 bg-teal" />
      <div className="container-prose grid gap-10 py-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-6">
          <Link to="/" className="inline-flex rounded-xl bg-white p-2">
            <img
              src={educationLogo}
              alt={SITE.brand}
              className="h-20 w-48 object-contain"
              width={192}
              height={80}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/75">
            {t("footer.tagline")}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="flex w-fit items-center gap-3 text-white/85 hover:text-gold"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="break-all">{SITE.email}</span>
            </a>
            <a
              href={`tel:${SITE.phone}`}
              className="flex w-fit items-center gap-3 text-white/85 hover:text-gold"
            >
              <Phone className="h-4 w-4 text-gold" />
              {SITE.phoneDisplay}
            </a>
            <p className="flex items-center gap-3 text-white/70">
              <MapPin className="h-4 w-4 shrink-0 text-gold" />
              {SITE.address}
            </p>
          </div>
          <a
            href={buildWhatsAppLink(t("cta.whatsapp"))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-gold hover:bg-white/5"
          >
            <MessageCircle className="h-4 w-4 text-gold" />
            {t("cta.whatsapp")}
            <ArrowUpRight className="ms-3 h-4 w-4 rtl:-rotate-90" />
          </a>
        </div>
        <div className="md:col-span-3">
          <h2 className="font-display text-base font-semibold text-white">
            {t("footer.quickLinks")}
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-flex min-h-7 items-center hover:text-gold">
                  {t(`nav.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="font-display text-base font-semibold text-white">{t("footer.legal")}</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li>
              <Link to="/gizlilik" className="inline-flex min-h-7 items-center hover:text-gold">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                to="/kullanim-kosullari"
                className="inline-flex min-h-7 items-center hover:text-gold"
              >
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openConsentSettings}
                className="min-h-7 text-start hover:text-gold"
              >
                {COOKIES[i18n.resolvedLanguage || "tr"] || COOKIES.en}
              </button>
            </li>
          </ul>
          <div className="mt-8 rounded-xl border border-white/15 p-4">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <h3 className="mt-3 text-sm font-semibold text-white">
              {t("about.values.items.0.title")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-white/65">{t("faq.items.3.a")}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-prose flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/60">
          <p>
            © {year} {SITE.brand}. {t("footer.rights")}
          </p>
          <a href={`mailto:${SITE.email}`} className="break-all hover:text-white">
            KVKK / GDPR: {SITE.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
