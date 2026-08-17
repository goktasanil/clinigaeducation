import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { SITE } from "@/data/site";

export const Route = createFileRoute("/gizlilik")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası & KVKK Metni | CliniGA Education" },
      {
        name: "description",
        content:
          "CliniGA Education kişisel veri işleme, saklama, paylaşım ve KVKK/GDPR kapsamındaki haklarınızı düzenleyen gizlilik politikası ve aydınlatma metni.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Gizlilik Politikası | CliniGA Education" },
      {
        property: "og:description",
        content:
          "KVKK ve GDPR kapsamında kişisel verilerinizin nasıl işlendiğine dair şeffaf bilgilendirme.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/gizlilik" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Gizlilik Politikası | CliniGA Education" },
      {
        name: "twitter:description",
        content: "KVKK/GDPR uyumlu veri işleme politikamız.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/gizlilik" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "17 Ağustos 2026";
  return (
    <>
      <section className="gradient-navy py-14 text-navy-foreground md:py-20">
        <div className="container-prose">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            KVKK / GDPR
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Gizlilik Politikası &amp; Aydınlatma Metni
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            Bu metin; CliniGA Education olarak kişisel verilerinizi hangi
            amaçlarla, hangi hukuki dayanaklarla ve ne kadar süreyle
            işlediğimizi şeffaf biçimde açıklar. Son güncelleme:{" "}
            <strong>{updated}</strong>.
          </p>
        </div>
      </section>

      <article className="container-prose prose prose-slate max-w-3xl py-14">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          CliniGA Education (“biz”, “platform”), iletişim formu, randevu ve
          e-posta üzerinden ilettiğiniz kişisel verilerin veri sorumlusudur.
          Her türlü talep, itiraz ve bilgilendirme için:{" "}
          <a href={`mailto:${SITE.email}`} className="text-teal hover:underline">
            <Mail className="mr-1 inline h-4 w-4" />
            {SITE.email}
          </a>
          .
        </p>

        <h2>2. İşlenen Veri Kategorileri</h2>
        <ul>
          <li>
            <strong>Kimlik &amp; İletişim:</strong> Ad-soyad, e-posta,
            telefon numarası.
          </li>
          <li>
            <strong>Akademik Bilgiler:</strong> Eğitim seviyesi, hedef ülke,
            hizmet talebi, deadline, mesaj içeriği.
          </li>
          <li>
            <strong>Randevu Verileri:</strong> Seçilen tarih/saat ve
            onay kodu.
          </li>
          <li>
            <strong>Portal Verileri:</strong> Profil tercihi, hedef ülke/şehir/kurum/bölüm, favoriler, moderasyonlu ilanlar, özel mesajlar ve belge meta verileri.
          </li>
          <li>
            <strong>Üyelik Verileri:</strong> Plan, abonelik durumu ve Stripe müşteri/abonelik kimlikleri. Kart numarası CliniGA tarafından alınmaz veya saklanmaz.
          </li>
          <li>
            <strong>Teknik Veriler:</strong> Dil tercihi, form gönderim zamanı
            (anti-spam denetimi için) ve tarayıcı meta verileri.
          </li>
        </ul>

        <h2>3. İşleme Amaçları ve Hukuki Dayanak</h2>
        <ul>
          <li>Danışmanlık talebinizi yanıtlamak ve ön görüşme planlamak — açık rızanız ve sözleşmenin kurulması.</li>
          <li>Yasal yükümlülükleri yerine getirmek — kanuni zorunluluk.</li>
          <li>Hizmet kalitesini iyileştirmek ve dolandırıcılığı önlemek — meşru menfaat.</li>
        </ul>

        <h2>4. Saklama Süresi</h2>
        <p>
          Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca
          (danışmanlık ilişkisi + azami 24 ay) muhafaza edilir; süre sonunda
          silinir, yok edilir veya anonim hâle getirilir.
        </p>

        <h2>5. Aktarım ve Alt İşleyenler</h2>
        <p>
          Verileriniz; barındırma (Supabase/Cloudflare), e-posta iletimi ve
          analiz altyapıları, küresel kurum dizini (OpenAlex), şehir dizini (GeoNames yapılandırıldığında) ve ödeme hizmeti (Stripe) gibi sınırlı sayıda alt işleyen ile yalnızca
          gerekli ölçüde paylaşılabilir. Verileriniz yurt dışına aktarıldığında
          KVKK/GDPR uyumlu güvenlik önlemleri (SCC vb.) uygulanır. Verileriniz
          reklam veya pazarlama amacıyla üçüncü kişilere satılmaz.
        </p>

        <h2>6. Haklarınız</h2>
        <p>KVKK md.11 ve GDPR md.15-22 kapsamında;</p>
        <ul>
          <li>Verilerinize erişim ve kopya talep etme,</li>
          <li>Düzeltme, silme veya işlemenin kısıtlanmasını isteme,</li>
          <li>Rızanızı geri çekme ve itiraz hakkı,</li>
          <li>Veri taşınabilirliği hakkına sahipsiniz.</li>
        </ul>
        <p>
          Taleplerinizi{" "}
          <a href={`mailto:${SITE.email}`} className="text-teal hover:underline">
            {SITE.email}
          </a>{" "}
          adresine e-posta göndererek iletebilirsiniz. Başvurunuz en geç 30 gün
          içinde ücretsiz olarak yanıtlanır.
        </p>

        <h2>7. Çerezler ve Analitik</h2>
        <p>
          Site yalnızca hizmetin çalışması için gerekli teknik verileri ve dil
          tercihini kullanır. Üçüncü taraf reklam ağı veya davranışsal reklam
          çerezi çalıştırılmaz. Tarayıcınızdan kayıtlı site verilerini her zaman
          silebilirsiniz.
        </p>

        <h2>8. Güvenlik ve Anti-Spam</h2>
        <p>
          İletişim formumuz honeypot alanı ve zaman kontrolü ile korunur;
          otomatik gönderim tespit edilirse kaydınız işleme alınmadan reddedilir.
          Verileriniz TLS ile şifrelenmiş biçimde iletilir ve satır düzeyinde
          erişim politikaları (RLS) altında saklanır.
        </p>

        <h2>9. Değişiklikler</h2>
        <p>
          Bu politika ihtiyaç hâlinde güncellenebilir; önemli değişiklikler
          bu sayfada duyurulur. Güncel sürüme her zaman{" "}
          <Link to="/gizlilik" className="text-teal hover:underline">
            /gizlilik
          </Link>{" "}
          adresinden ulaşabilirsiniz.
        </p>
      </article>
    </>
  );
}
