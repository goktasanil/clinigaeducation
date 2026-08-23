export type ServiceDetail = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  duration: string;
  idealFor: string[];
  deliverables: string[];
  process: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  boundary: string;
};

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    slug: "yurt-disi-egitim-danismanligi",
    title: "Yurt Dışı Eğitim Danışmanlığı",
    shortTitle: "Eğitim Danışmanlığı",
    eyebrow: "Lisans · Master · Doktora",
    summary:
      "Profilinize, bütçenize ve kariyer hedefinize göre ülke ve program kısa listesi oluşturur; başvuru dosyanızı son tarihlere göre yönetiriz.",
    duration: "Hedef döneme göre genellikle 2–6 ay",
    idealFor: [
      "Ülke ve program seçimini veriye dayalı yapmak isteyenler",
      "Birden fazla üniversiteye kontrollü biçimde başvuracak adaylar",
      "Burs, belge ve son tarih takibini tek planda görmek isteyenler",
    ],
    deliverables: [
      "Profil ve hedef analizi",
      "Gerekçeli üniversite/program kısa listesi",
      "Başvuru ve belge takvimi",
      "SOP, CV ve referans stratejisi",
      "Başvuru öncesi son dosya kontrolü",
    ],
    process: [
      {
        title: "Profil analizi",
        description: "Akademik geçmiş, dil, bütçe ve kariyer hedefi birlikte değerlendirilir.",
      },
      {
        title: "Kısa liste",
        description: "Erişilebilir, dengeli ve iddialı seçenekler gerekçeleriyle ayrıştırılır.",
      },
      {
        title: "Dosya hazırlığı",
        description: "Her programın beklentisine göre belge planı ve anlatı kurgusu oluşturulur.",
      },
      {
        title: "Başvuru takibi",
        description: "Teslim, ek belge, görüşme ve sonuç adımları tek çizelgede izlenir.",
      },
    ],
    faqs: [
      {
        question: "Kabul garantisi veriyor musunuz?",
        answer:
          "Hayır. Kabul kararı üniversiteye aittir. Biz profil-program uyumunu, dosya kalitesini ve süreç disiplinini güçlendiririz.",
      },
      {
        question: "Kaç üniversiteye başvurmalıyım?",
        answer:
          "Sayı; ülke, bölüm, bütçe ve profil rekabetine göre belirlenir. Ön görüşmede dengeli bir başvuru portföyü oluşturulur.",
      },
      {
        question: "Burs başvurusu dahil mi?",
        answer:
          "Seçilen kapsama göre burs araştırması, uygunluk kontrolü ve belge planı hizmete eklenebilir.",
      },
    ],
    boundary:
      "Üniversite veya konsolosluk adına karar verilmez; kesin kabul, burs ya da vize sonucu vaat edilmez.",
  },
  {
    slug: "vize-oturum-danismanligi",
    title: "Vize ve Oturum Danışmanlığı",
    shortTitle: "Vize & Oturum",
    eyebrow: "Öğrenci · Araştırmacı · Aile",
    summary:
      "Başvuru türüne uygun evrak listesini, zamanlamayı ve tutarlılık kontrolünü yönetir; resmi kaynaklarla doğrulanmış bir dosya hazırlamanıza yardımcı oluruz.",
    duration: "Dosya hazırlığı çoğunlukla 1–4 hafta; resmi işlem süresi kuruma bağlıdır",
    idealFor: [
      "İlk kez öğrenci veya araştırmacı vizesine başvuracaklar",
      "Finansal belge ve konaklama kanıtını doğru kurgulamak isteyenler",
      "Red sonrası gerekçeyi analiz edip yeniden başvuracaklar",
    ],
    deliverables: [
      "Güncel resmi evrak kontrol listesi",
      "Kişisel zaman ve randevu planı",
      "Form ve destekleyici belge incelemesi",
      "Mülakat/başvuru günü hazırlığı",
      "Risk ve eksik belge raporu",
    ],
    process: [
      {
        title: "Vize türü doğrulama",
        description:
          "Ülke, eğitim türü ve kalış süresine göre doğru başvuru kategorisi belirlenir.",
      },
      {
        title: "Belge matrisi",
        description: "Zorunlu ve destekleyici belgeler, kaynaklarıyla birlikte listelenir.",
      },
      {
        title: "Tutarlılık kontrolü",
        description: "Form, finans, konaklama ve eğitim anlatısındaki çelişkiler giderilir.",
      },
      {
        title: "Başvuru hazırlığı",
        description: "Randevu günü, olası sorular ve takip adımları netleştirilir.",
      },
    ],
    faqs: [
      {
        question: "Vize garantisi veriyor musunuz?",
        answer:
          "Hayır. Nihai karar yetkili temsilciliğe aittir; danışmanlık dosyanın doğruluğunu ve tutarlılığını artırmaya yöneliktir.",
      },
      {
        question: "Red dosyalarını inceliyor musunuz?",
        answer:
          "Evet. Red gerekçesi, önceki form ve belgeler birlikte incelenerek yeniden başvuru riskleri raporlanır.",
      },
      {
        question: "Randevu buluyor musunuz?",
        answer:
          "Randevu sistemine erişim ve resmi kurallar ülkeye göre değişir. Uygun kanalları ve zamanlama stratejisini açıklarız; yasa dışı aracı kullanılmaz.",
      },
    ],
    boundary:
      "Resmi makamların işlem süresi ve kararı kontrolümüz dışındadır; sahte veya yanıltıcı belgeyle çalışılmaz.",
  },
  {
    slug: "tez-danismanligi",
    title: "Etik Tez Danışmanlığı",
    shortTitle: "Tez Danışmanlığı",
    eyebrow: "Yüksek Lisans · Doktora",
    summary:
      "Araştırma sorusu, literatür, metodoloji ve akademik anlatım için yapılandırılmış geri bildirim sunar; öğrencinin kendi çalışmasını güçlendirmesini sağlarız.",
    duration: "Kapsama göre 4 hafta–12 ay",
    idealFor: [
      "Konu ve araştırma sorusunu daraltmak isteyenler",
      "Metodoloji veya bölüm yapısında desteğe ihtiyaç duyanlar",
      "Savunma öncesi bütüncül kalite kontrolü arayanlar",
    ],
    deliverables: [
      "Araştırma sorusu ve kapsam geri bildirimi",
      "Bölüm bazlı yapı planı",
      "Metodoloji karar matrisi",
      "Kaynak ve atıf tutarlılığı kontrolü",
      "Savunma sunumu ve soru hazırlığı",
    ],
    process: [
      {
        title: "Kapsam",
        description:
          "Üniversite yönergesi, teslim tarihi ve mevcut metin üzerinden ihtiyaç haritası çıkarılır.",
      },
      {
        title: "Yöntem",
        description:
          "Araştırma sorusuyla uyumlu desen, örneklem ve analiz yaklaşımı değerlendirilir.",
      },
      {
        title: "Bölüm geri bildirimi",
        description: "Taslaklar argüman, kaynak, yöntem ve anlatım açısından notlandırılır.",
      },
      {
        title: "Son kontrol",
        description: "Biçim, atıf, sınırlılıklar ve savunma hazırlığı birlikte gözden geçirilir.",
      },
    ],
    faqs: [
      {
        question: "Tezi benim yerime yazar mısınız?",
        answer:
          "Hayır. Öğrenci adına tez veya ödev yazılmaz. Yalnızca eğitim, yöntem, yapı ve editöryal geri bildirim verilir.",
      },
      {
        question: "Danışmanımla gelen geri bildirimleri ele alabilir miyiz?",
        answer:
          "Evet. Geri bildirimler bir aksiyon listesine çevrilir ve sizin uygulamanız için açıklanır.",
      },
      {
        question: "İntihal kontrolü nasıl ele alınıyor?",
        answer:
          "Kaynak kullanımı, doğrudan alıntılar ve atıf düzeni incelenir; amaç metni gizlemek değil akademik bütünlüğü güçlendirmektir.",
      },
    ],
    boundary:
      "Öğrenci adına metin üretimi, veri uydurma, intihal gizleme veya etik dışı işlem yapılmaz.",
  },
  {
    slug: "istatistik-analizi",
    title: "İstatistik Analizi ve Metodoloji",
    shortTitle: "İstatistik Analizi",
    eyebrow: "SPSS · R · Python · AMOS",
    summary:
      "Araştırma sorusundan veri temizliğine, uygun test seçiminden sonuçların akademik yorumuna kadar yeniden üretilebilir bir analiz akışı kurarız.",
    duration: "Veri ve kapsam hazırsa çoğunlukla 1–4 hafta",
    idealFor: [
      "Hangi analizin uygun olduğundan emin olmayan araştırmacılar",
      "Veri temizleme ve varsayım kontrollerine ihtiyaç duyanlar",
      "Bulgularını APA veya dergi formatında raporlayacaklar",
    ],
    deliverables: [
      "Analiz planı ve değişken sözlüğü",
      "Veri kalite ve eksik değer raporu",
      "Varsayım kontrolleri ve analiz çıktıları",
      "Tablo/grafik paketi",
      "Yorumlama oturumu ve yöntem notu",
    ],
    process: [
      {
        title: "Araştırma tasarımı",
        description: "Hipotezler, değişken türleri ve örneklem yapısı doğrulanır.",
      },
      {
        title: "Veri denetimi",
        description: "Eksik değer, aykırı gözlem, kodlama ve dağılım kontrolleri yapılır.",
      },
      {
        title: "Analiz",
        description: "Uygun model çalıştırılır; varsayımlar ve alternatifler raporlanır.",
      },
      {
        title: "Raporlama",
        description: "Sonuçlar tablo, grafik ve akademik yorumlama notlarıyla teslim edilir.",
      },
    ],
    faqs: [
      {
        question: "Hangi programları kullanıyorsunuz?",
        answer: "İhtiyaca göre SPSS, R, Python, AMOS, SmartPLS, Stata veya NVivo kullanılabilir.",
      },
      {
        question: "Ham veriyi paylaşmak güvenli mi?",
        answer:
          "Kişisel veriler mümkün olduğunca anonimleştirilmeli ve yalnızca gerekli değişkenler paylaşılmalıdır.",
      },
      {
        question: "Sonuçların anlamlı çıkması garanti mi?",
        answer:
          "Hayır. Analiz bilimsel olarak uygun şekilde yürütülür; istenen sonuca göre veri veya yöntem değiştirilmez.",
      },
    ],
    boundary: "Sonuç manipülasyonu, veri uydurma veya p-değeri odaklı etik dışı analiz yapılmaz.",
  },
  {
    slug: "belge-inceleme",
    title: "SOP, CV ve Belge İnceleme",
    shortTitle: "Belge İnceleme",
    eyebrow: "SOP · CV · Referans",
    summary:
      "Başvuru belgelerinizin programa özgü, tutarlı ve kanıta dayalı bir anlatı kurmasını sağlayan editöryal ve stratejik geri bildirim sunarız.",
    duration: "Belge sayısına göre çoğunlukla 2–7 iş günü",
    idealFor: [
      "SOP veya motivasyon mektubunu güçlendirmek isteyenler",
      "Akademik CV'sini hedef programa uyarlayacak adaylar",
      "Başvuru dosyasında anlatı tutarlılığı arayanlar",
    ],
    deliverables: [
      "Yapı ve mesaj değerlendirmesi",
      "Satır içi editöryal geri bildirim",
      "Programa uyum kontrolü",
      "Dil, ton ve tekrar kontrolü",
      "Son sürüm kalite kontrol listesi",
    ],
    process: [
      {
        title: "Brief",
        description: "Program beklentisi, kelime sınırı ve adayın özgün deneyimleri toplanır.",
      },
      {
        title: "İlk inceleme",
        description: "Yapı, kanıt, özgünlük ve hedef uyumu açısından ana sorunlar işaretlenir.",
      },
      {
        title: "Revizyon",
        description: "Aday kendi metnini geliştirir; yeni sürüm odaklı biçimde yeniden incelenir.",
      },
      {
        title: "Son kontrol",
        description: "Biçim, dil, tutarlılık ve teslim gereklilikleri doğrulanır.",
      },
    ],
    faqs: [
      {
        question: "SOP'yi sıfırdan siz mi yazıyorsunuz?",
        answer:
          "Metin adayın deneyimi ve sesi üzerine kurulmalıdır. Biz yapı, anlatı ve editöryal geri bildirim sağlarız; gerçeğe aykırı içerik üretmeyiz.",
      },
      {
        question: "Kaç revizyon dahil?",
        answer: "Revizyon sayısı seçilen kapsama göre teklif ve sözleşmede açıkça belirtilir.",
      },
      {
        question: "İngilizce dil kontrolü yapılıyor mu?",
        answer:
          "Evet; seçilen hizmet kapsamında dil, ton ve akademik anlatım kontrolü yapılabilir.",
      },
    ],
    boundary: "Adayın deneyimi, başarısı veya referansı hakkında gerçek dışı beyan oluşturulmaz.",
  },
  {
    slug: "akademik-yayin-destegi",
    title: "Makale ve Akademik Yayın Desteği",
    shortTitle: "Yayın Desteği",
    eyebrow: "Dergi Seçimi · Revizyon · Hakem Yanıtı",
    summary:
      "Çalışmanın kapsamına uygun dergi seçimi, raporlama standardı, editöryal kalite ve hakem yanıtı sürecinde etik danışmanlık sunarız.",
    duration: "İlk editöryal tur çoğunlukla 2–8 hafta; hakem süresi dergiye bağlıdır",
    idealFor: [
      "Makalesini dergi kapsamına uyarlamak isteyen araştırmacılar",
      "Hakem yorumlarına sistemli yanıt hazırlayacak yazarlar",
      "Raporlama rehberleri ve format kontrolüne ihtiyaç duyanlar",
    ],
    deliverables: [
      "Dergi uyum ve risk değerlendirmesi",
      "Makale yapı ve raporlama kontrolü",
      "Kaynak/format kontrol listesi",
      "Hakem yanıt matrisi",
      "Gönderim öncesi kalite raporu",
    ],
    process: [
      {
        title: "Uygunluk",
        description: "Makalenin konusu, yöntemi ve olgunluk düzeyi hedef dergiyle karşılaştırılır.",
      },
      {
        title: "Editöryal tur",
        description: "Argüman, yöntem şeffaflığı, tablo ve raporlama standartları incelenir.",
      },
      {
        title: "Gönderim planı",
        description: "Dergi gereklilikleri, ek dosyalar ve kontrol listesi tamamlanır.",
      },
      {
        title: "Revizyon",
        description:
          "Hakem talepleri yanıt matrisiyle izlenir; değişiklikler yazar tarafından uygulanır.",
      },
    ],
    faqs: [
      {
        question: "Yayın garantisi veriyor musunuz?",
        answer:
          "Hayır. Editör ve hakem kararı bağımsızdır. Hizmet, çalışma kalitesini ve gönderim uyumunu geliştirmeye yöneliktir.",
      },
      {
        question: "Dergi seçimine yardımcı oluyor musunuz?",
        answer:
          "Evet. Kapsam, indeks, yayın modeli, süre ve etik riskler karşılaştırılarak gerekçeli kısa liste hazırlanabilir.",
      },
      {
        question: "Hakem yanıtını siz mi yazıyorsunuz?",
        answer:
          "Yanıt stratejisi ve matrisi oluşturulur; bilimsel kararlar ve nihai yanıt yazarların sorumluluğundadır.",
      },
    ],
    boundary: "Yazarlık satışı, sahte veri, sonuç manipülasyonu veya yayın garantisi sunulmaz.",
  },
];

export const getServiceDetail = (slug: string) =>
  SERVICE_DETAILS.find((service) => service.slug === slug);
