import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL_PROVIDER, legalPageHead } from "@/data/legal";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/kvkk")({
  head: () =>
    legalPageHead(
      "/kvkk",
      "KVKK Aydınlatma Metni",
      "İletişim talepleri, danışmanlık ve öğrenci portalındaki kişisel veri işleme süreçleri; tamamlanacak veri sorumlusu bilgileri ve başvuru hakları.",
      { draft: true },
    ),
  component: KvkkPage,
});

function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      introduction="İletişim talebiniz ve platform kullanımınızla ilgili kişisel veriler için bilgilendirme. Bu metin pazarlama izni veya genel bir açık rıza talebi değildir."
      draft
    >
      <h2>Veri sorumlusu ve iletişim</h2>
      <p>CliniGA Education markası altında faaliyet gösteren veri sorumlusunun kimlik bilgileri:</p>
      <dl>
        <dt>Tam unvan</dt>
        <dd>{LEGAL_PROVIDER.commercialTitle}</dd>
        <dt>Kayıtlı adres</dt>
        <dd>{LEGAL_PROVIDER.registeredAddress}</dd>
        <dt>Vergi bilgileri</dt>
        <dd>{LEGAL_PROVIDER.taxInfo}</dd>
        <dt>Varsa temsilci</dt>
        <dd>[DOLDUR: gerekli ise Türkiye / AB temsilcisi ve iletişim bilgileri]</dd>
      </dl>
      <p>
        İletişim: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Hangi veriler, nasıl elde edilir?</h2>
      <p>
        Bilgiler; web formları, profil testi, portal hesabı, sizin başlattığınız e-posta ve
        mesajlaşmalar ile elektronik ortamda elde edilir. Bir hizmet talebi için gereken bilgilerle
        sınırlı paylaşım yapın; ilk iletişim mesajına pasaport, sağlık belgesi veya banka belgesi
        eklemeyin.
      </p>
      <ul>
        <li>
          İletişim formu: ad-soyad, e-posta, telefon, eğitim seviyesi, hedef ülke, hizmet, hedef
          tarih ve mesajınız.
        </li>
        <li>Ön görüşme talebi: tercih edilen tarih/saat ve talep referansı.</li>
        <li>Profil testi: paylaştığınız yanıtlar ve iletişim bilgileri.</li>
        <li>
          Portal: hesap/profil bilgileri, seçtiğiniz programlar, favoriler, ilanlar, mesajlar ve
          yüklediğiniz belgelerin bilgileri.
        </li>
        <li>
          Ödemeler: işlem, üyelik ve kredi kayıtları; kart bilgileri ödeme sağlayıcısının ekranında
          işlenir.
        </li>
        <li>
          Teknik kullanım: dil ve çerez tercihleri, oturum bilgileri ve güvenlik kayıtları; izin
          verdiğinizde reklam teknolojileri.
        </li>
      </ul>

      <h2>İşleme amaçları ve hukuki sebepler</h2>
      <p>
        KVKK kapsamındaki işlemler için amaç ve işleme şartı birlikte belirlenir. İletişim talebine
        yanıt verilmesi ve talep edilen hizmetin planlanması, sözleşmenin kurulması veya ifasıyla
        doğrudan ilgili olması ve gerekli olması ölçüsünde Kanun madde 5/2(c) kapsamında
        değerlendirilir. Faturalama ve zorunlu kayıtlar ilgili hukuki yükümlülük için madde 5/2(ç),
        uyuşmazlık kayıtları bir hakkın korunması için madde 5/2(e) çerçevesinde ele alınır. Kötüye
        kullanımı önlemeye yönelik gerekli güvenlik işlemleri, haklarınızla dengeleme yapılarak
        madde 5/2(f) bakımından değerlendirilir.
      </p>
      <p>
        Reklam teknolojilerine ilişkin seçim ayrı çerez panelinden alınır. Formu göndermek veya bu
        metni okuduğunuzu belirtmek reklam/pazarlama izni vermez. Açık rızaya dayanan ayrı bir
        faaliyet varsa amacı ve kapsamı ayrıca açıklanır; gerekli olmayan izinler hizmetin ön koşulu
        olarak sunulmaz.
      </p>
      <p>
        [DOLDUR: gerçek veri envanteri üzerinden her faaliyet için nihai hukuki sebep ve varsa özel
        nitelikli veri işleme şartı]
      </p>

      <h2>Alıcılar ve yurt dışı aktarım</h2>
      <p>
        Sitenin teknik akışlarında veri tabanı/hesap altyapısı Supabase, ödeme işlemleri için
        yapılandırılmış ödeme sağlayıcıları ve gerekli olduğunda e-posta bildirimi hizmeti
        kullanılır. WhatsApp veya başka bir dış bağlantıyı açmanız, ilgili sağlayıcının kendi
        hizmetine geçmenize yol açar. Pazarlama izni verilirse Google reklam hizmetleri
        yüklenebilir.
      </p>
      <p>
        [DOLDUR: fiilen kullanılan alıcı şirketler ve alıcı grupları, her aktarımın amacı, veri
        kategorileri, işleme ülkeleri ve varsa KVKK madde 9 kapsamındaki aktarım mekanizması]
      </p>
      <p>
        Bu metin, standart sözleşme imzalandığını veya belirli bir aktarım güvencesinin kurulmuş
        olduğunu beyan etmez.
      </p>

      <h2>Saklama ve silme</h2>
      <p>
        [DOLDUR: iletişim talepleri, danışmanlık dosyaları, hesaplar, ödeme kayıtları ve güvenlik
        kayıtları için ayrı saklama süreleri; yasal dayanaklar, silme takvimi ve yedeklerden çıkarma
        süreci]
      </p>

      <h2>Haklar ve başvuru</h2>
      <p>
        KVKK madde 11 kapsamındaki bilgi edinme, düzeltme, şartları varsa silme/yok etme, alıcılara
        bildirim, otomatik analiz sonucuna itiraz ve zararın giderilmesini isteme haklarınız için{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> üzerinden başvuru yöntemini
        öğrenebilirsiniz. Güvenli kimlik doğrulaması gerekebilir; gereksiz hassas belge göndermeyin.
      </p>
      <p>
        KVKK kapsamındaki başvuruların en kısa sürede ve en geç 30 gün içinde sonuçlandırılması
        gerekir; kural olarak ücretsizdir, mevzuattaki ek maliyet istisnaları saklıdır. Cevap
        verilmemesi veya cevabın yetersiz olması durumunda Kuruma şikâyet dahil yasal yollar
        açıktır. GDPR uygulanıyorsa onun sağladığı ek haklar da saklıdır.
      </p>
      <p>
        [DOLDUR: kayıtlı e-posta / KEP / posta başvuru adresi ve uygulanabilir temsilci başvuru
        usulü]
      </p>

      <h2>Resmî başvuru kaynakları</h2>
      <ul>
        <li>
          <a
            href="https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig"
            target="_blank"
            rel="noopener noreferrer"
          >
            KVKK — Aydınlatma yükümlülüğüne ilişkin Tebliğ
          </a>
        </li>
        <li>
          <a
            href="https://www.kvkk.gov.tr/Icerik/8710/veri-sorumlulari-tarafindan-acik-riza-ve-aydinlatma-metinlerinin-ayri-ayri-duzenlenmesi-gerektigi-hakkinda-kisisel-verileri-koruma-kurulunun-18-02-2026-tarihli-ve-2026-347-sayili-ilke-kararina-iliskin-kamuoyu-duyurusu"
            target="_blank"
            rel="noopener noreferrer"
          >
            KVKK — Aydınlatma ve açık rızanın ayrılması, 2026/347
          </a>
        </li>
        <li>
          <a
            href="https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim"
            target="_blank"
            rel="noopener noreferrer"
          >
            KVKK — Yurt dışına aktarım
          </a>
        </li>
        <li>
          <a
            href="https://www.kvkk.gov.tr/Icerik/5358/Kamuoyu-Duyurusu"
            target="_blank"
            rel="noopener noreferrer"
          >
            KVKK — Başvuru ve şikâyet süreleri
          </a>
        </li>
      </ul>
    </LegalPage>
  );
}
