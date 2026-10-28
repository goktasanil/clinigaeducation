import tr from "@/i18n/locales/tr.json";

/** Keep structured answers identical to the FAQ rendered in the Turkish page. */
export const siteFaqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "tr",
  mainEntity: tr.faq.items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
