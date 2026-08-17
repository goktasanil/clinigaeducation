import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { t } = useTranslation();
  const items = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container-prose grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
            {t("faq.title")}
          </h2>
        </div>
        <div className="md:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-display text-base font-medium text-navy">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
