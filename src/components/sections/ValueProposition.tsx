import { useTranslation } from "react-i18next";
import { GraduationCap, PenLine, BarChart3, ShieldCheck, LifeBuoy } from "lucide-react";

const ICONS = [GraduationCap, PenLine, BarChart3, ShieldCheck, LifeBuoy];
type Item = { title: string; desc: string };

export function ValueProposition() {
  const { t } = useTranslation();
  const items = t("valueProposition.items", { returnObjects: true }) as Item[];
  return (
    <section className="border-y border-navy/10 bg-white py-20 md:py-24">
      <div className="container-prose grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold text-teal">{t("brand.name")}</p>
          <h2 className="education-section-heading mt-3">{t("valueProposition.title")}</h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
            {t("valueProposition.subtitle")}
          </p>
        </div>
        <div className="divide-y divide-border">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? GraduationCap;
            return (
              <article key={item.title} className="flex gap-5 py-6 first:pt-0 last:pb-0">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e5f1f1] text-teal">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">{item.title}</h3>
                  <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
