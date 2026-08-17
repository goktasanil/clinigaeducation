import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calendar, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openCalendly } from "@/data/site";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="container-prose py-20">
      <div className="relative overflow-hidden rounded-2xl gradient-navy p-10 text-navy-foreground md:p-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {t("hero.title")}
            </h2>
            <p className="mt-3 max-w-md text-navy-foreground/80">
              {t("contact.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button
              size="lg"
              onClick={openCalendly}
              className="h-12 bg-gold px-6 text-gold-foreground hover:bg-gold/90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t("cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/30 bg-white/5 px-6 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
            >
              <Link to="/quiz">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
