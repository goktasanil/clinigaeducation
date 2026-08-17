import { useTranslation } from "react-i18next";

export function TrustBar() {
  const { t } = useTranslation();
  const items = t("trust.items", { returnObjects: true }) as string[];

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container-prose py-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("trust.title")}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-navy/70">
          {items.map((item) => (
            <span key={item} className="whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
