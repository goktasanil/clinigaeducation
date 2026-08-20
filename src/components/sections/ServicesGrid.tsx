import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { SERVICES } from "@/data/services";
import { Card, CardContent } from "@/components/ui/card";

export function ServicesGrid() {
  const { t } = useTranslation();

  return (
    <section className="container-prose py-16 md:py-24">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">İhtiyacına göre</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">
            Tekrarsız, net ve sana uygun destek
          </h2>
          <p className="mt-4 text-muted-foreground">
            Her kart farklı bir ihtiyaca cevap verir. Detayları incele veya kısa testle doğru başlangıcı bul.
          </p>
        </div>
        <Link to="/hizmetler" className="inline-flex items-center gap-2 text-sm font-bold text-teal hover:underline">
          Tüm hizmetleri karşılaştır <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ key, icon: Icon }, index) => (
          <Card key={key} className="group relative overflow-hidden rounded-3xl border-2 border-navy/10 bg-card transition-all hover:-translate-y-1 hover:border-teal/30 hover:shadow-premium">
            <CardContent className="flex h-full flex-col p-7">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-black text-navy/20">0{index + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">{t(`services.${key}.title`)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(`services.${key}.desc`)}</p>
              <Link
                to="/hizmetler/$slug"
                params={{ slug: key }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-coral transition-all hover:gap-2.5"
              >
                Detayları gör <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="pointer-events-none absolute inset-x-8 bottom-0 h-1 rounded-full bg-gradient-to-r from-coral via-gold to-lime opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
