import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { legalPageHead } from "@/data/legal";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/gizlilik")({
  head: () =>
    legalPageHead(
      "/gizlilik",
      "Gizlilik Politikası",
      "CliniGA Education iletişim formları, öğrenci portalı, hesap ve ödeme kayıtları ile çerez tercihlerine ilişkin gizlilik bilgileri ve ilgili belge bağlantıları.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      introduction="İletişim ve öğrenci portalı kullanımında paylaştığınız bilgiler ile sitedeki veri akışlarının kısa özeti."
    >
      <h2>Paylaştığınız bilgiler</h2>
      <p>
        İletişim formu, seçtiğiniz danışmanlık alanıyla ilgili talebi yanıtlamak için kimlik,
        iletişim ve eğitim hedefi bilgilerini alır. Bir tarih/saat seçerseniz ön görüşme tercihiniz
        de talebe eklenir. Referans kodu talebi takip etmenize yardımcı olur; formun gönderilmesi
        tek başına bir görüşmenin kesinleştiği anlamına gelmez.
      </p>
      <p>
        Portal hesabınızda profil, program tercihleri, favoriler, ilanlar, mesajlar ve paylaştığınız
        belgelerle ilgili kayıtlar oluşabilir. Ücretli işlemlerde üyelik, kredi ve ödeme
        referansları tutulur; kart bilgileri ödeme sağlayıcısının ekranında işlenir. İlk iletişim
        mesajına hassas kimlik, sağlık veya banka belgeleri eklemeyin.
      </p>

      <h2>Teknik altyapı ve dış hizmetler</h2>
      <p>
        İletişim ve hesap akışları Supabase altyapısını kullanır. Ödeme işlemleri ilgili ödeme
        sağlayıcısına yönlendirilebilir. E-posta bildirimi, yapılandırılmış olduğu akışlarda harici
        iletim hizmeti üzerinden gönderilebilir. Bir WhatsApp veya başka dış hizmet bağlantısını
        açtığınızda o sağlayıcının gizlilik koşulları da geçerlidir.
      </p>
      <p>
        Veri sorumlusunun tam kimliği, faaliyet bazında hukuki sebepler, saklama süreleri, alıcılar
        ve varsa yurt dışı aktarım düzenlemeleri
        <a href="/kvkk"> KVKK Aydınlatma Metni</a> sayfasında ayrı başlıklar altında sunulur; henüz
        doğrulanmamış kurumsal alanlar orada [DOLDUR] olarak işaretlidir.
      </p>

      <h2>Çerez ve reklam tercihi</h2>
      <p>
        Dil ve çerez tercihleriniz tarayıcıda hatırlanabilir. Google AdSense reklam betiği, yalnızca
        çerez panelindeki reklam izninizden sonra ve herkese açık sayfalarda yüklenir; portal, giriş
        ve yönetim sayfalarında yüklenmez. Alt bilgideki “Çerez ayarları” düğmesiyle tercihinizi
        değiştirebilirsiniz. Ayrıntılar ve saklama biçimleri{" "}
        <a href="/cerez-politikasi">Çerez Politikası</a> sayfasındadır.
      </p>

      <h2>Güvenlik ve başvurular</h2>
      <p>
        İletişim formunda alan doğrulaması ve otomatik gönderimleri azaltmaya yönelik kontroller
        bulunur. Hesabınızın şifresini koruyun ve şüpheli bir durumu bildirin. Kişisel veri
        talepleri veya gizlilik soruları için
        <a href={`mailto:${SITE.email}`}> {SITE.email}</a> adresini kullanabilirsiniz; talebin
        niteliğine göre kimliğinizin güvenli biçimde doğrulanması gerekebilir. KVKK kapsamındaki hak
        ve başvuru bilgileri
        <a href="/kvkk"> ayrı aydınlatma sayfasında</a> açıklanmıştır.
      </p>
    </LegalPage>
  );
}
