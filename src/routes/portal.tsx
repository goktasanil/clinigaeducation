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
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
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
        "Global student workspace for program discovery, application tracking, private documents, visa preparation, housing and arrival planning.",
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
        title: "Student Journey OS | Program & Application Workspace | CliniGA Education",
      },
      {
        name: "description",
        content:
          "Discover study-abroad programs and manage applications, deadlines, private documents, visa preparation and housing in one CliniGA student workspace.",
      },
      {
        name: "keywords",
        content:
          "study abroad portal, university application tracker, program discovery, student document management, international student portal",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "CliniGA Student Journey OS" },
      {
        property: "og:description",
        content:
          "Manage your study-abroad journey from program discovery to applications, documents, visa preparation, housing and arrival.",
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
  const publicCopy = usePortalPublicCopy();

  return (
    <>
      <PortalHero />
      <main className="container-prose">
        <PortalJourneyMap />

        <section
          id="kesfet"
          className="scroll-mt-24 pb-16"
          aria-labelledby="portal-discovery-heading"
        >
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              {publicCopy.discovery.eyebrow}
            </p>
            <h2
              id="portal-discovery-heading"
              className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl"
            >
              {publicCopy.discovery.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{publicCopy.discovery.subtitle}</p>
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
