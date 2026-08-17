import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  PenLine,
  BarChart3,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";

const ICONS = [GraduationCap, PenLine, BarChart3, ShieldCheck, LifeBuoy];

type Item = { title: string; desc: string };

export function ValueProposition() {
  const { t } = useTranslation();
  const items = t("valueProposition.items", { returnObjects: true }) as Item[];

  return (
    <section className="bg-muted/40 py-20 md:py-24">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            {t("brand.name")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
            {t("valueProposition.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("valueProposition.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? GraduationCap;
            return (
              <div
                key={item.title}
                className="group rounded-xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-premium"
              >
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-teal-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
