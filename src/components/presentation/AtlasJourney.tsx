import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Check,
  Compass,
  FileCheck2,
  MessagesSquare,
  Route,
  ChartNoAxesCombined,
} from "lucide-react";
import { journeyProgress, journeyStep, usePresentationMotion } from "@/lib/presentation-motion";
import { presentationCopy } from "@/components/sections/presentation-copy";
import { atlasCopy } from "./atlas-copy";

const ICONS = [MessagesSquare, ChartNoAxesCombined, Route, FileCheck2, Compass];
const POINTS = [
  [45, 210],
  [120, 145],
  [200, 185],
  [290, 105],
  [365, 60],
];
const PIN_QUERY = "(min-width: 1000px) and (min-height: 740px)";

export function AtlasJourney() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || "tr";
  const copy = presentationCopy(language);
  const atlas = atlasCopy(language);
  const steps = t("process.steps", { returnObjects: true }) as { title: string; desc: string }[];
  const { paused } = usePresentationMotion();
  const scene = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = scene.current;
    if (!element || paused) return;
    const media = window.matchMedia(PIN_QUERY);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      setActive(
        journeyStep(journeyProgress(rect.top, rect.height, window.innerHeight), steps.length),
      );
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

  const choose = (index: number) => {
    setActive(index);
    const element = scene.current;
    if (!element || paused || !window.matchMedia(PIN_QUERY).matches) return;
    const rect = element.getBoundingClientRect();
    const target =
      window.scrollY +
      rect.top -
      76 +
      (rect.height - window.innerHeight) * ((index + 0.5) / steps.length);
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };
  const CurrentIcon = ICONS[active % ICONS.length];

  return (
    <section
      id="education-journey"
      ref={scene}
      className="atlas-journey"
      data-motion={paused ? "paused" : "active"}
      aria-labelledby="atlas-journey-title"
    >
      <div className="atlas-journey-sticky">
        <div className="container-prose atlas-journey-layout">
          <div className="atlas-journey-intro">
            <p className="atlas-section-label">{t("process.title")}</p>
            <h2 id="atlas-journey-title">{copy.journey}</h2>
            <p>{t("process.subtitle")}</p>
            <ol className="atlas-step-list" aria-label={t("process.title")}>
              {steps.map((step, index) => (
                <li key={step.title} data-active={index === active}>
                  <button
                    type="button"
                    onClick={() => choose(index)}
                    aria-current={index === active ? "step" : undefined}
                  >
                    <span className="atlas-step-marker" aria-hidden="true">
                      {index < active ? <Check /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="atlas-step-title">{step.title}</span>
                      <span className="atlas-step-desc">{step.desc}</span>
                    </span>
                    <ArrowUpRight className="atlas-step-arrow rtl:-rotate-90" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="atlas-plan-column">
            <div
              className="atlas-plan-sheet"
              style={
                { "--plan-progress": active / Math.max(1, steps.length - 1) } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="atlas-plan-header">
                <span>CliniGA Education</span>
                <Compass />
              </div>
              <p className="atlas-plan-label">{atlas.roadmap}</p>
              <svg className="atlas-plan-map" viewBox="0 0 420 280" fill="none">
                <path
                  className="atlas-map-base"
                  d="M45 210C70 210 80 145 120 145S160 185 200 185 245 105 290 105 330 60 365 60"
                />
                <path
                  className="atlas-map-progress"
                  pathLength="1"
                  d="M45 210C70 210 80 145 120 145S160 185 200 185 245 105 290 105 330 60 365 60"
                />
                {POINTS.map(([cx, cy], index) => (
                  <g key={index} data-reached={index <= active} className="atlas-map-point">
                    <circle cx={cx} cy={cy} r={index === active ? 19 : 13} />
                    <text x={cx} y={cy + 4} textAnchor="middle">
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="atlas-plan-current">
                <span>
                  <CurrentIcon />
                </span>
                <div>
                  <p>
                    {copy.chapter} {String(active + 1).padStart(2, "0")}
                  </p>
                  <h3>{steps[active].title}</h3>
                </div>
              </div>
              <p className="atlas-plan-description">{steps[active].desc}</p>
              <div className="atlas-plan-footer">
                <span>{t("hero.eyebrow")}</span>
                <span>CliniGA</span>
              </div>
            </div>
            <a href="/iletisim#randevu" className="atlas-journey-cta">
              {t("cta.primary")}
              <ArrowUpRight className="rtl:-rotate-90" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
