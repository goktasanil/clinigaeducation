import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tr from "./locales/tr.json";

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

const localeLoaders: Record<
  Exclude<LanguageCode, "tr">,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  en: () => import("./locales/en.json"),
  ar: () => import("./locales/ar.json"),
  ru: () => import("./locales/ru.json"),
  de: () => import("./locales/de.json"),
  fr: () => import("./locales/fr.json"),
  it: () => import("./locales/it.json"),
  es: () => import("./locales/es.json"),
  zh: () => import("./locales/zh.json"),
};

const normalizeLanguage = (value: string | null | undefined): LanguageCode => {
  const code = (value || "tr").split("-")[0] as LanguageCode;
  return LANGUAGES.some((language) => language.code === code) ? code : "tr";
};

const stored =
  typeof window !== "undefined" ? normalizeLanguage(window.localStorage.getItem("lang")) : "tr";

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
  },
  lng: "tr",
  fallbackLng: "tr",
  supportedLngs: LANGUAGES.map((language) => language.code),
  load: "languageOnly",
  returnNull: false,
  interpolation: { escapeValue: false },
});

export async function setLanguage(value: string) {
  const code = normalizeLanguage(value);
  if (code !== "tr" && !i18n.hasResourceBundle(code, "translation")) {
    const locale = await localeLoaders[code]();
    i18n.addResourceBundle(code, "translation", locale.default, true, true);
  }
  await i18n.changeLanguage(code);
}

const syncDocumentLanguage = (value: string) => {
  const code = normalizeLanguage(value);
  const current = LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
  if (typeof document !== "undefined") {
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
  }
};

syncDocumentLanguage("tr");

i18n.on("languageChanged", (language) => {
  const code = normalizeLanguage(language);
  syncDocumentLanguage(code);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lang", code);
  }
});

if (stored !== "tr") {
  void setLanguage(stored);
}

export default i18n;
