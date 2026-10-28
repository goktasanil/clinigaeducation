import type { ReactNode } from "react";

import { LEGAL_UPDATED_AT } from "@/data/legal";

export function LegalPage({
  title,
  introduction,
  draft = false,
  children,
}: {
  title: string;
  introduction: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <section lang="tr" dir="ltr" className="gradient-navy py-14 text-navy-foreground md:py-20">
        <div className="container-prose">
          <p className="text-sm font-medium text-gold">Yasal bilgilendirme</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">{introduction}</p>
          <p className="mt-5 text-sm text-navy-foreground/70">Son güncelleme: {LEGAL_UPDATED_AT}</p>
        </div>
      </section>
      <div lang="tr" dir="ltr" className="container-prose max-w-3xl py-12 md:py-16">
        {draft && (
          <aside className="mb-10 rounded-xl border border-teal/25 bg-teal/5 p-5 text-sm leading-relaxed text-navy">
            <p className="font-semibold">Tamamlanacak bilgiler ve hukuki gözden geçirme</p>
            <p className="mt-2">
              Bu metindeki [DOLDUR] alanları hizmet sağlayıcının kayıtlarıyla tamamlanmalıdır.
              Sağlayıcının kuruluş ülkesi ve hizmetin niteliğine göre hukuki gözden geçirme
              beklenmektedir. Bu taslak, eksiksiz bir aydınlatma veya satış sözleşmesi olarak
              sunulmaz; kanundan doğan haklarınızı sınırlandırmaz.
            </p>
          </aside>
        )}
        <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-teal prose-a:underline-offset-4 prose-th:text-navy">
          {children}
        </article>
        <nav
          aria-label="Yasal belgeler"
          className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-navy/10 pt-6 text-sm font-medium text-teal"
        >
          <a href="/gizlilik" className="hover:underline">
            Gizlilik Politikası
          </a>
          <a href="/kvkk" className="hover:underline">
            KVKK Aydınlatma Metni
          </a>
          <a href="/cerez-politikasi" className="hover:underline">
            Çerez Politikası
          </a>
          <a href="/mesafeli-satis-iade" className="hover:underline">
            Mesafeli Satış ve İade
          </a>
          <a href="/kullanim-kosullari" className="hover:underline">
            Kullanım Koşulları
          </a>
        </nav>
      </div>
    </>
  );
}
