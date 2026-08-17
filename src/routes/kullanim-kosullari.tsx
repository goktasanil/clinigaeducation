import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/kullanim-kosullari")({
  head: () => ({
    meta: [
      { title: "Kullanım Koşulları | CliniGA Education" },
      { name: "description", content: "CliniGA Education web sitesi ve akademik danışmanlık hizmetlerinin kullanım koşulları." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Kullanım Koşulları | CliniGA Education" },
      { property: "og:description", content: "CliniGA Education web sitesi ve danışmanlık hizmetleri için geçerli temel kullanım koşulları." },
      { property: "og:url", content: "https://www.clinigaeducation.com/kullanim-kosullari" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/kullanim-kosullari" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <section className="gradient-navy py-14 text-navy-foreground md:py-20">
        <div className="container-prose">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Yasal</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">Kullanım Koşulları</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            Bu koşullar web sitesinin kullanımını ve danışmanlık sürecinin temel çerçevesini açıklar. Son güncelleme: 17 Ağustos 2026.
          </p>
        </div>
      </section>
      <article className="container-prose prose prose-slate max-w-3xl py-14">
        <h2>1. Kapsam</h2>
        <p>Bu site bilgilendirme ve danışmanlık talebi toplama amacıyla sunulur. Bir hizmetin kapsamı, takvimi, teslimatları ve ücreti taraflara iletilen yazılı teklif veya sözleşmede kesinleşir.</p>
        <h2>2. Akademik Etik</h2>
        <p>CliniGA Education öğrenci adına tez, ödev veya sınav çalışması üretmez. Hizmet; strateji, metodoloji, akademik yazım geri bildirimi, belge inceleme ve istatistik rehberliği ile sınırlıdır. Kullanıcı, teslim ettiği akademik çalışmanın doğruluğundan ve kurum kurallarına uygunluğundan sorumludur.</p>
        <h2>3. Başvuru ve Sonuçlar</h2>
        <p>Üniversite kabulü, vize, burs, yayın veya benzeri üçüncü taraf kararları ilgili kurumların yetkisindedir. Danışmanlık özenli profesyonel destek sağlar; belirli bir sonuç garanti edilmez.</p>
        <h2>4. Kullanıcı Yükümlülükleri</h2>
        <ul><li>Bilgileri doğru, güncel ve eksiksiz sağlamak,</li><li>Belge ve içerikleri paylaşmaya yetkili olmak,</li><li>Belirlenen teslim tarihleri ve kurum kurallarına uymak,</li><li>Siteyi hukuka aykırı veya kötüye kullanım amacıyla kullanmamak.</li></ul>
        <h2>5. Fikri Mülkiyet</h2>
        <p>Site tasarımı, marka unsurları ve özgün içerikler CliniGA Education'a aittir. Yazılı izin olmadan ticari amaçla kopyalanamaz veya yeniden yayımlanamaz. Kullanıcının kendi belge ve verileri üzerindeki hakları kullanıcıda kalır.</p>
        <h2>6. Portal Üyeliği ve Topluluk İçeriği</h2>
        <p>Free, Plus ve Pro portal planlarının güncel kapsamı satın alma ekranında gösterilir. Ücretli üyelikler seçilen aylık veya yıllık döneme göre yenilenir; iptal, mevcut ödeme döneminin sonunda geçerli olur. Ödeme Stripe üzerinde tamamlanır. Kullanıcı ilanları yayımlanmadan önce moderasyona alınabilir; yanıltıcı, hukuka aykırı, ayrımcı, taciz edici, kopya veya dolandırıcılık riski taşıyan içerikler kaldırılabilir. WhatsApp ve benzeri üçüncü taraf grupların kendi kuralları ayrıca geçerlidir.</p>
        <h2>7. Gizlilik</h2>
        <p>Kişisel verilerin işlenmesine ilişkin ayrıntılar <Link to="/gizlilik" className="text-teal hover:underline">Gizlilik Politikası ve Aydınlatma Metni</Link>'nde açıklanır.</p>
        <h2>8. İletişim ve Değişiklikler</h2>
        <p>Sorularınızı <a href={`mailto:${SITE.email}`} className="text-teal hover:underline"><Mail className="mr-1 inline h-4 w-4" />{SITE.email}</a> adresine iletebilirsiniz. Koşullar gerektiğinde güncellenebilir; güncel sürüm bu sayfada yayımlanır.</p>
      </article>
    </>
  );
}
