import type { LanguageCode } from "@/i18n";
type AtlasCopy = {
  choose: string;
  next: string;
  explore: string;
  research: string;
  roadmap: string;
  selected: string;
};
const COPY: Record<LanguageCode, AtlasCopy> = {
  tr: {
    choose: "Bir ülkeyle başla",
    next: "Yeni bir şehrin, yeni bir başlangıcın.",
    explore: "Ülke rehberlerini keşfet",
    research: "Ülke ve program araştırması için bir başlangıç.",
    roadmap: "Başvuru yol haritan",
    selected: "Seçtiğin rota",
  },
  en: {
    choose: "Begin with a country",
    next: "A new city. A new beginning.",
    explore: "Explore country guides",
    research: "A starting point for country and programme research.",
    roadmap: "Your application roadmap",
    selected: "Your chosen route",
  },
  de: {
    choose: "Mit einem Land beginnen",
    next: "Eine neue Stadt. Ein neuer Anfang.",
    explore: "Länderleitfäden entdecken",
    research: "Ein Ausgangspunkt für die Länder- und Studiengangssuche.",
    roadmap: "Dein Bewerbungsfahrplan",
    selected: "Deine gewählte Route",
  },
  fr: {
    choose: "Commencez par un pays",
    next: "Une nouvelle ville. Un nouveau départ.",
    explore: "Explorer les guides pays",
    research: "Un point de départ pour rechercher pays et formations.",
    roadmap: "Votre parcours de candidature",
    selected: "Votre parcours choisi",
  },
  it: {
    choose: "Inizia da un paese",
    next: "Una nuova città. Un nuovo inizio.",
    explore: "Esplora le guide per paese",
    research: "Un punto di partenza per cercare paesi e corsi.",
    roadmap: "Il tuo percorso di candidatura",
    selected: "Il percorso che hai scelto",
  },
  es: {
    choose: "Empieza por un país",
    next: "Una nueva ciudad. Un nuevo comienzo.",
    explore: "Explora las guías por país",
    research: "Un punto de partida para investigar países y programas.",
    roadmap: "Tu ruta de solicitud",
    selected: "La ruta que has elegido",
  },
  pt: {
    choose: "Comece por um país",
    next: "Uma nova cidade. Um novo começo.",
    explore: "Explore os guias por país",
    research: "Um ponto de partida para pesquisar países e cursos.",
    roadmap: "O seu percurso de candidatura",
    selected: "O percurso que escolheu",
  },
  ar: {
    choose: "ابدأ ببلد",
    next: "مدينة جديدة. بداية جديدة.",
    explore: "اكتشف أدلة البلدان",
    research: "نقطة انطلاق للبحث عن البلدان والبرامج.",
    roadmap: "خارطة طريق طلبك",
    selected: "المسار الذي اخترته",
  },
  ru: {
    choose: "Начните со страны",
    next: "Новый город. Новое начало.",
    explore: "Откройте путеводители по странам",
    research: "Отправная точка для поиска стран и программ.",
    roadmap: "Ваш план подачи заявления",
    selected: "Выбранный вами маршрут",
  },
  zh: {
    choose: "从选择国家开始",
    next: "一座新城市。一个新起点。",
    explore: "探索国家指南",
    research: "研究国家和课程的起点。",
    roadmap: "你的申请路线图",
    selected: "你选择的路线",
  },
};
export const atlasCopy = (language: string) =>
  COPY[language.split("-")[0] as LanguageCode] ?? COPY.en;
