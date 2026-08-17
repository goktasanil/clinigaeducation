import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

import { SITE, buildWhatsAppLink } from "@/data/site";
import logo from "@/assets/cliniga-education-logo.png.asset.json";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 gradient-navy text-navy-foreground">
      <div className="container-prose grid gap-10 py-16 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt={`${SITE.brand} logo`}
              className="h-12 w-auto rounded-md bg-white p-1"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
            />

            <div>
              <span className="font-display text-xl font-semibold">
                {SITE.brandShort}
              </span>
              <span className="ml-1 text-sm font-normal text-gold">Education</span>
            </div>
          </div>
          <p className="max-w-md text-sm text-navy-foreground/75">
            {t("footer.tagline")}
          </p>
          <div className="space-y-2 pt-2 text-sm text-navy-foreground/85">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold" />
              <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                {SITE.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" />
              <a href={`tel:+${SITE.whatsapp}`} className="hover:text-gold">
                {SITE.whatsappDisplay}
              </a>
              <a
                href={buildWhatsAppLink("Merhaba, danışmanlık hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" /> {SITE.address}
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold">
            {t("footer.quickLinks")}
          </h4>
          <ul className="space-y-2 text-sm text-navy-foreground/80">
            <li><Link to="/portal" className="font-semibold text-gold hover:text-white">{t("nav.portal")}</Link></li>
            <li><Link to="/hizmetler" className="hover:text-gold">{t("nav.services")}</Link></li>
            <li><Link to="/paketler" className="hover:text-gold">{t("nav.packages")}</Link></li>
            <li><Link to="/surec" className="hover:text-gold">{t("nav.process")}</Link></li>
            <li><Link to="/quiz" className="hover:text-gold">{t("nav.quiz")}</Link></li>
            <li><Link to="/blog" className="hover:text-gold">{t("nav.blog")}</Link></li>
            <li><Link to="/hakkimizda" className="hover:text-gold">{t("nav.about")}</Link></li>
            <li><Link to="/iletisim" className="hover:text-gold">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold">
            {t("footer.legal")}
          </h4>
          <ul className="space-y-2 text-sm text-navy-foreground/80">
            <li>
              <Link to="/gizlilik" className="hover:text-gold">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/kullanim-kosullari" className="hover:text-gold">
                {t("footer.terms")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-prose space-y-2 py-5 text-xs text-navy-foreground/60">
          <p>
            <strong className="text-navy-foreground/80">Etik Beyan:</strong>{" "}
            CliniGA Education akademik etik kurallara bağlı bir danışmanlık
            hizmetidir. Öğrenci adına tez / ödev yazımı yapılmaz; yalnızca
            metodoloji, akademik yazım ve istatistik rehberliği sunulur.
          </p>
          <p>
            KVKK / GDPR kapsamındaki taleplerinizi{" "}
            <a href={`mailto:${SITE.email}`} className="hover:text-gold">
              {SITE.email}
            </a>{" "}
            adresine iletebilirsiniz.
          </p>
          <p>© {year} {SITE.brand}. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
