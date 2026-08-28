import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, Loader2, ShieldCheck, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePortalCopy } from "@/components/portal/portal-copy";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalDashboardClient } from "@/lib/portal-browser";
import {
  getPortalCommerceHealth,
  startConnectOnboardingEdge,
  startCustomerPortalEdge,
} from "@/lib/stripe-edge";

export const Route = createFileRoute("/_authenticated/portal/account")({
  head: () => ({
    meta: [
      { title: "Student Account & Payments | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalAccountPage,
});

function PortalAccountPage() {
  const { copy } = usePortalCopy();
  const { commerce } = usePortalPublicCopy();
  const dashboard = useQuery({
    queryKey: ["portal-dashboard-browser"],
    queryFn: getPortalDashboardClient,
    staleTime: 20_000,
  });
  const health = useQuery({
    queryKey: ["portal-commerce-health"],
    queryFn: getPortalCommerceHealth,
    staleTime: 30_000,
    retry: 1,
  });
  const [pending, setPending] = useState<"billing" | "connect" | null>(null);

  const openBilling = async () => {
    setPending("billing");
    try {
      const result = await startCustomerPortalEdge();
      window.location.href = result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PORTAL_COMMERCE_FAILED");
    } finally {
      setPending(null);
    }
  };

  const openConnect = async () => {
    setPending("connect");
    try {
      const result = await startConnectOnboardingEdge();
      window.location.href = result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PORTAL_COMMERCE_FAILED");
    } finally {
      setPending(null);
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const data = dashboard.data;
  const plan = String(data?.subscription?.plan || "basic");
  const subscriptionStatus = String(data?.subscription?.status || "inactive");
  const credits = Number(data?.wallet?.balance || 0);
  const verification = String(
    data?.profile?.verification_status === "verified"
      ? "verified"
      : data?.verificationRequest?.status || "unverified",
  );
  const connectStatus = String(data?.connectAccount?.status || "not_connected");
  const commerceReady = health.data?.configured === true;

  return (
    <section className="min-h-screen bg-slate-50 py-8">
      <div className="container-prose max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal">CliniGA Student Journey</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
              {copy.nav.account}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild variant="outline" className="rounded-xl">
              <a href="/portal/workspace">{copy.nav.overview}</a>
            </Button>
          </div>
        </header>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <MetricCard icon={WalletCards} label={commerce.plans} value={plan.toUpperCase()} />
          <MetricCard icon={CreditCard} label={commerce.creditPacks} value={String(credits)} />
          <MetricCard icon={BadgeCheck} label={copy.nav.account} value={verification} />
        </div>

        {!commerceReady ? (
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <strong className="text-navy">{commerce.securePending}</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{commerce.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <CreditCard className="h-6 w-6 text-teal" />
              <h2 className="mt-4 font-display text-xl font-semibold text-navy">
                {commerce.plans}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.toUpperCase()} · {subscriptionStatus}
              </p>
              <Button
                onClick={() => void openBilling()}
                disabled={!commerceReady || subscriptionStatus !== "active" || pending !== null}
                className="mt-5 w-full rounded-xl bg-navy text-white hover:bg-navy/90"
              >
                {pending === "billing" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Stripe"}
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full rounded-xl">
                <a href="/portal#uyelik">{commerce.plansTitle}</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <WalletCards className="h-6 w-6 text-teal" />
              <h2 className="mt-4 font-display text-xl font-semibold text-navy">Stripe Connect</h2>
              <p className="mt-2 text-sm text-muted-foreground">{connectStatus}</p>
              {verification !== "verified" ? (
                <Button asChild className="mt-5 w-full rounded-xl bg-gold text-gold-foreground">
                  <a href="/portal/verify">{copy.nav.account}</a>
                </Button>
              ) : (
                <Button
                  onClick={() => void openConnect()}
                  disabled={!commerceReady || pending !== null}
                  className="mt-5 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  {pending === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Stripe Connect"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-teal" />
        <span className="mt-3 block text-xs text-muted-foreground">{label}</span>
        <strong className="mt-1 block truncate text-lg text-navy">{value}</strong>
      </CardContent>
    </Card>
  );
}
