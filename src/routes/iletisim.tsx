import { PageMasthead } from "@/components/presentation/PageMasthead";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { ContactForm, type ContactSuccess } from "@/components/contact/ContactForm";
import {
  AppointmentPicker,
  type AppointmentSelection,
} from "@/components/contact/AppointmentPicker";
import { APPOINTMENT_TIME_ZONE } from "@/components/contact/appointment-time";
import { contactCopy } from "@/components/contact/contact-copy";
import { contactPrefillService, validateContactSearch } from "@/components/contact/contact-prefill";
import { SITE, buildConsultationEmailLink, buildWhatsAppLink } from "@/data/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/iletisim")({
  validateSearch: validateContactSearch,
  head: () => ({
    meta: [
      { title: "İletişim & Ücretsiz Ön Görüşme Randevusu | CliniGA Education" },
      {
        name: "description",
        content:
          "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz ön görüşme talebinizi iletin. WhatsApp, kurumsal e-posta ve Roma saat diliminde görüşme tercihi.",
      },
      { property: "og:title", content: "Ücretsiz Ön Görüşme Planla | CliniGA Education" },
      {
        property: "og:description",
        content:
          "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz ön görüşme talebinizi iletin.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/iletisim" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Ücretsiz Ön Görüşme Randevusu" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ücretsiz Ön Görüşme Planla | CliniGA Education" },
      {
        name: "twitter:description",
        content:
          "Yurt dışı eğitim, vize, tez ve istatistik danışmanlığı için ücretsiz ön görüşme talebinizi iletin.",
      },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/iletisim" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": "https://www.clinigaeducation.com/iletisim#webpage",
          name: "İletişim ve Ön Görüşme Talebi | CliniGA Education",
          url: "https://www.clinigaeducation.com/iletisim",
          inLanguage: "tr",
          about: { "@id": "https://www.clinigaeducation.com/#organization" },
          mainEntity: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: SITE.email,
            telephone: SITE.phone,
            url: buildWhatsAppLink(),
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t, i18n } = useTranslation();
  const [success, setSuccess] = useState<ContactSuccess | null>(null);
  const [appointment, setAppointment] = useState<AppointmentSelection>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const copy = contactCopy(i18n.resolvedLanguage || i18n.language || "tr");
  const address = copy.addressPending.includes("[DOLDUR:") ? null : copy.addressPending;
  const responseTime = copy.responsePending.includes("[DOLDUR:") ? null : copy.responsePending;
  const routeSearch = Route.useSearch();
  // Pages serves the same queryless HTML for every query. Apply prefill after hydration.
  const search = hydrated ? routeSearch : {};
  const services = t("contact.form.services", { returnObjects: true }) as string[];
  const prefillService = contactPrefillService(search, services);
  const packageLabel = search.package ? t(`packages.items.${search.package}.name`) : null;

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
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(success.confirmationCode);
                      toast.success(t("contact.successScreen.copied"));
                    } catch {
                      toast.error(t("contact.errorGeneric"));
                    }
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
                        timeZone: APPOINTMENT_TIME_ZONE,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{copy.timeZone}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{copy.preference}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{copy.receipt}</p>
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
              <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
                <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
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
      <PageMasthead kind="contact">
        <div className="container-prose">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("nav.contact")}
            </p>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">{t("contact.subtitle")}</p>
        </div>
      </PageMasthead>

      <section id="randevu" className="container-prose scroll-mt-24 py-14">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-navy">{copy.location}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{copy.country}</p>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardContent className="p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-teal/10 text-teal">
                <MessageCircle className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.info.whatsappLabel")}
              </p>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-display text-lg font-semibold text-navy hover:text-teal"
              >
                WhatsApp · {SITE.whatsappDisplay}
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="mt-3 block font-display text-lg font-semibold text-navy hover:text-teal"
              >
                <span className="block text-xs font-normal text-muted-foreground">{copy.call}</span>
                {SITE.phoneDisplay}
              </a>
            </CardContent>
          </Card>
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
                <Clock className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("contact.info.hoursLabel")}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-navy">
                {t("contact.info.hoursValue")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{copy.timeZone}</p>
            </CardContent>
          </Card>
        </div>

        {(address || responseTime) && (
          <dl className="mb-10 grid gap-4 rounded-xl border border-border/70 bg-muted/30 p-5 text-sm sm:grid-cols-2">
            {address && (
              <div>
                <dt className="font-semibold text-navy">{copy.address}</dt>
                <dd className="mt-1 text-muted-foreground">{address}</dd>
              </div>
            )}
            {responseTime && (
              <div>
                <dt className="font-semibold text-navy">{copy.response}</dt>
                <dd className="mt-1 text-muted-foreground">{responseTime}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <aside className="min-w-0 space-y-5 lg:col-span-2">
            <Card className="overflow-hidden border-navy/10 bg-navy text-white shadow-card">
              <CardContent className="p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-gold-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-semibold">
                  {t("contact.requestCard.title", { defaultValue: "Ön görüşme nasıl ilerler?" })}
                </h2>
                <ol className="mt-5 space-y-4 text-sm text-white/75">
                  {[
                    t("contact.requestCard.step1", {
                      defaultValue: "Formda hedefinizi ve takviminizi paylaşın.",
                    }),
                    t("contact.requestCard.step2", {
                      defaultValue: "Ekibimiz talebinizi akademik kapsam açısından incelesin.",
                    }),
                    t("contact.requestCard.step3", {
                      defaultValue:
                        "Uygun görüşme saatini e-posta veya telefonla birlikte netleştirelim.",
                    }),
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-gold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Button
                  asChild
                  className="mt-7 w-full bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <a href={buildConsultationEmailLink()}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t("contact.requestCard.email", { defaultValue: "Doğrudan e-posta gönder" })}
                  </a>
                </Button>
              </CardContent>
            </Card>
            <p className="rounded-xl border border-border/70 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
              {t("contact.requestCard.privacy", {
                defaultValue:
                  "Talep bilgileri yalnızca danışmanlık değerlendirmesi ve sizinle iletişim kurmak amacıyla işlenir.",
              })}
            </p>
          </aside>
          <div className="min-w-0 space-y-5 lg:col-span-3">
            {packageLabel && (
              <p className="rounded-xl border border-teal/20 bg-teal/5 p-4 text-sm text-navy">
                {copy.package}: <strong>{packageLabel}</strong>
              </p>
            )}
            {hydrated ? (
              <AppointmentPicker value={appointment} onChange={setAppointment} />
            ) : (
              <Card className="min-h-96 border-border/70" aria-busy="true">
                <CardContent className="p-6">
                  <h3 className="font-display text-base font-semibold text-navy">
                    {t("contact.appointment.title")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("contact.appointment.desc")}
                  </p>
                </CardContent>
              </Card>
            )}
            <ContactForm
              appointment={appointment}
              onSuccess={setSuccess}
              prefillIntent={prefillService}
              prefillContext={packageLabel || prefillService}
            />
          </div>
        </div>
      </section>
    </>
  );
}
