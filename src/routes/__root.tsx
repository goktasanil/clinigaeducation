import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "../i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuditIdNotice } from "@/components/AuditIdNotice";
import { GOOGLE_SITE_VERIFICATION_TOKENS } from "@/lib/site-verification";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-navy">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
          Sayfa bulunamadı
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa taşınmış veya silinmiş olabilir.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy/90"
          >
            Anasayfaya Dön
          </Link>
        </div>
        <AuditIdNotice />
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Bu sayfa yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bir aksaklık oluştu. Tekrar deneyebilir ya da anasayfaya dönebilirsiniz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy/90"
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Anasayfa
          </a>
        </div>
        <AuditIdNotice />
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "CliniGA Education" },
      { name: "robots", content: "index, follow" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { httpEquiv: "X-Content-Type-Options", content: "nosniff" },
      { httpEquiv: "Permissions-Policy", content: "geolocation=(), microphone=(), camera=()" },
      { property: "og:site_name", content: "CliniGA Education" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B1F3A" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      { rel: "dns-prefetch", href: "https://static.wixstatic.com" },
      { rel: "preconnect", href: "https://static.wixstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["EducationalOrganization", "ProfessionalService"],
          name: "CliniGA Education",
          url: "https://www.clinigaeducation.com/",
          email: "clinigaeducation@gmail.com",
          telephone: "+39 344 675 9253",
          description:
            "Yurt dışı eğitim, vize, master, doktora ve tez danışmanlığı; istatistik analizi hizmetleri.",
          areaServed: "Worldwide",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Rome",
            addressCountry: "IT",
          },
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "clinigaeducation@gmail.com",
            telephone: "+39 344 675 9253",
            availableLanguage: ["tr", "en", "de", "fr", "it", "es", "ar", "ru", "zh"],
          },
          serviceType: [
            "Yurt Dışı Eğitim Danışmanlığı",
            "Vize Danışmanlığı",
            "Tez Danışmanlığı",
            "İstatistik Analizi",
            "Akademik Yazım",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {GOOGLE_SITE_VERIFICATION_TOKENS.map((content) => (
          <meta key={content} name="google-site-verification" content={content} />
        ))}
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-navy-foreground"
        >
          Ana içeriğe geç
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />

        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
