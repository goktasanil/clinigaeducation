import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Eye, Database, HeartHandshake } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/sections/CTASection";
import { TrustBar } from "@/components/sections/TrustBar";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda | Akademik Uzmanlık & Şeffaf Danışmanlık" },
      {
        name: "description",
        content:
          "10+ yıllık akademik deneyim, etik ve şeffaf danışmanlık anlayışıyla yurt dışı eğitim, tez ve istatistik alanlarında uzman destek.",
      },
      { property: "og:title", content: "Hakkımızda | CliniGA Education" },
      {
        property: "og:description",
        content: "Akademik altyapımız, ekibimiz ve değerlerimiz.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/hakkimizda" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Hakkımızda" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hakkımızda | CliniGA Education" },
      { name: "twitter:description", content: "Akademik altyapımız, ekibimiz ve değerlerimiz." },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/hakkimizda" }],
  }),
  component: AboutPage,
});

const VALUE_ICONS = [ShieldCheck, Eye, Database, HeartHandshake];

function AboutPage() {
  const { t } = useTranslation();
  const values = t("about.values.items", { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <>
      <section className="gradient-navy py-20 text-navy-foreground md:py-28">
        <div className="container-prose">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {t("nav.about")}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-foreground/80">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      <TrustBar />

      <section className="container-prose py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl font-semibold text-navy">
              {t("about.mission.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("about.mission.desc")}</p>
          </div>
          <div className="md:col-span-7">
            <h3 className="font-display text-2xl font-semibold text-navy">
              {t("about.values.title")}
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {values.map((v, idx) => {
                const Icon = VALUE_ICONS[idx] ?? ShieldCheck;
                return (
                  <Card key={v.title} className="border-border/70">
                    <CardContent className="p-5">
                      <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-teal/10 text-teal">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h4 className="font-display text-base font-semibold text-navy">
                        {v.title}
                      </h4>
                      <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
