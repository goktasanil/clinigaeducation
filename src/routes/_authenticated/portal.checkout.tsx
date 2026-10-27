import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Clock3, CreditCard, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePortalCheckoutCopy } from "@/components/portal/portal-checkout-copy";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getIyzicoCheckout, formatPortalPayment } from "@/lib/portal-payments";
import {
  buildIyzicoFrameDocument,
  checkoutSearchSchema,
  IYZICO_FRAME_SANDBOX,
} from "@/lib/iyzico-checkout-frame";

export const Route = createFileRoute("/_authenticated/portal/checkout")({
  validateSearch: zodValidator(checkoutSearchSchema),
  head: () => ({
    meta: [
      { title: "Secure Checkout | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  errorComponent: () => <CheckoutUnavailable invalid />,
  component: PortalCheckoutPage,
});

function CheckoutUnavailable({
  invalid = false,
  expired = false,
  auth = false,
  onRetry,
  pending = false,
}: {
  invalid?: boolean;
  expired?: boolean;
  auth?: boolean;
  onRetry?: () => void;
  pending?: boolean;
}) {
  const { copy } = usePortalCheckoutCopy();
  const title = invalid
    ? copy.invalidTitle
    : expired
      ? copy.expiredTitle
      : auth
        ? copy.authTitle
        : copy.errorTitle;
  const description = invalid
    ? copy.invalidDescription
    : expired
      ? copy.expiredDescription
      : auth
        ? copy.authDescription
        : copy.errorDescription;
  return (
    <section className="container-prose flex min-h-[60svh] max-w-2xl flex-col justify-center py-12">
      <div className="rounded-2xl border border-navy/10 bg-white p-6 md:p-9" role="status">
        <AlertCircle className="h-7 w-7 text-teal" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-navy">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="min-h-11 rounded-xl bg-navy text-white">
            <a href="/portal/account">{copy.account}</a>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <a href="/portal#uyelik">{copy.plans}</a>
          </Button>
          {onRetry && !expired && !auth && !invalid ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl"
              disabled={pending}
              onClick={onRetry}
            >
              <RefreshCw className="me-2 h-4 w-4" />
              {copy.retry}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PortalCheckoutPage() {
  const { session } = Route.useSearch();
  const { user } = Route.useRouteContext();
  const { copy, locale } = usePortalCheckoutCopy();
  const queryClient = useQueryClient();
  const [authValid, setAuthValid] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [frameLoading, setFrameLoading] = useState(true);
  const queryKey = ["portal-iyzico-checkout", user.id, session, locale];
  const checkout = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getIyzicoCheckout(session);
      const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
      const document = await buildIyzicoFrameDocument(result.formContent, {
        locale,
        title: copy.formTitle,
        callbackUrl: base
          ? `${base}/functions/v1/iyzico-callback?order=${encodeURIComponent(session)}`
          : undefined,
      });
      return { ...result, document };
    },
    enabled: authValid,
    retry: false,
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    document.title = `${copy.title} | CliniGA Education`;
  }, [copy.title]);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, sessionState) => {
      if (!sessionState || sessionState.user.id !== user.id) {
        setAuthValid(false);
        queryClient.removeQueries({ queryKey: ["portal-iyzico-checkout", user.id] });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, user.id]);
  useEffect(() => {
    setFrameLoading(true);
  }, [session, locale]);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!authValid) return <CheckoutUnavailable auth />;
  if (checkout.isLoading)
    return (
      <section className="container-prose grid min-h-[65svh] place-items-center py-12">
        <div className="text-center" role="status">
          <Loader2
            className="mx-auto h-8 w-8 animate-spin text-teal motion-reduce:animate-none"
            aria-hidden="true"
          />
          <h1 className="mt-4 font-display text-2xl font-semibold text-navy">{copy.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{copy.loading}</p>
        </div>
      </section>
    );
  if (checkout.isError || !checkout.data)
    return (
      <CheckoutUnavailable
        auth={checkout.error instanceof Error && checkout.error.message === "AUTH_REQUIRED"}
        pending={checkout.isFetching}
        onRetry={() => void checkout.refetch()}
      />
    );
  const data = checkout.data;
  if (Date.parse(data.expiresAt) <= now) return <CheckoutUnavailable expired />;
  const expires = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(data.expiresAt));

  return (
    <section className="min-h-screen bg-[#f6f9fc] py-8 md:py-10">
      <div className="container-prose max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              CliniGA Education
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-navy">{copy.title}</h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {copy.subtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-navy/10 bg-white p-5">
          <div>
            <p className="text-xs text-muted-foreground">{copy.provider}</p>
            <p className="mt-1 inline-flex items-center gap-2 font-semibold text-navy">
              <CreditCard className="h-4 w-4 text-teal" aria-hidden="true" />
              iyzico
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{copy.amount}</p>
            <p className="mt-1 text-xl font-semibold text-navy">
              {formatPortalPayment(data.amountMinor, data.currency, locale)}
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.expires}
            </p>
            <p className="mt-1 text-sm font-medium text-navy">{expires}</p>
          </div>
        </div>
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-navy/10 bg-white">
          {frameLoading ? (
            <div
              className="flex items-center gap-3 border-b p-4 text-sm text-muted-foreground"
              role="status"
            >
              <Loader2
                className="h-4 w-4 animate-spin text-teal motion-reduce:animate-none"
                aria-hidden="true"
              />
              {copy.loading}
            </div>
          ) : null}
          <iframe
            title={copy.formTitle}
            srcDoc={data.document}
            sandbox={IYZICO_FRAME_SANDBOX}
            referrerPolicy="no-referrer"
            allow="camera 'none'; microphone 'none'; geolocation 'none'"
            onLoad={() => setFrameLoading(false)}
            className="block h-[82svh] min-h-[720px] w-full border-0 bg-white md:min-h-[800px]"
          />
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {copy.statusNote}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {copy.formHelp}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="min-h-11 rounded-xl bg-navy text-white">
            <a href="/portal/account">{copy.account}</a>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <a href="/portal#uyelik">{copy.plans}</a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl"
            disabled={checkout.isFetching}
            onClick={() => {
              setFrameLoading(true);
              void checkout.refetch();
            }}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {copy.retry}
          </Button>
        </div>
      </div>
    </section>
  );
}
