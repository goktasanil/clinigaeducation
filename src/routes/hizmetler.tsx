import { PageMasthead } from "@/components/presentation/PageMasthead";
import { createFileRoute } from "@tanstack/react-router";

import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { TrustBar } from "@/components/sections/TrustBar";
import { EthicsNotice } from "@/components/sections/EthicsNotice";
import { StudentResources } from "@/components/sections/StudentResources";

const description =
  "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı; İtalyanca, TOEFL/GRE/GMAT/SAT hazırlığı ve öğrenci konaklaması için bağımsız kaynaklar.";

export const Route = createFileRoute("/hizmetler")({
  head: () => ({
    meta: [
      { title: "Hizmetler | Yurt Dışı Eğitim, Vize, Tez, İstatistik" },
      {
        name: "description",
        content: description,
      },
      { property: "og:title", content: "Hizmetlerimiz | CliniGA Education" },
      {
        property: "og:description",
        content: description,
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/hizmetler" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Hizmetler" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hizmetlerimiz | CliniGA Education" },
      {
        name: "twitter:description",
        content: description,
      },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/hizmetler" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "CliniGA Education Danışmanlık Hizmetleri",
          itemListOrder: "https://schema.org/ItemListUnordered",
          itemListElement: [
            {
              "@type": "Service",
              name: "Yurt Dışı Eğitim Danışmanlığı",
              url: "https://www.clinigaeducation.com/hizmetler/yurt-disi-egitim-danismanligi",
              serviceType: "Education Consulting",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "Lisans, master ve doktora başvuruları için ülke/üniversite seçimi, başvuru stratejisi ve dosya hazırlığı.",
            },
            {
              "@type": "Service",
              name: "Vize & Oturum Danışmanlığı",
              url: "https://www.clinigaeducation.com/hizmetler/vize-oturum-danismanligi",
              serviceType: "Visa Consulting",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "Öğrenci ve araştırmacı vizeleri, oturum başvuruları için evrak hazırlığı ve süreç yönetimi.",
            },
            {
              "@type": "Service",
              name: "Tez Danışmanlığı",
              url: "https://www.clinigaeducation.com/hizmetler/tez-danismanligi",
              serviceType: "Thesis Consulting",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "Metodoloji, yapı, dil ve akademik yazım konularında etik çerçevede tez rehberliği.",
            },
            {
              "@type": "Service",
              name: "İstatistik Analizi",
              url: "https://www.clinigaeducation.com/hizmetler/istatistik-analizi",
              serviceType: "Statistical Analysis",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "SPSS, R, Python, AMOS, SmartPLS, NVivo ve Stata ile nicel ve nitel veri analizi.",
            },
            {
              "@type": "Service",
              name: "Belge İnceleme",
              url: "https://www.clinigaeducation.com/hizmetler/belge-inceleme",
              serviceType: "Document Review",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "SOP, niyet mektubu, CV ve referans mektuplarının akademik incelemesi ve geri bildirim.",
            },
            {
              "@type": "Service",
              name: "Akademik Yayın Desteği",
              url: "https://www.clinigaeducation.com/hizmetler/akademik-yayin-destegi",
              serviceType: "Academic Publication",
              provider: { "@id": "https://www.clinigaeducation.com/#organization" },
              description:
                "Makale hazırlığı, dergi seçimi, revizyon ve akademik yayın süreç danışmanlığı.",
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <>
      <PageMasthead kind="services">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-navy md:text-5xl">
          Hizmetlerimiz
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Yurt dışı eğitim, vize, tez ve istatistik alanında uçtan uca profesyonel akademik
          danışmanlık.
        </p>
      </PageMasthead>
      <ServicesGrid interactive />
      <StudentResources />
      <EthicsNotice />
      <TrustBar />
      <CTASection />
    </>
  ),
});
