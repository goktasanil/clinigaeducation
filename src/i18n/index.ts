import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tr from "./locales/tr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import ru from "./locales/ru.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";

export const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "it", label: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const stored =
  typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    ar: { translation: ar },
    ru: { translation: ru },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    es: { translation: es },
    zh: { translation: zh },
  },
  lng: stored ?? "tr",
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
});

if (typeof document !== "undefined") {
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
  document.documentElement.lang = current.code;
  document.documentElement.dir = current.dir;
}

i18n.on("languageChanged", (lng) => {
  const current = LANGUAGES.find((l) => l.code === lng) ?? LANGUAGES[0];
  if (typeof document !== "undefined") {
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lang", lng);
  }
});

export default i18n;
