import { useTranslation } from "react-i18next";

export function ProcessTimeline() {
  const { t } = useTranslation();
  const steps = t("process.steps", { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <section className="border-y border-navy/10 bg-[#edf4f6] py-20 md:py-24">
      <div className="container-prose">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-teal">{t("nav.process")}</p>
          <h2 className="education-section-heading mt-3">{t("process.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("process.subtitle")}</p>
        </div>

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <span aria-hidden className="pointer-events-none absolute hidden" />
          {steps.map((step, idx) => (
            <li key={step.title} className="relative border-t-2 border-teal/30 pt-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-white">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-base font-semibold text-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
