import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Globe2,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EUROPEAN_CITY_GUIDES, cityGuideSlug } from "@/data/european-city-guides";
import { TOP_CITY_MENTIONS } from "@/data/student-insights";

const URL = "https://www.clinigaeducation.com/sehir-rehberleri";

export const Route = createFileRoute("/sehir-rehberleri")({
  head: () => ({
    meta: [
      { title: "Avrupa Öğrenci Şehir Rehberleri | CliniGA Education" },
      {
        name: "description",
        content:
          "Avrupa'da eğitim için ülke ve şehir seçin; barınma, vize/oturum, üniversite, ulaşım, sağlık, banka, iş ve topluluk kontrol listelerini açın.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Avrupa Öğrenci Şehir Rehberleri" },
      {
        property: "og:description",
        content: "Avrupa şehirlerinde öğrenci yaşamını işlem işlem planlayın.",
      },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: EuropeanCityGuidesPage,
});

function EuropeanCityGuidesPage() {
  const [countryCode, setCountryCode] = useState("");
  const [query, setQuery] = useState("");
  const countries = useMemo(
    () =>
      Array.from(
        new Map(
          EUROPEAN_CITY_GUIDES.map((city) => [city.countryCode, city.country] as const),
        ).entries(),
      ).sort((a, b) => a[1].localeCompare(b[1], "tr")),
    [],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    return EUROPEAN_CITY_GUIDES.filter(
      (city) =>
        (!countryCode || city.countryCode === countryCode) &&
        (!needle ||
          city.city.toLocaleLowerCase("tr").includes(needle) ||
          city.country.toLocaleLowerCase("tr").includes(needle)),
    );
  }, [countryCode, query]);

  const selectedCountry = countries.find(([code]) => code === countryCode)?.[1] || "";
  const exactCurated = EUROPEAN_CITY_GUIDES.find(
    (item) =>
      (!countryCode || item.countryCode === countryCode) &&
      item.city.localeCompare(query.trim(), "tr", { sensitivity: "base" }) === 0,
  );
  const customCityHref = query.trim()
    ? `/sehir-rehberleri/${exactCurated?.slug || cityGuideSlug(query.trim())}?city=${encodeURIComponent(
        exactCurated?.city || query.trim(),
      )}&country=${encodeURIComponent(exactCurated?.country || selectedCountry)}`
    : "";

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 text-white md:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <div className="container-prose relative">
          <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
            <Globe2 className="mr-1.5 h-3.5 w-3.5 text-gold" />
            Avrupa öğrenci yaşamı dizini
          </Badge>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            Ülkeyi ve şehri seç. Kafa karışıklığını adım adım çöz.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            Büyük öğrenci şehirleri için yayınlanan rehberleri listele; listede olmayan herhangi bir
            Avrupa şehrini yazarak aynı resmî kaynaklı kontrol şablonunu aç. İnce içerik üretmek
            yerine doğrulanabilir işlem adımları sunuyoruz.
          </p>
        </div>
      </section>

      <main className="container-prose py-12 md:py-16">
        <section className="-mt-24 grid gap-4 rounded-[2rem] border border-white/70 bg-white p-5 shadow-2xl shadow-navy/15 md:grid-cols-[.8fr_1.2fr_auto] md:p-7">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-teal">
            1 · Ülke
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium normal-case tracking-normal text-navy outline-none ring-teal/40 focus:ring-2"
            >
              <option value="">Tüm Avrupa ülkeleri</option>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-violet-700">
            2 · Şehir
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                list="europe-city-options"
                placeholder="Şehir yaz veya listeden seç"
                className="h-12 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm font-medium normal-case tracking-normal text-navy outline-none ring-violet-400/40 focus:ring-2"
              />
              <datalist id="europe-city-options">
                {filtered.map((city) => (
                  <option key={`${city.countryCode}-${city.slug}`} value={city.city}>
                    {city.country}
                  </option>
                ))}
              </datalist>
            </div>
          </label>
          <Button
            asChild
            disabled={!customCityHref}
            className="mt-auto h-12 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <a href={customCityHref || "#sehir-listesi"}>
              Rehberi aç <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-teal to-navy p-7 text-white md:p-9">
            <Sparkles className="h-7 w-7 text-gold" />
            <h2 className="mt-4 font-display text-3xl font-semibold">
              Her şehirde aynı 8 temel kontrol
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Üniversite ve gerçek program",
                "Vize ve oturum sırası",
                "Ev, yurt ve depozito",
                "Banka ve yerel kayıt",
                "Sağlık ve sigorta",
                "Ulaşım ve öğrenci kartı",
                "İş, staj ve çalışma hakkı",
                "Doğrulanmış topluluk ve ilan",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.07] p-3 text-sm"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-gold-foreground">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-border/70 bg-white p-7 shadow-sm md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              Sohbetlerde adı en çok geçenler
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
              Öne çıkan şehirler
            </h2>
            <div className="mt-6 space-y-4">
              {TOP_CITY_MENTIONS.slice(0, 6).map((item) => (
                <div key={item.city} className="flex items-center gap-3">
                  <MapPinned className="h-4 w-4 shrink-0 text-gold" />
                  <span className="w-24 text-sm font-medium text-navy">{item.city}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                      style={{
                        width: `${Math.max(8, (item.count / TOP_CITY_MENTIONS[0].count) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-teal">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Bu sayılar şehir kalitesi sıralaması değildir; anonim sohbetlerdeki şehir adı
              geçişlerini gösterir.
            </p>
          </div>
        </section>

        <section id="sehir-listesi" className="mt-16 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                Yayınlanmış dizin
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl">
                Avrupa öğrenci şehirleri
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {filtered.length} rehber gösteriliyor. Başka bir şehir için yukarıdaki alana adını
                yaz.
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-teal" /> Resmî bağlantı kontrolü
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((city, index) => (
              <a
                key={`${city.countryCode}-${city.slug}`}
                href={`/sehir-rehberleri/${city.slug}`}
                className="group rounded-2xl border border-border/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      "grid h-10 w-10 place-items-center rounded-xl " +
                      (index % 3 === 0
                        ? "bg-sky-100 text-sky-700"
                        : index % 3 === 1
                          ? "bg-violet-100 text-violet-700"
                          : "bg-rose-100 text-rose-700")
                    }
                  >
                    <Building2 className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-teal" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-navy">{city.city}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{city.country}</p>
                <span className="mt-4 block text-xs font-semibold text-teal">
                  8 adımlı öğrenci rehberi
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
