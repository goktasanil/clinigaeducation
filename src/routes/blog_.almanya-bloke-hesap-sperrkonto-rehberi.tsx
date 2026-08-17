import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

import { CTASection } from "@/components/sections/CTASection";
import { blogCspMeta } from "@/lib/csp";

const URL = "https://www.clinigaeducation.com/blog/almanya-bloke-hesap-sperrkonto-rehberi";
const TITLE = "Almanya Bloke Hesap (Sperrkonto) Rehberi 2026";
const PAGE_TITLE = "Almanya Bloke Hesap Rehberi 2026 | CliniGA Education";
const DESCRIPTION =
  "Alman öğrenci vizesi için bloke hesap (Sperrkonto) nasıl açılır? 2026 tutarı, Türk öğrenciler için belgeler ve Expatrio, Fintiba, Coracle karşılaştırması.";
const PUBLISHED = "2026-08-03";

export const Route = createFileRoute("/blog_/almanya-bloke-hesap-sperrkonto-rehberi")({
  head: () => ({
    meta: [
      blogCspMeta(),
      { title: PAGE_TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: TITLE,
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          mainEntityOfPage: { "@type": "WebPage", "@id": URL },
          author: { "@type": "Organization", name: "CliniGA Education" },
          publisher: { "@type": "Organization", name: "CliniGA Education" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "2026 yılında Sperrkonto'ya ne kadar para yatırmam gerekiyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Almanya'da öğrenci vizesi için gereken yıllık asgari geçim tutarı (Regelbedarf) güncel olarak yaklaşık 11.904 € seviyesindedir; bu tutar aylık yaklaşık 992 € olarak serbest bırakılır. Tutar her yıl güncellendiği için başvuru öncesi konsolosluk duyurusunu kontrol edin.",
              },
            },
            {
              "@type": "Question",
              name: "Bloke hesap açmak ne kadar sürer?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Online sağlayıcılarda (Expatrio, Fintiba, Coracle) hesap onayı genellikle 1-3 iş günü sürer. Transferin ulaşması ve bloke onay belgesinin (Sperrbestätigung) düzenlenmesi ile toplam süre 3-10 iş günü arasındadır.",
              },
            },
            {
              "@type": "Question",
              name: "Sperrkonto yerine burs belgesi veya Almanya'da yaşayan bir sponsor (Verpflichtungserklärung) kullanılabilir mi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Evet. DAAD gibi tam burslar veya Almanya'da yaşayan bir kişinin resmi taahhüt belgesi (Verpflichtungserklärung) finansal kanıt olarak kabul edilebilir. Ancak bursun tutarı asgari geçim tutarını karşılamıyorsa fark için yine bloke hesap istenir.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: SperrkontoGuide,
});

function SperrkontoGuide() {
  return (
    <>
      <section className="gradient-navy py-14 text-navy-foreground md:py-20">
        <div className="container-prose">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-navy-foreground/70 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Bloga Dön
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Vize &amp; Finansal Kanıt
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight md:text-5xl">
            Alman Öğrenci Vizesi İçin Bloke Hesap (Sperrkonto) Nasıl Açılır?
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            Türk öğrenciler için adım adım süreç, gerekli belgeler, 2026 tutarı
            ve Expatrio, Fintiba ile Coracle sağlayıcılarının karşılaştırması.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-navy-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> 3 Ağustos 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 12 dk okuma
            </span>
          </div>
        </div>
      </section>

      <article className="container-prose prose prose-slate max-w-3xl py-14">
        <h2>Sperrkonto (bloke hesap) nedir?</h2>
        <p>
          Sperrkonto, Alman öğrenci vizesi başvurusunda “finansal kanıt”
          (<em>Finanzierungsnachweis</em>) olarak sunulan özel bir banka
          hesabıdır. Hesaba yatırılan tutar Almanya'ya varışınıza kadar
          bloke tutulur; ülkeye giriş yaptıktan sonra her ay yalnızca belirli
          bir üst limit kadar para çekebilirsiniz. Amaç, öğrencinin eğitim
          süresince kendini geçindirebileceğini kanıtlamasıdır.
        </p>
        <p>
          Konsolosluk, hesabı açtığınız kurumdan gelen{" "}
          <strong>Sperrbestätigung</strong> (bloke onay belgesi) belgesini
          talep eder. Bu belge olmadan öğrenci vizesi dosyanız çoğu durumda
          eksik sayılır.
        </p>

        <h2>2026 için gereken tutar</h2>
        <p>
          Güncel uygulamada yıllık asgari geçim tutarı yaklaşık{" "}
          <strong>11.904 €</strong>'dur ve aylık yaklaşık{" "}
          <strong>992 €</strong> serbest bırakılır. Tutar Almanya'nın öğrenci
          geçim standardına (BAföG referansı) bağlı olarak neredeyse her yıl
          artar; bu nedenle başvurudan hemen önce Almanya Konsolosluğu'nun
          güncel duyurusunu teyit etmeniz gerekir. Bazı öğrenciler,
          kira depozitosu ve ilk aylardaki kuruluş masrafları için tutarın
          bir miktar üzerine çıkmayı tercih eder.
        </p>

        <h2>Türk öğrenciler için gerekli belgeler</h2>
        <ul>
          <li>Geçerli pasaport (biyometrik sayfası, en az 12–15 ay geçerli)</li>
          <li>Üniversite kabul mektubu (Zulassungsbescheid) veya başvuru kanıtı</li>
          <li>Adres kanıtı (fatura veya ikametgâh belgesi)</li>
          <li>Cep telefonu numarası ve aktif e-posta adresi</li>
          <li>
            Fon kaynağı beyanı: kendi hesabınız, ebeveyn hesabı veya sponsor
            beyanı (banka bazı durumlarda kaynak sorgusu yapar)
          </li>
          <li>
            Uluslararası transfer için IBAN/SWIFT bilgisi ve Türkiye'deki
            bankanızın döviz transfer limitleri
          </li>
        </ul>
        <p>
          <strong>Türkiye'ye özel pratik notlar:</strong> transferi TL yerine
          EUR olarak göndermek kur farkı kaynaklı eksik yatma riskini azaltır;
          bazı bankalar yüksek tutarlı yurt dışı transferlerde ek belge
          (öğrenci belgesi, kabul mektubu) ister. Ayrıca transfer masrafını
          gönderen tarafın ödemesi (OUR seçeneği) gerekir — aksi halde hesaba
          gereken tutardan az para ulaşır ve belge düzenlenmez.
        </p>

        <h2>Adım adım süreç</h2>
        <ol>
          <li>Sağlayıcı seçin (aşağıdaki karşılaştırmaya bakın).</li>
          <li>
            Online başvuruyu doldurup pasaport ve kabul/başvuru belgenizi
            yükleyin.
          </li>
          <li>
            Kimlik doğrulaması yapın (video görüşme veya online kimlik
            doğrulama).
          </li>
          <li>
            Hesap açılış ücretini ödeyin ve size verilen IBAN'a asgari geçim
            tutarını EUR olarak transfer edin.
          </li>
          <li>
            Para ulaştıktan sonra <strong>Sperrbestätigung</strong> belgesini
            PDF olarak indirin.
          </li>
          <li>
            Belgeyi vize dosyanıza ekleyip konsolosluk randevunuza götürün.
          </li>
          <li>
            Almanya'ya vardıktan sonra adres kaydı (Anmeldung) ve ikamet izni
            sonrası hesabı aktifleştirin; aylık limit kadar para çekmeye
            başlayın.
          </li>
        </ol>

        <h2>Sağlayıcı karşılaştırması: Expatrio, Fintiba, Coracle</h2>
        <div className="not-prose overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60 text-left">
                <th className="border border-border p-3 font-semibold">Kriter</th>
                <th className="border border-border p-3 font-semibold">Expatrio</th>
                <th className="border border-border p-3 font-semibold">Fintiba</th>
                <th className="border border-border p-3 font-semibold">Coracle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-medium">Paket yapısı</td>
                <td className="border border-border p-3">
                  Bloke hesap + sağlık sigortası birlikte (Value Package)
                </td>
                <td className="border border-border p-3">
                  Bloke hesap tek başına veya sigorta paketiyle (Plus)
                </td>
                <td className="border border-border p-3">
                  Bloke hesap odaklı; sigorta opsiyonel olarak eklenebilir
                </td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-medium">Kurulum hızı</td>
                <td className="border border-border p-3">Genelde 1–3 iş günü</td>
                <td className="border border-border p-3">Genelde 1–2 iş günü</td>
                <td className="border border-border p-3">Genelde 1–3 iş günü</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-medium">Konsolosluk kabulü</td>
                <td className="border border-border p-3">Kabul edilir</td>
                <td className="border border-border p-3">Kabul edilir</td>
                <td className="border border-border p-3">Kabul edilir</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-medium">Güçlü yönü</td>
                <td className="border border-border p-3">
                  Sigorta + hesap tek yerden; kapsamlı onboarding desteği
                </td>
                <td className="border border-border p-3">
                  En bilinen sağlayıcı; hızlı ve olgun süreç, geniş dokümantasyon
                </td>
                <td className="border border-border p-3">
                  Sade fiyatlandırma, esnek paket seçimi
                </td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-medium">Dikkat</td>
                <td className="border border-border p-3">
                  Paket içeriğinin ihtiyacınızla örtüştüğünü kontrol edin
                </td>
                <td className="border border-border p-3">
                  Aylık hesap işletim ücreti toplam maliyeti artırabilir
                </td>
                <td className="border border-border p-3">
                  Destek kanalı ve yanıt süresini önceden test edin
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Ücretler ve paket içerikleri sağlayıcılar tarafından sık
          güncellendiği için nihai fiyatı her zaman sağlayıcının resmî
          sayfasından doğrulayın. Yukarıdaki tablo yapısal bir karşılaştırmadır,
          fiyat taahhüdü içermez.
        </p>

        <h2>Hangi sağlayıcıyı seçmelisiniz?</h2>
        <ul>
          <li>
            <strong>Sigorta dahil tek paket istiyorsanız:</strong> Expatrio veya
            Fintiba Plus, sağlık sigortası zorunluluğunu da aynı adımda çözer.
          </li>
          <li>
            <strong>Zamanınız çok kısıtlıysa:</strong> süreçleri en oturmuş
            sağlayıcıyı (Fintiba) tercih etmek onay riskini azaltır.
          </li>
          <li>
            <strong>Sigortanızı ayrı yapacaksanız:</strong> Coracle gibi sade
            paketler toplam maliyeti düşürebilir.
          </li>
        </ul>

        <h2>Sık yapılan hatalar</h2>
        <ul>
          <li>
            Transfer masrafı alıcıya bırakıldığı için hesaba eksik tutar
            ulaşması (belge düzenlenmez).
          </li>
          <li>
            Kur dalgalanması nedeniyle asgari tutarın altına düşülmesi —
            küçük bir tampon ekleyin.
          </li>
          <li>
            Vize randevusunu bloke onay belgesi gelmeden almak ve dosyayı
            eksik teslim etmek.
          </li>
          <li>
            Zorunlu sağlık sigortasının (öğrenci statüsüne uygun) ayrı bir
            gereklilik olduğunun atlanması.
          </li>
          <li>
            Pasaport bilgileriyle başvuru bilgilerinin birebir aynı olmaması.
          </li>
        </ul>

        <h2>Sıkça sorulan sorular</h2>
        <h3>Vize reddedilirse para geri alınabilir mi?</h3>
        <p>
          Evet. Vize reddi durumunda ret kararının kopyası ve pasaport
          bilgileriyle hesap kapatma (Kontoauflösung) talebi açılır; bakiye
          gönderen hesaba iade edilir. İşlem birkaç hafta sürebilir ve bazı
          ücretler iade edilmez.
        </p>
        <h3>Sperrkonto yerine burs kullanılabilir mi?</h3>
        <p>
          DAAD gibi tam bursların onay yazısı finansal kanıt olarak kabul
          edilir. Burs tutarı asgari geçim tutarını karşılamıyorsa fark için
          bloke hesap gerekir.
        </p>
        <h3>Almanya'ya vardıktan sonra ne yapmalıyım?</h3>
        <p>
          Adres kaydı (Anmeldung) yapıp yerel bir cari hesap açın, ardından
          bloke hesabınızı bu hesaba bağlayarak aylık serbest tutarı
          çekmeye başlayın. Uzatma başvurularında (ikamet izni yenileme)
          hesap bakiyesi tekrar sorulabilir.
        </p>

        <h2>Süreci tek başınıza yönetmek istemiyorsanız</h2>
        <p>
          Bloke hesap, sağlık sigortası, kabul mektubu ve vize randevusu
          takvimi birbirine bağlı adımlardır; birindeki gecikme dönem
          kaybına dönüşebilir. CliniGA Education olarak belge setinizi
          kontrol ediyor, sağlayıcı seçiminde ve başvuru takviminde birlikte
          plan çıkarıyoruz.
        </p>
      </article>

      <CTASection />
    </>
  );
}
