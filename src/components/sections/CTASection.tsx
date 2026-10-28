import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarCheck2, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="container-prose py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-navy p-7 text-navy-foreground md:p-16">
        <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {t("contact.title")}
            </h2>
            <p className="mt-3 max-w-md text-navy-foreground/80">{t("contact.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-start">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold px-6 text-gold-foreground hover:bg-gold/90"
            >
              <a href="/iletisim#randevu">
                <CalendarCheck2 className="me-2 h-4 w-4" />
                {t("cta.primary")} <ArrowRight className="ms-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 h-auto whitespace-normal border-white/30 bg-white/5 px-6 py-3 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
            >
              <Link to="/quiz">
                <ClipboardCheck className="me-2 h-4 w-4" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
