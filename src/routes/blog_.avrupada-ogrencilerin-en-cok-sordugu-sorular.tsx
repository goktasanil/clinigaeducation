import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Calendar,
  FileCheck2,
  HeartPulse,
  Home,
  Landmark,
  MapPinned,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogCspMeta } from "@/lib/csp";
import {
  CHAT_ANALYSIS_SUMMARY,
  TOP_QUESTION_INTENTS,
  TOP_QUESTION_TOPICS,
} from "@/data/student-insights";

const URL = "https://www.clinigaeducation.com/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular";
const TITLE = "Avrupa’da Öğrencilerin En Çok Sorduğu Sorular: 2026 Görselli Rehber";
const DESCRIPTION =
  "22 öğrenci topluluğundaki 20.701 anonim mesajdan çıkan vize, üniversite, iş, belge, barınma ve banka kafa karışıklıkları için resmî kaynaklı rehber.";
const PUBLISHED = "2026-08-23";

const faqItems = [
  {
    id: "vize-oturum",
    icon: ShieldCheck,
    tone: "border-sky-200 bg-sky-50 text-sky-900",
    question: "Vize ile oturum izni aynı şey mi; hangisine ne zaman başvurmalıyım?",
    answer:
      "Aynı şey değildir. 90 güne kadar olan kısa eğitimlerde kısa süreli vize, daha uzun eğitimlerde ise ülkeye göre ulusal uzun süreli vize veya öğrenci oturum izni gerekir. Vatandaşlığınız, eğitim süresi ve gidilecek ülke sonucu değiştirir; ülkenin konsolosluğu ve AB Göç Portalı son kaynaktır.",
    checklist: [
      "Vatandaşlığını belirt",
      "Eğitim süresini netleştir",
      "Ülkenin resmî başvuru sayfasını aç",
    ],
    source: "https://education.ec.europa.eu/study-in-europe/planning-your-studies",
    sourceLabel: "European Education Area — vize ve izin planlama",
  },
  {
    id: "universite-basvuru",
    icon: Building2,
    tone: "border-violet-200 bg-violet-50 text-violet-900",
    question: "Başvuru tarihini ve gerçek program koşullarını nereden doğrulamalıyım?",
    answer:
      "Program adını üçüncü taraf listelerden bulabilirsin; ancak kabul koşulu, dil puanı, harç ve son tarih için yalnızca üniversitenin resmî program ve başvuru sayfasını esas al. Portal, ülke → şehir → yükseköğretim kurumu → doğrulanmış gerçek program sırasını bu nedenle kullanır.",
    checklist: [
      "Kurum alan adını kontrol et",
      "Program yılı ve dönemini eşleştir",
      "Son tarihi takvimine kaydet",
    ],
  },
  {
    id: "is-staj",
    icon: BriefcaseBusiness,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    question: "Öğrenciyken çalışabilir veya Erasmus stajı yapabilir miyim?",
    answer:
      "Erasmus+ yükseköğretim öğrencileri ve bazı yeni mezunlar için yurt dışı stajlarını destekler. Ücretli çalışma hakkı ise vatandaşlık, vize/oturum türü ve ülke mevzuatına göre değişir. İşe başlamadan önce izin koşulunu ve çalışma saati sınırını resmî göç/çalışma sayfasından doğrula.",
    checklist: [
      "Oturum kartındaki çalışma hakkını kontrol et",
      "Yazılı sözleşme iste",
      "EURES ve üniversite kariyer merkezini kullan",
    ],
    source:
      "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/traineeships-abroad-for-students",
    sourceLabel: "Erasmus+ — öğrenci stajları",
  },
  {
    id: "belge-apostil",
    icon: FileCheck2,
    tone: "border-amber-200 bg-amber-50 text-amber-950",
    question: "Diploma, transkript, apostil ve tercüme sırası nasıl olmalı?",
    answer:
      "Tek bir Avrupa sırası yoktur. Önce belgeyi isteyen kurumun kabul ettiği dil, format, elektronik doğrulama ve apostil şartını yazılı olarak öğren. Gereksiz noter ve tercüme masrafı yapmamak için işlem sırasını kurumun resmî kontrol listesine göre kur.",
    checklist: [
      "Belgeyi isteyen kuruma sor",
      "Dijital belge kabulünü kontrol et",
      "Apostil ve tercüme sırasını yazılı teyit et",
    ],
  },
  {
    id: "barinma",
    icon: Home,
    tone: "border-rose-200 bg-rose-50 text-rose-900",
    question: "Ev veya yurt ilanının güvenilir olduğunu nasıl anlarım?",
    answer:
      "İlan verenin doğrulanması tek başına yeterli değildir. Adres, sözleşme tarafı, toplam ücret, depozito iade koşulu ve mülk/temsil yetkisi birlikte kontrol edilmelidir. Görmeden veya güvenli sözleşme olmadan geri döndürülemez ödeme yapma; şüpheli ilanı platforma bildir.",
    checklist: [
      "Canlı görüntülü doğrulama yap",
      "Sözleşmeyi imzadan önce oku",
      "Ödeme alıcısını sözleşmeyle eşleştir",
    ],
  },
  {
    id: "banka-odeme",
    icon: Landmark,
    tone: "border-cyan-200 bg-cyan-50 text-cyan-900",
    question: "Banka hesabı, IBAN, vergi numarası ve ilk ödemelerde sıra nedir?",
    answer:
      "Sıra ülkeye göre değişir: bazı ülkelerde adres kaydı veya vergi numarası banka hesabından önce istenir. Kabul mektubu, pasaport, yerel adres ve kayıt belgesini hazır tut; transferde alıcı adı, IBAN, para birimi ve masraf türünü ikinci kez kontrol et.",
    checklist: [
      "Yerel vergi/kimlik numarasını öğren",
      "Öğrenci hesaplarını karşılaştır",
      "Transfer dekontunu sakla",
    ],
  },
  {
    id: "saglik-sigorta",
    icon: HeartPulse,
    tone: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
    question: "Hangi sağlık sigortası kabul edilir?",
    answer:
      "Kısa seyahat sigortası ile uzun süreli öğrenci sağlık kapsamı aynı değildir. Vize, üniversite kaydı ve oturum için istenen teminatları ayrı ayrı kontrol et; poliçede ülke, başlangıç tarihi ve kapsam dışı haller açık olmalıdır.",
    checklist: [
      "Vize kontrol listesini aç",
      "Üniversite kayıt şartını kontrol et",
      "Poliçe başlangıç tarihini seyahatle eşleştir",
    ],
  },
  {
    id: "burs-finansman",
    icon: Banknote,
    tone: "border-lime-200 bg-lime-50 text-lime-900",
    question: "Erasmus hibesi veya burs için kendim mi başvururum?",
    answer:
      "Başvuru yolu programa göre değişir. Erasmus+ hareketliliklerinin çoğunda kendi üniversiten veya ilgili kuruluş üzerinden ilerlersin; bazı staj ve lisansüstü fırsatlarda bireysel adımlar bulunur. Çağrı takvimini ve uygunluk şartını resmî ilan üzerinden kontrol et.",
    checklist: [
      "Üniversitenin uluslararası ofisine sor",
      "Resmî çağrı metnini indir",
      "Son tarih ve ek belgeleri takvime ekle",
    ],
    source: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/studying-abroad",
    sourceLabel: "Erasmus+ — yurt dışında eğitim",
  },
] as const;

export const Route = createFileRoute("/blog_/avrupada-ogrencilerin-en-cok-sordugu-sorular")({
  head: () => ({
    meta: [
      blogCspMeta(),
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: TITLE,
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          author: { "@type": "Organization", name: "CliniGA Education" },
          publisher: { "@type": "Organization", name: "CliniGA Education" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      },
    ],
  }),
  component: StudentQuestionsGuide,
});

function StudentQuestionsGuide() {
  const maxTopic = Math.max(...TOP_QUESTION_TOPICS.map((topic) => topic.count));
  const maxIntent = Math.max(...TOP_QUESTION_INTENTS.map((intent) => intent.count));

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 text-white md:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <div className="container-prose relative">
          <Link
            to="/blog"
            search={{ q: "", cat: "", page: 1 }}
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Bloga dön
          </Link>
          <Badge className="mt-7 block w-fit border-white/15 bg-white/10 text-white hover:bg-white/10">
            <BadgeCheck className="mr-1.5 inline h-3.5 w-3.5 text-gold" />
            Kimliksiz toplu ihtiyaç analizi · 2026
          </Badge>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            Avrupa’da öğrencilerin en çok kafasını karıştıran sorular
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            {CHAT_ANALYSIS_SUMMARY.groups} öğrenci topluluğundaki{" "}
            {CHAT_ANALYSIS_SUMMARY.analyzedMessages.toLocaleString("tr-TR")} kullanılabilir mesajdan
            çıkan gerçek ihtiyaç başlıkları; resmî Avrupa ve kurum kaynaklarıyla cevaplandı.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs text-white/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
              <Calendar className="mr-1.5 inline h-3.5 w-3.5 text-teal" /> 23 Ağustos 2026
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
              14 dk okuma
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
              Kişi adı, telefon ve ham alıntı: 0
            </span>
          </div>
        </div>
      </section>

      <article className="container-prose py-14 md:py-20">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]" aria-labelledby="veri-basligi">
          <div className="rounded-[2rem] border border-border/70 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              En yoğun soru başlıkları
            </p>
            <h2 id="veri-basligi" className="mt-2 font-display text-3xl font-semibold text-navy">
              Öğrenci nerede takılıyor?
            </h2>
            <div className="mt-7 space-y-5">
              {TOP_QUESTION_TOPICS.map((topic, index) => (
                <div key={topic.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <a href={`#${topic.id}`} className="font-medium text-navy hover:text-teal">
                      {topic.label}
                    </a>
                    <strong className="text-teal">{topic.count}</strong>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={
                        "h-full rounded-full " +
                        (index % 3 === 0
                          ? "bg-gradient-to-r from-navy to-sky-500"
                          : index % 3 === 1
                            ? "bg-gradient-to-r from-teal to-emerald-400"
                            : "bg-gradient-to-r from-gold to-rose-400")
                      }
                      style={{ width: `${(topic.count / maxTopic) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-teal to-navy p-6 text-white shadow-lg md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Cevap beklentisi
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Öğrenci nasıl soruyor?</h2>
            <div className="mt-7 space-y-4">
              {TOP_QUESTION_INTENTS.slice(0, 5).map((intent) => (
                <div key={intent.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span>{intent.label}</span>
                    <span className="font-semibold text-gold">{intent.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-rose-300"
                      style={{ width: `${(intent.count / maxIntent) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-7 text-xs leading-relaxed text-white/60">
              Bir mesaj birden fazla konuya girebilir. Grafik kişi sayısını değil, soru sinyali
              taşıyan anonim mesaj sayısını gösterir.
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="cevaplar-basligi">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Karışıklığı işlemlere böl
          </p>
          <h2
            id="cevaplar-basligi"
            className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl"
          >
            En çok sorulan 8 konu ve güvenli hareket planı
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {faqItems.map((item) => {
              const Icon = item.icon;
              return (
                <section
                  key={item.id}
                  id={item.id}
                  className={`scroll-mt-24 rounded-[1.75rem] border p-6 ${item.tone}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/75 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-snug">
                        {item.question}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed opacity-85">{item.answer}</p>
                    </div>
                  </div>
                  <ol className="mt-5 space-y-2 border-t border-current/10 pt-4 text-sm">
                    {item.checklist.map((step, index) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/80 text-[10px] font-bold">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {"source" in item && item.source ? (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center text-xs font-semibold underline underline-offset-4"
                    >
                      {item.sourceLabel} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </section>
              );
            })}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2rem] border border-rose-200 bg-rose-50">
          <div className="grid gap-0 lg:grid-cols-[.8fr_1.2fr]">
            <div className="bg-rose-600 p-7 text-white md:p-9">
              <ShieldAlert className="h-8 w-8" />
              <h2 className="mt-5 font-display text-3xl font-semibold">
                Dolandırıcılık kırmızı bayrakları
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Sohbetlerde güvenilirlik sorusu daha az görünse de maddi zarar ihtimali yüksek
                olduğu için portalda ayrı güvenlik katmanı gerekir.
              </p>
            </div>
            <div className="grid gap-3 p-7 sm:grid-cols-2 md:p-9">
              {[
                "Görüntülü doğrulamayı sürekli erteleme",
                "Sözleşme öncesi acil kapora baskısı",
                "İlan sahibi ile ödeme alıcısının farklı olması",
                "Piyasanın çok altında fiyat ve kısa süre baskısı",
                "Kimlik belgesini açık mesajla isteme",
                "Platform dışı, geri döndürülemez ödeme talebi",
              ].map((risk) => (
                <div
                  key={risk}
                  className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm text-rose-950 shadow-sm"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> {risk}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-navy p-7 text-white md:p-10">
          <MapPinned className="h-7 w-7 text-gold" />
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
            Kafan karıştığında şehir üzerinden ilerle
          </h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Avrupa şehir rehberi; barınma, kayıt, ulaşım, sağlık, banka, iş ve topluluk kontrol
            listesini seçtiğin şehir için tek ekranda toplar. Ülke ve şehir seçimi sonrasında resmî
            kaynaklara yönlendirir.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/sehir-rehberleri">
                Avrupa şehir rehberleri <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/portal">Ülke ve kurum bul</Link>
            </Button>
          </div>
        </section>

        <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
          <strong>Yöntem ve mahremiyet:</strong> yalnızca 22 sohbet dışa aktarımındaki metinler
          kullanıldı; medya, CV, PDF ve kişi kartları analiz edilmedi. Sistem/medya satırları
          çıkarıldı. İsim, telefon, e-posta, kullanıcı adı, bağlantı ve ham mesaj yayımlanmadı.
          İçerik hukuki danışmanlık değildir; vize ve oturum kararında ilgili ülkenin resmî kurumu
          son kaynaktır.
        </aside>
      </article>
    </>
  );
}
