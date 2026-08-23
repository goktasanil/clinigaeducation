import {
  ArrowRight,
  BadgeCheck,
  Building2,
  GraduationCap,
  Globe2,
  Home,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalTeaser() {
  return (
    <section className="container-prose py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_85%_10%,rgba(14,124,134,.35),transparent_30%),linear-gradient(135deg,#0B1F3A,#123d61)] px-6 py-10 text-white shadow-xl md:px-10 lg:grid lg:grid-cols-[1fr_.9fr] lg:items-center lg:gap-10">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-24 right-16 h-56 w-56 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <BadgeCheck className="h-3.5 w-3.5 text-gold" /> Doğrulanmış Küresel Öğrenci Portalı
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
            Programını bul, yeni şehrindeki hayatını tek yerden kur
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Ülke, şehir, yükseköğretim kurumu ve kuruma ait doğrulanmış gerçek programı sırayla seç.
            Konaklama, burs, topluluk ve ikinci el ihtiyaçlarını onaylı hesaplarla aynı panelde
            yönet.
          </p>
          <Button asChild className="mt-7 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <a href="/portal">
              Gerçek programları keşfet <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-xs text-white/55">
            Genel alan gösterilmez; yalnızca kuruma bağlı doğrulanmış programlar yayınlanır.
          </p>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-3 lg:mt-0">
          {[
            [Globe2, "Ülke + şehir", "bg-teal/15 text-teal"],
            [Building2, "Yükseköğretim", "bg-gold/15 text-gold"],
            [GraduationCap, "Gerçek program", "bg-sky-400/15 text-sky-300"],
            [Home, "Ev + yurt", "bg-emerald-400/15 text-emerald-300"],
            [MessageCircle, "Onaylı topluluk", "bg-violet-400/15 text-violet-300"],
            [ShoppingBag, "İkinci el pazar", "bg-rose-400/15 text-rose-300"],
          ].map(([Icon, label, color]) => {
            const Component = Icon as typeof Home;
            return (
              <div
                key={label as string}
                className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${color as string}`}>
                  <Component className="h-5 w-5" />
                </span>
                <span className="mt-3 block text-sm font-medium text-white/80">
                  {label as string}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
