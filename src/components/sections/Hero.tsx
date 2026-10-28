import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CalendarCheck2, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePortalDiscoveryCopy } from "@/components/portal/portal-discovery-copy";

const DISCOVERY_STEPS = ["country", "city", "institution", "program"] as const;

export function Hero() {
  const { t } = useTranslation();
  const discoveryCopy = usePortalDiscoveryCopy();

  return (
    <section className="education-hero relative isolate overflow-hidden bg-[#f6f9fc]">
      <div className="container-prose relative grid items-center gap-12 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-[1.18fr_1fr] lg:gap-16">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2.5 text-sm font-semibold text-teal">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-6 max-w-[15ch] [overflow-wrap:anywhere] text-balance font-display text-[clamp(2.6rem,5vw,4.65rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-navy">
            {t("hero.title")}
          </h1>
          <p className="mt-7 max-w-[58ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="min-h-13 whitespace-normal rounded-xl py-3 bg-navy px-6 text-white shadow-[0_8px_20px_-12px_#12243a] hover:bg-teal"
            >
              <a href="/iletisim#randevu">
                <CalendarCheck2 className="me-2 h-4 w-4" />
                {t("cta.primary")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-13 whitespace-normal rounded-xl py-3 border-navy/20 bg-transparent px-6 text-navy hover:border-teal hover:bg-white"
            >
              <Link to="/quiz">
                <ClipboardCheck className="me-2 h-4 w-4 text-teal" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>
          <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted-foreground">
            {t("brand.tagline")}
          </p>
        </div>

        <div className="education-atlas relative mx-auto w-full max-w-[32rem]">
          <div className="education-atlas-globe relative aspect-square" aria-hidden="true">
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
          <div className="relative -mt-12 rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_20px_60px_-35px_#12243a70] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-teal">{t("brand.name")}</p>
                <h2 className="mt-1.5 max-w-[28ch] font-display text-xl font-semibold leading-snug text-navy">
                  {discoveryCopy.title}
                </h2>
              </div>
            </div>
            <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-4">
              {DISCOVERY_STEPS.map((key, index) => (
                <li key={key} className="min-w-0 text-xs leading-relaxed text-muted-foreground">
                  <span className="me-1.5 font-semibold text-teal">{index + 1}.</span>
                  {discoveryCopy[key]}
                </li>
              ))}
            </ol>
            <Link
              to="/portal"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {t("nav.portal")}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 rtl:-rotate-90" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
