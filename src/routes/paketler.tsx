import { createFileRoute } from "@tanstack/react-router";

import { PackagesGrid } from "@/components/sections/PackagesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { FAQ } from "@/components/sections/FAQ";
import { EthicsNotice } from "@/components/sections/EthicsNotice";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Danışmanlık Paketleri | CliniGA Education" },
      {
        name: "description",
        content:
          "Saatlik danışmanlıktan lisans, master, doktora, tez ve istatistik paketlerine kadar; ihtiyaca göre şekillenen kişiye özel akademik danışmanlık.",
      },
      { property: "og:title", content: "Danışmanlık Paketleri | CliniGA Education" },
      {
        property: "og:description",
        content:
          "Kişiye özel fiyatlandırma. Kapsam analiziyle şekillenen profesyonel akademik danışmanlık paketleri.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/paketler" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Danışmanlık Paketleri" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Danışmanlık Paketleri | CliniGA Education" },
      { name: "twitter:description", content: "Kişiye özel fiyatlandırma ile profesyonel akademik danışmanlık paketleri." },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/paketler" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Danışmanlık süreci ne kadar sürer?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Hizmete göre değişir: saatlik danışmanlık tek seansta, başvuru paketleri 2–6 ay, tez danışmanlığı 3–12 ay sürebilir.",
              },
            },
            {
              "@type": "Question",
              name: "Hangi ülkeler için danışmanlık veriyorsunuz?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Almanya, ABD, İngiltere, Kanada, Hollanda, İsviçre, İtalya, İspanya, Avustralya ve Asya ülkeleri dahil 40+ ülke.",
              },
            },
            {
              "@type": "Question",
              name: "İstatistik analizi hangi programlarla yapılıyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "SPSS, R, Python, AMOS, SmartPLS, NVivo ve Stata ile nicel ve nitel analizler gerçekleştiriyoruz.",
              },
            },
            {
              "@type": "Question",
              name: "Tez danışmanlığı etik mi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Evet. Tezi sizin yazmanız esastır; biz metodoloji, yapı, dil ve istatistik konularında rehberlik ederiz. Akademik etik kurallarına tam uyum sağlarız.",
              },
            },
            {
              "@type": "Question",
              name: "Yatırım nasıl belirlenir?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Hizmet başlangıcında ihtiyaç analizi yapılır ve iş kapsamına göre kişiye özel yatırım teklifi sunulur. Paketler taksitlendirilebilir.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <div className="pt-10">
      <header className="container-prose pt-6 pb-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-navy md:text-5xl">
          Danışmanlık Paketleri
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          İşin kapsamına göre şekillenen, kişiye özel akademik danışmanlık paketleri. Fiyatlandırma ön görüşme sonrası netleşir.
        </p>
      </header>
      <PackagesGrid />
      <EthicsNotice />
      <FAQ />
      <CTASection />
    </div>
  ),
});
