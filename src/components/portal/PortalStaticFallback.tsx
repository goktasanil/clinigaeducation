import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, PORTAL_PLANS } from "@/data/portal";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
import {
  getPortalCommerceHealth,
  startCreditCheckoutEdge,
  startMembershipCheckoutEdge,
} from "@/lib/stripe-edge";

function useCommerceReady() {
  return useQuery({
    queryKey: ["portal-commerce-health"],
    queryFn: getPortalCommerceHealth,
    staleTime: 30_000,
    retry: 1,
  });
}

export function StaticPortalCommerceNotice() {
  const { commerce } = usePortalPublicCopy();
  const health = useCommerceReady();

  if (health.data?.configured) return null;

  return (
    <section className="pb-20" aria-labelledby="static-commerce-title">
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <Badge className="mb-3 bg-amber-100 text-amber-900 hover:bg-amber-100">
              {commerce.badge}
            </Badge>
            <h2
              id="static-commerce-title"
              className="font-display text-2xl font-semibold text-navy"
            >
              {commerce.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-950/80">
              {commerce.description}
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-xl border-amber-300 bg-white">
              <a href="/iletisim">{commerce.contact}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StaticPortalPricing() {
  const { commerce } = usePortalPublicCopy();
  const health = useCommerceReady();
  const ready = health.data?.configured === true;
  const [pendingItem, setPendingItem] = useState<string | null>(null);

  const handleCommerceError = (error: unknown) => {
    const message = error instanceof Error ? error.message : "PORTAL_COMMERCE_FAILED";
    if (message === "AUTH_REQUIRED" || /401|unauthorized/i.test(message)) {
      window.location.href = "/auth?next=" + encodeURIComponent("/portal#uyelik");
      return;
    }
    toast.error(message);
  };

  const beginMembership = async (plan: "basic" | "plus" | "pro", yearly: boolean) => {
    const pendingKey = `${plan}-${yearly ? "year" : "month"}`;
    setPendingItem(pendingKey);
    try {
      const result = await startMembershipCheckoutEdge({
        plan,
        yearly,
        requestId: crypto.randomUUID(),
      });
      window.location.href = result.url;
    } catch (error) {
      handleCommerceError(error);
    } finally {
      setPendingItem(null);
    }
  };

  const beginCredits = async (pack: "credits-25" | "credits-75" | "credits-200") => {
    setPendingItem(pack);
    try {
      const result = await startCreditCheckoutEdge({ pack, requestId: crypto.randomUUID() });
      window.location.href = result.url;
    } catch (error) {
      handleCommerceError(error);
    } finally {
      setPendingItem(null);
    }
  };

  return (
    <section id="uyelik" className="py-20">
      <div className="text-center">
        <Badge className="mb-3 bg-gold/15 text-navy hover:bg-gold/15">{commerce.plans}</Badge>
        <h2 className="font-display text-3xl font-semibold text-navy md:text-4xl">
          {commerce.plansTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{commerce.plansDesc}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {PORTAL_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              "relative rounded-[1.75rem] border p-6 shadow-sm " +
              (plan.featured
                ? "border-gold bg-navy text-white shadow-xl shadow-navy/20"
                : "border-border/70 bg-white")
            }
          >
            {plan.featured ? (
              <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-gold text-gold-foreground">
                {commerce.featured}
              </Badge>
            ) : null}
            <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
            <p
              className={
                "mt-2 text-sm " + (plan.featured ? "text-white/70" : "text-muted-foreground")
              }
            >
              {commerce.planDescriptions[plan.id]}
            </p>
            <div className="mt-6">
              <span className="text-4xl font-semibold">€{plan.monthly}</span>
              <span className={plan.featured ? "text-white/60" : "text-muted-foreground"}>
                /{commerce.month}
              </span>
              <span
                className={
                  "mt-2 block text-xs font-semibold " +
                  (plan.featured ? "text-gold" : "text-teal")
                }
              >
                €{plan.yearly}/{commerce.year} · {plan.includedCredits} {commerce.creditsIncluded}
              </span>
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
            {ready ? (
              <div className="mt-8 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void beginMembership(plan.id, false)}
                  disabled={pendingItem !== null}
                  className={
                    "min-h-11 rounded-xl px-3 text-sm font-semibold disabled:opacity-60 " +
                    (plan.featured ? "bg-gold text-gold-foreground" : "bg-navy text-white")
                  }
                >
                  {pendingItem === `${plan.id}-month` ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    `€${plan.monthly}/${commerce.month}`
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void beginMembership(plan.id, true)}
                  disabled={pendingItem !== null}
                  className={
                    "min-h-11 rounded-xl border px-3 text-sm font-semibold disabled:opacity-60 " +
                    (plan.featured
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-teal/30 bg-white text-teal")
                  }
                >
                  {pendingItem === `${plan.id}-year` ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    `€${plan.yearly}/${commerce.year}`
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className={
                  "mt-8 w-full cursor-not-allowed rounded-xl px-4 py-2.5 text-sm font-semibold opacity-70 " +
                  (plan.featured ? "bg-gold text-gold-foreground" : "bg-navy text-white")
                }
              >
                {health.isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : commerce.securePending}
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-teal/20 bg-gradient-to-br from-slate-50 to-teal/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              {commerce.creditPacks}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-navy">
              {commerce.compareCredits}
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <LockKeyhole className="h-4 w-4 text-teal" />
            {ready ? "Stripe" : commerce.securePending}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => ready && void beginCredits(pack.id)}
              disabled={!ready || pendingItem !== null}
              className="rounded-2xl border bg-white p-4 text-start shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:border-teal/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <strong className="text-2xl text-navy">{pack.credits}</strong>
              <span className="mt-1 block text-sm font-semibold text-gold">€{pack.price}</span>
              <span className="mt-3 flex min-h-5 items-center text-xs font-semibold text-teal">
                {pendingItem === pack.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : ready ? (
                  "Stripe"
                ) : (
                  commerce.purchaseSoon
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
