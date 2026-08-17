import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

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
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 2500, stopOnInteraction: false })],
  );

  return (
    <section className="border-y border-border/60 bg-background py-14">
      <div className="container-prose">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {t("trust.title")}
        </p>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-10">
            {[...UNIVERSITIES, ...UNIVERSITIES].map((name, i) => (
              <div
                key={i}
                aria-hidden={i >= UNIVERSITIES.length ? "true" : undefined}
                className="flex min-w-[180px] shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card px-6 py-4 text-center"
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wider text-navy/70">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
