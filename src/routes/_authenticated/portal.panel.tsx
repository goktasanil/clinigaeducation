import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  BookMarked,
  CheckCircle2,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createPortalListing, getPortalDashboard } from "@/lib/portal.functions";
import { getCountries, LISTING_CREDIT_COSTS } from "@/data/portal";

export const Route = createFileRoute("/_authenticated/portal/panel")({
  head: () => ({
    meta: [
      { title: "Öğrenci Paneli | CliniGA Global Student Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalPanel,
});

function PortalPanel() {
  const countries = useMemo(() => getCountries("tr"), []);
  const dashboardFn = useServerFn(getPortalDashboard);
  const createListingFn = useServerFn(createPortalListing);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kind: "housing" as "housing" | "dormitory" | "scholarships" | "marketplace" | "roommates" | "community" | "jobs" | "services",
    title: "",
    description: "",
    countryCode: "DE",
    city: "",
    institution: "",
  });

  const dashboard = useQuery({
    queryKey: ["portal-dashboard"],
    queryFn: () => dashboardFn(),
  });
  const createListing = useMutation({
    mutationFn: () => createListingFn({ data: form }),
    onSuccess: () => {
      toast.success("İlan kredisi güvenle düşüldü ve ilan moderasyona gönderildi.");
      setShowForm(false);
      setForm({ ...form, title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "İlan oluşturulamadı. Üyelik, doğrulama ve kredi bakiyenizi kontrol edin."),
  });

  const data = dashboard.data;
  const plan = String(data?.subscription?.plan || "basic");
  const activeMembership = data?.subscription?.status === "active";
  const verification = String(data?.profile?.verification_status === "verified" ? "verified" : data?.verificationRequest?.status || "unverified");
  const credits = Number(data?.wallet?.balance || 0);
  const listingCost = LISTING_CREDIT_COSTS[form.kind];
  const canList = activeMembership && verification === "verified" && credits >= listingCost;

  if (dashboard.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <section className="min-h-[80vh] bg-slate-50 py-8">
      <div className="container-prose grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-2xl bg-navy p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-navy">
              <Globe2 className="h-4 w-4" />
            </span>
            Student Portal
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            {[
              [LayoutDashboard, "Genel Bakış"],
              [BookMarked, "Kaydettiklerim"],
              [FileCheck2, "Başvuru & Belgeler"],
              [MessageCircle, "Topluluk & Mesajlar"],
              [Bell, "Bildirimler"],
            ].map(([Icon, label], index) => {
              const Component = Icon as typeof LayoutDashboard;
              return (
                <button
                  key={label as string}
                  className={
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left " +
                    (index === 0 ? "bg-white/10 text-gold" : "text-white/65 hover:bg-white/5")
                  }
                >
                  <Component className="h-4 w-4" />
                  {label as string}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.07] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Üyelik</span>
              <Badge className="bg-gold text-[10px] text-gold-foreground hover:bg-gold">
                {plan.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/10 p-2">
                <span className="block text-white/50">Kredi</span>
                <strong className="text-gold">{credits}</strong>
              </div>
              <div className="rounded-lg bg-white/10 p-2">
                <span className="block text-white/50">Doğrulama</span>
                <strong className="text-gold">{verification === "verified" ? "Onaylı" : "Bekliyor"}</strong>
              </div>
            </div>
            <a href="/portal#uyelik" className="mt-3 block text-xs font-medium text-gold hover:underline">
              Üyelik ve kredi satın al
            </a>
          </div>
        </aside>

        <main>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-teal">Global yolculuk çalışma alanı</p>
              <h1 className="font-display text-3xl font-semibold text-navy">
                Merhaba{data?.profile?.display_name ? ", " + data.profile.display_name : ""}
              </h1>
            </div>
            <Button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-xl bg-gold text-white hover:bg-gold/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Ücretli ilan ver
            </Button>
          </div>

          {showForm && (
            <Card className="mt-6 border-teal/30 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 grid gap-3 rounded-2xl border border-teal/20 bg-slate-50 p-4 sm:grid-cols-3">
                  <div><span className="text-xs text-muted-foreground">Aktif üyelik</span><strong className="block text-navy">{activeMembership ? "Evet" : "Hayır"}</strong></div>
                  <div><span className="text-xs text-muted-foreground">Hesap doğrulama</span><strong className="block text-navy">{verification === "verified" ? "Onaylı" : "Gerekli"}</strong></div>
                  <div><span className="text-xs text-muted-foreground">Bu ilanın bedeli</span><strong className="block text-gold">{listingCost} kredi · bakiye {credits}</strong></div>
                </div>
                {!canList && (
                  <div role="alert" className="mb-5 rounded-xl border border-gold/25 bg-gold/10 p-3 text-sm text-navy">
                    İlan göndermek için aktif ücretli üyelik, onaylı hesap ve yeterli kredi gerekir. <a href="/portal/verify" className="font-semibold text-teal hover:underline">Hesabını doğrula</a> · <a href="/portal#uyelik" className="font-semibold text-gold hover:underline">Üyelik ve kredileri incele</a>.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium">
                    Kategori
                    <select
                      value={form.kind}
                      onChange={(event) =>
                        setForm({ ...form, kind: event.target.value as typeof form.kind })
                      }
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3"
                    >
                      <option value="housing">Ev / oda</option>
                      <option value="dormitory">Öğrenci yurdu</option>
                      <option value="scholarships">Burs</option>
                      <option value="marketplace">İkinci el eşya</option>
                      <option value="roommates">Ev arkadaşı</option>
                      <option value="community">Topluluk / öğrenci grubu</option>
                      <option value="jobs">İş / staj</option>
                      <option value="services">Öğrenci hizmetleri</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Ülke
                    <select
                      value={form.countryCode}
                      onChange={(event) => setForm({ ...form, countryCode: event.target.value })}
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Şehir
                    <input
                      value={form.city}
                      onChange={(event) => setForm({ ...form, city: event.target.value })}
                      maxLength={100}
                      className="mt-1 h-11 w-full rounded-lg border px-3"
                      placeholder="Berlin"
                    />
                  </label>
                  <label className="text-sm font-medium md:col-span-3">
                    Okul / Enstitü{" "}
                    <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                    <input
                      value={form.institution}
                      onChange={(event) => setForm({ ...form, institution: event.target.value })}
                      maxLength={200}
                      className="mt-1 h-11 w-full rounded-lg border px-3"
                      placeholder="Örn. Technische Universität Berlin"
                    />
                  </label>
                  <label className="text-sm font-medium md:col-span-3">
                    Başlık
                    <input
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      maxLength={120}
                      className="mt-1 h-11 w-full rounded-lg border px-3"
                      placeholder="Örn. Ekim ayından itibaren oda aranıyor"
                    />
                  </label>
                  <label className="text-sm font-medium md:col-span-3">
                    Açıklama
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      maxLength={3000}
                      className="mt-1 min-h-28 w-full rounded-lg border p-3"
                      placeholder="İlanın ayrıntıları, koşullar ve güvenli iletişim bilgileri..."
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-teal" />
                    Kredi atomik olarak düşülür; ilanlar yayımlanmadan önce moderasyon kuyruğuna alınır.
                  </p>
                  <Button
                    onClick={() => createListing.mutate()}
                    disabled={createListing.isPending || !canList}
                    className="bg-gold text-white hover:bg-gold/90"
                  >
                    {createListing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {listingCost} krediyle incelemeye gönder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Kayıtlı öğeler", data?.saved?.length || 0, BookMarked],
              ["İlanlarım", data?.listings?.length || 0, Sparkles],
              ["Mesajlar", data?.messages?.length || 0, MessageCircle],
            ].map(([label, value, Icon]) => {
              const Component = Icon as typeof BookMarked;
              return (
                <Card key={label as string}>
                  <CardContent className="p-5">
                    <Component className="h-5 w-5 text-teal" />
                    <strong className="mt-4 block text-3xl text-navy">{String(value)}</strong>
                    <span className="text-sm text-muted-foreground">{label as string}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold text-navy">Son ilanların</h2>
                <div className="mt-4 space-y-3">
                  {(data?.listings || []).length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-5 text-sm text-muted-foreground">
                      Henüz ilan paylaşmadın. Konaklama, eşya, topluluk veya iş ilanı
                      oluşturabilirsin.
                    </div>
                  ) : (
                    (data?.listings ?? []).map((listing: any) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between rounded-xl border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-navy">{listing.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {listing.city} · {listing.kind}
                          </p>
                        </div>
                        <Badge variant="outline">{listing.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-navy to-teal text-white">
              <CardContent className="p-6">
                <CheckCircle2 className="h-7 w-7 text-gold" />
                <h2 className="mt-5 font-display text-2xl font-semibold">Profilini tamamla</h2>
                <p className="mt-2 text-sm text-white/70">
                  Ülke, şehir, okul ve bölüm bilgilerinle portal sana daha ilgili topluluk, ilan ve
                  kontrol listeleri gösterebilir.
                </p>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-full w-1/3 rounded-full bg-gold" />
                </div>
                <span className="mt-2 block text-xs text-white/60">1 / 3 adım</span>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </section>
  );
}
