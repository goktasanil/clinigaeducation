import { useTranslation } from "react-i18next";
import { Check, Sparkles, Calendar } from "lucide-react";

import { PACKAGE_KEYS } from "@/data/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openCalendly } from "@/data/site";

export function PackagesGrid() {
  const { t } = useTranslation();

  return (
    <section className="container-prose py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          {t("nav.packages")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
          {t("packages.title")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("packages.subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGE_KEYS.map(({ key, recommended }) => {
          const features = t(`packages.items.${key}.features`, {
            returnObjects: true,
          }) as string[];
          return (
            <Card
              key={key}
              className={`relative flex flex-col overflow-hidden border-border/70 transition-shadow hover:shadow-premium ${
                recommended ? "ring-2 ring-gold" : ""
              }`}
            >
              {recommended && (
                <Badge className="absolute right-4 top-4 gap-1 bg-gold text-gold-foreground">
                  <Sparkles className="h-3 w-3" /> {t("packages.recommended")}
                </Badge>
              )}
              <CardContent className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-lg font-semibold text-navy">
                  {t(`packages.items.${key}.name`)}
                </h3>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 font-display text-sm font-semibold text-teal">
                    {t("packages.customQuote")}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("packages.customQuoteHint")}
                  </p>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={openCalendly}
                  className={`mt-7 ${
                    recommended
                      ? "bg-gold text-gold-foreground hover:bg-gold/90"
                      : "bg-navy text-navy-foreground hover:bg-navy/90"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("cta.primary")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
