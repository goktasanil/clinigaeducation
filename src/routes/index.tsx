import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/cliniga-education-logo.png.asset.json";

import { Hero } from "@/components/sections/Hero";
import { UniversityLogos } from "@/components/sections/UniversityLogos";
import { AudiencePathways } from "@/components/sections/AudiencePathways";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { QuizTeaser } from "@/components/sections/QuizTeaser";
import { PackagesGrid } from "@/components/sections/PackagesGrid";
import { BlogTeaser } from "@/components/sections/BlogTeaser";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { PortalTeaser } from "@/components/sections/PortalTeaser";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Yurt Dışı Eğitim & Vize Danışmanlığı | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Yurt dışı eğitim, vize, master/doktora başvuru, tez ve SPSS/R istatistik danışmanlığı. PhD-düzeyi akademik ekiple ücretsiz ön görüşme planlayın.",
      },
      {
        name: "keywords",
        content:
          "yurt dışı eğitim danışmanlığı, vize danışmanlığı, tez danışmanlığı, istatistik analizi, master başvuru, doktora başvuru, SOP yazımı, niyet mektubu, Erasmus danışmanlık, SPSS analiz",
      },
      {
        property: "og:title",
        content: "Yurt Dışı Eğitim, Vize, Tez & İstatistik Danışmanlığı | CliniGA Education",
      },
      {
        property: "og:description",
        content:
          "PhD-düzeyi akademik danışmanlar ile lisans, master, doktora başvuruları; vize, tez ve istatistik danışmanlığı. Kişiye özel yol haritası, ücretsiz ön görüşme.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "CliniGA Education — Yurt Dışı Eğitim, Vize, Tez ve İstatistik Danışmanlığı",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Yurt Dışı Eğitim, Vize, Tez & İstatistik Danışmanlığı | CliniGA Education",
      },
      {
        name: "twitter:description",
        content:
          "PhD-düzeyi akademik danışmanlar ile lisans, master, doktora başvuruları; vize, tez ve istatistik danışmanlığı.",
      },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.clinigaeducation.com/" },
      { rel: "preload", as: "image", href: logo.url, fetchpriority: "high" },
    ],
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
                text: "Evet. Tezi sizin yazmanız esastır; biz metodoloji, yapı, dil ve istatistik konularında rehberlik ederiz.",
              },
            },
            {
              "@type": "Question",
              name: "Ücret nasıl belirlenir?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "İş kapsamı analizinden sonra kişiye özel bir fiyat teklifi sunulur. Sabit paket fiyatı yerine gerçek iş yüküne göre şeffaf ücretlendirme yaparız.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <UniversityLogos />
      <AudiencePathways />
      <ValueProposition />
      <PortalTeaser />
      <ServicesGrid />
      <StatsCounters />
      <ProcessTimeline />
      <QuizTeaser />
      <PackagesGrid />
      <BlogTeaser />
      <FAQ />
      <CTASection />
    </>
  );
}
