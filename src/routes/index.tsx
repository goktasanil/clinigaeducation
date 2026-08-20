import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/cliniga-education-logo.png.asset.json";

import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { QuizTeaser } from "@/components/sections/QuizTeaser";
import { BlogTeaser } from "@/components/sections/BlogTeaser";
import { EthicsNotice } from "@/components/sections/EthicsNotice";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yurt Dışı Eğitim & Akademik Yol Haritası | CliniGA Education" },
      {
        name: "description",
        content:
          "Yurt dışı eğitim, vize, yüksek lisans, doktora, tez ve istatistik süreçleri için kişiye özel ve etik danışmanlık. Hedefinizi birlikte planlayın.",
      },
      { property: "og:title", content: "Hayalindeki Eğitime Giden Rotayı Birlikte Çizelim | CliniGA Education" },
      {
        property: "og:description",
        content: "Ülke seçiminden başvuru ve vizeye, tezden istatistiğe kadar kişiye özel akademik yol haritası.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://www.clinigaeducation.com/" },
      { rel: "preload", as: "image", href: logo.url, fetchpriority: "high" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueProposition />
      <ServicesGrid />
      <ProcessTimeline />
      <QuizTeaser />
      <BlogTeaser />
      <EthicsNotice />
      <FAQ />
      <CTASection />
    </>
  );
}
