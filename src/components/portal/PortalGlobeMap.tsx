import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { Globe2, List, Loader2, LocateFixed, RotateCcw } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

import { resolvePortalMapFocus, type PortalMapFocus } from "@/data/portal-map-locations";

export type { PortalMapFocus } from "@/data/portal-map-locations";

type Props = { focus: PortalMapFocus; locale?: string; className?: string };

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const POINT_SOURCE = "cliniga-selected-location";

const COPY = {
  tr: {
    aria: "Eğitim keşfi için etkileşimli dünya haritası",
    loading: "Dünya haritası hazırlanıyor…",
    error: "Harita bu cihazda yüklenemedi.",
    fallback: "Ülke, şehir ve okul seçimine aşağıdaki listelerden devam edebilirsin.",
    list: "Listelerden devam et",
    retry: "Haritayı yeniden yükle",
    world: "Dünyayı göster",
    locate: "Seçime odaklan",
    instruction:
      "Dünyayı sürükle; yakınlaşmak için kontrolleri kullan. Telefonda haritayı iki parmakla hareket ettir.",
    institution: "Kurum konumu; kesin kampüs veya bölüm binası olmayabilir.",
    city: "Şehir konumu; kesin kampüs veya bölüm binası konumu değildir.",
    country: "Ülke görünümü",
    missing: "Bu seçim için konum bulunamadı; ülke görünümü korunuyor.",
    centers: "Ülke merkezleri",
    zoomIn: "Yakınlaştır",
    zoomOut: "Uzaklaştır",
    compass: "Kuzeyi göster",
  },
  en: {
    aria: "Interactive world map for study discovery",
    loading: "Preparing the world map…",
    error: "The map could not load on this device.",
    fallback: "Continue choosing a country, city and institution with the lists below.",
    list: "Continue with lists",
    retry: "Reload map",
    world: "Show the world",
    locate: "Focus on selection",
    instruction:
      "Drag the globe and use the controls to zoom. On a phone, move the map with two fingers.",
    institution: "Institution location; not necessarily the exact campus or department building.",
    city: "City location, not an exact campus or department building.",
    country: "Country view",
    missing: "No location is available for this selection; the country overview is retained.",
    centers: "Country centres",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    compass: "Reset north",
  },
  de: {
    aria: "Interaktive Weltkarte zur Studienwahl",
    loading: "Die Weltkarte wird vorbereitet…",
    error: "Die Karte konnte auf diesem Gerät nicht geladen werden.",
    fallback: "Wähle Land, Stadt und Hochschule über die Listen unten weiter aus.",
    list: "Mit Listen fortfahren",
    retry: "Karte neu laden",
    world: "Welt anzeigen",
    locate: "Auswahl anzeigen",
    instruction:
      "Ziehe den Globus und nutze die Zoomtasten. Auf dem Smartphone bewegst du die Karte mit zwei Fingern.",
    institution:
      "Hochschulstandort; nicht unbedingt der genaue Campus oder das Fachbereichsgebäude.",
    city: "Stadtstandort, kein genauer Campus- oder Fachbereichsstandort.",
    country: "Landesansicht",
    missing: "Für diese Auswahl liegt kein Standort vor; die Landesansicht bleibt erhalten.",
    centers: "Ländermittelpunkte",
    zoomIn: "Vergrößern",
    zoomOut: "Verkleinern",
    compass: "Nach Norden ausrichten",
  },
  fr: {
    aria: "Carte du monde interactive pour explorer les études",
    loading: "Préparation de la carte du monde…",
    error: "La carte n’a pas pu se charger sur cet appareil.",
    fallback:
      "Continuez à choisir un pays, une ville et un établissement dans les listes ci-dessous.",
    list: "Continuer avec les listes",
    retry: "Recharger la carte",
    world: "Afficher le monde",
    locate: "Centrer sur la sélection",
    instruction:
      "Faites glisser le globe et utilisez les commandes de zoom. Sur téléphone, déplacez la carte avec deux doigts.",
    institution:
      "Emplacement de l’établissement, pas nécessairement le campus ou le bâtiment exact du département.",
    city: "Emplacement de la ville, pas du campus ou du bâtiment du département.",
    country: "Vue du pays",
    missing:
      "Aucun emplacement n’est disponible pour cette sélection ; la vue du pays est conservée.",
    centers: "Centres des pays",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    compass: "Orienter vers le nord",
  },
  it: {
    aria: "Mappa interattiva del mondo per esplorare gli studi",
    loading: "Preparazione della mappa del mondo…",
    error: "Impossibile caricare la mappa su questo dispositivo.",
    fallback: "Continua a scegliere paese, città e istituto negli elenchi qui sotto.",
    list: "Continua con gli elenchi",
    retry: "Ricarica la mappa",
    world: "Mostra il mondo",
    locate: "Centra sulla selezione",
    instruction:
      "Trascina il globo e usa i comandi per lo zoom. Sul telefono, sposta la mappa con due dita.",
    institution:
      "Posizione dell’istituto; non necessariamente il campus o l’edificio esatto del dipartimento.",
    city: "Posizione della città, non del campus o dell’edificio del dipartimento.",
    country: "Vista del paese",
    missing:
      "Nessuna posizione disponibile per questa selezione; viene mantenuta la vista del paese.",
    centers: "Centri dei paesi",
    zoomIn: "Ingrandisci",
    zoomOut: "Riduci",
    compass: "Orienta a nord",
  },
  es: {
    aria: "Mapa mundial interactivo para explorar estudios",
    loading: "Preparando el mapa del mundo…",
    error: "El mapa no se pudo cargar en este dispositivo.",
    fallback: "Continúa eligiendo país, ciudad e institución con las listas de abajo.",
    list: "Continuar con las listas",
    retry: "Volver a cargar el mapa",
    world: "Mostrar el mundo",
    locate: "Centrar en la selección",
    instruction:
      "Arrastra el globo y usa los controles para ampliar. En el teléfono, mueve el mapa con dos dedos.",
    institution:
      "Ubicación de la institución; no necesariamente el campus o edificio exacto del departamento.",
    city: "Ubicación de la ciudad, no del campus ni del edificio del departamento.",
    country: "Vista del país",
    missing: "No hay una ubicación para esta selección; se mantiene la vista del país.",
    centers: "Centros de los países",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    compass: "Orientar al norte",
  },
  ar: {
    aria: "خريطة عالم تفاعلية لاستكشاف الدراسة",
    loading: "جارٍ إعداد خريطة العالم…",
    error: "تعذّر تحميل الخريطة على هذا الجهاز.",
    fallback: "يمكنك متابعة اختيار الدولة والمدينة والمؤسسة من القوائم أدناه.",
    list: "المتابعة بالقوائم",
    retry: "إعادة تحميل الخريطة",
    world: "عرض العالم",
    locate: "التركيز على الاختيار",
    instruction:
      "اسحب الكرة الأرضية واستخدم عناصر التحكم للتكبير. على الهاتف، حرّك الخريطة بإصبعين.",
    institution: "موقع المؤسسة؛ قد لا يكون الحرم الجامعي أو مبنى القسم بالتحديد.",
    city: "موقع المدينة وليس الموقع الدقيق للحرم الجامعي أو مبنى القسم.",
    country: "عرض الدولة",
    missing: "لا يتوفر موقع لهذا الاختيار؛ تم الاحتفاظ بعرض الدولة.",
    centers: "مراكز الدول",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    compass: "الاتجاه شمالاً",
  },
  ru: {
    aria: "Интерактивная карта мира для поиска обучения",
    loading: "Подготовка карты мира…",
    error: "Не удалось загрузить карту на этом устройстве.",
    fallback: "Продолжите выбор страны, города и учебного заведения в списках ниже.",
    list: "Продолжить со списками",
    retry: "Загрузить карту снова",
    world: "Показать мир",
    locate: "Показать выбранное место",
    instruction:
      "Перетаскивайте глобус и используйте кнопки масштаба. На телефоне перемещайте карту двумя пальцами.",
    institution:
      "Местоположение учреждения; это не обязательно точный кампус или здание факультета.",
    city: "Местоположение города, а не точный адрес кампуса или здания факультета.",
    country: "Вид страны",
    missing: "Для выбранного объекта нет координат; сохранён обзор страны.",
    centers: "Центры стран",
    zoomIn: "Приблизить",
    zoomOut: "Отдалить",
    compass: "Ориентировать на север",
  },
  zh: {
    aria: "用于探索留学机会的交互式世界地图",
    loading: "正在准备世界地图…",
    error: "无法在此设备上加载地图。",
    fallback: "你可以使用下方列表继续选择国家、城市和院校。",
    list: "使用列表继续",
    retry: "重新加载地图",
    world: "显示世界",
    locate: "定位所选地点",
    instruction: "拖动地球并使用控件缩放。在手机上，请用双指移动地图。",
    institution: "院校位置；不一定是具体校区或院系大楼的准确位置。",
    city: "城市位置，并非校区或院系大楼的准确位置。",
    country: "国家视图",
    missing: "此选项没有可用坐标；保留国家概览。",
    centers: "国家中心点",
    zoomIn: "放大",
    zoomOut: "缩小",
    compass: "朝向正北",
  },
} as const;

type MapStatus = "loading" | "ready" | "error";

function localeKey(locale: string): keyof typeof COPY {
  const key = locale.toLowerCase().split(/[-_]/)[0];
  return Object.prototype.hasOwnProperty.call(COPY, key) ? (key as keyof typeof COPY) : "en";
}

function focusMap(map: MapLibreMap, focus: PortalMapFocus) {
  const target = resolvePortalMapFocus(focus);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const camera = {
    center: target.center,
    zoom: target.zoom,
    pitch: target.precision === "institution" ? 35 : 0,
    bearing: 0,
  };
  map.stop();
  if (reducedMotion) map.jumpTo(camera);
  else map.flyTo({ ...camera, duration: 1500, essential: false });

  const source = map.getSource(POINT_SOURCE) as GeoJSONSource | undefined;
  source?.setData({
    type: "FeatureCollection",
    features:
      target.precision === "city" || target.precision === "institution"
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "Point", coordinates: target.center },
            },
          ]
        : [],
  });
}

export function PortalGlobeMap({ focus, locale = "tr", className = "" }: Props) {
  const copy = COPY[localeKey(locale)];
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const focusRef = useRef(focus);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const target = resolvePortalMapFocus(focus);

  useEffect(() => {
    focusRef.current = focus;
    const map = mapRef.current;
    if (map && status === "ready") focusMap(map, focus);
  }, [focus, status]);

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    let loaded = false;
    let failed = false;
    let map: MapLibreMap | null = null;
    let observer: ResizeObserver | undefined;
    setStatus("loading");

    const fail = () => {
      if (disposed || loaded) return;
      failed = true;
      setStatus("error");
      observer?.disconnect();
      map?.remove();
      map = null;
      mapRef.current = null;
      hostRef.current?.replaceChildren();
    };
    const timeout = window.setTimeout(fail, 20_000);

    void import("maplibre-gl")
      .then((lib) => {
        if (disposed || failed || !hostRef.current) return;
        // MapLibre 6's default relative worker path does not survive Vite's
        // hashed chunk names. Bundle and serve the matching worker explicitly.
        lib.setWorkerUrl(mapWorkerUrl);
        map = new lib.Map({
          container: hostRef.current,
          style: MAP_STYLE,
          center: [15, 18],
          zoom: 1.3,
          maxZoom: 18,
          attributionControl: false,
          cooperativeGestures: true,
          locale: {
            "Map.Title": copy.aria,
            "CooperativeGesturesHandler.WindowsHelpText": copy.instruction,
            "CooperativeGesturesHandler.MacHelpText": copy.instruction,
            "CooperativeGesturesHandler.MobileHelpText": copy.instruction,
            "NavigationControl.ZoomIn": copy.zoomIn,
            "NavigationControl.ZoomOut": copy.zoomOut,
            "NavigationControl.ResetBearing": copy.compass,
          },
        });
        mapRef.current = map;
        map.addControl(new lib.NavigationControl({ visualizePitch: true }), "top-right");
        map.addControl(new lib.AttributionControl({ compact: false }), "bottom-right");
        map.on("webglcontextlost", () => {
          loaded = false;
          fail();
        });
        map.on("style.load", () => {
          if (!disposed && map) map.setProjection({ type: "globe" });
        });
        map.once("load", () => {
          if (disposed || !map) return;
          loaded = true;
          window.clearTimeout(timeout);
          map.addSource(POINT_SOURCE, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: `${POINT_SOURCE}-halo`,
            type: "circle",
            source: POINT_SOURCE,
            paint: {
              "circle-radius": 17,
              "circle-color": "#0d9488",
              "circle-opacity": 0.18,
            },
          });
          map.addLayer({
            id: `${POINT_SOURCE}-point`,
            type: "circle",
            source: POINT_SOURCE,
            paint: {
              "circle-radius": 7,
              "circle-color": "#0f766e",
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3,
            },
          });
          setStatus("ready");
        });
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => map?.resize());
          observer.observe(hostRef.current);
        }
      })
      .catch(fail);

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [attempt, copy]);

  const missingCoordinates =
    (focus.level === "institution" || focus.level === "city") &&
    (target.precision === "country" || target.precision === "world");
  const selectionLabel = focus.institutionName || focus.city || "";
  const buttonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 text-xs font-semibold text-navy shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2";

  return (
    <section
      aria-label={copy.aria}
      className={`relative min-h-[280px] w-full overflow-hidden bg-[#dcecf0] [&_.maplibregl-ctrl-bottom-left]:bottom-7 [&_.maplibregl-ctrl-bottom-right]:bottom-7 ${className}`}
    >
      <div
        ref={hostRef}
        className="absolute inset-0"
        style={{ position: "absolute", inset: 0 }}
        aria-busy={status === "loading"}
      />
      <p className="sr-only">{copy.instruction}</p>

      {status === "ready" && (
        <div className="pointer-events-none absolute start-3 top-3 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-2 sm:start-5 sm:top-5">
          <button
            type="button"
            className={`${buttonClass} pointer-events-auto`}
            onClick={() => mapRef.current && focusMap(mapRef.current, { level: "world" })}
          >
            <Globe2 className="h-4 w-4 text-teal" />
            {copy.world}
          </button>
          {focus.level !== "world" && (
            <button
              type="button"
              className={`${buttonClass} pointer-events-auto`}
              onClick={() => mapRef.current && focusMap(mapRef.current, focus)}
            >
              <LocateFixed className="h-4 w-4 text-teal" />
              {copy.locate}
            </button>
          )}
        </div>
      )}

      {status !== "ready" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#e6f1f3]/95 px-5 py-6 text-center">
          <div className="max-w-md">
            <Globe2
              className={`mx-auto text-teal/40 ${status === "loading" ? "h-20 w-20" : "h-12 w-12"}`}
              strokeWidth={1}
            />
            <p role="status" className="mt-5 font-display text-lg font-semibold text-navy">
              {status === "loading" ? copy.loading : copy.error}
            </p>
            {status === "loading" ? (
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-teal motion-reduce:animate-none" />
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.fallback}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <a href="#kesfet" className={buttonClass}>
                    <List className="h-4 w-4" /> {copy.list}
                  </a>
                  <button
                    type="button"
                    onClick={() => setAttempt((value) => value + 1)}
                    className={buttonClass}
                  >
                    <RotateCcw className="h-4 w-4" /> {copy.retry}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {status === "ready" && focus.level !== "world" && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-3 bottom-16 z-10 max-w-xl rounded-xl border border-white/80 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur sm:start-5 sm:end-auto"
        >
          {selectionLabel && (
            <strong className="mb-1 block text-sm text-navy">{selectionLabel}</strong>
          )}
          {missingCoordinates
            ? copy.missing
            : target.precision === "institution"
              ? copy.institution
              : target.precision === "city"
                ? copy.city
                : copy.country}
        </div>
      )}

      <p className="absolute inset-x-0 bottom-0 z-30 bg-white/95 px-3 py-1.5 text-center text-[10px] leading-4 text-slate-600">
        {copy.centers}:{" "}
        <a
          href="https://github.com/mledoze/countries"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-navy"
        >
          mledoze/countries
        </a>{" "}
        ·{" "}
        <a
          href="https://opendatacommons.org/licenses/odbl/1-0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-navy"
        >
          ODbL 1.0
        </a>
      </p>
    </section>
  );
}
