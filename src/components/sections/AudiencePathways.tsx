import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  GraduationCap,
  Plane,
} from "lucide-react";

const PATHWAYS = [
  {
    icon: Plane,
    intent: "abroad",
    tr: {
      eyebrow: "Lisans & master",
      title: "Yurt dışında eğitim",
      description:
        "Ülke ve program seçimi, başvuru takvimi, SOP, burs ve vize adımlarını tek stratejide birleştirin.",
    },
    en: {
      eyebrow: "Bachelor's & master's",
      title: "Study abroad",
      description:
        "Unify country and program selection, applications, SOP, funding and visa steps in one strategy.",
    },
  },
  {
    icon: GraduationCap,
    intent: "career",
    tr: {
      eyebrow: "Doktora & akademi",
      title: "Akademik kariyer",
      description:
        "Araştırma önerisi, danışman eşleştirme, akademik CV ve mülakat hazırlığını güçlü bir dosyaya dönüştürün.",
    },
    en: {
      eyebrow: "PhD & academia",
      title: "Academic career",
      description:
        "Turn your proposal, supervisor outreach, academic CV and interview preparation into a coherent application.",
    },
  },
  {
    icon: ChartNoAxesCombined,
    intent: "stats",
    tr: {
      eyebrow: "Tez & araştırma",
      title: "Metodoloji ve istatistik",
      description:
        "Araştırma sorusundan SPSS, R, Python ve AMOS analizine kadar savunulabilir bir yöntem planı kurun.",
    },
    en: {
      eyebrow: "Thesis & research",
      title: "Methods and statistics",
      description:
        "Build a defensible methods plan from research question to SPSS, R, Python and AMOS analysis.",
    },
  },
  {
    icon: BookOpenCheck,
    intent: "university",
    tr: {
      eyebrow: "Vize & belgeler",
      title: "Dosya güveni",
      description:
        "Vize, oturum, motivasyon mektubu ve akademik belgelerinizi tutarlı, eksiksiz ve zamanında hazırlayın.",
    },
    en: {
      eyebrow: "Visa & documents",
      title: "Application confidence",
      description:
        "Prepare visa, residence, motivation and academic documents consistently, completely and on time.",
    },
  },
] as const;

export function AudiencePathways() {
  const { i18n } = useTranslation();
  const isTurkish = i18n.resolvedLanguage === "tr";

  return (
    <section id="hizmet-secimi" className="container-prose py-20 md:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          {isTurkish ? "İhtiyacına göre başla" : "Start with your goal"}
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-navy md:text-5xl">
          {isTurkish ? "Hangi yolculuk için buradasınız?" : "Which journey brings you here?"}
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {isTurkish
            ? "Genel bir paket yerine hedefinize göre doğru uzmanlık alanına ve ilk adıma yönlenin."
            : "Move to the right expertise and first step for your goal instead of a generic package."}
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PATHWAYS.map(({ icon: Icon, intent, tr, en }, index) => {
          const copy = isTurkish ? tr : en;
          return (
            <Link
              key={intent}
              to="/iletisim"
              search={{ intent }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-premium md:p-7"
            >
              <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-semibold text-navy/[0.035]">
                0{index + 1}
              </span>
              <div className="relative flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-white transition-colors group-hover:bg-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                    {copy.eyebrow}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-navy">
                    {copy.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {copy.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                    {isTurkish ? "Ücretsiz ön değerlendirme" : "Free discovery call"}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
