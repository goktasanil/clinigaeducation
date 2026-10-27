import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, Loader2, ShieldCheck, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePortalCopy } from "@/components/portal/portal-copy";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
import { usePortalPaymentsCopy } from "@/components/portal/portal-payments-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPortalDashboardClient } from "@/lib/portal-browser";
import { startConnectOnboardingEdge, startCustomerPortalEdge } from "@/lib/stripe-edge";
import {
  cancelIyzicoSubscription,
  getIyzicoSubscription,
  getPortalPaymentHealth,
  safePortalPaymentUrl,
} from "@/lib/portal-payments";

export const Route = createFileRoute("/_authenticated/portal/account")({
  head: () => ({
    meta: [
      { title: "Student Account & Payments | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalAccountPage,
});

function currentAccountMembership(dashboard: unknown, now = Date.now()) {
  if (typeof dashboard !== "object" || dashboard === null || !("paidAccess" in dashboard))
    return null;
  const paidAccess = dashboard.paidAccess;
  if (typeof paidAccess !== "object" || paidAccess === null || Array.isArray(paidAccess))
    return null;
  const access = paidAccess as Record<string, unknown>;
  if (
    access.has_access !== true ||
    access.status !== "active" ||
    (access.provider !== "iyzico" && access.provider !== "stripe") ||
    typeof access.plan !== "string" ||
    !["basic", "plus", "pro"].includes(access.plan) ||
    typeof access.cancel_at_period_end !== "boolean" ||
    (access.current_period_end !== null &&
      (typeof access.current_period_end !== "string" ||
        !Number.isFinite(Date.parse(access.current_period_end)) ||
        Date.parse(access.current_period_end) <= now))
  )
    return null;
  // Only the authenticated paid-access RPC determines the current membership.
  // Historical provider records remain available below for billing management.
  return {
    provider: access.provider,
    plan: access.plan,
    status: "active",
    periodEnd: access.current_period_end as string | null,
    renewalsStopped: access.cancel_at_period_end,
  };
}

function paymentStatusLabel(status: string, labels: Record<string, string>, unavailable: string) {
  const normalized = status === "canceled" ? "cancelled" : status;
  return Object.prototype.hasOwnProperty.call(labels, normalized)
    ? labels[normalized]
    : unavailable;
}

function PortalAccountPage() {
  const { copy } = usePortalCopy();
  const { commerce } = usePortalPublicCopy();
  const { copy: paymentCopy, locale } = usePortalPaymentsCopy();
  const queryClient = useQueryClient();
  const dashboard = useQuery({
    queryKey: ["portal-dashboard-browser"],
    queryFn: getPortalDashboardClient,
    staleTime: 20_000,
  });
  const health = useQuery({
    queryKey: ["portal-payment-health"],
    queryFn: getPortalPaymentHealth,
    staleTime: 30_000,
    retry: 1,
  });
  const iyzicoStatus = useQuery({
    queryKey: ["portal-iyzico-subscription"],
    queryFn: getIyzicoSubscription,
    staleTime: 20_000,
    retry: false,
  });
  const [pending, setPending] = useState<"billing" | "connect" | "cancel" | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const openBilling = async () => {
    setPending("billing");
    try {
      const result = await startCustomerPortalEdge();
      const url = safePortalPaymentUrl(result.url, "stripe");
      if (!url) throw new Error("PAYMENT_URL_INVALID");
      window.location.href = url;
    } catch {
      toast.error(paymentCopy.error);
    } finally {
      setPending(null);
    }
  };

  const openConnect = async () => {
    setPending("connect");
    try {
      const result = await startConnectOnboardingEdge();
      const url = safePortalPaymentUrl(result.url, "stripe");
      if (!url) throw new Error("PAYMENT_URL_INVALID");
      window.location.href = url;
    } catch {
      toast.error(paymentCopy.error);
    } finally {
      setPending(null);
    }
  };

  const stopRenewals = async () => {
    if (!iyzicoStatus.data || pending) return;
    setPending("cancel");
    try {
      await cancelIyzicoSubscription(iyzicoStatus.data.subscriptionReferenceCode);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal-iyzico-subscription"] }),
        queryClient.invalidateQueries({ queryKey: ["portal-dashboard-browser"] }),
      ]);
      toast.success(paymentCopy.cancellationDone);
    } catch {
      toast.error(paymentCopy.error);
    } finally {
      setPending(null);
      setCancelOpen(false);
    }
  };

  if (dashboard.isLoading || iyzicoStatus.isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const data = dashboard.data;
  const iyzicoSubscription = iyzicoStatus.data;
  const stripeSubscription = Boolean(data?.subscription?.stripe_subscription_id);
  const membership = currentAccountMembership(data);
  const plan = membership?.plan;
  const subscriptionStatus = membership?.status || "inactive";
  const renewalsStopped = membership?.renewalsStopped === true;
  const iyzicoRenewalsStopped = iyzicoSubscription?.renewalsStopped === true;
  const periodEnd = membership?.periodEnd;
  const validPeriodEnd =
    typeof periodEnd === "string" && Number.isFinite(Date.parse(periodEnd))
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(periodEnd))
      : null;
  const credits = Number(data?.wallet?.balance || 0);
  const verification = String(
    data?.profile?.verification_status === "verified"
      ? "verified"
      : data?.verificationRequest?.status || "unverified",
  );
  const connectStatus = String(data?.connectAccount?.status || "not_connected");
  const stripeReady = health.data?.stripeConfigured === true;
  const commerceReady =
    stripeReady || (health.data?.iyzico.configured === true && health.data.iyzico.mode === "live");
  const canCancelIyzico = Boolean(
    iyzicoSubscription &&
    !iyzicoRenewalsStopped &&
    ["active", "pending", "past_due"].includes(iyzicoSubscription.status),
  );
  const statusLabel = paymentStatusLabel(
    subscriptionStatus,
    paymentCopy.statuses,
    paymentCopy.statusUnavailable,
  );

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
          <MetricCard
            icon={WalletCards}
            label={commerce.plans}
            value={plan ? plan.toUpperCase() : paymentCopy.noSubscription}
          />
          <MetricCard icon={CreditCard} label={commerce.creditPacks} value={String(credits)} />
          <MetricCard icon={BadgeCheck} label={copy.nav.account} value={verification} />
        </div>

        {!commerceReady ? (
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <strong className="text-navy">{paymentCopy.pending}</strong>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {paymentCopy.pendingDescription}
                  </p>
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
                {plan ? `${plan.toUpperCase()} · ${statusLabel}` : paymentCopy.noSubscription}
              </p>
              {membership && (
                <p className="mt-2 text-xs text-slate-600">
                  {paymentCopy.provider}: {membership.provider === "stripe" ? "Stripe" : "iyzico"}
                </p>
              )}
              {validPeriodEnd && (
                <p className="mt-2 text-sm text-slate-600">
                  {paymentCopy.endDate}: {validPeriodEnd}
                </p>
              )}
              {renewalsStopped && (
                <p className="mt-2 text-sm font-semibold text-teal">{paymentCopy.stopped}</p>
              )}
              {iyzicoStatus.isError && !stripeSubscription && (
                <p role="status" className="mt-3 text-sm text-amber-800">
                  {paymentCopy.statusUnavailable}
                </p>
              )}
              {iyzicoSubscription && (
                <p className="mt-5 text-xs text-slate-600">
                  iyzico ·{" "}
                  {paymentStatusLabel(
                    iyzicoSubscription.status,
                    paymentCopy.statuses,
                    paymentCopy.statusUnavailable,
                  )}
                </p>
              )}
              {iyzicoSubscription && (
                <Button
                  onClick={() => setCancelOpen(true)}
                  disabled={!canCancelIyzico || pending !== null}
                  className="mt-5 w-full rounded-xl bg-navy text-white hover:bg-navy/90"
                >
                  {pending === "cancel" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : iyzicoRenewalsStopped ? (
                    `iyzico · ${paymentCopy.stopped}`
                  ) : (
                    `iyzico · ${paymentCopy.cancelRenewal}`
                  )}
                </Button>
              )}
              {stripeSubscription && (
                <Button
                  onClick={() => void openBilling()}
                  disabled={pending !== null}
                  className="mt-5 w-full rounded-xl bg-navy text-white hover:bg-navy/90"
                >
                  {pending === "billing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Stripe · ${paymentCopy.manage}`
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  void dashboard.refetch();
                  void iyzicoStatus.refetch();
                }}
                disabled={dashboard.isFetching || iyzicoStatus.isFetching || pending !== null}
                className="mt-2 w-full rounded-xl"
              >
                {paymentCopy.refresh}
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full rounded-xl">
                <a href="/portal#uyelik">{commerce.plansTitle}</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <WalletCards className="h-6 w-6 text-teal" />
              <h2 className="mt-4 font-display text-xl font-semibold text-navy">
                {paymentCopy.payouts}
              </h2>
              <p className="mt-2 text-xs text-slate-600">Stripe Connect</p>
              <p className="mt-2 text-sm text-muted-foreground">{connectStatus}</p>
              {verification !== "verified" ? (
                <Button asChild className="mt-5 w-full rounded-xl bg-gold text-gold-foreground">
                  <a href="/portal/verify">{copy.nav.account}</a>
                </Button>
              ) : (
                <Button
                  onClick={() => void openConnect()}
                  disabled={!stripeReady || pending !== null}
                  className="mt-5 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  {pending === "connect" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : stripeReady ? (
                    "Stripe Connect"
                  ) : (
                    paymentCopy.pending
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        <AlertDialog
          open={cancelOpen}
          onOpenChange={(open) => {
            if (!pending) setCancelOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{paymentCopy.cancelTitle}</AlertDialogTitle>
              <AlertDialogDescription>{paymentCopy.cancelDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending !== null}>
                {paymentCopy.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={pending !== null}
                onClick={(event) => {
                  event.preventDefault();
                  void stopRenewals();
                }}
              >
                {pending === "cancel" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  paymentCopy.confirmCancel
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
