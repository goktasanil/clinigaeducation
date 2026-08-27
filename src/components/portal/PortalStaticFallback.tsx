import { AlertTriangle, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, PORTAL_PLANS } from "@/data/portal";

export function StaticPortalCommerceNotice() {
  return (
    <section className="pb-20" aria-labelledby="static-commerce-title">
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <Badge className="mb-3 bg-amber-100 text-amber-900 hover:bg-amber-100">
              Güvenli ödeme durumu
            </Badge>
            <h2 id="static-commerce-title" className="font-display text-2xl font-semibold text-navy">
              Portal içerikleri açık, ödeme işlemleri kontrollü biçimde beklemede
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-950/80">
              Bu üretim sürümü statik web barındırma üzerinde çalıştığı için kartlı ödeme ve ödeme
              hesabı işlemleri burada başlatılmaz. Böylece başarısız checkout bağlantıları kullanıcıya
              gösterilmez. Planları inceleyebilir ve destek ekibiyle iletişime geçebilirsiniz.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-xl border-amber-300 bg-white">
              <a href="/iletisim">Üyelik ve ödeme hakkında bilgi al</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StaticPortalPricing() {
  return (
    <section id="uyelik" className="py-20">
      <div className="text-center">
        <Badge className="mb-3 bg-gold/15 text-navy hover:bg-gold/15">Üyelik planları</Badge>
        <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
          Yolculuğuna uygun planı incele
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Planlar ve kredi paketleri şeffaf biçimde gösterilir. Satın alma butonları güvenli ödeme
          servisi üretime alındığında etkinleşecektir.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {PORTAL_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              "relative rounded-[1.75rem] border p-6 shadow-sm " +
              (plan.featured
                ? "border-gold bg-navy text-white shadow-xl shadow-navy/20"
                : "border-border/70 bg-white")
            }
          >
            {plan.featured ? (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground">
                En çok tercih edilen
              </Badge>
            ) : null}
            <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
            <p className={"mt-2 text-sm " + (plan.featured ? "text-white/70" : "text-muted-foreground")}>
              {plan.description}
            </p>
            <div className="mt-6">
              <span className="text-4xl font-semibold">€{plan.monthly}</span>
              <span className={plan.featured ? "text-white/60" : "text-muted-foreground"}>/ay</span>
              <span
                className={
                  "mt-2 block text-xs font-semibold " +
                  (plan.featured ? "text-gold" : "text-teal")
                }
              >
                Yıllık €{plan.yearly} · {plan.includedCredits} kredi dahil
              </span>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className={plan.featured ? "text-white/85" : "text-foreground/80"}>
                  • {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className={
                "mt-8 w-full cursor-not-allowed rounded-xl px-4 py-2.5 text-sm font-semibold opacity-70 " +
                (plan.featured ? "bg-gold text-gold-foreground" : "bg-navy text-white")
              }
            >
              Güvenli ödeme hazırlanıyor
            </button>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-teal/20 bg-gradient-to-br from-slate-50 to-teal/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">İlan kredileri</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-navy">
              Kredi paketlerini karşılaştır
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <LockKeyhole className="h-4 w-4 text-teal" /> Güvenli ödeme hazırlanıyor
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <strong className="text-2xl text-navy">{pack.credits} kredi</strong>
              <span className="mt-1 block text-sm font-semibold text-gold">€{pack.price}</span>
              <span className="mt-3 block text-xs text-muted-foreground">Satın alma yakında</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
