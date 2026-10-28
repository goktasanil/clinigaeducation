import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, List, RotateCcw } from "lucide-react";

import type { LanguageCode } from "@/i18n";
import { PortalGlobeMap } from "@/components/portal/PortalGlobeMap";
import {
  PortalDiscovery,
  type PortalDiscoverySelection,
} from "@/components/portal/PortalDiscovery";
import { PortalMarketplaceHub } from "@/components/portal/PortalMarketplaceHub";

type ExplorerCopy = {
  title: string;
  heading: string;
  description: string;
  map: string;
  list: string;
  reset: string;
  views: string;
};

const COPY: Record<LanguageCode, ExplorerCopy> = {
  pt: {
    title: "Do mundo à sua universidade: Portal do Estudante CliniGA",
    heading: "Explore os seus estudos e a próxima cidade",
    description:
      "Escolha por ordem o país, a cidade, a universidade e um curso específico da instituição. O mapa acompanha a localização disponível e os anúncios abaixo acompanham a seleção.",
    map: "Mundo e listas",
    list: "Apenas listas",
    reset: "Repor seleção",
    views: "Vista de descoberta",
  },

  tr: {
    title: "Dünyadan üniversitene: CliniGA Öğrenci Portalı",
    heading: "Eğitimini ve yeni şehrini keşfet",
    description:
      "Ülke, şehir, üniversite ve kuruma ait programı sırayla seç. Harita seçiminin konumuna gider; aşağıdaki öğrenci ilanları da bulunduğun yere göre süzülür.",
    map: "Dünya ve listeler",
    list: "Yalnızca listeler",
    reset: "Seçimi sıfırla",
    views: "Keşif görünümü",
  },
  en: {
    title: "From the world to your university: CliniGA Student Portal",
    heading: "Explore your studies and your next city",
    description:
      "Choose a country, city, university and institution-specific program in order. The map follows the available location, and student listings below follow your selection.",
    map: "World and lists",
    list: "Lists only",
    reset: "Reset selection",
    views: "Discovery view",
  },
  de: {
    title: "Von der Welt zu deiner Hochschule: CliniGA Studierendenportal",
    heading: "Entdecke dein Studium und deine neue Stadt",
    description:
      "Wähle nacheinander Land, Stadt, Hochschule und einen zugehörigen Studiengang. Die Karte zeigt den verfügbaren Standort; die Anzeigen unten passen sich deiner Auswahl an.",
    map: "Welt und Listen",
    list: "Nur Listen",
    reset: "Auswahl zurücksetzen",
    views: "Entdeckungsansicht",
  },
  fr: {
    title: "Du monde à votre université : portail étudiant CliniGA",
    heading: "Explorez vos études et votre nouvelle ville",
    description:
      "Choisissez un pays, une ville, une université puis un programme propre à cet établissement. La carte suit le lieu disponible et les annonces ci-dessous suivent votre sélection.",
    map: "Monde et listes",
    list: "Listes seules",
    reset: "Réinitialiser le choix",
    views: "Vue de découverte",
  },
  it: {
    title: "Dal mondo alla tua università: portale studenti CliniGA",
    heading: "Scopri i tuoi studi e la tua prossima città",
    description:
      "Scegli in ordine paese, città, università e un suo programma. La mappa segue la posizione disponibile e gli annunci per studenti qui sotto seguono la tua selezione.",
    map: "Mondo ed elenchi",
    list: "Solo elenchi",
    reset: "Azzera la selezione",
    views: "Vista di esplorazione",
  },
  es: {
    title: "Del mundo a tu universidad: portal estudiantil CliniGA",
    heading: "Descubre tus estudios y tu próxima ciudad",
    description:
      "Elige país, ciudad, universidad y un programa propio de esa institución, en ese orden. El mapa sigue la ubicación disponible y los anuncios se filtran según tu selección.",
    map: "Mundo y listas",
    list: "Solo listas",
    reset: "Reiniciar selección",
    views: "Vista de exploración",
  },
  ar: {
    title: "من العالم إلى جامعتك: بوابة طلاب CliniGA",
    heading: "استكشف دراستك ومدينتك القادمة",
    description:
      "اختر الدولة ثم المدينة ثم الجامعة ثم برنامجاً تابعاً لها. تنتقل الخريطة إلى الموقع المتاح وتُصفّى إعلانات الطلاب أدناه وفقاً لاختيارك.",
    map: "العالم والقوائم",
    list: "القوائم فقط",
    reset: "إعادة ضبط الاختيار",
    views: "عرض الاستكشاف",
  },
  ru: {
    title: "От мира к вашему университету: студенческий портал CliniGA",
    heading: "Найдите обучение и свой новый город",
    description:
      "Выберите страну, город, университет и программу этого учреждения по порядку. Карта покажет доступное местоположение, а объявления ниже отфильтруются по вашему выбору.",
    map: "Мир и списки",
    list: "Только списки",
    reset: "Сбросить выбор",
    views: "Вид поиска",
  },
  zh: {
    title: "从世界到你的大学：CliniGA 学生门户",
    heading: "探索学业与下一座城市",
    description:
      "依次选择国家、城市、大学及该校的课程。地图会移向可用的位置，下方学生生活信息也会根据你的选择筛选。",
    map: "地球与列表",
    list: "仅列表",
    reset: "重置选择",
    views: "探索视图",
  },
};

const WORLD_SELECTION: PortalDiscoverySelection = {
  countryCode: "",
  city: "",
  institutionId: "",
  institutionName: "",
  programName: "",
  latitude: null,
  longitude: null,
  level: "world",
};

export function PortalWorldExplorer() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const locale: LanguageCode = Object.prototype.hasOwnProperty.call(COPY, language)
    ? (language as LanguageCode)
    : "tr";
  const copy = COPY[locale];
  const [selection, setSelection] = useState<PortalDiscoverySelection>(WORLD_SELECTION);
  const [showMap, setShowMap] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const choose = useCallback((value: PortalDiscoverySelection) => setSelection(value), []);
  const compactMap = selection.level !== "world";

  const changeView = (map: boolean) => {
    setShowMap(map);
    requestAnimationFrame(() => {
      document.getElementById(map ? "portal-world" : "kesfet")?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  };

  return (
    <>
      <section aria-labelledby="portal-world-title" className="relative bg-[#f6f9fc]">
        <h1 id="portal-world-title" className="sr-only">
          {copy.title}
        </h1>
        {showMap && (
          <div
            id="portal-world"
            className={
              compactMap
                ? "sticky top-[76px] z-20 border-b border-navy/10 shadow-sm"
                : "scroll-mt-[76px]"
            }
          >
            <PortalGlobeMap
              focus={selection}
              locale={locale}
              className={
                compactMap ? "h-[42svh] max-h-[500px]" : "h-[calc(100svh-76px)] min-h-[420px]"
              }
            />
          </div>
        )}

        <div id="kesfet" className="container-prose scroll-mt-24 pb-12 pt-8 md:pb-16 md:pt-10">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy md:text-3xl">
                {copy.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {copy.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div
                role="group"
                aria-label={copy.views}
                className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
              >
                <button
                  type="button"
                  aria-pressed={showMap}
                  onClick={() => changeView(true)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${showMap ? "bg-navy text-white" : "text-navy hover:bg-slate-100"}`}
                >
                  <Globe2 className="h-4 w-4" />
                  {copy.map}
                </button>
                <button
                  type="button"
                  aria-pressed={!showMap}
                  onClick={() => changeView(false)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${!showMap ? "bg-navy text-white" : "text-navy hover:bg-slate-100"}`}
                >
                  <List className="h-4 w-4" />
                  {copy.list}
                </button>
              </div>
              {selection.countryCode && (
                <button
                  type="button"
                  onClick={() => {
                    setResetKey((value) => value + 1);
                    setSelection(WORLD_SELECTION);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-navy hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <RotateCcw className="h-4 w-4" />
                  {copy.reset}
                </button>
              )}
            </div>
          </div>
          <PortalDiscovery
            onSelectionChange={choose}
            viewMode={showMap ? "grid" : "list"}
            resetKey={resetKey}
          />
        </div>
      </section>
      <div className="container-prose">
        <PortalMarketplaceHub selection={selection} />
      </div>
    </>
  );
}
