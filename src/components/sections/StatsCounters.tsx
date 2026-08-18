import { useTranslation } from "react-i18next";
import { ShieldCheck, Route, FileSearch, MessagesSquare } from "lucide-react";

const ICONS = [ShieldCheck, Route, FileSearch, MessagesSquare];

type Item = { value: string; label: string };

export function StatsCounters() {
  const { t, i18n } = useTranslation();
  const items: Item[] =
    i18n.resolvedLanguage === "tr"
      ? [
          { value: "Etik", label: "Akademik bütünlük" },
          { value: "Kişiye özel", label: "Profil bazlı yol haritası" },
          { value: "Şeffaf", label: "Net kapsam ve takvim" },
          { value: "Uçtan uca", label: "Başvurudan yerleşmeye destek" },
        ]
      : [
          { value: "Ethical", label: "Academic integrity" },
          { value: "Tailored", label: "Profile-based roadmap" },
          { value: "Transparent", label: "Clear scope and timeline" },
          { value: "End to end", label: "Application-to-arrival support" },
        ];

  return (
    <section className="container-prose py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
          {t("statsSection.standardTitle", { defaultValue: "The CliniGA working standard" })}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("statsSection.standardSubtitle", {
            defaultValue:
              "Transparent scope, academic integrity and tailored planning instead of inflated promises.",
          })}
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-7 text-center shadow-card"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal/10 blur-2xl" />
              <span className="relative mx-auto mb-3 grid h-11 w-11 place-items-center rounded-lg bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <p className="font-display text-4xl font-semibold tracking-tight text-navy">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
