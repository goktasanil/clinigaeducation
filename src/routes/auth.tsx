import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe2, Loader2, LockKeyhole, LogIn, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_PORTAL_DESTINATION = "/portal/workspace";
const LEGACY_PANEL_PATH = "/portal/panel";
const SAFE_ACCOUNT_PATH = "/portal/account";

function safeDestination(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_PORTAL_DESTINATION;
  }
  const pathname = value.split(/[?#]/, 1)[0] || value;
  if (pathname === LEGACY_PANEL_PATH) {
    return SAFE_ACCOUNT_PATH + value.slice(LEGACY_PANEL_PATH.length);
  }
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Giriş Yap | CliniGA Global Student Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const destination = useMemo(() => safeDestination(next), [next]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active || error || !data.user) return;
      void navigate({ to: destination as never, replace: true });
    });
    return () => {
      active = false;
    };
  }, [destination, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUri =
        window.location.origin +
        "/auth?next=" +
        encodeURIComponent(destination);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
      });
      if (result.error) {
        toast.error("Giriş başarısız. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      await navigate({ to: destination as never, replace: true });
    } catch {
      toast.error("Giriş sırasında bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16">
      <div className="absolute left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
      <Card className="w-full max-w-md overflow-hidden rounded-[1.75rem] border-border/70 shadow-2xl">
        <div className="bg-navy px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-navy">
              <Globe2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                CliniGA Global
              </p>
              <h1 className="font-display text-2xl font-semibold">Student Portal</h1>
            </div>
          </div>
        </div>
        <CardContent className="p-8 text-center">
          <Sparkles className="mx-auto h-7 w-7 text-gold" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-navy">
            Yolculuğuna devam et
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Ücretli üyeliğini, hesap doğrulamanı, kredi bakiyeni ve ilanlarını güvenle yönetmek için giriş yap.
          </p>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            size="lg"
            className="mt-8 w-full rounded-xl bg-navy text-navy-foreground hover:bg-navy/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Google ile güvenli giriş
          </Button>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5 text-teal" />
            Üyelik ücretlidir; ilan yayınlamak ayrıca kredi gerektirir. Şifrenizi CliniGA görmez veya saklamaz.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
