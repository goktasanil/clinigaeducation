import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  HeartPulse,
  Home,
  MapPinned,
  ShieldCheck,
  TrainFront,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEuropeanCityGuide } from "@/data/european-city-guides";

const searchSchema = z.object({
  city: z.string().trim().max(100).optional().default(""),
  country: z.string().trim().max(100).optional().default(""),
});

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr") + part.slice(1))
    .join(" ");
}

const guideSteps = [
  {
    icon: Building2,
    title: "Üniversite ve gerçek program",
    description:
      "Kurumun resmî alan adını, program düzeyini, eğitim dilini, son tarihi ve harcı aynı dönem için doğrula.",
    tone: "border-sky-200 bg-sky-50 text-sky-900",
  },
  {
    icon: ShieldCheck,
    title: "Vize ve oturum",
    description:
      "Vatandaşlık, eğitim süresi ve ülkeye göre izin türünü belirle; konsolosluk ve göç idaresini son kaynak kabul et.",
    tone: "border-violet-200 bg-violet-50 text-violet-900",
  },
  {
    icon: FileCheck2,
    title: "Belge, tercüme ve kayıt",
    description:
      "Apostil, noter ve tercüme işlemine başlamadan önce belgeyi isteyen kurumun formatını yazılı teyit et.",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    icon: Home,
    title: "Ev, yurt ve depozito",
    description:
      "Sözleşme tarafı, toplam ücret, depozito iadesi, adres ve ödeme alıcısını birlikte kontrol et.",
    tone: "border-rose-200 bg-rose-50 text-rose-900",
  },
  {
    icon: Banknote,
    title: "Banka ve yerel numaralar",
    description:
      "Adres kaydı, vergi/kimlik numarası, öğrenci hesabı ve ilk transfer sırasını yerel resmî kaynaktan öğren.",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-900",
  },
  {
    icon: HeartPulse,
    title: "Sağlık ve sigorta",
    description:
      "Vize, üniversite kaydı ve oturum için gereken kapsamların aynı olup olmadığını kontrol et.",
    tone: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
  },
  {
    icon: TrainFront,
    title: "Ulaşım ve öğrenci kartı",
    description:
      "Üniversite ulaşım indirimi, aylık abonman, havalimanı bağlantısı ve gece ulaşımını karşılaştır.",
    tone: "border-lime-200 bg-lime-50 text-lime-900",
  },
  {
    icon: BriefcaseBusiness,
    title: "İş, staj ve topluluk",
    description:
      "Çalışma hakkını doğrula; üniversite kariyer merkezi, EURES ve doğrulanmış şehir topluluklarını kullan.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
] as const;

export const Route = createFileRoute("/sehir-rehberleri_/$slug")({
  validateSearch: searchSchema,
  head: ({ params }) => {
    const curated = getEuropeanCityGuide(params.slug);
    const city = curated?.city || titleFromSlug(params.slug);
    const country = curated?.country || "Avrupa";
    const url = `https://www.clinigaeducation.com/sehir-rehberleri/${params.slug}`;
    const description = `${city}, ${country} için üniversite, vize/oturum, barınma, banka, sağlık, ulaşım, iş ve öğrenci yaşamı kontrol rehberi.`;
    return {
      meta: [
        { title: `${city} Öğrenci Rehberi 2026 | CliniGA Education` },
        { name: "description", content: description },
        { name: "robots", content: curated ? "index, follow" : "noindex, follow" },
        { property: "og:title", content: `${city} Öğrenci Rehberi 2026` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CityGuidePage,
});

function CityGuidePage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const curated = getEuropeanCityGuide(slug);
  const city = curated?.city || search.city || titleFromSlug(slug);
  const country = curated?.country || search.country || "Avrupa";

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 text-white md:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <div className="container-prose relative">
          <Link
            to="/sehir-rehberleri"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Tüm şehir rehberleri
          </Link>
          <Badge className="mt-7 block w-fit border-white/15 bg-white/10 text-white hover:bg-white/10">
            <MapPinned className="mr-1.5 inline h-3.5 w-3.5 text-gold" />
            {country} · Öğrenci şehir rehberi
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-semibold md:text-6xl">{city}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/75">
            Üniversite ve gerçek programdan vize/oturuma, evden bankaya, sağlıktan iş ve staja kadar{" "}
            {city} için kafa karışıklığını azaltan 8 adımlı kontrol planı.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/portal">
                {city} kurumlarını bul <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#kontrol-listesi">Kontrol listesini aç</a>
            </Button>
          </div>
        </div>
      </section>

      <main className="container-prose py-14 md:py-20">
        <section id="kontrol-listesi" className="scroll-mt-24" aria-labelledby="kontrol-basligi">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Başlamadan önce
          </p>
          <h2
            id="kontrol-basligi"
            className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl"
          >
            {city} için öğrenci yerleşim kontrolü
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Tutarlar ve işlem süreleri hızla değiştiği için sabit rakam vermiyoruz. Her adımda
            ilgili resmî kurumun güncel sayfasını kontrol et; portalda kaydettiğin program ve
            şehirle süreci tek panelden izle.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {guideSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className={`rounded-[1.75rem] border p-6 ${step.tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold opacity-60">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-80">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal to-navy p-7 text-white md:p-10">
          <ShieldCheck className="h-7 w-7 text-gold" />
          <h2 className="mt-4 font-display text-3xl font-semibold">
            Güncel bilgiyi nereden doğrulamalısın?
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              ["Üniversitenin resmî program ve başvuru sayfası", "Kabul, dil, ücret ve son tarih"],
              ["Ülkenin konsolosluk / göç idaresi", "Vize, oturum ve çalışma hakkı"],
              ["European Education Area", "Avrupa'da eğitim planlama ve ülke bilgileri"],
              ["Erasmus+ ve EURES", "Hibe, staj, iş ve hareketlilik"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.07] p-4">
                <strong className="block text-sm">{title}</strong>
                <span className="mt-1 block text-xs text-white/65">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="https://education.ec.europa.eu/study-in-europe/planning-your-studies"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white px-4 py-2.5 text-navy"
            >
              European Education Area
            </a>
            <a
              href="https://erasmus-plus.ec.europa.eu/opportunities/individuals/students"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white"
            >
              Erasmus+
            </a>
            <a
              href="https://eures.europa.eu/jobseekers_en"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white"
            >
              EURES
            </a>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-border/70 bg-white p-7 shadow-sm md:p-9">
          <h2 className="font-display text-3xl font-semibold text-navy">
            {city} için kişisel planını oluştur
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Ülke, şehir, yükseköğretim kurumu ve yalnızca o kuruma ait doğrulanmış gerçek programı
            seç; ardından belge, son tarih, konaklama ve ilan adımlarını paneline ekle.
          </p>
          <Button asChild className="mt-6 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/portal">
              Portalda {city} araması yap <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
    </>
  );
}
