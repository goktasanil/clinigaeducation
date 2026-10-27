import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, PORTAL_PLANS } from "@/data/portal";
import { PortalBillingDialog } from "@/components/portal/PortalBillingDialog";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
import { usePortalPaymentsCopy } from "@/components/portal/portal-payments-copy";
import {
  formatPortalPayment,
  getPortalPaymentHealth,
  portalPaymentAccountEmail,
  portalPaymentQuote,
  startPortalCheckout,
  type PaymentCurrency,
  type PortalCheckoutSelection,
} from "@/lib/portal-payments";

function useCommerceReady() {
  return useQuery({
    queryKey: ["portal-payment-health"],
    queryFn: getPortalPaymentHealth,
    staleTime: 30_000,
    retry: 1,
  });
}

export function StaticPortalCommerceNotice() {
  const { copy } = usePortalPaymentsCopy();
  const health = useCommerceReady();
  const ready =
    health.data?.stripeConfigured ||
    (health.data?.iyzico.configured &&
      health.data.iyzico.mode === "live" &&
      health.data.iyzico.readyCurrencies.length > 0);
  if (ready) return null;
  return (
    <section className="pb-8" aria-labelledby="static-commerce-title">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 id="static-commerce-title" className="font-display text-xl font-semibold text-navy">
              {copy.pending}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-950/80">
              {copy.pendingDescription}
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-xl border-amber-300 bg-white">
              <a href="/iletisim">{copy.contact}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StaticPortalPricing() {
  const { commerce } = usePortalPublicCopy();
  const { copy, locale } = usePortalPaymentsCopy();
  const health = useCommerceReady();
  const [role, setRole] = useState<"student" | "advertiser">("student");
  const [yearly, setYearly] = useState(false);
  const [currency, setCurrency] = useState<PaymentCurrency>("EUR");
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [billingSelection, setBillingSelection] = useState<PortalCheckoutSelection | null>(null);
  const visiblePlans = PORTAL_PLANS.filter((plan) =>
    role === "student" ? plan.id !== "pro" : plan.id === "pro",
  );
  const begin = async (selection: PortalCheckoutSelection) => {
    const quote = portalPaymentQuote(health.data, selection);
    if (!quote.provider || quote.amountMinor === null || pendingItem) return;
    setPendingItem(selection.kind === "membership" ? selection.plan : selection.pack);
    try {
      await portalPaymentAccountEmail();
      if (quote.provider === "iyzico") setBillingSelection(selection);
      else {
        const result = await startPortalCheckout(selection, undefined, quote);
        window.location.href = result.url;
      }
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_REQUIRED")
        window.location.href = "/auth?next=" + encodeURIComponent("/portal#uyelik");
      else toast.error(copy.error);
    } finally {
      setPendingItem(null);
    }
  };
  const toggleClass = (active: boolean) =>
    "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
    (active ? "bg-navy text-white shadow-sm" : "text-slate-600 hover:bg-slate-100");

  return (
    <section id="uyelik" className="scroll-mt-24 py-16" aria-labelledby="portal-pricing-title">
      <div className="text-center">
        <Badge className="mb-3 bg-gold/15 text-navy hover:bg-gold/15">{commerce.plans}</Badge>
        <h2
          id="portal-pricing-title"
          className="font-display text-3xl font-semibold text-navy md:text-4xl"
        >
          {commerce.plansTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {yearly ? copy.recurringAnnual : copy.recurringMonthly}
        </p>
      </div>
      <div className="mx-auto mt-7 flex max-w-5xl flex-wrap items-center justify-center gap-3">
        <div
          className="flex rounded-2xl border bg-white p-1"
          role="group"
          aria-label={commerce.plans}
        >
          <button
            type="button"
            aria-pressed={role === "student"}
            className={toggleClass(role === "student")}
            onClick={() => setRole("student")}
          >
            {copy.students}
          </button>
          <button
            type="button"
            aria-pressed={role === "advertiser"}
            className={toggleClass(role === "advertiser")}
            onClick={() => setRole("advertiser")}
          >
            {copy.advertisers}
          </button>
        </div>
        <div
          className="flex rounded-2xl border bg-white p-1"
          role="group"
          aria-label={`${copy.monthly} / ${copy.annual}`}
        >
          <button
            type="button"
            aria-pressed={!yearly}
            className={toggleClass(!yearly)}
            onClick={() => setYearly(false)}
          >
            {copy.monthly}
          </button>
          <button
            type="button"
            aria-pressed={yearly}
            className={toggleClass(yearly)}
            onClick={() => setYearly(true)}
          >
            {copy.annual}
          </button>
        </div>
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border bg-white px-3 text-sm text-navy">
          {copy.currency}
          <select
            aria-label={copy.currency}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as PaymentCurrency)}
            className="min-h-11 rounded-lg bg-white px-2 font-semibold focus:outline-none focus:ring-2 focus:ring-teal"
          >
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
          </select>
        </label>
      </div>
      <div
        className={`mx-auto mt-8 grid gap-5 ${role === "student" ? "max-w-4xl md:grid-cols-2" : "max-w-lg"}`}
      >
        {visiblePlans.map((plan) => {
          const selection: PortalCheckoutSelection = {
            kind: "membership",
            plan: plan.id,
            yearly,
            currency,
          };
          const quote = portalPaymentQuote(health.data, selection);
          const ready = Boolean(quote.provider && quote.amountMinor !== null);
          return (
            <article
              key={plan.id}
              className={
                "relative rounded-[1.75rem] border p-6 shadow-sm " +
                (plan.featured ? "border-teal/40 bg-navy text-white" : "border-border/70 bg-white")
              }
            >
              <p className={"text-sm font-semibold " + (plan.featured ? "text-gold" : "text-teal")}>
                {role === "student" ? copy.students : copy.advertisers}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{plan.name}</h3>
              <p
                className={
                  "mt-2 text-sm " + (plan.featured ? "text-white/70" : "text-muted-foreground")
                }
              >
                {commerce.planDescriptions[plan.id]}
              </p>
              <div className="mt-6">
                <span className="text-4xl font-semibold">
                  {formatPortalPayment(quote.amountMinor, currency, locale)}
                </span>
                <span
                  className={"ms-2 text-sm " + (plan.featured ? "text-white/70" : "text-slate-600")}
                >
                  {yearly ? copy.annualTotal : copy.monthly}
                </span>
                <p
                  className={"mt-2 text-xs " + (plan.featured ? "text-white/70" : "text-slate-600")}
                >
                  {plan.includedCredits} {commerce.creditsIncluded}
                </p>
                {quote.amountMinor === null && <p className="mt-2 text-xs">{copy.noPrice}</p>}
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {commerce.planFeatures[plan.id].map((feature) => (
                  <li
                    key={feature}
                    className={plan.featured ? "text-white/85" : "text-foreground/80"}
                  >
                    • {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void begin(selection)}
                disabled={!ready || pendingItem !== null}
                className={
                  "mt-7 flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 " +
                  (plan.featured ? "bg-gold text-gold-foreground" : "bg-navy text-white")
                }
              >
                {pendingItem === plan.id || health.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : ready ? (
                  copy.continue
                ) : (
                  copy.pending
                )}
              </button>
              {quote.provider && (
                <p
                  className={
                    "mt-2 text-center text-xs " +
                    (plan.featured ? "text-white/70" : "text-slate-600")
                  }
                >
                  {copy.provider}: {quote.provider === "stripe" ? "Stripe" : "iyzico"}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <div className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-teal/20 bg-slate-50 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-teal">{commerce.creditPacks}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-navy">
              {commerce.compareCredits}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{copy.oneTime}</p>
          </div>
          <LockKeyhole className="h-6 w-6 text-teal" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => {
            const selection: PortalCheckoutSelection = { kind: "credits", pack: pack.id, currency };
            const quote = portalPaymentQuote(health.data, selection);
            const ready = Boolean(quote.provider && quote.amountMinor !== null);
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => void begin(selection)}
                disabled={!ready || pendingItem !== null}
                className="rounded-2xl border border-teal/20 bg-white p-5 text-start transition hover:border-teal/60 disabled:cursor-not-allowed disabled:opacity-65"
              >
                <strong className="block text-xl text-navy">
                  {pack.credits} {commerce.creditPacks}
                </strong>
                <span className="mt-2 block text-lg font-semibold text-teal">
                  {formatPortalPayment(quote.amountMinor, currency, locale)}
                </span>
                <span className="mt-3 flex min-h-5 items-center gap-2 text-xs text-slate-600">
                  {pendingItem === pack.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : ready ? (
                    `${copy.continue} · ${quote.provider === "stripe" ? "Stripe" : "iyzico"}`
                  ) : quote.amountMinor === null ? (
                    copy.noPrice
                  ) : (
                    copy.pending
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {billingSelection && (
        <PortalBillingDialog
          selection={billingSelection}
          quote={portalPaymentQuote(health.data, billingSelection)}
          onClose={() => setBillingSelection(null)}
        />
      )}
    </section>
  );
}
