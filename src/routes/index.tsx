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
import { SITE } from "@/data/site";

const HOME_TITLE = `${SITE.brand} | Yurt Dışı Eğitim ve Akademik Danışmanlık`;
const HOME_DESCRIPTION =
  "CliniGA Education ile yurt dışı eğitim ve akademik danışmanlık: ülke ve program seçimi, başvuru, vize, tez ve istatistik rehberliği. Ücretsiz ön görüşme planlayın.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: HOME_TITLE,
      },
      {
        name: "description",
        content: HOME_DESCRIPTION,
      },
      {
        property: "og:title",
        content: HOME_TITLE,
      },
      {
        property: "og:description",
        content: HOME_DESCRIPTION,
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
        content: HOME_TITLE,
      },
      {
        name: "twitter:description",
        content: HOME_DESCRIPTION,
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
          name: HOME_TITLE,
          description: HOME_DESCRIPTION,
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
      <ProcessTimeline />
      <UniversityLogos />
      <ValueProposition />
      <ExpertTeaser />
      <PortalTeaser />
      <ServicesGrid />
      <StudentResources teaser />
      <PackagesGrid teaser />
      <BlogTeaser />
      <FAQ />
      <CTASection />
    </>
  );
}
