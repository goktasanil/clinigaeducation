import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  CalendarCheck2,
  Clock3,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import educationLogo from "@/assets/cliniga-education-logo.webp";

export function Hero() {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.resolvedLanguage === "tr";
  const trustPoints = isTurkish
    ? ["Şablon değil strateji", "Etik akademik destek", "Şeffaf teslimatlar"]
    : ["Strategy, not templates", "Ethical academic support", "Transparent deliverables"];
  const consultationPoints = isTurkish
    ? ["Hedef ve profil analizi", "Uygun hizmet eşleştirmesi", "Net sonraki adımlar"]
    : ["Goal and profile review", "Right-fit service matching", "Clear next steps"];

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
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-pink/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-blue/35 blur-3xl" />
      <div className="pointer-events-none absolute -left-52 top-10 h-[32rem] w-[32rem] rounded-full border border-brand-silver/20" />
      <div className="pointer-events-none absolute -left-44 top-18 h-[29rem] w-[29rem] rounded-full border-2 border-brand-blue/20" />
      <div className="pointer-events-none absolute -right-44 bottom-[-19rem] h-[38rem] w-[38rem] rounded-full border border-brand-pink/25" />
      <div className="pointer-events-none absolute -right-36 bottom-[-17rem] h-[34rem] w-[34rem] rounded-full border-2 border-white/10" />

      <div className="container-prose relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold">
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.eyebrow")}
          </div>

          <h1 className="brand-wordmark-gradient mt-6 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-brand-pink via-brand-pink to-brand-silver" />

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
              className="h-12 w-full gradient-gold px-6 text-gold-foreground shadow-[0_14px_36px_-14px_rgb(229_30_103_/_80%)] hover:brightness-105 sm:w-auto"
            >
              <a href="/iletisim#randevu">
                <CalendarCheck2 className="mr-2 h-4 w-4" />
                {t("cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full border-white/30 bg-white/5 px-6 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground sm:w-auto"
            >
              <Link to="/quiz">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-foreground/70">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-pink" /> {point}
              </span>
            ))}
          </div>

          <Link
            to="/portal"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            {isTurkish ? "Global Öğrenci Portalını keşfet" : "Explore the Global Student Portal"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="lg:col-span-5 lg:pl-4">
          <div className="brand-glass relative overflow-hidden rounded-3xl p-5 md:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-brand-pink/30" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-brand-silver/25" />
            <div className="relative mb-5 overflow-hidden rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-brand-silver/25">
              <div className="pointer-events-none absolute -left-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full border-2 border-brand-pink/10" />
              <img
                src={educationLogo}
                alt="CliniGA Education logosu"
                className="relative mx-auto h-20 w-full object-contain"
                width={800}
                height={328}
                fetchPriority="high"
              />
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {isTurkish ? "15 dakikalık ön değerlendirme" : "15-minute discovery call"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {isTurkish
                    ? "Hedefini birlikte netleştirelim"
                    : "Clarify your next move with an expert"}
                </h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-gold text-gold-foreground shadow-[0_10px_28px_-12px_rgb(229_30_103_/_80%)]">
                <CalendarCheck2 className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {consultationPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 text-brand-pink" />
                  <span className="text-sm font-medium text-white/85">{point}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-blue/25 bg-brand-blue/20 px-4 py-3 text-sm">
              <Clock3 className="h-4 w-4 shrink-0 text-brand-pink" />
              <span className="text-white/75">
                {isTurkish ? "Pazartesi–Cumartesi · 08:00–18:00" : "Monday–Saturday · 08:00–18:00"}
              </span>
            </div>
            <Button asChild className="mt-5 h-11 w-full bg-white text-navy hover:bg-white/90">
              <a href="/iletisim#randevu">
                {isTurkish ? "Uygun saati seç" : "Choose a time"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
