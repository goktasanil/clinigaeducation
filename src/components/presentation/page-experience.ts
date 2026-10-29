export type PageKind =
  | "home"
  | "services"
  | "service"
  | "packages"
  | "about"
  | "contact"
  | "process"
  | "cities"
  | "city"
  | "journal"
  | "article"
  | "legal"
  | "quiz"
  | "portal"
  | "workspace"
  | "account"
  | "page";

export function pageKind(pathname: string): PageKind {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (/^\/(?:[a-z]{2}\/)?blog(?:\/|$)/.test(path)) {
    return /^\/(?:[a-z]{2}\/)?blog$/.test(path) ? "journal" : "article";
  }
  if (path.startsWith("/hizmetler/")) return "service";
  if (path.startsWith("/sehir-rehberleri/")) return "city";
  if (path.startsWith("/admin/")) return "workspace";
  if (path === "/portal/workspace") return "workspace";
  if (path.startsWith("/portal/")) return "account";
  if (
    [
      "/gizlilik",
      "/kvkk",
      "/cerez-politikasi",
      "/mesafeli-satis-iade",
      "/kullanim-kosullari",
    ].includes(path)
  )
    return "legal";
  const pages: Record<string, PageKind> = {
    "/hizmetler": "services",
    "/paketler": "packages",
    "/hakkimizda": "about",
    "/iletisim": "contact",
    "/surec": "process",
    "/sehir-rehberleri": "cities",
    "/quiz": "quiz",
    "/portal": "portal",
    "/auth": "account",
  };
  return pages[path] || "page";
}

export function isTaskPage(kind: PageKind) {
  return ["account", "workspace", "quiz", "portal", "contact"].includes(kind);
}

const COPY: Record<
  string,
  {
    contents: string;
    all: string;
    application: string;
    research: string;
    compare: string;
    remove: string;
  }
> = {
  tr: {
    contents: "Bu sayfada",
    all: "Tümü",
    application: "Eğitim ve başvuru",
    research: "Akademik çalışma",
    compare: "Karşılaştır",
    remove: "Karşılaştırmadan çıkar",
  },
  en: {
    contents: "On this page",
    all: "All",
    application: "Study and applications",
    research: "Academic work",
    compare: "Compare",
    remove: "Remove from comparison",
  },
  de: {
    contents: "Auf dieser Seite",
    all: "Alle",
    application: "Studium und Bewerbung",
    research: "Wissenschaftliche Arbeit",
    compare: "Vergleichen",
    remove: "Aus Vergleich entfernen",
  },
  fr: {
    contents: "Sur cette page",
    all: "Tout",
    application: "Études et candidatures",
    research: "Travail académique",
    compare: "Comparer",
    remove: "Retirer du comparatif",
  },
  it: {
    contents: "In questa pagina",
    all: "Tutti",
    application: "Studi e candidature",
    research: "Lavoro accademico",
    compare: "Confronta",
    remove: "Rimuovi dal confronto",
  },
  es: {
    contents: "En esta página",
    all: "Todo",
    application: "Estudios y solicitudes",
    research: "Trabajo académico",
    compare: "Comparar",
    remove: "Quitar de la comparación",
  },
  pt: {
    contents: "Nesta página",
    all: "Todos",
    application: "Estudos e candidaturas",
    research: "Trabalho académico",
    compare: "Comparar",
    remove: "Remover da comparação",
  },
  ar: {
    contents: "في هذه الصفحة",
    all: "الكل",
    application: "الدراسة والتقديم",
    research: "العمل الأكاديمي",
    compare: "مقارنة",
    remove: "إزالة من المقارنة",
  },
  ru: {
    contents: "На этой странице",
    all: "Все",
    application: "Учёба и поступление",
    research: "Научная работа",
    compare: "Сравнить",
    remove: "Убрать из сравнения",
  },
  zh: {
    contents: "本页内容",
    all: "全部",
    application: "学习与申请",
    research: "学术工作",
    compare: "比较",
    remove: "移出比较",
  },
  hi: {
    contents: "इस पृष्ठ पर",
    all: "सभी",
    application: "अध्ययन और आवेदन",
    research: "शैक्षणिक कार्य",
    compare: "तुलना करें",
    remove: "तुलना से हटाएं",
  },
};
const TOP: Record<string, string> = {
  tr: "Sayfanın başına dön",
  en: "Back to top",
  de: "Zurück nach oben",
  fr: "Retour en haut",
  it: "Torna in alto",
  es: "Volver arriba",
  pt: "Voltar ao topo",
  ar: "العودة إلى الأعلى",
  ru: "Наверх",
  zh: "返回顶部",
  hi: "ऊपर लौटें",
};
export const pageCopy = (language: string) => ({
  ...(COPY[language] || COPY.en),
  top: TOP[language] || TOP.en,
});

export function serviceMatches(key: string, filter: string) {
  return (
    filter === "all" ||
    (filter === "application"
      ? ["education", "visa", "documents"].includes(key)
      : ["thesis", "statistics", "publication"].includes(key))
  );
}
