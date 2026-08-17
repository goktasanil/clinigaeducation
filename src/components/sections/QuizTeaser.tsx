import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QuizTeaser() {
  const { t } = useTranslation();
  return (
    <section className="container-prose py-20">
      <div className="relative overflow-hidden rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 via-background to-gold/5 p-10 md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal">
              <Compass className="h-3.5 w-3.5" />
              Lead Magnet · Ücretsiz Test
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
              Sana hangi danışmanlık uygun?
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Yurt dışı eğitim, tez, istatistik, akademik yayın, KPSS, kariyer planlama ve mentörlük — 1 dakikada ihtiyacına en uygun hizmeti bul.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2 md:items-end">
            <Button
              asChild
              size="lg"
              className="h-12 bg-teal px-7 text-teal-foreground hover:bg-teal/90"
            >
              <Link to="/quiz">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t("quizTeaser.cta")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground md:text-right">
              6 soru · ~1 dakika · kişiselleştirilmiş rapor
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
