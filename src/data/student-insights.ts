export const CHAT_ANALYSIS_SUMMARY = {
  groups: 22,
  parsedMessages: 24_607,
  analyzedMessages: 20_701,
  excludedSystemOrMedia: 3_906,
  questionLikeMessages: 3_606,
  analyzedAt: "2026-08-23",
} as const;

export const TOP_QUESTION_TOPICS = [
  {
    id: "vize-oturum",
    label: "Vize, oturum ve randevu",
    count: 789,
    description: "Doğru izin türü, randevu, süre ve ülkeye göre işlem sırası.",
  },
  {
    id: "universite-basvuru",
    label: "Üniversite başvuru ve kayıt",
    count: 456,
    description: "Kabul koşulları, kayıt adımları, son tarihler ve kurum doğrulama.",
  },
  {
    id: "is-staj",
    label: "İş, staj ve çalışma izni",
    count: 284,
    description: "Öğrenciyken çalışma, staj bulma ve mezuniyet sonrası seçenekler.",
  },
  {
    id: "belge-apostil",
    label: "Belge, apostil ve denklik",
    count: 246,
    description: "Hangi belgenin nerede onaylanacağı, tercüme ve tanınma süreçleri.",
  },
  {
    id: "barinma",
    label: "Barınma, kira ve depozito",
    count: 220,
    description: "Ev/yurt bulma, sözleşme kontrolü, depozito ve dolandırıcılık riski.",
  },
  {
    id: "banka-odeme",
    label: "Banka, ödeme ve vergi numarası",
    count: 193,
    description: "Hesap açma, IBAN/SWIFT, ilk ödemeler ve yerel kayıt numaraları.",
  },
] as const;

export const TOP_QUESTION_INTENTS = [
  { label: "Hangi belgeler gerekli?", count: 615 },
  { label: "Nasıl yapılır?", count: 346 },
  { label: "Ne kadar tutar?", count: 305 },
  { label: "Hangi seçenek doğru?", count: 296 },
  { label: "Uygun muyum / kabul edilir mi?", count: 197 },
  { label: "Ne zaman / ne kadar sürer?", count: 154 },
] as const;

export const TOP_CITY_MENTIONS = [
  { city: "Madrid", count: 168 },
  { city: "Barcelona", count: 47 },
  { city: "Amsterdam", count: 36 },
  { city: "Berlin", count: 35 },
  { city: "Padova", count: 23 },
  { city: "Valencia", count: 22 },
  { city: "Porto", count: 18 },
  { city: "Riga", count: 13 },
] as const;
