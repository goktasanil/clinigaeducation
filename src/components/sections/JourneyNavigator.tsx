import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  FileCheck2,
  Search,
} from "lucide-react";

const ROUTES = [
  {
    icon: Search,
    intent: "university",
    tr: { title: "Program ve ülke seçimi", detail: "Profilime uygun seçenekleri karşılaştır" },
    en: { title: "Program and country", detail: "Compare options matched to my profile" },
  },
  {
    icon: FileCheck2,
    intent: "abroad",
    tr: { title: "Başvuru dosyası", detail: "SOP, CV, referans ve takvimimi planla" },
    en: { title: "Application file", detail: "Plan my SOP, CV, references and timeline" },
  },
  {
    icon: BookOpenCheck,
    intent: "visa",
    tr: { title: "Vize ve oturum", detail: "Belge ve randevu sürecimi kontrol et" },
    en: { title: "Visa and residence", detail: "Review my documents and appointment plan" },
  },
  {
    icon: ChartNoAxesCombined,
    intent: "stats",
    tr: { title: "Tez ve istatistik", detail: "Yöntem ve analiz ihtiyacımı belirle" },
    en: { title: "Thesis and statistics", detail: "Define my methodology and analysis needs" },
  },
] as const;

export function JourneyNavigator() {
  const { i18n } = useTranslation();
  const isTurkish = i18n.resolvedLanguage === "tr";

  return (
    <section className="relative z-10 -mt-8 px-4 md:-mt-10" aria-labelledby="journey-navigator-title">
      <div className="container-prose rounded-3xl border border-border/70 bg-card p-4 shadow-premium md:p-6">
        <div className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              {isTurkish ? "Hızlı başlangıç" : "Quick start"}
            </p>
            <h2 id="journey-navigator-title" className="mt-1 font-display text-2xl font-semibold text-navy md:text-3xl">
              {isTurkish ? "Bugün hangi kararı vermeniz gerekiyor?" : "Which decision do you need to make today?"}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {isTurkish
              ? "İhtiyacınızı seçin; ön görüşme formu doğru uzmanlık alanıyla hazırlanmış olarak açılsın."
              : "Choose your need and open a discovery form prepared for the right expertise."}
          </p>
        </div>

        <nav className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4" aria-label={isTurkish ? "Akademik danışmanlık rotaları" : "Academic advisory routes"}>
          {ROUTES.map(({ icon: Icon, intent, tr, en }) => {
            const copy = isTurkish ? tr : en;
            return (
              <a
                key={intent}
                href={`/iletisim?intent=${intent}`}
                className="group flex min-h-[96px] items-center gap-3 rounded-2xl border border-transparent bg-muted/45 p-4 transition duration-200 hover:border-brand-pink/25 hover:bg-background hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-white transition-colors group-hover:bg-brand-pink">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold text-navy">{copy.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{copy.detail}</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-brand-pink transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <span>{isTurkish ? "Profil" : "Profile"}</span>
          <ArrowRight className="h-3 w-3 text-brand-pink" aria-hidden="true" />
          <span>{isTurkish ? "Strateji" : "Strategy"}</span>
          <ArrowRight className="h-3 w-3 text-brand-pink" aria-hidden="true" />
          <span>{isTurkish ? "Belge planı" : "Document plan"}</span>
          <ArrowRight className="h-3 w-3 text-brand-pink" aria-hidden="true" />
          <span>{isTurkish ? "Başvuru takibi" : "Application tracking"}</span>
        </div>
      </div>
    </section>
  );
}
