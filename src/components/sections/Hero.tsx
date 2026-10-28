import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, CalendarCheck2, ClipboardCheck, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePortalDiscoveryCopy } from "@/components/portal/portal-discovery-copy";
import { usePresentationMotion } from "@/lib/presentation-motion";
import { presentationCopy } from "./presentation-copy";
import { SITE } from "@/data/site";

const DISCOVERY_STEPS = ["country", "city", "institution", "program"] as const;

export function Hero() {
  const { t, i18n } = useTranslation();
  const discoveryCopy = usePortalDiscoveryCopy();
  const copy = presentationCopy(i18n.resolvedLanguage || "tr");
  const { paused, reduced, toggle } = usePresentationMotion();
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element || paused) {
      element?.style.removeProperty("--hero-shift");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        element.style.setProperty("--hero-shift", `${Math.max(0, -bounds.top) * 0.16}px`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [paused]);

  return (
    <section
      ref={section}
      className="education-hero cinema-hero"
      data-motion={paused ? "paused" : "active"}
    >
      <div className="cinema-stars" aria-hidden="true" />
      <div className="container-prose cinema-hero-layout">
        <div className="cinema-hero-copy">
          <p className="cinema-eyebrow">
            <span aria-hidden="true" />
            {SITE.brand} · {t("hero.eyebrow")}
          </p>
          <h1 className="cinema-title">
            <span>{copy.headline[0]}</span>
            <span className="cinema-title-accent">{copy.headline[1]}</span>
          </h1>
          <p className="cinema-hero-subject">{t("hero.title")}</p>
          <p className="cinema-hero-description">{t("hero.subtitle")}</p>
          <div className="cinema-hero-actions">
            <Button asChild size="lg" className="cinema-primary">
              <a href="/iletisim#randevu">
                <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                {t("cta.primary")}
                <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="cinema-secondary">
              <Link to="/quiz">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>
          <p className="cinema-cta-note">{t("hero.ctaNote")}</p>
        </div>
        <div className="education-atlas cinema-atlas">
          <div className="cinema-atlas-aura" aria-hidden="true" />
          <div className="cinema-orbital cinema-orbital-one" aria-hidden="true" />
          <div className="cinema-orbital cinema-orbital-two" aria-hidden="true" />
          <div className="education-atlas-globe cinema-globe" aria-hidden="true">
            <svg viewBox="0 0 520 520" fill="none" className="h-full w-full">
              <defs>
                <radialGradient id="education-ocean" cx="0.3" cy="0.24" r="0.85">
                  <stop stopColor="#238e9a" />
                  <stop offset=".6" stopColor="#176077" />
                  <stop offset="1" stopColor="#12243a" />
                </radialGradient>
                <clipPath id="education-globe-clip">
                  <circle cx="260" cy="246" r="190" />
                </clipPath>
                <linearGradient
                  id="education-land"
                  x1="160"
                  y1="80"
                  x2="380"
                  y2="420"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#c6e7d1" />
                  <stop offset="1" stopColor="#69a8a4" />
                </linearGradient>
              </defs>
              <circle cx="260" cy="246" r="215" stroke="#d5e2ec" />
              <circle cx="260" cy="246" r="234" stroke="#d5e2ec" strokeDasharray="2 10" />
              <circle cx="260" cy="246" r="190" fill="url(#education-ocean)" />
              <g clipPath="url(#education-globe-clip)">
                <g stroke="white" strokeOpacity=".15">
                  <ellipse cx="260" cy="246" rx="82" ry="190" />
                  <ellipse cx="260" cy="246" rx="151" ry="190" />
                  <ellipse cx="260" cy="246" rx="190" ry="57" />
                  <ellipse cx="260" cy="246" rx="190" ry="132" />
                  <path d="M70 246h380M260 56v380" />
                </g>
                <g fill="url(#education-land)">
                  <path d="m84 164 34-43 44-18 44 10 17 24-15 20-32-2-6 25-23 9-3 29-25 11-16-35z" />
                  <path d="m151 245 26 7 24 35-4 36-20 34-11 37-18-28 4-42-13-34z" />
                  <path d="m230 132 18-15 22 8 8 22-17 17-19-8-4 20-19-5 3-22z" />
                  <path d="m258 188 32-4 36 25 12 36-17 47-31 35-11-15-4-42-21-25-14-30z" />
                  <path d="m288 123 35-28 57 9 52 45 12 54-26 9-33-23-17 27-28-19-12-31-30 10-19-22z" />
                  <path d="m346 230 16 8 7 26-12 21-13-27zM374 306l34-10 24 19-2 29-24 5-32-17z" />
                </g>
                <path
                  d="M146 179Q251 66 340 192"
                  stroke="#eebc64"
                  strokeWidth="2"
                  strokeDasharray="6 7"
                />
                <path
                  d="M260 157Q355 183 404 319"
                  stroke="#eebc64"
                  strokeOpacity=".8"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                />
                {[
                  [146, 179],
                  [260, 157],
                  [340, 192],
                  [404, 319],
                ].map(([cx, cy]) => (
                  <g key={`${cx}-${cy}`}>
                    <circle cx={cx} cy={cy} r="11" fill="#eebc64" fillOpacity=".2" />
                    <circle cx={cx} cy={cy} r="4" fill="#eebc64" stroke="#12243a" strokeWidth="2" />
                  </g>
                ))}
              </g>
              <path
                d="M47 326c33 43 139 61 263 22 118-38 193-93 166-125"
                stroke="#eebc64"
                strokeWidth="2"
              />
              <circle cx="80" cy="349" r="5" fill="#3d6ef5" />
              <circle cx="466" cy="254" r="6" fill="#eebc64" />
            </svg>
          </div>
          <div className="cinema-coordinate" aria-hidden="true">
            <span />
            CLINIGA / EDUCATION
          </div>
          <Link to="/portal" className="cinema-discovery-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="cinema-card-eyebrow">{t("nav.portal")}</p>
                <h2>{discoveryCopy.title}</h2>
              </div>
              <span className="cinema-card-arrow">
                <ArrowUpRight className="h-5 w-5 rtl:-rotate-90" aria-hidden="true" />
              </span>
            </div>
            <ol>
              {DISCOVERY_STEPS.map((key, index) => (
                <li key={key}>
                  <span aria-hidden="true">0{index + 1}</span>
                  {discoveryCopy[key]}
                </li>
              ))}
            </ol>
          </Link>
        </div>
        <div className="cinema-hero-footer">
          <a href="#education-journey" className="cinema-scroll-link">
            <span className="cinema-scroll-icon" aria-hidden="true">
              <ArrowDown className="h-4 w-4" />
            </span>
            {copy.scroll}
          </a>
          <button
            type="button"
            className="cinema-motion-control"
            onClick={toggle}
            disabled={reduced}
            aria-pressed={paused}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {reduced ? copy.reduced : paused ? copy.play : copy.pause}
          </button>
        </div>
      </div>
    </section>
  );
}
