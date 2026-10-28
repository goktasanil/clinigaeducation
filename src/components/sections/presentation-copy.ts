import type { LanguageCode } from "@/i18n";

type PresentationCopy = {
  headline: [string, string];
  pause: string;
  play: string;
  reduced: string;
  scroll: string;
  chapter: string;
  journey: string;
};

const COPY: Record<LanguageCode, PresentationCopy> = {
  tr: {
    headline: ["Dünya kadar seçenek.", "Sana özel bir yol."],
    pause: "Hareketi duraklat",
    play: "Hareketi başlat",
    reduced: "Azaltılmış hareket açık",
    scroll: "Yolculuğu keşfet",
    chapter: "ADIM",
    journey: "Hedefinden ilk adımına.",
  },
  en: {
    headline: ["A world of possibilities.", "A path of your own."],
    pause: "Pause motion",
    play: "Play motion",
    reduced: "Reduced motion enabled",
    scroll: "Explore the journey",
    chapter: "STEP",
    journey: "From ambition to action.",
  },
  de: {
    headline: ["Eine Welt voller Möglichkeiten.", "Dein eigener Weg."],
    pause: "Bewegung pausieren",
    play: "Bewegung starten",
    reduced: "Reduzierte Bewegung aktiv",
    scroll: "Die Reise entdecken",
    chapter: "SCHRITT",
    journey: "Vom Ziel zum ersten Schritt.",
  },
  fr: {
    headline: ["Un monde de possibilités.", "Votre propre voie."],
    pause: "Mettre en pause",
    play: "Activer les animations",
    reduced: "Mouvement réduit activé",
    scroll: "Explorer le parcours",
    chapter: "ÉTAPE",
    journey: "De l’ambition à l’action.",
  },
  it: {
    headline: ["Un mondo di possibilità.", "Un percorso tutto tuo."],
    pause: "Pausa animazioni",
    play: "Avvia animazioni",
    reduced: "Movimento ridotto attivo",
    scroll: "Esplora il percorso",
    chapter: "PASSO",
    journey: "Dall’obiettivo al primo passo.",
  },
  es: {
    headline: ["Un mundo de posibilidades.", "Tu propio camino."],
    pause: "Pausar animación",
    play: "Activar animación",
    reduced: "Movimiento reducido activado",
    scroll: "Explora el camino",
    chapter: "PASO",
    journey: "De la ambición a la acción.",
  },
  pt: {
    headline: ["Um mundo de possibilidades.", "Um caminho só seu."],
    pause: "Pausar animações",
    play: "Ativar animações",
    reduced: "Movimento reduzido ativo",
    scroll: "Explore o percurso",
    chapter: "ETAPA",
    journey: "Do objetivo ao primeiro passo.",
  },
  ar: {
    headline: ["عالم من الإمكانات.", "مسار خاص بك."],
    pause: "إيقاف الحركة مؤقتًا",
    play: "تشغيل الحركة",
    reduced: "الحركة المخففة مفعلة",
    scroll: "اكتشف الرحلة",
    chapter: "الخطوة",
    journey: "من الطموح إلى الخطوة الأولى.",
  },
  ru: {
    headline: ["Мир возможностей.", "Твой собственный путь."],
    pause: "Приостановить анимацию",
    play: "Включить анимацию",
    reduced: "Уменьшение движения включено",
    scroll: "Откройте свой путь",
    chapter: "ШАГ",
    journey: "От цели к первому шагу.",
  },
  zh: {
    headline: ["世界，无限可能。", "走出自己的路。"],
    pause: "暂停动画",
    play: "开启动画",
    reduced: "已启用减少动态效果",
    scroll: "探索旅程",
    chapter: "步骤",
    journey: "从目标迈向行动。",
  },
};

export const presentationCopy = (language: string) =>
  COPY[language.split("-")[0] as LanguageCode] ?? COPY.en;
