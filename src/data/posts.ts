export type Post = {
  slug: string;
  category: "erasmus" | "visa" | "sop" | "statistics" | "thesis" | "scholarship";
  title: string;
  excerpt: string;
  date: string;
  minutes: number;
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "avrupada-ogrencilerin-en-cok-sordugu-sorular",
    category: "visa",
    title: "Avrupa’da Öğrencilerin En Çok Sorduğu Sorular: 2026 Görselli Rehber",
    excerpt:
      "22 öğrenci topluluğundaki 20.701 anonim mesajdan çıkan vize, üniversite, iş, belge, barınma ve banka sorularına resmî kaynaklı yanıtlar.",
    date: "2026-08-23",
    minutes: 14,
    body: [
      "Avrupa'da eğitim planlayan öğrencilerin en sık sorduğu vize, üniversite, çalışma, belge, konaklama ve finans sorularını tek rehberde topladık.",
      "Her başlıkta öğrencilerin gerçek karar noktalarını, resmî kaynaklarla doğrulanmış kontrol listelerini ve uygulanabilir sonraki adımları bulabilirsiniz.",
    ],
  },
  {
    slug: "almanya-bloke-hesap-sperrkonto-rehberi",
    category: "visa",
    title: "Almanya Bloke Hesap (Sperrkonto) Rehberi 2026",
    excerpt:
      "Alman öğrenci vizesi için bloke hesap nasıl açılır? 2026 tutarı, gerekli belgeler ve sağlayıcı karşılaştırması.",
    date: "2026-08-03",
    minutes: 10,
    body: [
      "Almanya öğrenci vizesinde bloke hesap, yaşam giderlerini karşılayabileceğinizi kanıtlayan temel finansal belgelerden biridir.",
      "Başvuru öncesinde güncel tutarı, sağlayıcı ücretlerini, para transferi süresini ve bloke hesabın açılma belgesini birlikte kontrol edin.",
    ],
  },
  {
    slug: "yurt-disi-yuksek-lisans-basvuru-rehberi",
    category: "scholarship",
    title: "Yurt Dışı Yüksek Lisans Başvuru Rehberi 2026",
    excerpt:
      "Almanya, ABD ve İngiltere için yüksek lisans başvurularında zaman çizelgesi, belgeler ve burs fırsatları.",
    date: "2026-05-12",
    minutes: 9,
    body: [
      "Yurt dışı yüksek lisans başvurularında doğru planlama, kabul oranınızı doğrudan etkiler. Programlar 12–18 ay öncesinden hazırlık ister.",
      "İlk adım: hedef ülke ve program belirleme. Akademik ortalama, dil yeterliliği (IELTS/TOEFL), motivasyon ve araştırma profili eşleşmeli.",
      "Belge seti genellikle SOP, akademik CV, 2–3 referans mektubu, transkript ve dil belgesinden oluşur. Her üniversitenin özel formatı ayrıca incelenmelidir.",
      "Burs fırsatları: DAAD (Almanya), Chevening (UK), Fulbright (ABD), Erasmus Mundus, üniversite kaynaklı GA / TA pozisyonları.",
      "Profesyonel danışmanlık, başvuru takvimini optimize ederek son dakikadaki belge eksikliklerini ve düşük SOP kalitesini önler.",
    ],
  },
  {
    slug: "schengen-vizesi-akademik-basvuru",
    category: "visa",
    title: "Schengen Öğrenci Vizesi: Akademik Başvuru İpuçları",
    excerpt:
      "Almanya, Hollanda ve Fransa öğrenci vizeleri için belge listesi, finansal kanıt ve mülakat hazırlığı.",
    date: "2026-04-22",
    minutes: 7,
    body: [
      "Schengen öğrenci vizeleri, ülkeye göre değişen belge setleri ister; ortak nokta finansal kanıt, sağlık sigortası ve kabul mektubudur.",
      "Almanya için bloke hesap (Sperrkonto) zorunlu; Hollanda'da üniversite çoğunlukla başvuruyu kendi yapar; Fransa'da Campus France ön onayı gerekir.",
      "Vize randevuları yoğun dönemlerde 4–8 hafta sürebilir; başvurunuzu kabul mektubu eline geçer geçmez planlayın.",
      "Mülakat sorularına net, kısa ve tutarlı yanıtlar verin. Geri dönüş niyetinizi ve finansal planınızı açıkça belirtin.",
    ],
  },
  {
    slug: "etkili-niyet-mektubu-sop-yazimi",
    category: "sop",
    title: "Etkili Niyet Mektubu (SOP) Nasıl Yazılır?",
    excerpt:
      "Kabul komitelerinin dikkatini çeken bir SOP'un yapısı: hook, akademik arka plan, hedefler ve program uyumu.",
    date: "2026-04-05",
    minutes: 8,
    body: [
      "SOP, akademik kariyerinizin hikayesidir. Klişe açılışlardan kaçının; somut, kişisel ve programa özel bir narrative kurun.",
      "Yapı: güçlü bir giriş (hook), akademik arka plan, araştırma deneyimi, kariyer hedefleri ve programla net bir uyum bölümü.",
      "Her cümle ya bir kanıt ya da bir argüman olmalı. Genel ifadelerden (örn. 'her zaman bilimi sevmişimdir') kaçının.",
      "İdeal uzunluk 700–1000 kelime; ayrı bir program varsa formatına birebir uyun.",
    ],
  },
  {
    slug: "spss-r-istatistik-analiz-tez",
    category: "statistics",
    title: "Tezler İçin SPSS ve R ile İstatistiksel Analiz",
    excerpt:
      "Hangi analizi nerede kullanmalı: t-testi, ANOVA, regresyon, yapısal eşitlik modeli (SEM) ve raporlama.",
    date: "2026-03-18",
    minutes: 10,
    body: [
      "İstatistiksel analiz seçimi, hipotez tipi ve veri yapısına bağlıdır. Yanlış test seçimi, tezin geçerliliğini zedeler.",
      "İki grup karşılaştırması için bağımsız örneklem t-testi veya Mann-Whitney; üç ve üzeri grup için ANOVA veya Kruskal-Wallis kullanılır.",
      "İlişkisel modellerde çoklu regresyon, yapısal model testleri için SEM (AMOS / SmartPLS) tercih edilir. Geçerlilik ve güvenirlik testleri (CFA, Cronbach α) raporlanmalıdır.",
      "APA 7 formatında raporlama: test istatistiği, serbestlik derecesi, p değeri ve etki büyüklüğü birlikte verilir.",
    ],
  },
  {
    slug: "erasmus-plus-2026-firsatlari",
    category: "erasmus",
    title: "Erasmus+ 2026: Yeni Fırsatlar ve Başvuru Stratejisi",
    excerpt:
      "Erasmus+ öğrenim, staj ve doktora hareketliliği için 2026 dönemi başvurularında dikkat edilmesi gerekenler.",
    date: "2026-02-28",
    minutes: 6,
    body: [
      "Erasmus+ programı, AB üyesi ve ortak ülkelerde 3–12 ay arası eğitim veya staj imkânı sunar.",
      "Başvuru süreci: üniversite koordinatörlüğüne ön başvuru, dil yeterliliği, akademik ortalama ve motivasyon mülakatı.",
      "Doktora hareketliliğinde uygun bir host kurum bulmak kritik; danışmanınızla iş birliği yaparak host bulun.",
      "Hibe miktarları ülke kategorisine göre değişir; yaşam maliyetinin tamamını karşılamayabileceği için ek bütçe planı yapın.",
    ],
  },
  {
    slug: "doktora-tez-yazimi-aksamak",
    category: "thesis",
    title: "Doktora Tezi Yazımında Aksamamak İçin 6 Strateji",
    excerpt:
      "Literatür taramasından savunmaya kadar tezinizi zamanında bitirmek için kanıta dayalı çalışma teknikleri.",
    date: "2026-02-10",
    minutes: 11,
    body: [
      "Doktora tezi bir maratondur; günlük kısa yazma seansları (Pomodoro / Cal Newport 'deep work') büyük blokları parçalara böler.",
      "Bölüm bazlı milestone'lar belirleyin: literatür özeti → metodoloji → veri toplama → analiz → tartışma.",
      "Literatür yönetimi için Zotero veya Mendeley şart; alıntıları manuel toplama yapmayın.",
      "Danışmanınızla 2–4 haftada bir düzenli ilerleme görüşmesi yapın; geri bildirim döngüsünü kısa tutun.",
      "Akademik yazım koçluğu, blok dönemlerini önemli ölçüde azaltır.",
    ],
  },
];

export const POST_CATEGORIES = [
  "all",
  "erasmus",
  "visa",
  "sop",
  "statistics",
  "thesis",
  "scholarship",
] as const;
