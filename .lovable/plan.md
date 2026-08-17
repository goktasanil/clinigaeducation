
# CliniGA Education — CRO & Kurumsal Revizyon Planı

## 1. Marka Kimliği Tutarlılığı
- Tüm dosyalarda "Akademika" → **CliniGA Education** olarak birleştirilecek (9 dil JSON, footer, meta, JSON-LD, hero, hakkımızda).
- Yüklediğin yeni logo (`ChatGPT_Image_9_Tem_2026_22_18_04.png`) Lovable Assets olarak eklenip Header + Footer'da kullanılacak. Eski `cliniga-logo.png` referansları güncellenecek.
- Wordmark: "CliniGA" büyük, altında "Education" alt yazısı — 9 dilde brand.tagline güncellenecek.

## 2. Fiyatların Kaldırılması (Profesyonel Konumlandırma)
- `src/routes/paketler.tsx` ve `PackagesGrid` bileşenindeki tüm `$60`, `$480`, `$720`… fiyatları kaldırılacak.
- Yerine "İşin kapsamına göre özel teklif" / "Kişiye özel fiyatlandırma" ibaresi + "Ücretsiz Ön Görüşme Planla" CTA'sı.
- 9 dil JSON dosyasında `packages.items.*.price` ve `unit` alanları temizlenecek, `customQuote` anahtarı eklenecek.
- Ana sayfa FAQ'daki "ödeme/taksit" sorusu daha genel bir "yatırım nasıl belirlenir" cevabıyla değiştirilecek.

## 3. CTA Stratejisi: WhatsApp → Calendly
- Ana CTA "Ücretli Danışmanlık Al" → **"Ücretsiz Ön Değerlendirme Randevusu Al"** (Calendly'e yönlendirir).
- WhatsApp FAB kaldırılıp yerine ikincil "WhatsApp'tan Yaz" küçük linki (yalnız iletişim sayfasında) korunacak — agresif satış hissi kırılacak.
- Calendly entegrasyonu: **Calendly connector** bağlanacak. İletişim sayfasındaki manuel `AppointmentPicker` yerine Calendly inline widget (`react-calendly`) gömülecek; slot senkronizasyonu Calendly hesabından gerçek zamanlı gelir.
- Tüm sayfalardaki `buildWhatsAppLink` çağrıları `openCalendly()` ile değiştirilecek.

## 4. İletişim Formu Sertleştirmesi
- `ContactForm.tsx` Zod şeması güçlendirilecek:
  - `name`: min 2, max 100, harf regex
  - `email`: strict email + max 255 (zorunlu)
  - `phone`: E.164 regex (`^\+?[1-9]\d{7,14}$`), zorunlu
  - `message`: min 20, max 2000
  - Consent checkbox (KVKK/GDPR) zorunlu
- Alan-altı hata mesajları (9 dilde çeviri), submit öncesi tüm alanların kontrolü, disabled submit + spinner, başarı/hata toast.
- Gönderim: Lovable **Email** altyapısı (Cloud + email domain) üzerinden `clinigaeducation@gmail.com`'a mail atacak server function. (Cloud enable gerekecek.)
- Aynı server function CRM/log tablosuna kayıt atar (leads tablosu).

## 5. Sosyal Kanıt Bölümü
- **Logo Carousel**: Ana sayfada Hero altı — Sapienza, Bologna, Politecnico, TU Munich, LMU, Sorbonne, KU Leuven, ETH gibi 10-12 üniversite logosu (SVG/placeholder text logolar), Embla ile sonsuz kayan carousel.
- **Rakamlarla Biz**: 1200+ başarılı vize, %98 memnuniyet, 40+ ülke, 10+ yıl deneyim — animasyonlu sayaç kartları.
- **Testimonial Grid**: 6 kartlık şık grid — isim, program, ülke, alıntı, foto placeholder. Karışık ortalama başarı hikayeleri (ör. "2.85 GPA ile Bologna kabulü").

## 6. Değer Önerisi Bölümü (Yeni)
- Hero'nun hemen altına "Neden CliniGA Education?" bölümü:
  - Akademik altyapı (10+ yıl PhD-level danışman)
  - Kişiye özel SOP & LoR yazımı
  - İstatistik & tez metodolojisi uzmanlığı
  - Şeffaf süreç, garantili takip
  - Vize red durumunda destek

## 7. Lead Magnet Quiz: "İdeal Yurt Dışı Eğitim Ülkeni Bul"
- Yeni route: `/quiz` + ana sayfada teaser bölümü.
- 6 soru (5-6 sn/soru), progress bar, framer-motion geçişler:
  1. Bütçe aralığı (4 şık: 5-10k, 10-20k, 20-40k, 40k+ USD/yıl)
  2. GPA aralığı (2.5 altı / 2.5-3.0 / 3.0-3.5 / 3.5+)
  3. Dil yeterliliği (IELTS 6+ / TOEFL / A2-B1 / henüz yok)
  4. Kariyer hedefi (Orada kalıp çalışmak / Türkiye'ye dönmek / Akademik kariyer / Belirsiz)
  5. Program seviyesi (Lisans / Master / PhD)
  6. Zaman ufku (0-6 ay / 6-12 ay / 1-2 yıl)
- **Sonuç ekranı**: Skorlama algoritması → 3 önerilen ülke (İtalya, Almanya, Hollanda, Kanada, İngiltere, ABD, İspanya, Fransa havuzu).
- E-posta yakalama gate: "Detaylı raporunu ve 15 dakikalık ücretsiz strateji görüşmesi linkini e-postana gönderelim" — e-posta + isim alınır, form submit → aynı email server function → Calendly linki + kişisel rapor.
- 9 dilde tam çeviri.

## 8. İletişim Bilgileri
- Kurumsal mail: `clinigaeducation@gmail.com` (mevcut) korunuyor; footer'da "Kurumsal iletişim" olarak sunulacak. Kullanıcı özel domainli mail isterse ileride `info@clinigacro.com` kolayca değiştirilebilir.
- Footer'a şirket adresi yer tutucu: "CliniGA Education — Roma, İtalya" (kullanıcı gerçek adresi verirse güncellenir).

## 9. SEO & Meta
- Tüm route title/description "CliniGA Education" kullanacak.
- JSON-LD `ProfessionalService` → name: "CliniGA Education".
- Sitemap'e `/quiz` eklenecek.

---

## Teknik Notlar (özet)

**Yeni/değişecek dosyalar:**
- `src/assets/cliniga-education-logo.png.asset.json` (yeni logo)
- `src/data/site.ts` — brand isim, calendly URL
- `src/i18n/locales/*.json` (9 dosya) — brand, packages fiyatları, quiz, testimonials, valueProp, cta metinleri
- `src/components/layout/Header.tsx`, `Footer.tsx`, `WhatsAppFAB.tsx` (silinecek/dönüştürülecek)
- `src/components/sections/Hero.tsx`, `PackagesGrid.tsx`, `CTASection.tsx`, `FAQ.tsx`
- `src/components/sections/ValueProposition.tsx` (yeni)
- `src/components/sections/UniversityLogos.tsx` (yeni, Embla carousel)
- `src/components/sections/StatsCounters.tsx` (yeni)
- `src/components/sections/Testimonials.tsx` (yeni)
- `src/components/sections/QuizTeaser.tsx` (yeni)
- `src/components/quiz/*` (Quiz, Question, Result, EmailGate)
- `src/components/contact/CalendlyWidget.tsx` (yeni; AppointmentPicker kaldırılacak)
- `src/components/contact/ContactForm.tsx` — Zod güçlendirme
- `src/lib/lead.functions.ts` — createServerFn ile email gönderim + lead kaydı
- `src/routes/quiz.tsx` (yeni), `src/routes/index.tsx`, `paketler.tsx`, `iletisim.tsx` güncellenecek
- Migration: `leads` tablosu (id, source, name, email, phone, quiz_result jsonb, created_at) + RLS + grants

**Bağımlılıklar / gerekli aksiyonlar:**
- `bun add react-calendly embla-carousel-react embla-carousel-autoplay`
- **Lovable Cloud** enable edilecek (form → email + leads DB için)
- **Lovable Email** kurulacak (domain: clinigacro.com — DNS setup dialogu açılacak)
- **Calendly connector** bağlanacak — kullanıcının Calendly hesabı gerekli

---

## Senden Onay/Bilgi Gerekenler

1. **Calendly hesabın var mı?** Varsa connector'ü bağlayacağım; yoksa ücretsiz plan açman gerekecek (5 dk).
2. **Email domain**: Formlardan gerçek mail gitmesi için `clinigacro.com` üzerinden email setup açacağım — DNS ayarına onay verecek misin? (Şimdilik mailto: fallback ile ilerleyip sonra bağlayabiliriz.)
3. **Şirket adresi** footer için gerçek adres var mı, yoksa şimdilik "Roma, İtalya" yer tutucu mu?
4. Fiyatları tamamen kaldırıp "Kişiye özel teklif" yazmamı onaylıyor musun, yoksa "başlangıç fiyatı" göstermek ister misin?

Onay verdiğinde uygulamaya başlıyorum.
