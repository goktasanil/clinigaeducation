import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Award, Sparkles, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openCalendly } from "@/data/site";

export function Hero() {
  const { t } = useTranslation();

  const stats = [
    { value: "1,200+", label: t("hero.stats.applications") },
    { value: "40+", label: t("hero.stats.countries") },
    { value: "10+", label: t("hero.stats.experience") },
    { value: "%98", label: t("hero.stats.satisfaction") },
  ];

  return (
    <section className="relative overflow-hidden gradient-navy text-navy-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-teal/25 blur-3xl" />

      <div className="container-prose relative grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.eyebrow")}
          </motion.div>

          <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-navy-foreground/80 sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              onClick={openCalendly}
              className="h-12 bg-gold px-6 text-gold-foreground hover:bg-gold/90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t("cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-white/5 px-6 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
            >
              <Link to="/quiz">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="md:col-span-4 md:pl-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gold" />
                  <p className="font-display text-2xl font-semibold text-navy-foreground">
                    {s.value}
                  </p>
                </div>
                <p className="mt-1 text-xs text-navy-foreground/65">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
