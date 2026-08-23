import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Mail,
  Sparkles,
  ClipboardCheck,
  SearchCheck,
  Route,
  FileCheck2,
  PlaneTakeoff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildConsultationEmailLink } from "@/data/site";
import { CLINIGA_LOGO_COVER } from "@/assets/cliniga-logo-cover";

type ProcessStep = { title: string; desc: string };

export function Hero() {
  const { t } = useTranslation();

  const process = t("process.steps", { returnObjects: true }) as ProcessStep[];
  const stages = [
    { icon: SearchCheck, title: process[1]?.title },
    { icon: Route, title: process[2]?.title },
    { icon: FileCheck2, title: process[3]?.title },
    { icon: PlaneTakeoff, title: process[4]?.title },
  ];

  return (
    <section className="relative overflow-hidden gradient-navy text-navy-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-teal/25 blur-3xl" />

      <div className="container-prose relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold">
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.eyebrow")}
          </div>

          <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-navy-foreground/80 sm:text-lg">
            {t("hero.professionalSubtitle", {
              defaultValue:
                "Evidence-based, end-to-end academic strategy tailored to your bachelor’s, master’s, PhD or thesis journey.",
            })}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-gold px-6 text-gold-foreground hover:bg-gold/90 sm:w-auto"
            >
              <a href={buildConsultationEmailLink()}>
                <Mail className="mr-2 h-4 w-4" />
                {t("cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full border-white/30 bg-white/5 px-6 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground sm:w-auto"
            >
              <Link to="/portal">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Global Öğrenci Portalı
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-navy-foreground/60">
            {t("hero.ctaNote", {
              defaultValue: "Ön görüşme ücretsizdir; kapsam ve uygunluk birlikte değerlendirilir.",
            })}
          </p>
        </div>

        <div className="lg:col-span-5 lg:pl-4">
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur md:p-7">
            <div className="mb-5 overflow-hidden rounded-2xl bg-white p-3 shadow-lg ring-1 ring-white/70">
              <img
                src={CLINIGA_LOGO_COVER}
                alt="CliniGA Clinical Research logosu"
                className="mx-auto h-auto w-full object-contain"
                width={893}
                height={360}
                fetchPriority="high"
              />
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {t("process.title")}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {t("hero.journeyTitle", {
                    defaultValue: "Başvurudan yerleşmeye net bir yol haritası",
                  })}
                </h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground">
                <Route className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {stages.map(({ icon: Icon, title }, index) => (
                <div
                  key={`${title}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="h-5 w-5 text-teal" />
                    <span className="text-[10px] font-semibold text-white/35">0{index + 1}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-teal/15 px-4 py-3 text-sm">
              <span className="text-white/70">
                {t("hero.emailSupport", { defaultValue: "Doğrudan uzman ekibe ulaşın" })}
              </span>
              <span className="font-semibold text-gold">
                {t("hero.emailChannel", { defaultValue: "E-posta" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
