import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  GraduationCap,
  HeartPulse,
  Home,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Users,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getCheckoutUrl,
  getCountries,
  GLOBAL_STUDY_FIELDS,
  PORTAL_CATEGORIES,
  PORTAL_PLANS,
} from "@/data/portal";
import {
  searchGlobalCities,
  searchGlobalInstitutions,
} from "@/lib/global-catalog.functions";

const categoryIcons = {
  "visa-residence": ShieldCheck,
  applications: GraduationCap,
  documents: FileCheck2,
  housing: Home,
  community: Users,
  finance: CircleDollarSign,
  jobs: BriefcaseBusiness,
  health: HeartPulse,
  transport: TrainFront,
  marketplace: ShoppingBag,
  connectivity: Wifi,
  safety: BadgeCheck,
} as const;

type City = { name: string; institutionCount: number };
type Institution = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  country: string;
  homepageUrl: string | null;
  logoUrl: string | null;
  worksCount: number;
};

export function PortalDiscovery() {
  const countries = useMemo(() => getCountries("tr"), []);
  const getCities = useServerFn(searchGlobalCities);
  const getInstitutions = useServerFn(searchGlobalInstitutions);
  const [countryCode, setCountryCode] = useState("DE");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [studyField, setStudyField] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setCity("");
    setCities([]);
    setLoadingCities(true);
    setError("");
    getCities({ data: { countryCode, query: "" } })
      .then((result) => {
        if (active) setCities(result.cities);
      })
      .catch(() => {
        if (active) setError("Şehir dizini şu anda yenileniyor. Kurum araması kullanılabilir.");
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [countryCode, getCities]);

  const runSearch = async () => {
    setLoadingInstitutions(true);
    setError("");
    try {
      const result = await getInstitutions({
        data: { countryCode, city, query, page: 1 },
      });
      setInstitutions(result.institutions);
      if (result.institutions.length === 0) {
        setError("Bu filtreyle sonuç bulunamadı. Şehir veya kurum adını değiştirin.");
      }
    } catch {
      setError("Küresel kurum dizinine şu anda ulaşılamıyor. Lütfen tekrar deneyin.");
    } finally {
      setLoadingInstitutions(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-navy p-5 text-white shadow-2xl shadow-navy/30 md:p-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/25 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-3 border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Globe2 className="mr-1.5 h-3.5 w-3.5 text-gold" />
              249 ülke ve bölge · Küresel kurum dizini
            </Badge>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Dünyadaki eğitim seçeneklerini tek aramada bul
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
              Ülkeyi seçin; şehir, üniversite, kolej, araştırma merkezi ve enstitüleri
              güncel küresel katalogdan keşfedin.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-right md:block">
            <div className="text-2xl font-semibold text-gold">Global</div>
            <div className="text-xs text-white/60">live institution search</div>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            1 · Ülke
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            2 · Şehir
            <div className="relative">
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                list="portal-city-options"
                placeholder="Tüm şehirler veya şehir yazın"
                maxLength={100}
                className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 pr-9 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2"
              />
              <datalist id="portal-city-options">
                {cities.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.institutionCount ? item.institutionCount + " kurum" : ""}
                  </option>
                ))}
              </datalist>
              {loadingCities && (
                <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-teal" />
              )}
            </div>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            3 · Bölüm / Alan
            <select
              value={studyField}
              onChange={(event) => setStudyField(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2"
            >
              <option value="">Tüm çalışma alanları</option>
              {GLOBAL_STUDY_FIELDS.map((field) => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            4 · Üniversite / Enstitü
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void runSearch();
              }}
              placeholder="Kurum veya bölüm ara"
              maxLength={100}
              className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none placeholder:text-slate-400 ring-gold/60 focus:ring-2"
            />
          </label>
          <div className="flex items-end">
            <Button
              onClick={() => void runSearch()}
              disabled={loadingInstitutions}
              className="h-12 w-full rounded-xl bg-gold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
            >
              {loadingInstitutions ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Küresel Dizinde Ara
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            {error}
          </p>
        )}

        {institutions.length > 0 && (
          <div className="mt-5 grid max-h-[480px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {institutions.map((institution) => (
              <article
                key={institution.id}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4 transition hover:-translate-y-0.5 hover:border-teal/60 hover:bg-white/[0.12]"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-navy">
                  {institution.logoUrl ? (
                    <img
                      src={institution.logoUrl}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                      loading="lazy"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-teal" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{institution.name}</h3>
                    <Badge className="shrink-0 border-white/15 bg-white/10 text-[10px] text-white hover:bg-white/10">
                      {institution.type}
                    </Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/60">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {[institution.city, institution.region, institution.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <a
                      href={
                        "/portal/panel?institution=" +
                        encodeURIComponent(institution.id) +
                        "&field=" +
                        encodeURIComponent(studyField)
                      }
                      className="font-medium text-gold hover:underline"
                    >
                      Kaydet ve incele
                    </a>
                    {institution.homepageUrl && (
                      <a
                        href={institution.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-white/70 hover:text-white"
                      >
                        Resmî site
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/50">
          <BookOpenCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
          Kurum dizini OpenAlex açık akademik verisiyle sunulur. Kabul koşulları ve
          program bilgileri için kurumun resmî sayfası son kaynak kabul edilir.
        </p>
      </div>
    </div>
  );
}

export function PortalCategoryGrid() {
  return (
    <section className="py-20">
      <div className="mb-10 text-center">
        <Badge variant="outline" className="mb-3 border-teal/30 text-teal">
          Öğrenci ihtiyaçlarından tasarlandı
        </Badge>
        <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
          Başvurudan mezuniyete, gerçek hayatın tüm başlıkları
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Kategoriler, 22 uluslararası öğrenci WhatsApp topluluğundaki kişisel veri
          içermeyen toplu ihtiyaç sinyallerinden oluşturuldu.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PORTAL_CATEGORIES.map((category, index) => {
          const Icon = categoryIcons[category.id as keyof typeof categoryIcons] || Sparkles;
          return (
            <article
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[3rem] bg-gradient-to-bl from-teal/10 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-gold shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-navy">
                {category.title}
              </h3>
              <p className="text-xs font-medium text-teal">{category.titleEn}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  ihtiyaç sinyali
                </span>
                <span className="text-xs font-semibold text-navy">{category.signal}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function PortalDashboardPreview() {
  const tasks = [
    ["Vize belge kontrolü", "8 / 11", "72%"],
    ["Okul kısa listesi", "5 kurum", "55%"],
    ["Konaklama araştırması", "12 ilan", "40%"],
  ];
  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-50 p-4 ring-1 ring-border/70 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-navy p-5 text-white">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-navy">
              <Plane className="h-4 w-4" />
            </span>
            My Journey
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            {["Genel Bakış", "Okullarım", "Başvurular", "Belgeler", "Topluluk", "İlanlar"].map(
              (item, index) => (
                <div
                  key={item}
                  className={
                    "flex items-center justify-between rounded-xl px-3 py-2.5 " +
                    (index === 0 ? "bg-white/10 text-gold" : "text-white/65")
                  }
                >
                  {item}
                  {index === 4 && (
                    <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] text-white">
                      3
                    </span>
                  )}
                </div>
              ),
            )}
          </nav>
        </aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-teal">Günaydın, global öğrenci</p>
              <h2 className="font-display text-2xl font-semibold text-navy">
                Berlin yüksek lisans yolculuğun
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <a href="/portal/panel">
                Paneli aç <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {tasks.map(([title, value, progress]) => (
              <div key={title} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground">{title}</div>
                <div className="mt-2 flex items-end justify-between">
                  <strong className="text-xl text-navy">{value}</strong>
                  <span className="text-xs text-teal">{progress}</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                    style={{ width: progress }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.25fr_.75fr]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy">Yaklaşan adımlar</h3>
                <span className="text-xs text-teal">Takvim</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["18 Eyl", "Transkript tercümesini yükle"],
                  ["03 Eki", "İlk okul başvurusunu gönder"],
                  ["12 Eki", "Konaklama görüşmesi"],
                ].map(([date, task]) => (
                  <div key={task} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="w-14 text-xs font-semibold text-teal">{date}</span>
                    <span className="text-sm text-navy">{task}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-teal to-navy p-5 text-white shadow-lg">
              <MessageCircle className="h-6 w-6 text-gold" />
              <h3 className="mt-5 font-display text-xl font-semibold">Topluluğun hazır</h3>
              <p className="mt-2 text-sm text-white/70">
                Şehir, okul ve bölümüne göre doğrulanmış gruplara güvenle katıl.
              </p>
              <div className="mt-5 flex -space-x-2">
                {["TR", "DE", "IT", "ES", "+42"].map((label) => (
                  <span
                    key={label}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-teal bg-white text-[10px] font-bold text-navy"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PortalPricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="uyelik" className="py-20">
      <div className="text-center">
        <Badge className="mb-3 bg-gold/15 text-navy hover:bg-gold/15">
          Basit ve şeffaf üyelik
        </Badge>
        <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
          Yolculuğuna uygun planı seç
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Ücretsiz keşfet; daha fazla planlama, güven ve iletişim gerektiğinde yükselt.
        </p>
        <div className="mx-auto mt-6 inline-flex rounded-xl border bg-white p-1 shadow-sm">
          <button
            onClick={() => setYearly(false)}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium transition " +
              (!yearly ? "bg-navy text-white" : "text-muted-foreground")
            }
          >
            Aylık
          </button>
          <button
            onClick={() => setYearly(true)}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium transition " +
              (yearly ? "bg-navy text-white" : "text-muted-foreground")
            }
          >
            Yıllık · 2 ay avantaj
          </button>
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {PORTAL_PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const href =
            plan.id === "free"
              ? "/auth?next=/portal/panel"
              : getCheckoutUrl(plan.id, yearly);
          return (
            <article
              key={plan.id}
              className={
                "relative rounded-[1.75rem] border p-6 shadow-sm " +
                (plan.featured
                  ? "border-gold bg-navy text-white shadow-xl shadow-navy/20"
                  : "border-border/70 bg-white")
              }
            >
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground">
                  En çok tercih edilen
                </Badge>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  <p className={"mt-1 text-sm " + (plan.featured ? "text-white/65" : "text-muted-foreground")}>
                    {plan.description}
                  </p>
                </div>
                {plan.featured ? (
                  <Sparkles className="h-6 w-6 text-gold" />
                ) : (
                  <Globe2 className="h-6 w-6 text-teal" />
                )}
              </div>
              <div className="mt-7">
                <span className="text-4xl font-semibold">
                  {price === 0 ? "€0" : "€" + price}
                </span>
                {price > 0 && (
                  <span className={plan.featured ? "text-white/60" : "text-muted-foreground"}>
                    /{yearly ? "yıl" : "ay"}
                  </span>
                )}
              </div>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    <span className={plan.featured ? "text-white/85" : "text-foreground/80"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  "mt-8 w-full rounded-xl " +
                  (plan.featured
                    ? "bg-gold text-gold-foreground hover:bg-gold/90"
                    : "bg-navy text-white hover:bg-navy/90")
                }
              >
                <a href={href}>{plan.id === "free" ? "Ücretsiz başla" : plan.name + " seç"}</a>
              </Button>
            </article>
          );
        })}
      </div>
      <p className="mx-auto mt-6 flex max-w-2xl items-start justify-center gap-2 text-center text-xs text-muted-foreground">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
        Ödeme güvenli Stripe ödeme sayfasında tamamlanır. Kart bilgileri CliniGA
        sunucularında tutulmaz; üyelik istenildiğinde yönetilebilir.
      </p>
    </section>
  );
}
