import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  MapPinned,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const JOURNEY = [
  {
    title: "Keşfet",
    description: "Ülke, şehir, kurum ve akademik alanları karşılaştır.",
    icon: Search,
  },
  {
    title: "Kısa liste",
    description: "Gerçekten değerlendirmek istediğin seçenekleri tek yerde tut.",
    icon: GraduationCap,
  },
  {
    title: "Belgeler",
    description: "Başvuru dosyanı private belge merkezinde düzenle.",
    icon: FileCheck2,
  },
  {
    title: "Başvurular",
    description: "Deadline, status ve eksik gereksinimleri takip et.",
    icon: Route,
  },
  {
    title: "Vize & yaşam",
    description: "Vize, finans, konaklama ve günlük yaşam adımlarını planla.",
    icon: ShieldCheck,
  },
  {
    title: "Varış",
    description: "İlk hafta yapılacaklarını ve yerleşme görevlerini tamamla.",
    icon: MapPinned,
  },
] as const;

const LIFE_GROUPS = [
  {
    title: "Housing",
    description: "Yurt, ev, oda ve ev arkadaşı seçeneklerini daha güvenli değerlendir.",
    icon: Home,
    items: ["Yurt & konaklama", "Ev / oda", "Ev arkadaşı"],
  },
  {
    title: "Finance & Work",
    description: "Burs, öğrenci işi ve günlük bütçe kararlarını tek başlıkta yönet.",
    icon: WalletCards,
    items: ["Burslar", "İş & staj", "Finans"],
  },
  {
    title: "Community",
    description: "Şehir, okul ve bölüm bağlamında moderasyonlu öğrenci ağına eriş.",
    icon: Users,
    items: ["Topluluklar", "Öğrenci grupları", "Yerel bağlantılar"],
  },
  {
    title: "Daily Life",
    description: "Sağlık, ulaşım, bağlantı ve ikinci el ihtiyaçlarını tamamlayıcı modül olarak kullan.",
    icon: HeartHandshake,
    items: ["Sağlık", "Ulaşım", "Bağlantı & pazar"],
  },
] as const;

export function PortalHero() {
  return (
    <section className="relative overflow-hidden border-b bg-white py-10 md:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--teal)/.12),transparent_35%),radial-gradient(circle_at_80%_0%,hsl(var(--gold)/.14),transparent_32%)]" />
      <div className="container-prose relative grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge variant="outline" className="border-teal/30 bg-teal/5 text-teal">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> CliniGA Student Journey OS
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-navy md:text-6xl">
            Yurt dışı eğitim yolculuğun,
            <span className="block text-teal">tek çalışma alanında.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Program keşfinden başvuru ve belge takibine, vizeden konaklama ve varış planına kadar
            tüm süreci dağınık sekmeler yerine tek bir öğrenci çalışma alanında yönet.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-navy text-white hover:bg-navy/90">
              <a href="#kesfet">
                Programları keşfet <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-teal/30">
              <a href="/portal/workspace">Yolculuğuma devam et</a>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-teal" /> Private student documents</span>
            <span className="flex items-center gap-1.5"><Landmark className="h-4 w-4 text-teal" /> Official source ayrımı</span>
            <span className="flex items-center gap-1.5"><CalendarCheck2 className="h-4 w-4 text-teal" /> Deadline odaklı çalışma alanı</span>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 shadow-xl shadow-navy/10">
          <CardContent className="p-0">
            <div className="border-b bg-navy px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Journey overview</p>
                  <h2 className="mt-1 font-display text-xl font-semibold">Sıradaki adımı gör, sonra detaylara in</h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Route className="h-5 w-5 text-gold" /></span>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal">Next best action</p>
                <strong className="mt-1 block text-base text-navy">İlk hedef kurumlarını kısa listeye ekle</strong>
                <p className="mt-1 text-sm text-muted-foreground">Portal kullanıcıya bütün menüyü değil, o anda en önemli ilerleme adımını öne çıkarır.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Başvurular", "Status + deadline", GraduationCap],
                  ["Belgeler", "Private + RLS", FileCheck2],
                  ["Yaşam", "Housing + community", Home],
                ].map(([title, subtitle, Icon]) => {
                  const Component = Icon as typeof GraduationCap;
                  return (
                    <div key={title as string} className="rounded-xl border bg-slate-50 p-3">
                      <Component className="h-4 w-4 text-teal" />
                      <strong className="mt-2 block text-xs text-navy">{title as string}</strong>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{subtitle as string}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded-xl border px-3 py-3 text-sm">
                <span className="flex items-center gap-2 text-navy"><CheckCircle2 className="h-4 w-4 text-teal" /> Kaynak türü ve güncellik görünür</span>
                <span className="text-xs text-muted-foreground">no fake data</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function PortalJourneyMap() {
  return (
    <section className="py-16" aria-labelledby="portal-journey-map-title">
      <div className="max-w-3xl">
        <Badge variant="outline" className="border-gold/40 text-navy">Student journey</Badge>
        <h2 id="portal-journey-map-title" className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">
          Başvuruyu değil, tüm yolculuğu yönet
        </h2>
        <p className="mt-3 text-muted-foreground">
          Her aşama bir sonrakine bağlanır. Belgeler deadline’lara, deadline’lar başvurulara,
          başvurular da vize ve yerleşme görevlerine dönüşür.
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {JOURNEY.map(({ title, description, icon: Icon }, index) => (
          <article key={title} className="group rounded-2xl border border-border/70 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-gold"><Icon className="h-5 w-5" /></span>
              <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-navy">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal/20 bg-teal/5 px-5 py-4">
        <div>
          <strong className="text-navy">Çalışma alanın hesabınla birlikte ilerler.</strong>
          <p className="mt-1 text-sm text-muted-foreground">Başvuru, görev ve private belgelerini tek yerde tut.</p>
        </div>
        <Button asChild className="rounded-xl bg-navy text-white hover:bg-navy/90">
          <a href="/portal/workspace">Workspace’i aç <ArrowRight className="ml-2 h-4 w-4" /></a>
        </Button>
      </div>
    </section>
  );
}

export function PortalLifeAbroadGroups() {
  return (
    <section className="pb-16" aria-labelledby="life-abroad-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-teal/30 text-teal">Life abroad</Badge>
          <h2 id="life-abroad-title" className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">Öğrenci yaşamı, ama ana iş akışını bozmadan</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Community ve marketplace ana ürün değil; eğitim yolculuğunu tamamlayan güvenlik odaklı yardımcı modüllerdir.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl"><a href="/portal/workspace">Workspace’e git</a></Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {LIFE_GROUPS.map(({ title, description, icon: Icon, items }) => (
          <Card key={title} className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-teal"><Icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {items.map((item) => <Badge key={item} variant="secondary" className="font-normal">{item}</Badge>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-4"><Building2 className="h-5 w-5 text-teal" /><strong className="mt-3 block text-sm text-navy">Kurum bilgisi</strong><span className="mt-1 block text-xs text-muted-foreground">Resmî kaynak ile akademik sinyal ayrı etiketlenir.</span></div>
        <div className="rounded-2xl border p-4"><BriefcaseBusiness className="h-5 w-5 text-teal" /><strong className="mt-3 block text-sm text-navy">Topluluk ilanları</strong><span className="mt-1 block text-xs text-muted-foreground">Moderasyon ve hesap doğrulama süreçleri görünür tutulur.</span></div>
        <div className="rounded-2xl border p-4"><ShieldCheck className="h-5 w-5 text-teal" /><strong className="mt-3 block text-sm text-navy">Private dosyalar</strong><span className="mt-1 block text-xs text-muted-foreground">Başvuru belgeleri public URL ile paylaşılmaz.</span></div>
      </div>
    </section>
  );
}
