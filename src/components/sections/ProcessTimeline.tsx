import { useTranslation } from "react-i18next";

export function ProcessTimeline() {
  const { t } = useTranslation();
  const steps = t("process.steps", { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            {t("nav.process")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
            {t("process.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("process.subtitle")}</p>
        </div>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-5">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {steps.map((step, idx) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-border bg-background p-6 shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-gold font-display text-lg font-semibold text-gold-foreground">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-base font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
