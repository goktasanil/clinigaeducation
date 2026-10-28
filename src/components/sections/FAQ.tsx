import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const { t } = useTranslation();
  const items = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section id="sss" className="scroll-mt-24 border-y border-navy/10 bg-white py-20 md:py-24">
      <div className="container-prose grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="education-section-heading">{t("faq.title")}</h2>
        </div>
        <div className="md:col-span-8">
          <div className="w-full">
            {items.map((item, idx) => (
              <details
                key={item.q}
                id={idx === 3 ? "akademik-etik" : undefined}
                name="education-faq"
                className="group scroll-mt-24 border-b border-border"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-start font-display text-base font-medium text-navy hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  <h3>{item.q}</h3>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-open:rotate-180"
                  />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
