import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  Compass,
  FileCheck2,
  MessagesSquare,
  Route,
} from "lucide-react";

import { journeyProgress, journeyStep, usePresentationMotion } from "@/lib/presentation-motion";
import { presentationCopy } from "./presentation-copy";

const ICONS = [MessagesSquare, ChartNoAxesCombined, Route, FileCheck2, Compass];

export function ProcessTimeline() {
  const { t, i18n } = useTranslation();
  const steps = t("process.steps", { returnObjects: true }) as { title: string; desc: string }[];
  const copy = presentationCopy(i18n.resolvedLanguage || "tr");
  const { paused } = usePresentationMotion();
  const scene = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = scene.current;
    if (!element || paused) return;
    const media = window.matchMedia("(min-width: 900px) and (min-height: 800px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = journeyProgress(rect.top, rect.height, window.innerHeight);
      element.style.setProperty("--journey-progress", String(progress));
      element.style.setProperty("--journey-angle", `${progress * 145}deg`);
      setActive(journeyStep(progress, steps.length));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, [paused, steps.length]);

  return (
    <section
      id="education-journey"
      ref={scene}
      className="process-cinema"
      data-motion={paused ? "paused" : "active"}
      aria-labelledby="process-cinema-title"
    >
      <div className="process-cinema-sticky">
        <div className="container-prose process-cinema-layout">
          <div className="process-cinema-heading">
            <p className="cinema-eyebrow">
              <span aria-hidden="true" />
              {t("process.title")}
            </p>
            <h2 id="process-cinema-title">{copy.journey}</h2>
            <p className="process-cinema-subtitle">{t("process.subtitle")}</p>
            <div className="journey-sculpture" aria-hidden="true">
              <div className="journey-sculpture-ring journey-sculpture-ring-a" />
              <div className="journey-sculpture-ring journey-sculpture-ring-b" />
              <div className="journey-sculpture-ring journey-sculpture-ring-c" />
              <div className="journey-sculpture-core">
                <span>{String(active + 1).padStart(2, "0")}</span>
                <small>/ {String(steps.length).padStart(2, "0")}</small>
              </div>
              <span className="journey-sculpture-dot" />
            </div>
            <a href="/iletisim#randevu" className="process-cinema-link">
              {t("cta.primary")}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" aria-hidden="true" />
            </a>
          </div>
          <ol className="cinema-step-list" aria-label={t("process.title")}>
            {steps.map((step, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <li key={index} className="cinema-step" data-active={active === index}>
                  <button
                    type="button"
                    className="cinema-step-button"
                    aria-current={active === index ? "step" : undefined}
                    onClick={() => setActive(index)}
                  >
                    <span className="cinema-step-number" aria-hidden="true">
                      {index < active ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="cinema-step-text">
                      <span className="cinema-step-label">
                        {copy.chapter} {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="cinema-step-title">{step.title}</span>
                      <span className="cinema-step-description">{step.desc}</span>
                    </span>
                    <Icon className="cinema-step-icon" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="cinema-journey-track" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
