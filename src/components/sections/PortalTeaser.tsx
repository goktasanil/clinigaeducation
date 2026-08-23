import { ArrowRight, Globe2, Home, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PortalTeaser() {
  return (
    <section className="container-prose py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-10 text-white shadow-xl md:px-10 lg:grid lg:grid-cols-[1fr_.8fr] lg:items-center lg:gap-10">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal/25 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <Globe2 className="h-3.5 w-3.5 text-gold" /> Yeni · Global Student Portal
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
            Başvurudan yerleşmeye, öğrencilik hayatının yeni merkezi
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Tüm ülkelerde şehir, üniversite ve enstitü ara; konaklama, doğrulanmış
            WhatsApp grupları, ikinci el eşya ve başvuru planını tek yerde yönet.
          </p>
          <Button asChild className="mt-7 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/portal">
              Portalı keşfet <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="relative mt-8 grid grid-cols-3 gap-3 lg:mt-0">
          {[
            [Home, "Konaklama"],
            [MessageCircle, "Topluluk"],
            [ShoppingBag, "Eşya Pazarı"],
          ].map(([Icon, label]) => {
            const Component = Icon as typeof Home;
            return (
              <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-center backdrop-blur">
                <Component className="mx-auto h-6 w-6 text-teal" />
                <span className="mt-3 block text-xs text-white/70">{label as string}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
