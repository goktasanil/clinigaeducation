import { ArrowRight, BarChart3, MapPinned, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CHAT_ANALYSIS_SUMMARY } from "@/data/student-insights";

export function StudentInsightsFeature() {
  return (
    <section className="mt-12 grid overflow-hidden rounded-[2rem] border border-border/70 bg-navy text-white shadow-xl shadow-navy/15 lg:grid-cols-[1.1fr_.9fr]">
      <div className="relative p-6 md:p-9">
        <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative">
          <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-gold" />
            Yeni · Toplu öğrenci ihtiyaç analizi
          </Badge>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold md:text-4xl">
            Avrupa’da öğrencilerin en çok sorduğu sorular
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
            {CHAT_ANALYSIS_SUMMARY.groups} topluluk ve{" "}
            {CHAT_ANALYSIS_SUMMARY.analyzedMessages.toLocaleString("tr-TR")} anonim mesajın
            gösterdiği vize, başvuru, iş, belge, barınma ve banka kafa karışıklıkları; resmî
            kaynaklarla cevaplandı.
          </p>
          <a
            href="/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular"
            className="mt-7 inline-flex items-center rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground transition hover:bg-gold/90"
          >
            Görselli rehberi oku <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="grid gap-3 border-t border-white/10 bg-white/[0.06] p-6 sm:grid-cols-2 lg:border-l lg:border-t-0 md:p-9">
        {[
          ["3.606", "Soru/kararsızlık sinyali", BarChart3, "bg-sky-400/15 text-sky-200"],
          ["789", "Vize ve oturum sorusu", ShieldCheck, "bg-rose-400/15 text-rose-200"],
          ["Avrupa", "Ülke ve şehir rehberleri", MapPinned, "bg-emerald-400/15 text-emerald-200"],
          ["0", "Yayımlanan kişi bilgisi", ShieldCheck, "bg-amber-400/15 text-amber-200"],
        ].map(([value, label, Icon, color]) => {
          const CardIcon = Icon as typeof BarChart3;
          return (
            <div key={label as string} className={`rounded-2xl p-4 ${color as string}`}>
              <CardIcon className="h-5 w-5" />
              <strong className="mt-5 block text-2xl text-white">{value as string}</strong>
              <span className="mt-1 block text-xs leading-relaxed opacity-80">
                {label as string}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
