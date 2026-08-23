/* eslint-disable @typescript-eslint/no-explicit-any -- Verification tables are newer than generated Supabase types. */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  BadgeCheck,
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
  WalletCards,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PortalCatalogFields, type PortalCatalogValue } from "@/components/portal/PortalDiscovery";
import { createPortalListing, getPortalDashboard, savePortalProfile } from "@/lib/portal.functions";
import {
  createPortalListingClient,
  ensurePortalProfileClient,
  getPortalDashboardClient,
} from "@/lib/portal-browser";
import { LISTING_CREDIT_COSTS } from "@/data/portal";
import { supabase } from "@/integrations/supabase/client";
import { startConnectOnboarding, startCustomerPortal } from "@/lib/stripe.functions";

export const Route = createFileRoute("/_authenticated/portal/panel")({
  validateSearch: (search: Record<string, unknown>) => ({
    country: typeof search.country === "string" ? search.country : undefined,
    city: typeof search.city === "string" ? search.city : undefined,
    institution: typeof search.institution === "string" ? search.institution : undefined,
    institutionName:
      typeof search.institutionName === "string" ? search.institutionName : undefined,
    program: typeof search.program === "string" ? search.program : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Öğrenci Paneli | CliniGA Global Student Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalPanel,
});

const allowedVerificationTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxVerificationBytes = 8 * 1024 * 1024;
const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

function PortalVerificationCard({ onComplete }: { onComplete: () => void }) {
  const saveProfile = useServerFn(savePortalProfile);
  const [role, setRole] = useState<"student" | "advertiser" | "institution">("student");
  const [documentType, setDocumentType] = useState("student_document");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [catalog, setCatalog] = useState<PortalCatalogValue>({
    countryCode: "DE",
    city: "",
    institution: "",
    institutionId: "",
    program: "",
  });

  const submit = async () => {
    if (displayName.trim().length < 2) {
      toast.error("Lütfen adınızı veya kurum adını yazın.");
      return;
    }
    if (
      !file ||
      !allowedVerificationTypes.includes(file.type) ||
      file.size > maxVerificationBytes
    ) {
      toast.error("PDF, JPG veya PNG biçiminde en fazla 8 MB belge seçin.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Oturum bulunamadı.");

      const profileData = {
        displayName,
        countryCode: catalog.countryCode,
        city: catalog.city || null,
        institution: catalog.institution || null,
        program: catalog.program || null,
      };
      if (isStaticHost) await ensurePortalProfileClient(profileData);
      else await saveProfile({ data: profileData });

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "bin";
      const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("portal-verification").upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upload.error) throw upload.error;

      const db = supabase as any;
      const request = await db.from("portal_verification_requests").insert({
        user_id: user.id,
        requested_role: role,
        document_storage_path: storagePath,
        document_type: documentType,
        status: "pending",
      });
      if (request.error) {
        await supabase.storage.from("portal-verification").remove([storagePath]);
        throw request.error;
      }

      setSubmitted(true);
      setFile(null);
      onComplete();
      toast.success("Doğrulama başvurunuz güvenli inceleme kuyruğuna alındı.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Doğrulama başvurusu gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card id="hesap-dogrulama" className="mt-6 scroll-mt-24 border-gold/30 shadow-lg">
      <CardContent className="p-6">
        {submitted ? (
          <div className="py-5 text-center">
            <ShieldCheck className="mx-auto h-11 w-11 text-teal" />
            <h2 className="mt-3 font-display text-2xl font-semibold text-navy">Başvuru alındı</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Belgeniz herkese açık değildir. İnceleme sonucu bu panelde gösterilir.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">Hesabını doğrula</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  İlan vermeden önce öğrenci, ilan veren kişi veya kurum hesabı manuel olarak
                  incelenir.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-navy sm:col-span-2">
                Ad soyad / kurum adı
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={80}
                  autoComplete="name"
                  className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                  placeholder="Profilde görünecek doğrulanmış ad"
                />
              </label>
              <label className="text-sm font-semibold text-navy">
                Hesap türü
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as typeof role)}
                  className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                >
                  <option value="student">Öğrenci</option>
                  <option value="advertiser">İlan veren kişi</option>
                  <option value="institution">Kurum / yurt / işletme</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-navy">
                Belge türü
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border bg-white px-3"
                >
                  <option value="student_document">Öğrenci belgesi</option>
                  <option value="identity_document">Kimlik belgesi</option>
                  <option value="company_document">Şirket / kurum yetki belgesi</option>
                  <option value="dormitory_license">Yurt / işletme ruhsatı</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-teal/20 bg-slate-50 p-4">
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                Yalnızca seçilen kuruma ait doğrulanmış gerçek programlar gösterilir; genel alan
                gösterilmez.
              </p>
              <PortalCatalogFields value={catalog} onChange={setCatalog} compact />
            </div>

            <label className="mt-5 block rounded-2xl border-2 border-dashed border-teal/30 bg-teal/5 p-5 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-teal" />
              <span className="mt-2 block font-semibold text-navy">
                Belgeyi güvenli alana yükle
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                PDF, JPG veya PNG · en fazla 8 MB
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="mt-4 block w-full text-sm"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs text-muted-foreground">
              <FileCheck2 className="mr-2 inline h-4 w-4 text-teal" />
              Belge yalnız yetkili inceleme ekibince görülür; herkese açık bağlantı oluşturulmaz.
            </div>
            <Button
              onClick={submit}
              disabled={submitting || !file}
              className="mt-5 w-full bg-gold text-white hover:bg-gold/90"
              size="lg"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Doğrulama başvurusu gönder
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PortalPanel() {
  const search = Route.useSearch();
  const dashboardFn = useServerFn(getPortalDashboard);
  const createListingFn = useServerFn(createPortalListing);
  const connectOnboardingFn = useServerFn(startConnectOnboarding);
  const customerPortalFn = useServerFn(startCustomerPortal);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kind: "housing" as
      | "housing"
      | "dormitory"
      | "scholarships"
      | "marketplace"
      | "roommates"
      | "community"
      | "jobs"
      | "services",
    title: "",
    description: "",
    countryCode: search.country?.toUpperCase() || "DE",
    city: search.city || "",
    institution: search.institutionName || "",
    institutionId: search.institution || "",
    program: search.program || "",
    price: null as number | null,
    currency: "EUR" as const,
  });

  const dashboard = useQuery({
    queryKey: ["portal-dashboard"],
    queryFn: () => (isStaticHost ? getPortalDashboardClient() : dashboardFn()),
  });
  const createListing = useMutation({
    mutationFn: () =>
      isStaticHost ? createPortalListingClient(form) : createListingFn({ data: form }),
    onSuccess: () => {
      toast.success("İlan kredisi güvenle düşüldü ve ilan moderasyona gönderildi.");
      setShowForm(false);
      setForm({ ...form, title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "İlan oluşturulamadı. Üyelik, doğrulama ve kredi bakiyenizi kontrol edin.",
      ),
  });
  const connectOnboarding = useMutation({
    mutationFn: () => connectOnboardingFn(),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Stripe ödeme hesabı kurulumu başlatılamadı.",
      ),
  });
  const customerPortal = useMutation({
    mutationFn: () => customerPortalFn(),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Fatura portalı açılamadı."),
  });

  const data = dashboard.data;
  const plan = String(data?.subscription?.plan || "basic");
  const activeMembership = data?.subscription?.status === "active";
  const verification = String(
    data?.profile?.verification_status === "verified"
      ? "verified"
      : data?.verificationRequest?.status || "unverified",
  );
  const credits = Number(data?.wallet?.balance || 0);
  const listingCost = LISTING_CREDIT_COSTS[form.kind];
  const canList = activeMembership && verification === "verified" && credits >= listingCost;
  const connectStatus = String(data?.connectAccount?.status || "not_connected");
  const connectReady = connectStatus === "active" && Boolean(data?.connectAccount?.payouts_enabled);

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
                <strong className="text-gold">
                  {verification === "verified" ? "Onaylı" : "Bekliyor"}
                </strong>
              </div>
            </div>
            <a
              href="/portal#uyelik"
              className="mt-3 block text-xs font-medium text-gold hover:underline"
            >
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

          <Card className="mt-6 overflow-hidden border-teal/25">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold">
                  <WalletCards className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-navy">
                      Stripe ödeme hesabı
                    </h2>
                    <Badge variant={connectReady ? "default" : "outline"}>
                      {connectReady
                        ? "Ödemeye hazır"
                        : connectStatus === "not_connected"
                          ? "Bağlı değil"
                          : "Kurulum bekliyor"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fiyatlı ilanlardan ödeme almak için onaylı hesabını Stripe Express'e bağla.
                    Alıcı ödemesi güvenli Checkout üzerinden alınır, platform ücreti ayrılır ve
                    kalan tutar hesabına aktarılır.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeMembership && (
                  <Button
                    variant="outline"
                    onClick={() => customerPortal.mutate()}
                    disabled={customerPortal.isPending}
                  >
                    {customerPortal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Fatura ve üyelik
                  </Button>
                )}
                <Button
                  onClick={() => connectOnboarding.mutate()}
                  disabled={connectOnboarding.isPending || verification !== "verified"}
                  className="bg-navy text-white hover:bg-navy/90"
                >
                  {connectOnboarding.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {connectReady ? "Stripe hesabını yönet" : "Ödeme hesabını kur"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {verification !== "verified" && (
            <PortalVerificationCard
              onComplete={() => queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] })}
            />
          )}

          {showForm && (
            <Card className="mt-6 border-teal/30 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 grid gap-3 rounded-2xl border border-teal/20 bg-slate-50 p-4 sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Aktif üyelik</span>
                    <strong className="block text-navy">
                      {activeMembership ? "Evet" : "Hayır"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Hesap doğrulama</span>
                    <strong className="block text-navy">
                      {verification === "verified" ? "Onaylı" : "Gerekli"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Bu ilanın bedeli</span>
                    <strong className="block text-gold">
                      {listingCost} kredi · bakiye {credits}
                    </strong>
                  </div>
                </div>
                {!canList && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-gold/25 bg-gold/10 p-3 text-sm text-navy"
                  >
                    İlan göndermek için aktif ücretli üyelik, onaylı hesap ve yeterli kredi gerekir.{" "}
                    <a href="#hesap-dogrulama" className="font-semibold text-teal hover:underline">
                      Hesabını doğrula
                    </a>{" "}
                    ·{" "}
                    <a href="/portal#uyelik" className="font-semibold text-gold hover:underline">
                      Üyelik ve kredileri incele
                    </a>
                    .
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
                  <div className="md:col-span-3">
                    <PortalCatalogFields
                      value={{
                        countryCode: form.countryCode,
                        city: form.city,
                        institution: form.institution,
                        institutionId: form.institutionId,
                        program: form.program,
                      }}
                      onChange={(catalog) => setForm({ ...form, ...catalog })}
                      allowCatalogRequest
                    />
                  </div>
                  <label className="text-sm font-medium md:col-span-2">
                    Satış fiyatı{" "}
                    <span className="font-normal text-muted-foreground">
                      (burs ve bilgilendirme ilanlarında boş bırakılabilir)
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      step="0.01"
                      value={form.price ?? ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          price: event.target.value === "" ? null : Number(event.target.value),
                        })
                      }
                      className="mt-1 h-11 w-full rounded-lg border px-3"
                      placeholder="Örn. 250.00"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Para birimi
                    <select
                      value={form.currency}
                      disabled
                      className="mt-1 h-11 w-full rounded-lg border bg-slate-50 px-3"
                    >
                      <option value="EUR">EUR (€)</option>
                    </select>
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
                    Kredi atomik olarak düşülür; ilanlar moderasyona alınır. Fiyatlı satış için
                    Stripe hesabının ödemeye hazır olması gerekir.
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
                    (data?.listings ?? []).map(
                      (listing: {
                        id: string;
                        title: string;
                        city: string;
                        kind: string;
                        status: string;
                      }) => (
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
                      ),
                    )
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-navy via-teal to-[#7f1d5a] text-white">
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
                <Button asChild className="mt-5 bg-gold text-white hover:bg-gold/90">
                  <a href="#hesap-dogrulama">Profili tamamla ve doğrula</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </section>
  );
}
