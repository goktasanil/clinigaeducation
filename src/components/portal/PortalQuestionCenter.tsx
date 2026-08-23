import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CHAT_ANALYSIS_SUMMARY,
  TOP_QUESTION_INTENTS,
  TOP_QUESTION_TOPICS,
} from "@/data/student-insights";

const topicIcons = [ShieldCheck, Building2, BriefcaseBusiness, FileCheck2, Sparkles, Landmark];
const topicStyles = [
  "border-sky-200 bg-sky-50 text-sky-800",
  "border-violet-200 bg-violet-50 text-violet-800",
  "border-emerald-200 bg-emerald-50 text-emerald-800",
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-rose-200 bg-rose-50 text-rose-800",
  "border-cyan-200 bg-cyan-50 text-cyan-800",
];

export function PortalQuestionCenter() {
  const maxIntent = Math.max(...TOP_QUESTION_INTENTS.map((item) => item.count));

  return (
    <section className="py-20" aria-labelledby="question-center-title">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-xl shadow-navy/10">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative overflow-hidden bg-navy p-6 text-white md:p-9">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-60 w-60 rounded-full bg-teal/20 blur-3xl" />
            <div className="relative">
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold" />
                Anonim öğrenci ihtiyaç analizi
              </Badge>
              <h2
                id="question-center-title"
                className="mt-5 font-display text-3xl font-semibold md:text-4xl"
              >
                En çok kafa karıştıran işlemler için hızlı çözüm merkezi
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
                {CHAT_ANALYSIS_SUMMARY.groups} öğrenci topluluğundaki{" "}
                {CHAT_ANALYSIS_SUMMARY.analyzedMessages.toLocaleString("tr-TR")} kullanılabilir
                mesajdan, kimlik ve ham mesaj yayımlamadan çıkarılan soru başlıkları.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {TOP_QUESTION_TOPICS.map((topic, index) => {
                  const Icon = topicIcons[index];
                  return (
                    <a
                      key={topic.id}
                      href={`/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular#${topic.id}`}
                      className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${topicStyles[index]}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">
                          {topic.count} soru
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold">{topic.label}</h3>
                      <p className="mt-1 text-xs leading-relaxed opacity-75">{topic.description}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              Soruların biçimi
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-navy">
              Öğrencinin aradığı cevap türü
            </h3>
            <div className="mt-7 space-y-5">
              {TOP_QUESTION_INTENTS.map((intent, index) => (
                <div key={intent.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-navy">{intent.label}</span>
                    <span className="font-semibold text-teal">{intent.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={
                        "h-full rounded-full " +
                        (index % 3 === 0
                          ? "bg-gradient-to-r from-navy to-sky-500"
                          : index % 3 === 1
                            ? "bg-gradient-to-r from-teal to-emerald-400"
                            : "bg-gradient-to-r from-gold to-rose-400")
                      }
                      style={{ width: `${Math.max(10, (intent.count / maxIntent) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Button asChild className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/blog/avrupada-ogrencilerin-en-cok-sordugu-sorular">
                  Soru rehberini aç <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-teal text-teal">
                <Link to="/sehir-rehberleri">
                  Şehir rehberlerini aç <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Konular birbiriyle örtüşebilir; sayılar tekil kişi sayısı değil, soru sinyali taşıyan
              anonim mesaj sayısıdır. Güncel hukuki ve idari bilgi için resmî kurum bağlantıları
              kullanılır.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
