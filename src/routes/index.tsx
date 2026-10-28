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
import { PackagesGrid } from "@/components/sections/PackagesGrid";
import { ExpertTeaser } from "@/components/sections/ExpertTeaser";
import { siteFaqSchema } from "@/lib/site-faq";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Yurt Dışı Eğitim ve Akademik Danışmanlık | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Yurt dışı eğitim ve akademik danışmanlık: ülke ve program seçimi, başvuru planı, vize süreci, tez ve istatistik rehberliği için ön görüşme talep edin.",
      },
      {
        property: "og:title",
        content: "Yurt Dışı Eğitim ve Akademik Danışmanlık | CliniGA Education",
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
        content: "Yurt Dışı Eğitim ve Akademik Danışmanlık | CliniGA Education",
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
          name: "Yurt Dışı Eğitim ve Akademik Danışmanlık | CliniGA Education",
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
      { type: "application/ld+json", children: JSON.stringify(siteFaqSchema()) },
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
      <ExpertTeaser />
      <PortalTeaser />
      <ServicesGrid />
      <StudentResources teaser />
      <ProcessTimeline />
      <PackagesGrid teaser />
      <BlogTeaser />
      <FAQ />
      <CTASection />
    </>
  );
}
