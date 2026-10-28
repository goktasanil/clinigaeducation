# CliniGA Education: UX, içerik ve SEO düzenlemeleri

Mevcut lacivert, teal ve altın renkleri, tipografi ve bileşen yapısı korunur. Blogdaki 1.000 konu / 10.000 makale sayfası bu çalışmanın kapsamı dışında korunur.

| Ne değişti | Dosya veya bileşen | Önceki → sonraki |
|---|---|---|
| FAQ | `FAQ.tsx`, 9 dil dosyası | JS ile yüklenen cevap → sunucu HTML’sinde kendi sorusunun altındaki, klavye ile de çalışan native accordion. |
| Ücret sorusu | Dil dosyaları, `site-faq.ts` | “Yatırım nasıl belirlenir?” → “Ücretler nasıl belirlenir?”; mevcut kapsam esaslı yazılı teklif açıklaması. Fiyat ve taksit uydurulmadı. |
| Akademik etik | FAQ, Footer | Footer’da uzun cevap → kısa not ve FAQ’daki tam cevaba bağlantı. |
| Başlık ve hero | `index.tsx`, `Hero.tsx` | Portal ağırlıklı/soyut başlık → “Yurt Dışı Eğitim ve Akademik Danışmanlık”; title/H1 tutarlı. |
| CTA hiyerarşisi | Hero, CTASection, Header, PortalTeaser | Tekrarlayan Portal ve süreç çağrıları → ana hedefler ön görüşme ve ücretsiz profil testi; Portal ikincil bağlantı. |
| Test metinleri | Dil dosyaları, QuizTeaser | “Testi Başlat”, “Lead Magnet” → ücretsiz profil testini açıklayan etiketler. Ham rota görünür metin olarak kullanılmaz. |
| WhatsApp | `site.ts`, WhatsAppFAB, Footer | Buton etiketi mesaj olarak gönderiliyor → “Merhaba, … hakkında bilgi almak istiyorum.”; blog bağlamlı mesajları korunur. |
| Ana iletişim | `site.ts`, `iletisim.tsx` | Farklı +90/+39 numaraları → mevcut +39 344 675 9253 telefon/WhatsApp; WhatsApp ana kanal, Roma/İtalya ve Europe/Rome açık. |
| E-posta | `site.ts`, ortak iletişim alanları | Gmail → kullanıcının istediği `info@clinigaeducation.com`. Bu değişiklik posta kutusu oluşturmaz. |
| İletişim/randevu | ContactForm, AppointmentPicker | Ziyaretçinin saat dilimine göre kayabilen saat → yaz/kış saatini bilen Roma saati; seçilen saat teyit bekleyen talep olarak anlatılır. |
| Form yönlendirmeleri | PackagesGrid, contact-prefill | E-posta uygulaması / eşleşmeyen alan → gerçek iletişim formu, izin verilen paket ve hizmet seçimi; bildirim/veri tabanı altyapısı değiştirilmez. |
| Blog menüsü | Header, blog route | Yalnız açılır menü → tıklanabilir Blog metni ve ayrı menü oku. Canonical giriş `/tr/blog`. Worker yönlendirmesi 301; statik hosting sınırı aşağıda. |
| Çerez paneli | CookieConsent, consent, AdSenseLoader | İki karar düğmesi → mevcut tercihi gösteren panel, reklam anahtarı, kaydetme/ret/kabul; geri çekme ve yazılamayan depolama durumları korunur. |
| Paket özeti | `index.tsx`, PackagesGrid | Ana sayfada yok → üç kısa özet, mevcut kapsam metinleri, kişiye özel teklif ve tüm paketler bağlantısı. |
| Uzmanlık ve ekip | ExpertTeaser, TeamProfiles, about-content | Belirsiz “10+ yıl/PhD” iddiaları → çalışma kapsamı özeti ve doğrulanmış ekip kaydı altyapısı. |
| Öğrenci hikâyeleri | StudentStories, about-content, dil dosyaları | Kullanılmayan sahte isim/yorumlar → üç boş editoryal şablon; gerçek metin ve kayıtlı yayın izni olmadan gösterilmez. |
| Akademik yazarlık | ServicesGrid, hizmet detayları, academic-integrity | Dolaylı açıklama → tez, SOP/belge ve makale kartlarında ve sayfalarında “Metni müşteri yazar; biz yöntem, yapı, dil ve istatistik rehberliği veririz.” |
| Sonuç vaatleri | Dil dosyaları, serviceDetails | “Sonuç alana kadar”, başkası adına metin hazırlama çağrışımı → kapsam ve takvime bağlı destek, öğrencinin yazarlığı, yeniden değerlendirme. |
| Üniversite adları | UniversityLogos | Soluk not → listenin hemen altında belirgin resmî ortaklık/temsil olmadığını açıklayan not. |
| Yasal sayfalar | kvkk, cerez-politikasi, mesafeli-satis-iade, gizlilik, kullanim-kosullari | Dağınık/eksik metinler → ayrı belgeler ve footer bağlantıları; bilinmeyen veriler tahmin edilmez. |
| Ticari alanlar | legal.ts, Footer | Yok → ticari unvan/vergi alanları; gerçek bilgiler tamamlanınca footer’da gösterilir. |
| Yapılandırılmış veri | __root, site-faq, hizmet sayfaları | Tekrarlanan/uyumsuz FAQ cevapları ve işletme alanları → ortak Organization kimliği, görünür FAQ ile aynı cevaplar, hizmete özel Service. |
| Meta keywords | index, iletisim, quiz, portal | Eski anahtar kelime etiketleri → kaldırıldı; doğrulanmamış Erasmus+ hizmeti eklenmedi. Dil/sınav kaynaklarına mevcut yönlendirme korunur. |
| Görsel alternatifleri | BlogTeaser, MobileConversionBar | Boş teaser görsel altı → mevcut gerçek fotoğraf açıklaması; mobil altın düğmenin metin kontrastı düzeltildi. Dekoratif görsellerin her biri anlatım gerektirmez. |
| İngilizce altyapısı | LanguageSwitcher, blog hreflang | Mevcut seçici ve gerçek 10 dil blog alternatifleri korundu; dil adları `lang` ile işaretlendi. Türkçe SSR veren sayfalara sahte `/en` alternatifi eklenmedi. |

## Uygulanmayanlar ve dış bağımlılıklar

- Gerçek kabul/vize/öğrenci sayıları olmadan sayısal güven şeridi eklenmedi.
- İsim, unvan, deneyim ve izin verisi olmadan kişi profili veya öğrenci yorumu yayımlanmadı. Doldurulacak taslaklar kaynakta hazırdır; boş kartlar ziyaretçiye gösterilmez.
- Mevcut 1.000 konuya tekrar içerik eklemek yerine aşağıdaki altı yazı için kaynak kontrolü ve güncelleme takvimi önerildi. Bu bir otomasyon veya yeni yayın yapılmış olduğu iddiası değildir.
- GitHub Pages, `/blog/` dosyasını HTTP200 ile sunup HTML/JavaScript üzerinden `/tr/blog` adresine geçirir. Worker’daki 301 kodu bu statik hostta çalışmaz. Gerçek `/blog` → `/tr/blog` HTTP301 için CDN/hosting yönlendirme kuralı gerekir; DNS/hosting taşıması yapılmadı.
- Kurumsal posta kutusu açma, MX/DKIM ayarı ve gerçek posta teslimi bu kod değişikliğiyle doğrulanmış sayılmaz.
- KVKK ve satış/iade belgeleri eksik ticari ve işletim bilgileri nedeniyle taslaktır, `noindex, follow` kullanır ve sitemap’e alınmaz. Çerez politikası ve teknik gizlilik özeti indekslenebilir. Hukuki uygunluk onayı verilmez.
- FAQPage teknik işaretlemesi arama sonuçlarında FAQ zengin görünümü garantilemez.

## [DOLDUR] bekleyen bilgiler

1. `src/data/legal.ts`: tam ticari unvan, kayıtlı açık adres/ülke, vergi ülkesi/daire/KDV veya vergi numarası, uygulanıyorsa sicil/MERSİS/REA.
2. `src/components/contact/contact-copy.ts`: açık adres/posta kodu, yüz yüze hizmet uygunluğu, doğrulanmış ortalama yanıt süresi. Şimdilik kamuya açık kartlarda gösterilmez.
3. `src/data/about-content.ts`: danışmanın adı, doğrulanmış unvan/uzmanlık/deneyim/profil; üç hikâyenin gerçek içeriği, sonuç bilgisi ve özel izin kaydı referansı. Kimlik veya izin belgesinin kendisi depoya konulmaz.
4. `src/data/academic-integrity.ts`: hukuki inceleme ve onay bilgisi.
5. KVKK/satış taslakları: gerçek veri envanteri, alıcı/aktarım ve saklama-silme süreleri, resmî başvuru yolu; hizmet ön bilgisi, uygulanabilir hukuk ve cayma/erken başlama/iade usulü.
6. `info@clinigaeducation.com`: posta kutusunun oluşturulması ve teslim kontrolü.

## Altı yazılık güncelleme takvimi önerisi

Tarihler Europe/Berlin yerel takvimine göredir. Her güncellemede yazının bağlı olduğu resmî ülke kaynağı yeniden kontrol edilir; arama hacmi veya sıralama vaadi verilmez.

| Önerilen tarih | Mevcut yazı | Güncelleme odağı |
|---|---|---|
| 2026-11-02 | [İtalya: Burs ilk ödemesi varıştan sonra yapılacaksa ilk ayın kullanılabilir bütçesini önceden planlamak](https://www.clinigaeducation.com/tr/blog/archive/it-grant-paid-after-arrival) | Burs ödeme takvimi, ilk ay bütçesi ve ön koşullar; ilgili resmî kaynakların yeniden kontrolü. |
| 2026-11-05 | [Almanya: değişim, staj ve kısa eğitimde doğru izin türünü belirlemek](https://www.clinigaeducation.com/tr/blog/archive/de-visa-category-exchange-traineeship) | Değişim ve staj için doğru başvuru kategorisi; ilgili resmî kaynakların yeniden kontrolü. |
| 2026-11-09 | [Fransa: mali sponsorun aile bağı, geliri ve hesap kayıtlarını tutarlı göstermek](https://www.clinigaeducation.com/tr/blog/archive/fr-sponsor-relationship-evidence) | Sponsor yakınlığı ve finansal kanıtın tutarlılığı; ilgili resmî kaynakların yeniden kontrolü. |
| 2026-11-12 | [Hollanda: uçuş, vize ve sağlık poliçesi tarihleri arasındaki kapsam boşluğunu kapatmak](https://www.clinigaeducation.com/tr/blog/archive/nl-insurance-start-gap) | Varış ile poliçe başlangıcı arasındaki boşluk; ilgili resmî kaynakların yeniden kontrolü. |
| 2026-11-16 | [Polonya: burs ve eğitim ödemelerinde alıcı adı ile banka kaydını eşleştirmek](https://www.clinigaeducation.com/tr/blog/archive/pl-bank-name-mismatch) | Burs alıcısının adı, IBAN ve ödeme takibi; ilgili resmî kaynakların yeniden kontrolü. |
| 2026-11-19 | [İspanya: iş sözleşmesinin burs, sağlık güvencesi ve öğrenci statüsüne etkisini ayırmak](https://www.clinigaeducation.com/tr/blog/archive/es-work-contract-social-insurance) | İş sözleşmesi, öğrenci statüsü ve sosyal güvence; ilgili resmî kaynakların yeniden kontrolü. |
