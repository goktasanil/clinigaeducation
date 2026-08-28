import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";
const STATIC_BROWSER_SAFE_PORTAL_ROUTES = new Set([
  "/portal/workspace",
  "/portal/verify",
  "/portal/account",
]);

function StaticPortalPanelRedirect({ searchStr }: { searchStr: string }) {
  const target = `/portal/account${searchStr || ""}`;

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-16">
      <div className="container-prose">
        <div className="mx-auto max-w-xl rounded-[2rem] border bg-white p-7 text-center shadow-lg md:p-9">
          <p className="text-sm text-muted-foreground">Hesap merkezine yönlendiriliyorsunuz…</p>
          <a
            href={target}
            className="mt-5 inline-flex rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white"
          >
            Hesap merkezini aç
          </a>
        </div>
      </div>
    </section>
  );
}

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
            {isAdmin ? "Yönetim araçları" : "Eski sunucu paneli"} statik dağıtımda kapalı
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bu eski bölüm doğrudan sunucu çalışma zamanı gerektirir. GitHub Pages üzerinde gizli
            anahtar taşımamak için kapalı kalır. Student Journey, doğrulama ve Edge tabanlı hesap /
            ödeme yönetimi browser-safe rotalarda kullanılabilir.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={isAdmin ? "/" : "/portal/account"}
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {isAdmin ? "Ana sayfaya dön" : "Hesap merkezini aç"}
            </a>
            <a
              href={isAdmin ? "/iletisim" : "/portal/workspace"}
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-teal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {isAdmin ? "Destek / iletişim" : "Student Journey’i aç"}
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Oturumunuz korunur; ayrıcalıklı ödeme işlemleri yalnız Edge Function üzerinde yürütülür.
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
  if (isStaticHost && location.pathname === "/portal/panel") {
    return <StaticPortalPanelRedirect searchStr={location.searchStr} />;
  }
  if (
    isStaticHost &&
    location.pathname.startsWith("/portal/") &&
    !STATIC_BROWSER_SAFE_PORTAL_ROUTES.has(location.pathname)
  ) {
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
