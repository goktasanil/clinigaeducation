import { createFileRoute } from "@tanstack/react-router";
import educationLogo from "@/assets/cliniga-education-logo.png";

import { Hero } from "@/components/sections/Hero";
import { UniversityLogos } from "@/components/sections/UniversityLogos";
import { JourneyNavigator } from "@/components/sections/JourneyNavigator";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { BlogTeaser } from "@/components/sections/BlogTeaser";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { PortalTeaser } from "@/components/sections/PortalTeaser";
import { StudentResources } from "@/components/sections/StudentResources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Yurt Dışı Eğitim ve Öğrenci Portalı | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Yurt dışı eğitim hedefinizi planlayın; ülke, üniversite ve programları keşfedin. Başvuru, vize ve akademik danışmanlık için ön görüşme planlayın.",
      },
      {
        name: "keywords",
        content:
          "yurt dışı eğitim danışmanlığı, vize danışmanlığı, tez danışmanlığı, istatistik analizi, master başvuru, doktora başvuru, SOP yazımı, niyet mektubu, Erasmus danışmanlık, SPSS analiz",
      },
      {
        property: "og:title",
        content: "Yurt Dışı Eğitim ve Öğrenci Portalı | CliniGA Education",
      },
      {
        property: "og:description",
        content:
          "Ülke, üniversite ve program keşfinden başvuru planına; öğrenci yaşamı, vize ve akademik danışmanlık kaynaklarını CliniGA Education’da inceleyin.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "CliniGA Education — Yurt dışı eğitim ve akademik danışmanlık",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Yurt Dışı Eğitim ve Öğrenci Portalı | CliniGA Education",
      },
      {
        name: "twitter:description",
        content:
          "Ülke, üniversite ve program keşfi; başvuru, vize ve akademik danışmanlık için kişiye özel planlama.",
      },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.clinigaeducation.com/" },
      { rel: "preload", as: "image", href: educationLogo, fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.clinigaeducation.com/#webpage",
          url: "https://www.clinigaeducation.com/",
          name: "Yurt Dışı Eğitim ve Öğrenci Portalı | CliniGA Education",
          description:
            "Yurt dışı eğitim hedefleri, üniversite ve program keşfi, başvuru planlama ve akademik danışmanlık kaynakları.",
          inLanguage: "tr",
          isPartOf: { "@id": "https://www.clinigaeducation.com/#website" },
          about: { "@id": "https://www.clinigaeducation.com/#organization" },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: "https://www.clinigaeducation.com/og-cover.png",
            width: 1200,
            height: 630,
          },
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
      <JourneyNavigator />
      <UniversityLogos />
      <ValueProposition />
      <PortalTeaser />
      <ServicesGrid />
      <StudentResources teaser />
      <ProcessTimeline />
      <BlogTeaser />
      <FAQ />
      <CTASection />
    </>
  );
}
