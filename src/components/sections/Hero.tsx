import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  MessageCircle,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/data/site";

export function Hero() {
  const { t } = useTranslation();

  const goals = [
    { icon: PlaneTakeoff, label: t("services.education.title") },
    { icon: FileText, label: t("services.documents.title") },
    { icon: GraduationCap, label: t("services.thesis.title") },
  ];

  return (
    <section className="youth-hero relative overflow-hidden">
      <div className="youth-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-coral/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-lime/20 blur-3xl" aria-hidden="true" />

      <div className="container-prose relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <div className="inline-flex rotate-[-1deg] items-center gap-2 rounded-full border-2 border-navy/10 bg-white px-4 py-2 text-xs font-bold text-navy shadow-card">
            <Sparkles className="h-4 w-4 text-coral" aria-hidden="true" />
            Rotanı bul. Planını kur. Yola çık.
          </div>

          <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] text-navy sm:text-5xl md:text-6xl">
            Hayalindeki eğitime giden yol{" "}
            <span className="text-gradient-playful">sana özel</span> olsun.
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-navy/75 sm:text-lg">
            Ülke seçiminden kabul ve vizeye, tezden istatistiğe kadar karmaşık adımları
            anlaşılır bir yol haritasına dönüştürüyoruz.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-12 w-full rounded-full bg-coral px-6 text-white shadow-lg shadow-coral/20 hover:bg-coral/90 sm:w-auto">
              <Link to="/quiz">
                <Compass className="mr-2 h-4 w-4" aria-hidden="true" />
                Uygun Hizmeti Bul <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full border-2 border-navy/15 bg-white/80 px-6 text-navy hover:bg-navy hover:text-white sm:w-auto">
              <a
                href={buildWhatsAppLink("Merhaba, eğitim hedefim için yol haritası oluşturmak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                WhatsApp'tan Sor
              </a>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy/65">
            {["Kişiye özel plan", "Etik akademik destek", "Net süreç ve takvim"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-[2rem] border-2 border-navy/10 bg-white/90 p-6 shadow-premium backdrop-blur md:p-8">
            <span className="absolute -right-3 -top-3 rotate-6 rounded-xl bg-lime px-3 py-2 text-xs font-black text-navy shadow-card">
              1 dakikada başla
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Hedefini seç</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy">Şu an hangi aşamadasın?</h2>
            <div className="mt-6 space-y-3">
              {goals.map(({ icon: Icon, label }, index) => (
                <Link
                  key={label}
                  to="/quiz"
                  className="group flex min-h-16 items-center gap-4 rounded-2xl border border-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-navy">{label}</span>
                  <ArrowRight className="h-4 w-4 text-navy/30 group-hover:text-coral" aria-hidden="true" />
                </Link>
              ))}
            </div>
            <Link to="/quiz" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-coral hover:underline">
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Bana uygun rotayı göster
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
