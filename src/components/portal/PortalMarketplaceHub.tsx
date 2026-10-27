import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BadgeCheck,
  Bike,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Globe2,
  Grid2X2,
  HeartHandshake,
  Home,
  List,
  Loader2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type MarketplaceKind,
  usePortalMarketplaceCopy,
} from "@/components/portal/portal-marketplace-copy";
import { supabase } from "@/integrations/supabase/client";

export type PortalMarketplaceSelection = {
  countryCode: string;
  city: string;
  institutionName: string;
  institutionId?: string;
};

type PublicListing = {
  id: string;
  kind: MarketplaceKind;
  title: string;
  description: string;
  country_code: string;
  city: string;
  institution: string | null;
  program: string | null;
  price_amount: number | string | null;
  currency: string | null;
  verified: boolean;
  expires_at: string | null;
  created_at: string;
  global_scope: boolean;
};

type PublicListingQuery = {
  or: (filters: string) => PublicListingQuery;
  order: (column: string, options: { ascending: boolean }) => PublicListingQuery;
  limit: (count: number) => PromiseLike<{
    data: PublicListing[] | null;
    error: { message: string } | null;
  }>;
};

type PublicListingClient = {
  from: (table: "portal_public_listings") => {
    select: (columns: string) => PublicListingQuery;
  };
};

const CATEGORIES = [
  {
    id: "housing",
    Icon: Home,
    color: "bg-sky-50 text-sky-800 border-sky-200",
    accent: "bg-sky-100 text-sky-800",
  },
  {
    id: "dormitory",
    Icon: Building2,
    color: "bg-violet-50 text-violet-800 border-violet-200",
    accent: "bg-violet-100 text-violet-800",
  },
  {
    id: "roommates",
    Icon: Users,
    color: "bg-rose-50 text-rose-800 border-rose-200",
    accent: "bg-rose-100 text-rose-800",
  },
  {
    id: "marketplace",
    Icon: Bike,
    color: "bg-orange-50 text-orange-800 border-orange-200",
    accent: "bg-orange-100 text-orange-800",
  },
  {
    id: "jobs",
    Icon: BriefcaseBusiness,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accent: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "services",
    Icon: HeartHandshake,
    color: "bg-cyan-50 text-cyan-800 border-cyan-200",
    accent: "bg-cyan-100 text-cyan-800",
  },
  {
    id: "scholarships",
    Icon: CircleDollarSign,
    color: "bg-amber-50 text-amber-900 border-amber-200",
    accent: "bg-amber-100 text-amber-900",
  },
  {
    id: "community",
    Icon: Globe2,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    accent: "bg-blue-100 text-blue-800",
  },
] as const;

function normalized(value: string | null | undefined) {
  return (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isListing(value: PublicListing) {
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    CATEGORIES.some((category) => category.id === value.kind) &&
    (!value.expires_at || Date.parse(value.expires_at) > Date.now())
  );
}

function selectionParameters(selection?: PortalMarketplaceSelection) {
  const params = new URLSearchParams();
  if (selection?.countryCode && /^[A-Z]{2}$/.test(selection.countryCode)) {
    params.set("country", selection.countryCode);
  }
  if (selection?.city) params.set("city", selection.city.slice(0, 120));
  if (selection?.institutionId) params.set("institution", selection.institutionId.slice(0, 240));
  if (selection?.institutionName) {
    params.set("institutionName", selection.institutionName.slice(0, 240));
  }
  return params;
}

export function PortalMarketplaceHub({ selection }: { selection?: PortalMarketplaceSelection }) {
  const { copy, locale } = usePortalMarketplaceCopy();
  const [category, setCategory] = useState<MarketplaceKind | "all">("all");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(selection?.city || "");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(12);
  const [openedListing, setOpenedListing] = useState<PublicListing | null>(null);
  const countryCode = /^[A-Z]{2}$/.test(selection?.countryCode || "")
    ? selection?.countryCode || ""
    : "";

  useEffect(() => {
    setCity(selection?.city || "");
    setVisibleCount(12);
  }, [selection?.city, countryCode]);

  const listingsQuery = useQuery({
    queryKey: ["portal-marketplace-public", countryCode],
    queryFn: async () => {
      // This security-invoker view exposes active, moderated public content only.
      // Owner IDs, contact details and payment fields never enter this component.
      const db = supabase as unknown as PublicListingClient;
      let request = db
        .from("portal_public_listings")
        .select(
          "id, kind, title, description, country_code, city, institution, program, price_amount, currency, verified, expires_at, created_at, global_scope",
        );
      if (countryCode) {
        request = request.or(`country_code.eq.${countryCode},global_scope.eq.true`);
      }
      const { data, error } = await request.order("created_at", { ascending: false }).limit(72);
      if (error) throw new Error(error.message);
      return (data || []).filter(isListing);
    },
    staleTime: 60_000,
    retry: 1,
  });

  const filteredListings = useMemo(() => {
    const query = normalized(search);
    const cityQuery = normalized(city);
    const institutionQuery = normalized(selection?.institutionName);
    const budget = maximumPrice === "" ? null : Number(maximumPrice);
    return (listingsQuery.data || []).filter((listing) => {
      if (category !== "all" && listing.kind !== category) return false;
      if (!listing.global_scope && cityQuery && !normalized(listing.city).includes(cityQuery)) {
        return false;
      }
      if (
        !listing.global_scope &&
        institutionQuery &&
        listing.institution &&
        normalized(listing.institution) !== institutionQuery
      ) {
        return false;
      }
      if (
        query &&
        !normalized(
          [listing.title, listing.description, listing.city, listing.institution].join(" "),
        ).includes(query)
      ) {
        return false;
      }
      if (budget !== null && Number.isFinite(budget)) {
        if (
          listing.price_amount === null ||
          !Number.isFinite(Number(listing.price_amount)) ||
          Number(listing.price_amount) > budget ||
          String(listing.currency || "").toUpperCase() !== currency
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    listingsQuery.data,
    category,
    search,
    city,
    maximumPrice,
    currency,
    selection?.institutionName,
  ]);

  const params = selectionParameters(selection);
  const panelHref = "/portal/panel" + (params.size ? "?" + params.toString() : "");
  const accountHref = "/auth?next=" + encodeURIComponent(panelHref);
  const workspaceHref = "/portal/workspace" + (params.size ? "?" + params.toString() : "");

  const price = (listing: PublicListing) => {
    if (listing.price_amount === null || !Number.isFinite(Number(listing.price_amount))) {
      return copy.priceOnRequest;
    }
    const code = String(listing.currency || "").toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) return copy.priceOnRequest;
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
      }).format(Number(listing.price_amount));
    } catch {
      return copy.priceOnRequest;
    }
  };

  const changeFilter = (update: () => void) => {
    update();
    setVisibleCount(12);
  };

  const clearFilters = () => {
    setCategory("all");
    setSearch("");
    setCity("");
    setMaximumPrice("");
    setVisibleCount(12);
  };

  const inputClass =
    "mt-2 h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-navy outline-none focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/30";
  const locationLabel = [selection?.city, selection?.institutionName].filter(Boolean).join(" · ");

  return (
    <section
      id="community"
      className="scroll-mt-24 py-14 md:py-20"
      aria-labelledby="portal-marketplace-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-teal">{copy.eyebrow}</p>
          <h2
            id="portal-marketplace-title"
            className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{copy.description}</p>
          {locationLabel && (
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-teal">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{locationLabel}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <a href={workspaceHref}>{copy.saved}</a>
          </Button>
          <Button asChild className="min-h-11 rounded-xl bg-navy text-white hover:bg-navy/90">
            <a href={accountHref}>
              <Plus className="me-2 h-4 w-4" />
              {copy.post}
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" aria-label={copy.eyebrow}>
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => changeFilter(() => setCategory("all"))}
          className={
            "min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
            (category === "all"
              ? "border-navy bg-navy text-white"
              : "border-slate-200 bg-white text-navy hover:bg-slate-50")
          }
        >
          {copy.all}
        </button>
        {CATEGORIES.map(({ id, Icon, color }) => (
          <button
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => changeFilter(() => setCategory(id))}
            className={
              "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
              color +
              (category === id ? " ring-2 ring-current ring-offset-2" : " hover:brightness-95")
            }
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {copy.categories[id]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_.65fr]">
        <label className="min-w-0 text-sm font-semibold text-navy">
          {copy.search}
          <span className="relative block">
            <Search className="pointer-events-none absolute start-3 top-5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              maxLength={120}
              placeholder={copy.searchPlaceholder}
              onChange={(event) => changeFilter(() => setSearch(event.target.value))}
              className={inputClass + " ps-10"}
            />
          </span>
        </label>
        <label className="min-w-0 text-sm font-semibold text-navy">
          {copy.city}
          <input
            value={city}
            maxLength={100}
            placeholder={copy.cityPlaceholder}
            onChange={(event) => changeFilter(() => setCity(event.target.value))}
            className={inputClass}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold text-navy">
          {copy.budget}
          <input
            type="number"
            min="0"
            max="1000000"
            step="1"
            value={maximumPrice}
            inputMode="decimal"
            aria-describedby="marketplace-budget-hint"
            onChange={(event) => changeFilter(() => setMaximumPrice(event.target.value))}
            className={inputClass}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold text-navy">
          {copy.currency}
          <select
            value={currency}
            onChange={(event) => changeFilter(() => setCurrency(event.target.value))}
            className={inputClass}
          >
            {["EUR", "TRY", "USD", "GBP"].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <p
          id="marketplace-budget-hint"
          className="text-xs leading-relaxed text-muted-foreground sm:col-span-2 xl:col-span-4"
        >
          {copy.budgetHint}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {!listingsQuery.isLoading && !listingsQuery.isError && (
            <>
              {copy.results}: <strong className="text-navy">{filteredListings.length}</strong>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="me-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {copy.clear}
          </button>
          <div className="flex rounded-xl border bg-white p-1">
            <button
              type="button"
              aria-label={copy.grid}
              title={copy.grid}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={
                "grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                (view === "grid" ? "bg-navy text-white" : "text-slate-500 hover:bg-slate-50")
              }
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={copy.list}
              title={copy.list}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={
                "grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                (view === "list" ? "bg-navy text-white" : "text-slate-500 hover:bg-slate-50")
              }
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {listingsQuery.isLoading ? (
        <div
          className="mt-6 flex min-h-60 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none text-teal" />
          {copy.loading}
        </div>
      ) : listingsQuery.isError ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-amber-950">{copy.error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 rounded-xl border-amber-300 bg-white"
            onClick={() => void listingsQuery.refetch()}
          >
            {copy.retry}
          </Button>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="mt-6 grid items-center gap-6 rounded-2xl border border-dashed border-slate-300 bg-white p-7 sm:grid-cols-[auto_1fr] md:p-10">
          <div aria-hidden="true" className="flex -space-x-3 rtl:space-x-reverse">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-sky-100 text-sky-800">
              <Home className="h-7 w-7" />
            </span>
            <span className="mt-5 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-orange-100 text-orange-800">
              <Bike className="h-7 w-7" />
            </span>
            <span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-rose-100 text-rose-800">
              <Users className="h-7 w-7" />
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-navy">{copy.emptyTitle}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {copy.emptyDescription}
            </p>
            <a
              href={accountHref}
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-teal hover:underline"
            >
              {copy.post}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : (
        <div
          className={
            "mt-6 grid gap-4 " + (view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")
          }
        >
          {filteredListings.slice(0, visibleCount).map((listing) => {
            const categoryItem = CATEGORIES.find((item) => item.id === listing.kind)!;
            const Icon = categoryItem.Icon;
            return (
              <article
                key={listing.id}
                className={
                  "group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-teal/50 " +
                  (view === "list"
                    ? "sm:grid sm:grid-cols-[3.5rem_1fr_auto] sm:items-start sm:gap-5"
                    : "flex flex-col")
                }
              >
                <div
                  className={
                    "mb-4 grid h-12 w-12 shrink-0 place-items-center rounded-xl " +
                    categoryItem.accent
                  }
                >
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-teal">
                      {copy.categories[listing.kind]}
                    </span>
                    {listing.global_scope && (
                      <Badge variant="secondary" className="text-[11px]">
                        {copy.global}
                      </Badge>
                    )}
                    {listing.verified && (
                      <span title={copy.verified} aria-label={copy.verified}>
                        <BadgeCheck className="h-4 w-4 text-teal" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 break-words font-display text-lg font-semibold leading-snug text-navy">
                    <button
                      type="button"
                      onClick={() => setOpenedListing(listing)}
                      className="text-start decoration-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                    >
                      {listing.title}
                    </button>
                  </h3>
                  <p className="mt-3 line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
                    {listing.description}
                  </p>
                  <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {[listing.city, listing.country_code].filter(Boolean).join(", ")}
                      {listing.institution && (
                        <span className="mt-1 block">{listing.institution}</span>
                      )}
                    </span>
                  </p>
                </div>
                <div
                  className={
                    "mt-5 flex flex-wrap items-center justify-between gap-3 " +
                    (view === "list"
                      ? "sm:mt-0 sm:max-w-52 sm:flex-col sm:items-end"
                      : "border-t border-slate-100 pt-4")
                  }
                >
                  <strong className="text-sm text-navy">{price(listing)}</strong>
                  <button
                    type="button"
                    onClick={() => setOpenedListing(listing)}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  >
                    {copy.details}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredListings.length > visibleCount && (
        <div className="mt-7 text-center">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl"
            onClick={() => setVisibleCount((value) => value + 12)}
          >
            {copy.more}
          </Button>
        </div>
      )}
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">{copy.notice}</p>

      <DialogPrimitive.Root
        open={openedListing !== null}
        onOpenChange={(open) => {
          if (!open) setOpenedListing(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/60" />
          <DialogPrimitive.Content
            className="fixed start-1/2 top-1/2 z-50 max-h-[88dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-white p-6 shadow-2xl outline-none rtl:translate-x-1/2 md:p-8"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {openedListing && (
              <>
                <DialogPrimitive.Title className="pe-10 font-display text-2xl font-semibold leading-tight text-navy">
                  {openedListing.title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{copy.categories[openedListing.kind]}</span>
                  <span>
                    {[openedListing.city, openedListing.country_code].filter(Boolean).join(", ")}
                  </span>
                </DialogPrimitive.Description>
                <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {openedListing.description}
                </p>
                {openedListing.institution && (
                  <p className="mt-5 text-sm font-medium text-teal">
                    {openedListing.institution}
                    {openedListing.program ? " · " + openedListing.program : ""}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                  <strong className="text-lg text-navy">{price(openedListing)}</strong>
                  <Button
                    asChild
                    className="min-h-11 rounded-xl bg-navy text-white hover:bg-navy/90"
                  >
                    <a href={accountHref}>
                      {copy.contact}
                      <ArrowUpRight className="ms-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{copy.notice}</p>
              </>
            )}
            <DialogPrimitive.Close
              className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              aria-label={copy.close}
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
