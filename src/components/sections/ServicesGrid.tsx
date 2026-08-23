import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { SERVICES } from "@/data/services";
import { Card, CardContent } from "@/components/ui/card";

export function ServicesGrid() {
  const { t } = useTranslation();
  return (
    <section className="container-prose py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          {t("nav.services")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
          {t("services.title")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ key, slug, icon: Icon }) => (
          <Card
            key={key}
            className="group relative overflow-hidden border-border/70 transition-all hover:-translate-y-1 hover:shadow-premium"
          >
            <CardContent className="flex h-full flex-col p-7">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-lg gradient-navy text-navy-foreground transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-navy">
                {t(`services.${key}.title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t(`services.${key}.desc`)}
              </p>
              <Link
                to="/hizmetler/$slug"
                params={{ slug }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal transition-all hover:gap-2.5"
              >
                {t("cta.learnMore")} <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
