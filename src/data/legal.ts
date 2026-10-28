export const LEGAL_UPDATED_AT = "28 Ekim 2026";

// Complete from the provider's registration documents, not the brand or a phone code.
export const LEGAL_PROVIDER = {
  commercialTitle: "[DOLDUR: tam ticari unvan]",
  registeredAddress: "[DOLDUR: kayıtlı açık iş adresi ve ülke]",
  taxInfo: "[DOLDUR: vergi ülkesi, vergi dairesi ve vergi/KDV numarası]",
  registryInfo: "[DOLDUR: uygulanıyorsa ticaret sicili / MERSİS / REA numarası]",
} as const;

export function legalPageHead(
  path: string,
  title: string,
  description: string,
  { draft = false }: { draft?: boolean } = {},
) {
  const url = `https://www.clinigaeducation.com${path}`;
  const pageTitle = `${title} | CliniGA Education`;
  return {
    meta: [
      { title: pageTitle },
      { name: "description", content: description },
      { name: "robots", content: draft ? "noindex, follow" : "index, follow" },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `CliniGA Education — ${title}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
