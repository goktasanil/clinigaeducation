export type PortalPlan = {
  id: "basic" | "plus" | "pro";
  includedCredits: number;
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
  { id: "housing", title: "Ev & Oda", titleEn: "Homes & Rooms", description: "Doğrulanmış oda, kiralık ev, kısa dönem ve ev arkadaşı ilanları.", signal: "çok yüksek" },
  { id: "dormitory", title: "Öğrenci Yurdu", titleEn: "Student Dormitories", description: "Kamu, üniversite ve özel yurt seçenekleri; dönem, depozito ve sözleşme bilgileri.", signal: "çok yüksek" },
  { id: "scholarships", title: "Burslar", titleEn: "Scholarships", description: "Ülke, kurum, program ve başarı ölçütlerine göre doğrulanmış burs çağrıları.", signal: "çok yüksek" },
  { id: "marketplace", title: "İkinci El Eşya", titleEn: "Second-hand Marketplace", description: "Mobilya, kitap, bisiklet, elektronik ve öğrencinin ihtiyaç duyduğu eşyalar.", signal: "çok yüksek" },
  { id: "roommates", title: "Ev Arkadaşı", titleEn: "Roommates", description: "Şehir, okul ve yaşam tercihlerine göre güvenli ev arkadaşı arama.", signal: "yüksek" },
  { id: "applications", title: "Okul & Başvuru", titleEn: "University & Applications", description: "Üniversite, enstitü, bölüm, son tarih ve başvuru adımları.", signal: "çok yüksek" },
  { id: "visa-residence", title: "Vize & Oturum", titleEn: "Visa & Residence", description: "Randevu, evrak, uzatma ve ülkeye göre doğrulanmış kontrol listeleri.", signal: "çok yüksek" },
  { id: "documents", title: "Belge & Tercüme", titleEn: "Documents & Translation", description: "Apostil, yeminli tercüme, diploma ve belge kontrolü.", signal: "yüksek" },
  { id: "community", title: "Topluluk & Gruplar", titleEn: "Community & Groups", description: "Şehir, okul ve bölüm bazlı moderasyonlu öğrenci toplulukları.", signal: "yüksek" },
  { id: "jobs", title: "İş & Staj", titleEn: "Jobs & Internships", description: "Öğrenci işi, staj ve mezuniyet sonrası kariyer fırsatları.", signal: "yüksek" },
  { id: "transport", title: "Ulaşım & Seyahat", titleEn: "Transport & Travel", description: "Öğrenci kartları, şehir içi ulaşım, tren ve seyahat fırsatları.", signal: "yüksek" },
  { id: "health", title: "Sağlık & Sigorta", titleEn: "Health & Insurance", description: "Sigorta, doktor, acil durum ve yerel sağlık sistemi.", signal: "yüksek" },
  { id: "connectivity", title: "Hat & İnternet", titleEn: "Mobile & Internet", description: "SIM kart, internet, abonelik ve temel yerleşim ihtiyaçları.", signal: "gelişen" },
  { id: "safety", title: "Güvenli Yardım", titleEn: "Verified Help", description: "Doğrulama, moderasyon, şikâyet, dolandırıcılık uyarısı ve destek.", signal: "çok yüksek" },
];

export const PORTAL_PLANS: PortalPlan[] = [
  {
    id: "basic",
    name: "Basic",
    monthly: 4.99,
    yearly: 49,
    includedCredits: 10,
    description: "Doğrulanmış öğrenci topluluğuna ve temel araçlara eriş.",
    features: [
      "Aktif ücretli üyelik",
      "10 başlangıç kredisi",
      "Ülke, şehir, kurum ve bölüm dizini",
      "Favoriler ve ilan mesajlaşması",
      "Doğrulama başvurusu",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthly: 8.99,
    yearly: 89,
    includedCredits: 30,
    description: "Başvuru ve yerleşme sürecini tek yerde yönet.",
    featured: true,
    features: [
      "Basic'teki her şey",
      "30 üyelik kredisi",
      "Son tarih ve belge planlayıcı",
      "Doğrulanmış topluluklar",
      "Kişiselleştirilmiş bildirimler",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19.99,
    yearly: 199,
    includedCredits: 80,
    description: "İlan verenler ve yoğun kullanan öğrenciler için profesyonel çalışma alanı.",
    features: [
      "Plus'taki her şey",
      "80 üyelik kredisi",
      "Akıllı ülke ve program eşleştirme",
      "Güvenli belge çalışma alanı",
      "Öncelikli moderasyon ve gelişmiş ilan araçları",
    ],
  },
];

export const LISTING_CREDIT_COSTS = {
  housing: 12,
  dormitory: 18,
  scholarships: 8,
  marketplace: 5,
  roommates: 7,
  community: 6,
  jobs: 10,
  services: 12,
} as const;

export const CREDIT_PACKS = [
  { id: "credits-25", credits: 25, price: 9.99 },
  { id: "credits-75", credits: 75, price: 24.99 },
  { id: "credits-200", credits: 200, price: 54.99 },
] as const;

export function getCheckoutUrl(plan: "basic" | "plus" | "pro", yearly: boolean) {
  const env = import.meta.env as Record<string, string | undefined>;
  const suffix = yearly ? "YEARLY" : "MONTHLY";
  const key = "VITE_STRIPE_" + plan.toUpperCase() + "_" + suffix + "_URL";
  return env[key] || "/iletisim?intent=portal-membership&plan=" + plan;
}
