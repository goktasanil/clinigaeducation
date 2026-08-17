export type PortalPlan = {
  id: "free" | "plus" | "pro";
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  featured?: boolean;
};

export type PortalCategory = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  signal: "çok yüksek" | "yüksek" | "gelişen";
};

// ISO 3166-1 alpha-2: the portal renders every current country/territory name
// with Intl.DisplayNames, so one compact source works in every interface language.
export const ISO_COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ " +
  "BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ " +
  "DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY " +
  "HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY " +
  "MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY " +
  "QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ " +
  "TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ " +
  "VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

export function getCountries(locale = "tr") {
  const display = new Intl.DisplayNames([locale, "en"], { type: "region" });
  return ISO_COUNTRY_CODES.map((code) => ({
    code,
    name: display.of(code) || code,
  })).sort((a, b) => a.name.localeCompare(b.name, locale));
}

export const GLOBAL_STUDY_FIELDS = [
  "Tıp ve Sağlık Bilimleri",
  "Mühendislik",
  "Bilgisayar Bilimleri ve Yapay Zekâ",
  "Veri Bilimi ve İstatistik",
  "İşletme ve Yönetim",
  "Ekonomi ve Finans",
  "Hukuk",
  "Psikoloji",
  "Eğitim Bilimleri",
  "Sosyal Bilimler",
  "Uluslararası İlişkiler",
  "İletişim ve Medya",
  "Mimarlık ve Şehir Planlama",
  "Tasarım ve Güzel Sanatlar",
  "Doğa Bilimleri",
  "Matematik",
  "Çevre ve Sürdürülebilirlik",
  "Tarım ve Gıda Bilimleri",
  "Dil, Edebiyat ve Beşerî Bilimler",
  "Turizm ve Otelcilik",
];

export const PORTAL_CATEGORIES: PortalCategory[] = [
  {
    id: "visa-residence",
    title: "Vize & Oturum",
    titleEn: "Visa & Residence",
    description: "Randevu, evrak, uzatma ve ülkeye göre doğrulanmış kontrol listeleri.",
    signal: "çok yüksek",
  },
  {
    id: "applications",
    title: "Okul & Başvuru",
    titleEn: "University & Applications",
    description: "Üniversite, enstitü, bölüm, son tarih ve başvuru adımları.",
    signal: "çok yüksek",
  },
  {
    id: "documents",
    title: "Belge & Tercüme",
    titleEn: "Documents & Translation",
    description: "Apostil, yeminli tercüme, diploma ve belge kontrolü.",
    signal: "çok yüksek",
  },
  {
    id: "housing",
    title: "Konaklama",
    titleEn: "Accommodation",
    description: "Yurt, oda, ev arkadaşı, depozito ve dolandırıcılık uyarıları.",
    signal: "çok yüksek",
  },
  {
    id: "community",
    title: "Topluluk & Gruplar",
    titleEn: "Community & Groups",
    description: "Şehir, okul ve bölüm bazlı doğrulanmış WhatsApp toplulukları.",
    signal: "yüksek",
  },
  {
    id: "finance",
    title: "Burs & Finans",
    titleEn: "Scholarship & Finance",
    description: "Burslar, bloke hesap, banka, bütçe ve ödeme takibi.",
    signal: "yüksek",
  },
  {
    id: "jobs",
    title: "İş & Staj",
    titleEn: "Jobs & Internships",
    description: "Öğrenci işi, staj, mezuniyet sonrası kariyer ve CV paylaşımı.",
    signal: "yüksek",
  },
  {
    id: "health",
    title: "Sağlık & Sigorta",
    titleEn: "Health & Insurance",
    description: "Sigorta, doktor, acil durum ve yerel sağlık sistemi.",
    signal: "yüksek",
  },
  {
    id: "transport",
    title: "Ulaşım & Seyahat",
    titleEn: "Transport & Travel",
    description: "Öğrenci kartları, şehir içi ulaşım, tren ve seyahat fırsatları.",
    signal: "yüksek",
  },
  {
    id: "marketplace",
    title: "Eşya Pazarı",
    titleEn: "Student Marketplace",
    description: "İkinci el eşya, kitap, bisiklet ve güvenli öğrenci ilanları.",
    signal: "gelişen",
  },
  {
    id: "connectivity",
    title: "Hat & İnternet",
    titleEn: "Mobile & Internet",
    description: "SIM kart, internet, abonelik ve temel yerleşim ihtiyaçları.",
    signal: "gelişen",
  },
  {
    id: "safety",
    title: "Güvenli Yardım",
    titleEn: "Verified Help",
    description: "Doğrulanmış rehberler, moderasyon, şikâyet ve acil destek.",
    signal: "çok yüksek",
  },
];

export const PORTAL_PLANS: PortalPlan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Küresel eğitim dünyasını keşfet.",
    features: [
      "Tüm ülke, şehir ve kurum dizini",
      "Genel öğrenci rehberleri",
      "3 kayıtlı favori",
      "Topluluk ilanlarını görüntüleme",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthly: 8.99,
    yearly: 89,
    description: "Başvuru ve yerleşme sürecini tek yerde yönet.",
    featured: true,
    features: [
      "Sınırsız favori ve karşılaştırma",
      "Son tarih ve belge planlayıcı",
      "Doğrulanmış WhatsApp grupları",
      "Konaklama ve eşya ilanı mesajlaşması",
      "Kişiselleştirilmiş bildirimler",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19.99,
    yearly: 199,
    description: "Daha hızlı karar ve profesyonel başvuru çalışma alanı.",
    features: [
      "Plus'taki her şey",
      "Akıllı ülke ve program eşleştirme",
      "Güvenli belge çalışma alanı",
      "Öncelikli doğrulanmış ilanlar",
      "Uzman webinarları ve aylık dosya kontrolü",
    ],
  },
];

export function getCheckoutUrl(plan: "plus" | "pro", yearly: boolean) {
  const env = import.meta.env as Record<string, string | undefined>;
  const key =
    plan === "plus"
      ? yearly
        ? "VITE_STRIPE_PLUS_YEARLY_URL"
        : "VITE_STRIPE_PLUS_MONTHLY_URL"
      : yearly
        ? "VITE_STRIPE_PRO_YEARLY_URL"
        : "VITE_STRIPE_PRO_MONTHLY_URL";
  return env[key] || "/iletisim?intent=portal-membership";
}
