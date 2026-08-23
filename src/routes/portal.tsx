import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PortalCategoryGrid,
  PortalCommunityFeed,
  PortalDashboardPreview,
  PortalPricing,
} from "@/components/portal/PortalExperience";
import { PortalDiscovery } from "@/components/portal/PortalDiscovery";

const portalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "CliniGA Global Student Portal",
      url: "https://www.clinigaeducation.com/portal",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Basic Monthly", price: "4.99", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus Monthly", price: "8.99", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Pro Monthly", price: "19.99", priceCurrency: "EUR" },
      ],
      description:
        "Ülke, şehir, üniversite, enstitü ve öğrenci yaşamı bilgilerini tek çalışma alanında birleştiren küresel öğrenci portalı.",
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
          name: "Global Student Portal",
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
        title: "Global Student Portal | Ülke, Şehir, Üniversite ve Enstitü Rehberi | CliniGA",
      },
      {
        name: "description",
        content:
          "Tüm ülkelerde şehir, üniversite ve enstitü arayın; başvuru, vize, konaklama, öğrenci grupları, burs, iş ve ikinci el ihtiyaçlarınızı tek portalda yönetin.",
      },
      {
        name: "keywords",
        content:
          "global student portal, dünya üniversiteleri, yurt dışı üniversite bulma, enstitü arama, öğrenci konaklama, erasmus whatsapp grupları, international students",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "CliniGA Global Student Portal" },
      {
        property: "og:description",
        content:
          "Dünyadaki ülkeleri, şehirleri, üniversiteleri ve enstitüleri keşfet; öğrenci yaşamını tek panelden yönet.",
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
  const portalStats = [
    { value: "249", label: "ülke ve bölge", icon: Globe2 },
    { value: "Küresel", label: "üniversite + enstitü dizini", icon: Building2 },
    { value: "14", label: "öğrenci yaşam kategorisi", icon: Users },
    { value: "Tek panel", label: "başvurudan yerleşmeye", icon: MapPin },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_85%_15%,hsl(var(--gold)/.22),transparent_28%),linear-gradient(145deg,hsl(var(--navy)),#0b5d91)] py-10 text-white md:py-14">
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="container-prose">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold" />
                CliniGA Global Student Portal
              </Badge>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
                Dünyadaki eğitimi bul.
                <span className="block bg-gradient-to-r from-gold via-amber-200 to-teal bg-clip-text text-transparent">
                  Yeni hayatını güvenle kur.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/72">
                Ülkeden şehre, üniversiteden enstitüye; vizeden konaklamaya, burslardan öğrenci
                işlerine, yurtlardan ikinci el eşyaya kadar öğrencinin ihtiyaç duyduğu her şey
                doğrulanmış, ücretli ve moderasyonlu tek pazarda.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <a href="#kesfet">
                    Dünyayı keşfet <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#uyelik">Ücretli üyeliği incele</a>
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
                <span className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-teal" /> 249 ülke ve bölge
                </span>
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-gold" /> Üniversite + enstitü
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal" /> Doğrulanmış hesaplar
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-gold/20 to-teal/20 blur-2xl" />
              <div className="relative rotate-1 rounded-[2rem] border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur">
                <div className="rounded-2xl bg-white p-5 text-navy">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                        Örnek yolculuk paneli
                      </p>
                      <h2 className="mt-1 font-display text-xl font-semibold">
                        Berlin · Doğrulanmış program kataloğu
                      </h2>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-gold">
                      <Globe2 className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                    {[
                      ["12", "Kurum"],
                      ["8", "İlan"],
                      ["6", "Grup"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl bg-slate-50 px-2 py-3">
                        <strong className="block text-xl">{value}</strong>
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Kurum kısa listesini tamamla", "80%"],
                      ["Vize belgelerini doğrula", "62%"],
                      ["Konaklama görüşmesi planla", "36%"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{label}</span>
                          <span className="font-semibold text-teal">{value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                            style={{ width: value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-white">
                    <span className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gold" /> Berlin öğrenci ağı
                    </span>
                    <span className="text-xs text-white/60">örnek görünüm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container-prose">
        <section
          aria-label="Portal kapsamı"
          className="relative z-20 -mt-7 grid overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-xl shadow-navy/10 backdrop-blur sm:grid-cols-2 lg:grid-cols-4"
        >
          {portalStats.map(({ value, label, icon: Icon }, index) => (
            <div
              key={label}
              className={
                "flex items-center gap-3 px-5 py-4 " +
                (index > 0 ? "border-t border-border/60 sm:border-l sm:border-t-0" : "")
              }
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <strong className="block text-lg leading-none text-navy">{value}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
              </span>
            </div>
          ))}
        </section>
        <section id="kesfet" className="relative z-10 mt-8 scroll-mt-24">
          <PortalDiscovery />
        </section>
        <PortalCommunityFeed />
        <PortalCategoryGrid />
        <PortalDashboardPreview />
        <PortalPricing />
      </main>
    </>
  );
}
