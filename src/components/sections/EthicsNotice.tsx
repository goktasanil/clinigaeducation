import { ShieldCheck } from "lucide-react";

export function EthicsNotice() {
  return (
    <section className="container-prose py-8">
      <div className="flex items-start gap-4 rounded-2xl border border-teal/20 bg-teal/5 p-5 md:p-6">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-teal" aria-hidden />
        <div className="space-y-1.5">
          <h2 className="font-display text-lg font-semibold text-navy">
            Akademik Etik İlkelerimiz
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            CliniGA Education, YÖK ve uluslararası yükseköğretim etik kurallarına
            bağlıdır. <strong>Öğrenci veya araştırmacı adına tez, ödev ya da makale
            yazmıyoruz.</strong> Sunduğumuz destek; metodoloji, literatür tarama,
            akademik yazım rehberliği, istatistik analiz eğitimi ve süreç
            yönetimidir. Nihai akademik ürün ve içerik daima danışan kişiye aittir
            ve intihal / etik ihlal içeren talepler kabul edilmez.
          </p>
        </div>
      </div>
    </section>
  );
}
