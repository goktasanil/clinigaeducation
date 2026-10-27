import { createFileRoute } from "@tanstack/react-router";

import { PortalWorldExplorer } from "@/components/portal/PortalWorldExplorer";
import { PortalQuestionCenter } from "@/components/portal/PortalQuestionCenter";
import {
  StaticPortalCommerceNotice,
  StaticPortalPricing,
} from "@/components/portal/PortalStaticFallback";

const portalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "CliniGA Global Öğrenci Portalı",
      url: "https://www.clinigaeducation.com/portal",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description:
        "Dünya haritasıyla ülke, şehir ve üniversite keşfi; kuruma bağlı programlar, öğrenci ilanları ve başvuru çalışma alanı.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "CliniGA Education",
          item: "https://www.clinigaeducation.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Öğrenci Portalı",
          item: "https://www.clinigaeducation.com/portal",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      {
        title: "Dünya Haritasıyla Üniversite ve Öğrenci İlanları | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Ülke, şehir, üniversite ve kuruma ait programları dünya haritasında keşfet. Konaklama, ev arkadaşı, ikinci el, iş ve öğrenci hizmetleri ilanlarını incele.",
      },
      {
        name: "keywords",
        content:
          "yurt dışı üniversite, öğrenci portalı, üniversite bölümleri, öğrenci konaklama, ev arkadaşı, öğrenci ilanları",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "CliniGA Global Öğrenci Portalı" },
      {
        property: "og:description",
        content:
          "Dünyadan şehrine, üniversitenden öğrenci yaşamına. Haritada keşfet, kuruma bağlı programları ve öğrenci ilanlarını incele.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/portal" },
      {
        property: "og:image",
        content: "https://www.clinigaeducation.com/og-cover.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.clinigaeducation.com/portal",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(portalJsonLd),
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  return (
    <>
      <PortalWorldExplorer />
      <div className="container-prose">
        <StaticPortalPricing />
        <StaticPortalCommerceNotice />
        <PortalQuestionCenter />
      </div>
    </>
  );
}
