import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CalendarCheck2, ClipboardCheck } from "lucide-react";

export function MobileConversionBar() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_36px_-24px_rgba(7,28,51,.65)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
        <a
          href="/iletisim#randevu"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gold/90"
        >
          <CalendarCheck2 className="mr-2 h-4 w-4" />
          {t("cta.primary")}
        </a>
        <Link
          to="/quiz"
          aria-label={t("cta.secondary")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-navy/15 bg-white text-navy transition hover:bg-muted"
        >
          <ClipboardCheck className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
