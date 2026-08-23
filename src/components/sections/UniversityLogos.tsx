import { useTranslation } from "react-i18next";

const UNIVERSITIES = [
  "Sapienza · Roma",
  "Bologna",
  "Politecnico Milano",
  "TU Munich",
  "LMU München",
  "Sorbonne · Paris",
  "KU Leuven",
  "ETH Zürich",
  "Delft TU",
  "Uppsala",
  "Trinity Dublin",
  "UCL London",
];

export function UniversityLogos() {
  const { t } = useTranslation();
  const researchTitle = t("trust.researchTitle", {
    defaultValue: "Institutions frequently explored during program comparison",
  });
  return (
    <section className="border-y border-border/60 bg-background py-12">
      <div className="container-prose">
        <p className="mb-7 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {researchTitle}
        </p>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          role="list"
          aria-label={researchTitle}
        >
          {UNIVERSITIES.map((name) => (
            <div
              key={name}
              role="listitem"
              className="flex min-h-16 items-center justify-center rounded-lg border border-border/60 bg-card px-3 py-3 text-center transition-colors hover:border-navy/20 hover:bg-muted/50"
            >
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/65 sm:text-xs">
                {name}
              </span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground/80">
          {t("trust.disclaimer", {
            defaultValue:
              "Institution names are shown only as program-research examples and do not imply an official partnership with or representation by CliniGA Education.",
          })}
        </p>
      </div>
    </section>
  );
}
