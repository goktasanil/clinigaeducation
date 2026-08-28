import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

function StaticServerRuntimeNotice({ area }: { area: "admin" | "portal" }) {
  const isAdmin = area === "admin";

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-16">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-gold/25 bg-white p-7 text-center shadow-xl md:p-10">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy text-gold">
            <span aria-hidden="true" className="text-xl font-bold">
              {isAdmin ? "A" : "P"}
            </span>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            Güvenli sunucu işlemi
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-navy md:text-3xl">
            {isAdmin ? "Yönetim araçları" : "Öğrenci hesabı işlemleri"} statik dağıtımda kapalı
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bu bölüm ödeme, Search Console, servis rolü veya diğer ayrıcalıklı sunucu işlemleri
            gerektirir. Gizli anahtarları tarayıcıya taşımamak için GitHub Pages sürümünde bu
            işlemler bilinçli olarak çalıştırılmaz.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={isAdmin ? "/" : "/portal"}
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
            >
              {isAdmin ? "Ana sayfaya dön" : "Public portalı aç"}
            </a>
            <a
              href="/iletisim"
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-teal/50"
            >
              Destek / iletişim
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Oturumunuz korunur; bu ekran yalnızca statik production hostunda ayrıcalıklı çağrıların
            hata vermesini ve gizli anahtarların istemciye taşınmasını engeller.
          </p>
        </div>
      </div>
    </section>
  );
}

function AuthenticatedLayout() {
  const location = useLocation();

  if (isStaticHost && location.pathname.startsWith("/admin")) {
    return <StaticServerRuntimeNotice area="admin" />;
  }
  if (isStaticHost && location.pathname.startsWith("/portal/")) {
    return <StaticServerRuntimeNotice area="portal" />;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { next: location.pathname + location.searchStr },
      });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});
