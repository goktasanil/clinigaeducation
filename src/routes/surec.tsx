import { createFileRoute } from "@tanstack/react-router";

import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTASection } from "@/components/sections/CTASection";

export const Route = createFileRoute("/surec")({
  head: () => ({
    meta: [
      { title: "Süreç | Profesyonel Danışmanlık İş Akışı | CliniGA Education" },
      {
        name: "description",
        content:
          "Talep, analiz, plan, destek ve takipten oluşan şeffaf 5 adımlı profesyonel danışmanlık süreci.",
      },
      { property: "og:title", content: "Çalışma Sürecimiz | CliniGA Education" },
      {
        property: "og:description",
        content: "5 adımlı profesyonel danışmanlık sürecimizi inceleyin.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/surec" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Süreç" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Çalışma Sürecimiz | CliniGA Education" },
      { name: "twitter:description", content: "5 adımlı profesyonel danışmanlık sürecimizi inceleyin." },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/surec" }],
  }),
  component: () => (
    <div className="pt-10">
      <header className="container-prose pt-6 pb-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-navy md:text-5xl">
          Çalışma Sürecimiz
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Talep, analiz, plan, destek ve takipten oluşan şeffaf 5 adımlı profesyonel danışmanlık süreci.
        </p>
      </header>
      <ProcessTimeline />
      <CTASection />
    </div>
  ),
});
