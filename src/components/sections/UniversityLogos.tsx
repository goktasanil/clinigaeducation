import { useTranslation } from "react-i18next";

const UNIVERSITIES = [
  "Sapienza · Roma",
  "Bologna",
  "Politecnico Milano",
  "TU Munich",
  "LMU München",
  "Sorbonne · Paris",
  "KU Leuven",
  "ETH Zürich",
  "Delft TU",
  "Uppsala",
  "Trinity Dublin",
  "UCL London",
];

const COPY: Record<string, { title: string; disclaimer: string }> = {
  tr: {
    title: "Hedef program karşılaştırmasında incelenebilecek kurumlar",
    disclaimer:
      "Kurum adları yalnızca program araştırmasını örneklendirir; CliniGA Education ile resmî ortaklık veya temsil ilişkisi anlamına gelmez.",
  },
  en: {
    title: "Institution examples for comparing study programs",
    disclaimer:
      "Institution names are program-research examples only. They do not imply an official partnership with or representation by CliniGA Education.",
  },
  de: {
    title: "Beispiele für die Recherche nach Studienprogrammen",
    disclaimer:
      "Die Namen dienen nur als Beispiele für die Programmsuche. Sie bedeuten keine offizielle Partnerschaft oder Vertretung durch CliniGA Education.",
  },
  fr: {
    title: "Exemples d’établissements pour comparer les programmes",
    disclaimer:
      "Ces noms servent uniquement d’exemples pour la recherche de programmes. Ils n’impliquent aucun partenariat officiel ni représentation par CliniGA Education.",
  },
  it: {
    title: "Esempi di atenei per confrontare i programmi",
    disclaimer:
      "I nomi sono solo esempi per la ricerca dei programmi. Non indicano partnership ufficiali o rapporti di rappresentanza con CliniGA Education.",
  },
  es: {
    title: "Instituciones de ejemplo para comparar programas",
    disclaimer:
      "Los nombres son solo ejemplos para investigar programas. No implican una colaboración oficial ni representación por parte de CliniGA Education.",
  },
  ar: {
    title: "أمثلة لمؤسسات يمكن البحث في برامجها",
    disclaimer:
      "تُذكر أسماء المؤسسات كأمثلة للبحث عن البرامج فقط، ولا تعني وجود شراكة رسمية أو علاقة تمثيل مع CliniGA Education.",
  },
  ru: {
    title: "Примеры вузов для сравнения программ",
    disclaimer:
      "Названия приведены только как примеры для поиска программ. Они не означают официального партнёрства или представительства со стороны CliniGA Education.",
  },
  zh: {
    title: "用于项目比较的院校示例",
    disclaimer: "院校名称仅作为项目研究示例，不代表与 CliniGA Education 存在官方合作或代理关系。",
  },
};

export function UniversityLogos() {
  const { i18n } = useTranslation();
  const code = i18n.resolvedLanguage || "tr";
  const copy = Object.hasOwn(COPY, code) ? COPY[code] : COPY.en;
  const researchTitle = copy.title;
  return (
    <section className="border-y border-navy/10 bg-white py-10">
      <div className="container-prose">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          {researchTitle}
        </p>
        <div
          className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-6"
          role="list"
          aria-label={researchTitle}
        >
          {UNIVERSITIES.map((name) => (
            <div
              key={name}
              role="listitem"
              className="flex min-h-10 items-center justify-center px-2 py-2 text-center"
            >
              <span className="font-display text-xs font-semibold text-navy/75 sm:text-sm">
                {name}
              </span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-4xl rounded-xl border border-teal/20 bg-teal/5 px-5 py-4 text-center text-sm font-medium leading-relaxed text-navy">
          {copy.disclaimer}
        </p>
      </div>
    </section>
  );
}
