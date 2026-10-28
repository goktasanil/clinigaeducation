import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/LegalPage";
import { legalPageHead } from "@/data/legal";
import { openConsentSettings } from "@/lib/consent";

export const Route = createFileRoute("/cerez-politikasi")({
  head: () =>
    legalPageHead(
      "/cerez-politikasi",
      "Çerez Politikası",
      "CliniGA Education çerez ve tarayıcı depolama kullanımı, zorunlu depolama, isteğe bağlı reklam izni ve tercihlerinizi değiştirme yolları.",
    ),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      introduction="Çerezlerin yanı sıra tarayıcıdaki yerel depolamayı da kapsayan bu sayfa, sitede hangi tercihlerin tutulduğunu ve bunları nasıl yönetebileceğinizi açıklar."
    >
      <h2>Tercih sizin</h2>
      <p>
        Google AdSense reklam betiği, yalnızca çerez panelinden reklam izni verdiğinizde yüklenir.
        “Yalnızca zorunlu” seçeneği reklam izni vermez. Reklam seçimini kapatıp tercihlerinizi
        kaydedebilir veya panelde tümünü kabul edebilirsiniz. Siteyi ziyaret etmek, kaydırmak veya
        iletişim formunu göndermek tek başına reklam izni sayılmaz. Reklam betiği portal, giriş ve
        yönetim sayfalarında yüklenmez.
      </p>
      <p>
        <button
          type="button"
          onClick={openConsentSettings}
          className="min-h-11 rounded-lg bg-teal px-5 py-3 font-semibold text-white no-underline hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          Çerez tercihlerini aç
        </button>
      </p>

      <h2>Tarayıcıda tutulan bilgiler</h2>
      <div className="not-prose overflow-x-auto rounded-xl border border-navy/10">
        <table className="w-full min-w-[36rem] text-start text-sm">
          <caption className="sr-only">Depolama adı, amacı, türü ve saklama biçimi</caption>
          <thead className="bg-navy/5 text-navy">
            <tr>
              <th scope="col" className="p-4 text-start">
                Ad / sağlayıcı
              </th>
              <th scope="col" className="p-4 text-start">
                Amaç ve kategori
              </th>
              <th scope="col" className="p-4 text-start">
                Süre
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10 text-muted-foreground">
            <tr>
              <th scope="row" className="break-all p-4 text-start font-medium text-navy">
                cliniga-education-cookie-consent
              </th>
              <td className="p-4">
                CliniGA; seçtiğiniz reklam iznini veya yalnızca zorunlu tercihini hatırlar. Yerel
                depolama.
              </td>
              <td className="p-4">
                Kodda otomatik son kullanma süresi tanımlı değildir; tercih değişene veya tarayıcı
                verileri silinene kadar.
              </td>
            </tr>
            <tr>
              <th scope="row" className="p-4 text-start font-medium text-navy">
                lang
              </th>
              <td className="p-4">
                CliniGA; seçtiğiniz arayüz dilini hatırlar. Tercih depolaması.
              </td>
              <td className="p-4">
                Kodda otomatik son kullanma süresi tanımlı değildir; seçim değişene veya tarayıcı
                verileri silinene kadar.
              </td>
            </tr>
            <tr>
              <th scope="row" className="p-4 text-start font-medium text-navy">
                Hesap oturumu / Supabase
              </th>
              <td className="p-4">
                Giriş yaptığınızda hesap oturumunu sürdürür. Kimlik doğrulama için gerekli yerel
                depolama.
              </td>
              <td className="p-4">
                Oturumun geçerliliğine ve yenilenmesine bağlıdır; çıkış veya geçersizleşme ile sona
                erer.
              </td>
            </tr>
            <tr>
              <th scope="row" className="p-4 text-start font-medium text-navy">
                sidebar_state
              </th>
              <td className="p-4">
                Bu bileşenin kullanıldığı ekranlarda yan menü görünüm tercihini saklayan birinci
                taraf çerezi.
              </td>
              <td className="p-4">7 gün.</td>
            </tr>
            <tr>
              <th scope="row" className="p-4 text-start font-medium text-navy">
                Google AdSense
              </th>
              <td className="p-4">
                Yalnızca reklam izniyle; reklam sunumu ve ilgili ölçüm için üçüncü taraf
                teknolojileri.
              </td>
              <td className="p-4">
                Google hizmetine, tarayıcıya ve tercihlerinize göre değişir. Sağlayıcının güncel
                çerez açıklamasına bakın.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Tarayıcı kalıcı depolamayı engelliyorsa çerez tercihiniz yalnızca açık sayfanın belleğinde
        korunabilir; yeni ziyaretinizde yeniden seçim gerekebilir. Üçüncü tarafın kullanabileceği
        bütün çerezlerin sitenin her ziyaretinde oluştuğu varsayılmaz. Google&apos;ın ad, amaç ve
        süre açıklamaları kendi
        <a
          href="https://policies.google.com/technologies/cookies?hl=tr"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          çerez belgesinde
        </a>{" "}
        yer alır. Bu açıklama, CliniGA tarafından ayrı bir analiz aracı çalıştırıldığı anlamına
        gelmez.
      </p>

      <h2>İzni değiştirme ve silme</h2>
      <p>
        Her sayfanın altındaki “Çerez ayarları” bağlantısından paneli yeniden açabilirsiniz. Reklam
        iznini geri çekmek sonraki reklam betiği yüklemelerini durdurur; çalışmakta olan betiğin
        kaldırılması için sayfa yenilenebilir. Önceden oluşmuş üçüncü taraf çerezlerini tarayıcı
        ayarlarınızdan silebilirsiniz. Tercihi değiştirmek, sağlayıcının daha önce işlediği verileri
        kendiliğinden silmez.
      </p>
      <p>
        Tarayıcınızdan site depolamasını engellemeniz veya temizlemeniz mümkündür. Hesap oturumu,
        dil seçimi ve çerez tercihinin hatırlanması etkilenebilir. İletişim ve diğer kişisel veri
        süreçleri için <a href="/gizlilik">Gizlilik Politikası</a> ve
        <a href="/kvkk"> KVKK Aydınlatma Metni</a> ayrıca sunulur.
      </p>
      <h2>Resmî rehber</h2>
      <p>
        <a
          href="https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber"
          target="_blank"
          rel="noopener noreferrer"
        >
          KVKK — Çerez Uygulamaları Hakkında Rehber
        </a>
      </p>
    </LegalPage>
  );
}
