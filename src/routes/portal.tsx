import { createFileRoute } from "@tanstack/react-router";

import {
  PortalCommunityFeed as ServerPortalCommunityFeed,
  PortalPricing as ServerPortalPricing,
} from "@/components/portal/PortalExperience";
import {
  PortalHero,
  PortalJourneyMap,
  PortalLifeAbroadGroups,
} from "@/components/portal/PortalLandingExperience";
import { PortalDiscovery } from "@/components/portal/PortalDiscovery";
import { PortalQuestionCenter } from "@/components/portal/PortalQuestionCenter";
import {
  StaticPortalCommerceNotice,
  StaticPortalPricing,
} from "@/components/portal/PortalStaticFallback";

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

const portalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "CliniGA Student Journey OS",
      url: "https://www.clinigaeducation.com/portal",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Basic Monthly", price: "4.99", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus Monthly", price: "8.99", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Pro Monthly", price: "19.99", priceCurrency: "EUR" },
      ],
      description:
        "Program keşfi, başvuru takibi, private belge merkezi, vize, konaklama ve öğrenci yaşamı adımlarını tek çalışma alanında birleştiren küresel öğrenci portalı.",
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
          name: "Student Journey OS",
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
        title: "Student Journey OS | Program, Başvuru ve Belge Takibi | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Yurt dışı eğitim programlarını keşfedin; kısa listenizi, başvurularınızı, deadline'larınızı, private belgelerinizi, vize ve konaklama adımlarınızı tek portalda yönetin.",
      },
      {
        name: "keywords",
        content:
          "study abroad portal, university application tracker, yurt dışı üniversite bulma, başvuru takip sistemi, öğrenci belge yönetimi, international student portal",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "CliniGA Student Journey OS" },
      {
        property: "og:description",
        content:
          "Program keşfinden başvuru, belge, vize ve konaklamaya kadar yurt dışı eğitim yolculuğunu tek çalışma alanında yönetin.",
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
      <PortalHero />
      <main className="container-prose">
        <PortalJourneyMap />

        <section id="kesfet" className="scroll-mt-24 pb-16" aria-labelledby="portal-discovery-heading">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              Program discovery
            </p>
            <h2 id="portal-discovery-heading" className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl">
              Önce seçenekleri bul, sonra çalışma alanına taşı
            </h2>
            <p className="mt-3 text-muted-foreground">
              Kurum ve akademik alan verisini keşif amacıyla kullan; kesin program, kabul koşulu ve ücretler için resmî kurum kaynağını esas al.
            </p>
          </div>
          <PortalDiscovery />
        </section>

        <PortalLifeAbroadGroups />
        <section id="community" className="scroll-mt-24">
          {isStaticHost ? <StaticPortalCommerceNotice /> : <ServerPortalCommunityFeed />}
        </section>
        <PortalQuestionCenter />
        {isStaticHost ? <StaticPortalPricing /> : <ServerPortalPricing />}
      </main>
    </>
  );
}
