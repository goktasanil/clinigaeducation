import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MessageCircle, Clock, CheckCircle2, Calendar as CalendarIcon, Copy } from "lucide-react";
import { toast } from "sonner";

import { ContactForm, type ContactSuccess } from "@/components/contact/ContactForm";
import { AppointmentPicker } from "@/components/contact/AppointmentPicker";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SITE, buildWhatsAppLink } from "@/data/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim & Ücretsiz Ön Görüşme Randevusu | CliniGA Education" },
      {
        name: "description",
        content:
          "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz ön görüşmenizi çevrimiçi randevu sistemimizle planlayın.",
      },
      {
        name: "keywords",
        content:
          "yurt dışı eğitim danışmanlığı iletişim, vize danışmanlığı randevu, tez danışmanlığı görüşme, ücretsiz ön görüşme, akademik danışmanlık randevu",
      },
      { property: "og:title", content: "Ücretsiz Ön Görüşme Planla | CliniGA Education" },
      {
        property: "og:description",
        content:
          "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz strateji görüşmenizi ayırtın.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/iletisim" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Ücretsiz Ön Görüşme Randevusu" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ücretsiz Ön Görüşme Planla | CliniGA Education" },
      { name: "twitter:description", content: "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz strateji görüşmenizi ayırtın." },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/iletisim" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "CliniGA Education",
          description:
            "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı. Şeffaf, etik ve sonuç odaklı akademik rehberlik.",
          url: "https://www.clinigaeducation.com",
          email: "clinigaeducation@gmail.com",
          telephone: "+39-344-675-9253",
          address: { "@type": "PostalAddress", addressLocality: "Roma", addressCountry: "IT" },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+39-344-675-9253",
            contactType: "Academic Consulting",
            availableLanguage: [
              "Turkish","English","Arabic","Russian","German",
              "French","Italian","Spanish","Chinese",
            ],
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            opens: "09:00",
            closes: "18:00",
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t, i18n } = useTranslation();
  const [appointment, setAppointment] = useState<import("@/components/contact/AppointmentPicker").AppointmentSelection>(null);
  const [success, setSuccess] = useState<ContactSuccess | null>(null);

  // Read ?intent=xxx from quiz redirect to prefill the service field
  const intentFromQuery =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("intent")
      : null;
  const intentList = t("quiz.intents.list", { returnObjects: true }) as Array<{ title: string }>;
  const INTENT_ORDER = ["abroad", "career", "university", "thesis", "stats", "publication", "kpss", "mentorship"] as const;
  const intentIdx = intentFromQuery ? INTENT_ORDER.indexOf(intentFromQuery as (typeof INTENT_ORDER)[number]) : -1;
  const prefillIntentLabel = intentIdx >= 0 ? intentList[intentIdx]?.title ?? null : null;

  if (success) {
    return (
      <section className="container-prose py-16 md:py-24">
        <Card className="mx-auto max-w-2xl border-teal/30 bg-teal/5 shadow-card">
          <CardContent className="p-8 text-center md:p-12">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-teal text-teal-foreground">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-navy md:text-4xl">
              {t("contact.successScreen.title")}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {t("contact.successScreen.subtitle", { name: success.name })}
            </p>

            <div className="mt-8 rounded-lg border border-border bg-background p-5 text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.successScreen.confirmationLabel")}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="font-display text-2xl font-bold tracking-wider text-gold">
                  {success.confirmationCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(success.confirmationCode);
                    toast.success(t("contact.successScreen.copied"));
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  {t("contact.successScreen.copy")}
                </Button>
              </div>
              {success.appointmentAt && (
                <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
                  <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <div className="text-sm">
                    <p className="font-medium text-navy">
                      {t("contact.successScreen.appointmentLabel")}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(success.appointmentAt).toLocaleString(i18n.language, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {t("contact.successScreen.nextSteps", { email: success.email })}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setAppointment(null);
                }}
              >
                {t("contact.successScreen.newRequest")}
              </Button>
              <Button
                asChild
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                <a href={buildWhatsAppLink(t("cta.whatsapp"))} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <>
      <section className="gradient-navy py-16 text-navy-foreground md:py-20">
        <div className="container-prose">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("nav.contact")}
            </p>
            <div className="shrink-0 rounded-full bg-white/10 px-1 backdrop-blur">
              <LanguageSwitcher />
            </div>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <section className="container-prose py-14">
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardContent className="p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-teal/10 text-teal">
                <Mail className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.info.emailLabel")}
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-1 block font-display text-lg font-semibold text-navy hover:text-teal"
              >
                {SITE.email}
              </a>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-teal/10 text-teal">
                <MessageCircle className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.info.whatsappLabel")}
              </p>
              <a
                href={buildWhatsAppLink(t("cta.whatsapp"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-display text-lg font-semibold text-navy hover:text-teal"
              >
                {SITE.whatsappDisplay}
              </a>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-teal/10 text-teal">
                <Clock className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.info.hoursLabel")}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-navy">
                {t("contact.info.hoursValue")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AppointmentPicker value={appointment} onChange={setAppointment} />
          </div>
          <div className="lg:col-span-2">
            <ContactForm appointment={appointment} onSuccess={setSuccess} prefillIntent={prefillIntentLabel} />
          </div>
        </div>
      </section>
    </>
  );
}
