import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL_PROVIDER, legalPageHead } from "@/data/legal";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/mesafeli-satis-iade")({
  head: () =>
    legalPageHead(
      "/mesafeli-satis-iade",
      "Mesafeli Satış ve İade Koşulları",
      "Danışmanlık ve portal işlemlerinde kapsam, ödeme öncesi bilgilendirme, iptal, cayma ve iade talepleri için genel çerçeve ve tamamlanacak sağlayıcı bilgileri.",
      { draft: true },
    ),
  component: DistanceSalesPage,
});

function DistanceSalesPage() {
  return (
    <LegalPage
      title="Mesafeli Satış ve İade Koşulları"
      introduction="Danışmanlık teklifi, portal üyeliği ve diğer ücretli işlemlerin kapsamı ile iptal ve iade taleplerine ilişkin bilgilendirme."
      draft
    >
      <h2>Hizmet sağlayıcı</h2>
      <dl>
        <dt>Ticari unvan</dt>
        <dd>{LEGAL_PROVIDER.commercialTitle}</dd>
        <dt>Kayıtlı açık adres</dt>
        <dd>{LEGAL_PROVIDER.registeredAddress}</dd>
        <dt>Vergi bilgileri</dt>
        <dd>{LEGAL_PROVIDER.taxInfo}</dd>
        <dt>Kayıt bilgileri</dt>
        <dd>{LEGAL_PROVIDER.registryInfo}</dd>
      </dl>
      <p>
        İletişim ve talep kanalı: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Teklif ve ödeme öncesinde</h2>
      <p>
        Ücretsiz ön görüşme talebi veya profil testinin tamamlanması tek başına ücretli bir
        danışmanlık sözleşmesi kurmaz. Danışmanlık kapsamı, görüşme sayısı, teslimatlar, takvim,
        vergiler dahil toplam ücret, ek masraflar ve ödeme planı size sunulan yazılı teklifte
        belirlenir. Kapsam dışı işler ayrıca açıklanıp kabul edilmeden ek ücret doğurmaz.
      </p>
      <p>
        Üniversite, konsolosluk, sınav merkezi ve benzeri üçüncü tarafların ücretleri teklif
        kapsamına dahilse ayrıca belirtilmelidir. Kabul, vize, burs veya yayın kararı garanti
        edilmez; hizmetin konusu başvuru ve akademik çalışma sürecinde kararlaştırılan destektir.
      </p>
      <p>
        [DOLDUR: hizmet bazında nihai ön bilgilendirme formu, ödeme para birimi, vergiler, teslim
        takvimi ve şikâyet usulü]
      </p>

      <h2>Portal üyelikleri, krediler ve ilan işlemleri</h2>
      <p>
        Portal üyeliğinin seçilen dönemi, yenileme bilgisi, kredi paketinin miktarı ve işlem bedeli
        satın alma ekranında kontrol edilmelidir. Yenilemeyi iptal etmek ile kanuni cayma veya bedel
        iadesi talep etmek farklı işlemlerdir; dönem sonunda sona eren bir abonelik, varsa emredici
        iade hakkınızı ortadan kaldırmaz.
      </p>
      <p>
        Bir ilan üzerinden başka bir kişiden alınan ürün veya hizmette satıcının kimliği ve işlemin
        niteliği önemlidir. Platformun kendi danışmanlık hizmeti ile ilan verenin yükümlülükleri
        aynı kabul edilmez. Ödeme sağlayıcısının teknik iade akışı tüketicinin kanundan doğan
        haklarının yerine geçmez.
      </p>

      <h2>İptal, cayma ve erken başlama</h2>
      <p>
        Uygulanacak kurallar; sağlayıcının ve tüketicinin ülkesi, tüketici işlemi olup olmadığı ve
        satın alınan hizmete göre belirlenir. Türkiye&apos;deki mesafeli tüketici sözleşmeleri ile
        AB&apos;deki ilgili çerçevelerde genel olarak 14 günlük cayma süresi bulunur; başlangıç,
        istisnalar ve iadeye ilişkin ayrıntılar aynı değildir. Her işlem için uygulanabilir şartlar
        ödeme öncesinde bildirilmelidir.
      </p>
      <p>
        Bir hizmetin kişiye özel planlanması tek başına bütün cayma haklarını kaldırdığı şeklinde
        yorumlanamaz. Cayma süresi içinde hizmete başlanması isteniyorsa, gerektiği yerde ayrıca
        açık başlama talebi ve ilgili sonuçlara ilişkin bilgilendirme gerekir. Özellikle AB
        çerçevesinde tam ifa, önceden açık onay ve hakkın kaybının kabulü gibi koşullar önemlidir.
        Genel kullanım koşulunun kabulü, bu ayrı şartların kendiliğinden sağlandığı anlamına gelmez.
      </p>
      <p>
        Kullanılmamış hizmet, kısmen ifa edilmiş çalışma, dijital kredi ve abonelik talepleri kendi
        sözleşmesi ve zorunlu tüketici kurallarıyla değerlendirilir. Bu sayfada herkese uygulanacak
        “iade yoktur” veya otomatik kesinti kuralı konulmamıştır.
      </p>
      <p>
        [DOLDUR: uygulanacak ülke hukuku, her hizmet için cayma koşulları, erken başlama beyanı,
        yasal süreleri aşmayan iade süreci ve yetkili tüketici başvuru mercileri]
      </p>

      <h2>Talep nasıl iletilir?</h2>
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> adresine işlem veya talep referansınızı,
        satın alınan hizmeti, işlem tarihini ve isteğinizi yazabilirsiniz. Kanuni cayma hakkınıza
        dayanıyorsanız, bildiriminizde gerekçe göstermeniz gerekmez. Kart numarası veya güvenlik
        kodu göndermeyin; varsa ilgili ödeme kaydının hassas bilgileri kapatılmış örneğini kullanın.
        Kanuni başvuru yöntemleri ve süreleri saklıdır.
      </p>
      <p>[DOLDUR: iade taleplerini takip edecek yetkili ve yazılı işlem/cevap prosedürü]</p>

      <h2>Resmî bilgi kaynakları</h2>
      <ul>
        <li>
          <a
            href="https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/mesafeli-sozlesmeler-hakkinda-bilgilendirme"
            target="_blank"
            rel="noopener noreferrer"
          >
            T.C. Ticaret Bakanlığı — Mesafeli sözleşmeler hakkında bilgilendirme
          </a>
        </li>
        <li>
          <a
            href="https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Avrupa Birliği — Cayma ve iade hakları
          </a>
        </li>
      </ul>
    </LegalPage>
  );
}
