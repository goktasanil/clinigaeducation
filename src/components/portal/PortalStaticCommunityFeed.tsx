import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Loader2, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";
import { supabase } from "@/integrations/supabase/client";
import { getPortalCommerceHealth, startMarketplaceCheckoutEdge } from "@/lib/stripe-edge";

type PublicListing = {
  id: string;
  title: string;
  description: string;
  city: string;
  country_code: string;
  institution: string | null;
  verified: boolean;
  price_amount: number | null;
  currency: string | null;
  created_at: string;
};

type ListingQuery = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: unknown) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => {
          limit: (count: number) => Promise<{ data: PublicListing[] | null; error: Error | null }>;
        };
      };
    };
  };
};

export function PortalStaticCommunityFeed() {
  const { life, commerce } = usePortalPublicCopy();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const commerceHealth = useQuery({
    queryKey: ["portal-commerce-health"],
    queryFn: getPortalCommerceHealth,
    staleTime: 30_000,
    retry: 1,
  });
  const listings = useQuery({
    queryKey: ["portal-public-listings-static"],
    queryFn: async () => {
      const db = supabase as unknown as ListingQuery;
      const { data, error } = await db
        .from("portal_listings")
        .select(
          "id, title, description, city, country_code, institution, verified, price_amount, currency, created_at",
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const buy = async (listingId: string) => {
    setPurchasingId(listingId);
    try {
      const result = await startMarketplaceCheckoutEdge({
        listingId,
        requestId: crypto.randomUUID(),
      });
      window.location.href = result.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "PORTAL_COMMERCE_FAILED";
      if (message === "AUTH_REQUIRED" || /401|unauthorized/i.test(message)) {
        window.location.href = "/auth?next=" + encodeURIComponent("/portal#community");
        return;
      }
      toast.error(message);
    } finally {
      setPurchasingId(null);
    }
  };

  if (listings.isLoading) {
    return (
      <div className="mb-16 grid min-h-40 place-items-center rounded-2xl border bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-teal" />
      </div>
    );
  }

  if (listings.isError || !listings.data?.length) return null;

  const paymentReady = commerceHealth.data?.configured === true;

  return (
    <section className="pb-20" aria-labelledby="static-community-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-teal/30 text-teal">
            {life.moderation}
          </Badge>
          <h2 id="static-community-title" className="font-display text-3xl font-semibold text-navy">
            {life.groups[2]?.title ?? life.moderation}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{life.moderationDesc}</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl border-teal/30">
          <a href="/portal/workspace">{life.workspace}</a>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.data.map((listing) => (
          <article key={listing.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-gold">
                <ShoppingBag className="h-5 w-5" />
              </span>
              {listing.verified ? (
                <Badge className="bg-teal/10 text-teal hover:bg-teal/10">
                  <BadgeCheck className="me-1 h-3.5 w-3.5" />
                  ✓
                </Badge>
              ) : null}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-navy">{listing.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-teal" />
              {[listing.city, listing.country_code].filter(Boolean).join(", ")}
            </div>
            {listing.institution ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">{listing.institution}</p>
            ) : null}
            <div className="mt-5 border-t pt-4">
              {listing.price_amount ? (
                <button
                  type="button"
                  onClick={() => paymentReady && void buy(listing.id)}
                  disabled={!paymentReady || purchasingId !== null}
                  className="flex min-h-10 w-full items-center justify-center rounded-xl bg-gold px-4 text-sm font-semibold text-gold-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {purchasingId === listing.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : paymentReady ? (
                    `${String(listing.currency || "EUR").toUpperCase()} ${Number(listing.price_amount).toFixed(2)} · Stripe`
                  ) : (
                    commerce.securePending
                  )}
                </button>
              ) : (
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <a href="/auth?next=/portal/workspace">{life.workspace}</a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
