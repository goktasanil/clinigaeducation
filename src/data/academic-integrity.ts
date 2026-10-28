export const AUTHORSHIP_SERVICE_KEYS = ["thesis", "documents", "publication"] as const;

export const AUTHORSHIP_SERVICE_SLUGS = [
  "tez-danismanligi",
  "belge-inceleme",
  "akademik-yayin-destegi",
] as const;

export const ACADEMIC_INTEGRITY_COPY: Record<string, string> = {
  pt: "O cliente escreve o texto; orientamos nos métodos, estrutura, linguagem e estatística.",
  tr: "Metni müşteri yazar; biz yöntem, yapı, dil ve istatistik rehberliği veririz.",
  en: "The client writes the text; we provide guidance on methods, structure, language and statistics.",
  de: "Den Text verfasst die Kundin oder der Kunde; wir beraten zu Methode, Aufbau, Sprache und Statistik.",
  fr: "Le client rédige le texte ; nous apportons des conseils sur la méthode, la structure, la langue et les statistiques.",
  it: "Il testo è scritto dal cliente; noi offriamo consulenza su metodo, struttura, lingua e statistica.",
  es: "El cliente escribe el texto; ofrecemos orientación sobre metodología, estructura, lenguaje y estadística.",
  ar: "يكتب العميل النص بنفسه؛ ونقدم الإرشاد في المنهجية والبنية واللغة والإحصاء.",
  ru: "Текст пишет клиент; мы консультируем по методологии, структуре, языку и статистике.",
  zh: "正文由客户本人撰写；我们提供研究方法、结构、语言及统计方面的指导。",
};

// Publication checklist: this is an editorial review field, not a public claim of legal approval.
export const ACADEMIC_INTEGRITY_LEGAL_REVIEW =
  "[DOLDUR: akademik destek kapsamı ve sözleşme metinleri için hukuki inceleme tarihi ve onayı]";

export const requiresClientAuthorship = (value: string) =>
  (AUTHORSHIP_SERVICE_KEYS as readonly string[]).includes(value) ||
  (AUTHORSHIP_SERVICE_SLUGS as readonly string[]).includes(value);

export const academicIntegrityStatement = (language: string) =>
  ACADEMIC_INTEGRITY_COPY[language.split("-")[0]] || ACADEMIC_INTEGRITY_COPY.tr;
