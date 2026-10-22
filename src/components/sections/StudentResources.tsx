import { ArrowRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { STUDENT_RESOURCES, STUDENT_RESOURCE_COPY } from "@/data/student-resources";
import type { LanguageCode } from "@/i18n";

type StudentResourcesProps = {
  scope?: "all" | "education" | "housing";
  teaser?: boolean;
  contained?: boolean;
};

export function StudentResources({
  scope = "all",
  teaser = false,
  contained = false,
}: StudentResourcesProps) {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const copy = STUDENT_RESOURCE_COPY[language as LanguageCode] || STUDENT_RESOURCE_COPY.tr;
  const resources = STUDENT_RESOURCES.filter((resource) =>
    scope === "housing"
      ? resource.id === "spotahome"
      : scope === "education"
        ? resource.id !== "spotahome"
        : true,
  );
  const linkClass =
    "inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-4";

  return (
    <section
      id="ogrenci-kaynaklari"
      aria-labelledby="student-resources-heading"
      className={`${contained ? "" : "container-prose "}scroll-mt-24 py-16 md:py-20`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{copy.eyebrow}</p>
      <h2
        id="student-resources-heading"
        className="mt-3 max-w-4xl font-display text-3xl font-semibold text-navy md:text-4xl"
      >
        {teaser
          ? copy.teaserTitle
          : scope === "housing"
            ? copy.cards.spotahome.category
            : copy.title}
      </h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
        {teaser ? copy.teaserDescription : copy.intro}
      </p>
      {teaser ? (
        <a href="/hizmetler#ogrenci-kaynaklari" className={`${linkClass} mt-6`}>
          {copy.browse}{" "}
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 rtl:rotate-180" />
        </a>
      ) : (
        <>
          <p className="mt-6 max-w-4xl rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
            {copy.disclosure}
          </p>
          <div
            className={`mt-8 grid gap-5 ${scope === "housing" ? "max-w-3xl" : "md:grid-cols-2"}`}
          >
            {resources.map((resource) => (
              <Card key={resource.id} className="border-border/70">
                <CardContent className="flex h-full flex-col p-6 md:p-7">
                  <p className="text-sm font-medium text-teal">
                    {copy.cards[resource.id].category}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-navy">
                    <bdi>{resource.name}</bdi>
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                    {copy.cards[resource.id].description}
                  </p>
                  <p className="mb-6 mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {copy.cards[resource.id].check}
                  </p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {copy.official}
                    <span className="sr-only">: {resource.name}</span>
                    <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
          <nav aria-label={copy.eyebrow} className="mt-8 flex flex-col items-start gap-4">
            {scope !== "education" && (
              <a
                href="/hizmetler/yurt-disi-egitim-danismanligi#ogrenci-kaynaklari"
                className={linkClass}
              >
                {copy.education}
              </a>
            )}
            {scope !== "housing" && (
              <a href="/portal#ogrenci-kaynaklari" className={linkClass}>
                {copy.housing}
              </a>
            )}
            {scope !== "all" && (
              <a href="/hizmetler#ogrenci-kaynaklari" className={linkClass}>
                {copy.browse}
              </a>
            )}
            <a href="/iletisim?intent=yurt-disi-egitim-danismanligi#randevu" className={linkClass}>
              {copy.consult}{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 rtl:rotate-180" />
            </a>
          </nav>
        </>
      )}
    </section>
  );
}
