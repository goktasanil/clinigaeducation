import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { getServiceDetail, SERVICE_DETAILS } from "@/data/serviceDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BASE_URL = "https://www.clinigaeducation.com";

export const Route = createFileRoute("/hizmetler_/$slug")({
  loader: ({ params }) => {
    const service = getServiceDetail(params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData, params }) => {
    const service = loaderData;
    if (!service) return {};
    const url = `${BASE_URL}/hizmetler/${params.slug}`;
    return {
      meta: [
        { title: `${service.title} | CliniGA Education` },
        { name: "description", content: service.summary },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${service.title} | CliniGA Education` },
        { property: "og:description", content: service.summary },
        { property: "og:url", content: url },
        { property: "og:image", content: `${BASE_URL}/og-cover.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${BASE_URL}/og-cover.png` },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                name: service.title,
                description: service.summary,
                url,
                provider: { "@type": "Organization", name: "CliniGA Education", url: BASE_URL },
                areaServed: "Worldwide",
              },
              {
                "@type": "FAQPage",
                mainEntity: service.faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: { "@type": "Answer", text: faq.answer },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const service = Route.useLoaderData();
  const related = SERVICE_DETAILS.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="gradient-navy py-16 text-navy-foreground md:py-24">
        <div className="container-prose">
          <nav className="text-sm text-navy-foreground/60" aria-label="Breadcrumb">
            <Link to="/hizmetler" className="hover:text-gold">
              Hizmetler
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{service.shortTitle}</span>
          </nav>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {service.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            {service.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-navy-foreground/78">
            {service.summary}
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
            <Clock3 className="h-4 w-4 text-gold" /> {service.duration}
          </div>
        </div>
      </section>

      <main className="container-prose py-16 md:py-20">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-7">
              <h2 className="font-display text-2xl font-semibold text-navy">Kimler için uygun?</h2>
              <ul className="mt-5 space-y-3">
                {service.idealFor.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-7">
              <h2 className="font-display text-2xl font-semibold text-navy">Örnek teslimatlar</h2>
              <ul className="mt-5 space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                    <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Çalışma modeli
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
            Süreç nasıl ilerler?
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border/70 bg-card p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy font-display text-sm font-semibold text-gold">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-teal/25 bg-teal/5 p-6 md:flex md:items-start md:gap-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-teal" />
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">Etik ve sonuç sınırı</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {service.boundary}
            </p>
          </div>
        </aside>

        <section className="py-16 md:py-20">
          <h2 className="font-display text-3xl font-semibold text-navy">
            Bu hizmet hakkında sık sorulanlar
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {service.faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-border/70 bg-card p-6"
              >
                <h3 className="font-display text-lg font-semibold text-navy">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-navy p-7 text-white md:flex md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="font-display text-3xl font-semibold">Kapsamı birlikte netleştirelim</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
              Ön görüşmede hedef, takvim, teslimatlar, ücret ve sorumluluklar yazılı olarak
              açıklanır.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-6 shrink-0 bg-gold text-gold-foreground hover:bg-gold/90 md:ml-8 md:mt-0"
          >
            <a href={`/iletisim?intent=${service.slug}#randevu`}>
              Ücretsiz ön görüşme <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </section>

        <section className="pt-16">
          <h2 className="font-display text-2xl font-semibold text-navy">İlgili hizmetler</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                to="/hizmetler/$slug"
                params={{ slug: item.slug }}
                className="group rounded-xl border border-border/70 p-5 transition hover:border-teal hover:shadow-card"
              >
                <span className="font-display font-semibold text-navy group-hover:text-teal">
                  {item.shortTitle}
                </span>
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
