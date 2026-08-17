import { useTranslation } from "react-i18next";
import { Quote, Star } from "lucide-react";

type Item = {
  name: string;
  program: string;
  country: string;
  quote: string;
};

export function Testimonials() {
  const { t } = useTranslation();
  const items = t("testimonials.items", { returnObjects: true }) as Item[];

  return (
    <section className="bg-muted/40 py-20 md:py-24">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Referanslar
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <figure
              key={it.name}
              className="relative flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-shadow hover:shadow-premium"
            >
              <Quote className="absolute right-5 top-5 h-6 w-6 text-teal/20" />
              <div className="mb-3 flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/85">
                &ldquo;{it.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-border/60 pt-4">
                <p className="font-display text-sm font-semibold text-navy">
                  {it.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {it.program} · {it.country}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
