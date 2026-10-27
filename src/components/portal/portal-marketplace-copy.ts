import { useTranslation } from "react-i18next";

import type { LanguageCode } from "@/i18n";

export type MarketplaceKind =
  | "housing"
  | "dormitory"
  | "roommates"
  | "marketplace"
  | "jobs"
  | "services"
  | "scholarships"
  | "community";

type MarketplaceCopy = {
  eyebrow: string;
  title: string;
  description: string;
  all: string;
  search: string;
  searchPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  budget: string;
  currency: string;
  budgetHint: string;
  grid: string;
  list: string;
  post: string;
  saved: string;
  loading: string;
  error: string;
  retry: string;
  emptyTitle: string;
  emptyDescription: string;
  clear: string;
  details: string;
  contact: string;
  priceOnRequest: string;
  verified: string;
  global: string;
  more: string;
  results: string;
  notice: string;
  published: string;
  close: string;
  categories: Record<MarketplaceKind, string>;
};

const COPY: Record<LanguageCode, MarketplaceCopy> = {
  tr: {
    eyebrow: "Öğrenci yaşamı",
    title: "Yeni şehrinde ihtiyacın olanları bul",
    description:
      "Konaklama, eşya, iş ve yerel bağlantılar. Seçtiğin ülke, şehir ve üniversiteye göre yayımlanan ilanları keşfet.",
    all: "Tümü",
    search: "İlan ara",
    searchPlaceholder: "Oda, bisiklet, dil dersi…",
    city: "Şehir",
    cityPlaceholder: "Şehir adı",
    budget: "En yüksek fiyat",
    currency: "Para birimi",
    budgetHint:
      "Bütçe filtresi yalnızca seçilen para birimindeki fiyatlı ilanları gösterir; kur dönüşümü yapılmaz.",
    grid: "Kart görünümü",
    list: "Liste görünümü",
    post: "İlan ver",
    saved: "Çalışma alanım",
    loading: "Yayımlanan ilanlar yükleniyor…",
    error: "İlanlar şu anda yüklenemiyor. Yeniden deneyebilir veya çalışma alanına geçebilirsin.",
    retry: "Yeniden dene",
    emptyTitle: "Bu seçimde henüz ilan yok",
    emptyDescription:
      "Filtrelerini genişlet veya bu şehirde ilk ilanı sen oluştur. Burada yalnızca yayımlanmış gerçek ilanlar gösterilir.",
    clear: "Filtreleri temizle",
    details: "İlanı incele",
    contact: "Hesabımla devam et",
    priceOnRequest: "Fiyat belirtilmemiş",
    verified: "İlan doğrulaması mevcut",
    global: "Küresel ilan",
    more: "Daha fazla ilan göster",
    results: "Son ilanlarda eşleşen",
    notice:
      "İletişim ve ilan yönetimi hesabın üzerinden yapılır. Ödeme yapmak doğrulama veya kalite onayı anlamına gelmez.",
    published: "Yayımlanma",
    close: "Kapat",
    categories: {
      housing: "Ev & oda",
      dormitory: "Öğrenci yurdu",
      roommates: "Ev arkadaşı",
      marketplace: "İkinci el",
      jobs: "İş & staj",
      services: "Yerel hizmetler",
      scholarships: "Burslar",
      community: "Topluluk",
    },
  },
  en: {
    eyebrow: "Student life",
    title: "Find what you need in your new city",
    description:
      "Housing, essentials, work and local connections. Explore published listings for your selected country, city and university.",
    all: "All",
    search: "Search listings",
    searchPlaceholder: "Room, bicycle, language lesson…",
    city: "City",
    cityPlaceholder: "City name",
    budget: "Maximum price",
    currency: "Currency",
    budgetHint:
      "A budget shows only priced listings in the selected currency; no currency conversion is applied.",
    grid: "Card view",
    list: "List view",
    post: "Create a listing",
    saved: "My workspace",
    loading: "Loading published listings…",
    error: "Listings cannot be loaded right now. Retry or continue to your workspace.",
    retry: "Try again",
    emptyTitle: "No listings for this selection yet",
    emptyDescription:
      "Broaden your filters or create the first listing in this city. Only real, published listings appear here.",
    clear: "Clear filters",
    details: "View listing",
    contact: "Continue with my account",
    priceOnRequest: "Price not specified",
    verified: "Listing verification recorded",
    global: "Global listing",
    more: "Show more listings",
    results: "Matches among recent listings",
    notice:
      "Manage listings and communication through your account. Payment does not imply verification or a quality endorsement.",
    published: "Published",
    close: "Close",
    categories: {
      housing: "Homes & rooms",
      dormitory: "Student housing",
      roommates: "Roommates",
      marketplace: "Second-hand",
      jobs: "Jobs & internships",
      services: "Local services",
      scholarships: "Scholarships",
      community: "Community",
    },
  },
  de: {
    eyebrow: "Studierendenleben",
    title: "Finde, was du in deiner neuen Stadt brauchst",
    description:
      "Wohnen, Ausstattung, Arbeit und Kontakte. Entdecke veröffentlichte Anzeigen für dein gewähltes Land, deine Stadt und Hochschule.",
    all: "Alle",
    search: "Anzeigen suchen",
    searchPlaceholder: "Zimmer, Fahrrad, Sprachunterricht…",
    city: "Stadt",
    cityPlaceholder: "Stadtname",
    budget: "Höchstpreis",
    currency: "Währung",
    budgetHint:
      "Der Budgetfilter zeigt nur bepreiste Anzeigen in der gewählten Währung; ohne Währungsumrechnung.",
    grid: "Kartenansicht",
    list: "Listenansicht",
    post: "Anzeige erstellen",
    saved: "Mein Arbeitsbereich",
    loading: "Veröffentlichte Anzeigen werden geladen…",
    error:
      "Anzeigen können gerade nicht geladen werden. Versuche es erneut oder öffne deinen Arbeitsbereich.",
    retry: "Erneut versuchen",
    emptyTitle: "Noch keine Anzeigen für diese Auswahl",
    emptyDescription:
      "Erweitere die Filter oder erstelle die erste Anzeige in dieser Stadt. Hier erscheinen nur echte, veröffentlichte Anzeigen.",
    clear: "Filter zurücksetzen",
    details: "Anzeige ansehen",
    contact: "Mit meinem Konto fortfahren",
    priceOnRequest: "Preis nicht angegeben",
    verified: "Anzeigenprüfung erfasst",
    global: "Globale Anzeige",
    more: "Weitere Anzeigen anzeigen",
    results: "Treffer unter den neuesten Anzeigen",
    notice:
      "Anzeigen und Kommunikation werden über dein Konto verwaltet. Eine Zahlung bedeutet keine Verifizierung oder Qualitätsbestätigung.",
    published: "Veröffentlicht",
    close: "Schließen",
    categories: {
      housing: "Wohnungen & Zimmer",
      dormitory: "Wohnheime",
      roommates: "Mitbewohner",
      marketplace: "Secondhand",
      jobs: "Jobs & Praktika",
      services: "Lokale Dienste",
      scholarships: "Stipendien",
      community: "Community",
    },
  },
  fr: {
    eyebrow: "Vie étudiante",
    title: "Trouve l’essentiel dans ta nouvelle ville",
    description:
      "Logement, équipement, emploi et contacts. Explore les annonces publiées pour le pays, la ville et l’université sélectionnés.",
    all: "Tout",
    search: "Rechercher une annonce",
    searchPlaceholder: "Chambre, vélo, cours de langue…",
    city: "Ville",
    cityPlaceholder: "Nom de la ville",
    budget: "Prix maximal",
    currency: "Devise",
    budgetHint:
      "Le budget affiche uniquement les annonces tarifées dans la devise sélectionnée, sans conversion.",
    grid: "Vue cartes",
    list: "Vue liste",
    post: "Publier une annonce",
    saved: "Mon espace",
    loading: "Chargement des annonces publiées…",
    error: "Les annonces ne peuvent pas être chargées. Réessaie ou ouvre ton espace.",
    retry: "Réessayer",
    emptyTitle: "Aucune annonce pour cette sélection",
    emptyDescription:
      "Élargis tes filtres ou crée la première annonce dans cette ville. Seules de vraies annonces publiées sont affichées.",
    clear: "Effacer les filtres",
    details: "Voir l’annonce",
    contact: "Continuer avec mon compte",
    priceOnRequest: "Prix non précisé",
    verified: "Vérification de l’annonce enregistrée",
    global: "Annonce internationale",
    more: "Afficher plus d’annonces",
    results: "Résultats parmi les annonces récentes",
    notice:
      "Gère les annonces et les échanges depuis ton compte. Un paiement ne vaut pas vérification ni garantie de qualité.",
    published: "Publication",
    close: "Fermer",
    categories: {
      housing: "Logements & chambres",
      dormitory: "Résidences étudiantes",
      roommates: "Colocataires",
      marketplace: "Seconde main",
      jobs: "Emplois & stages",
      services: "Services locaux",
      scholarships: "Bourses",
      community: "Communauté",
    },
  },
  it: {
    eyebrow: "Vita studentesca",
    title: "Trova ciò che serve nella tua nuova città",
    description:
      "Alloggi, oggetti, lavoro e contatti. Esplora gli annunci pubblicati per il paese, la città e l’università selezionati.",
    all: "Tutti",
    search: "Cerca annunci",
    searchPlaceholder: "Stanza, bicicletta, lezione di lingua…",
    city: "Città",
    cityPlaceholder: "Nome della città",
    budget: "Prezzo massimo",
    currency: "Valuta",
    budgetHint:
      "Il budget mostra solo annunci con prezzo nella valuta selezionata, senza conversione.",
    grid: "Vista schede",
    list: "Vista elenco",
    post: "Crea un annuncio",
    saved: "Il mio spazio",
    loading: "Caricamento degli annunci pubblicati…",
    error: "Impossibile caricare gli annunci. Riprova o apri il tuo spazio di lavoro.",
    retry: "Riprova",
    emptyTitle: "Nessun annuncio per questa selezione",
    emptyDescription:
      "Amplia i filtri o crea il primo annuncio in questa città. Qui appaiono soltanto annunci reali e pubblicati.",
    clear: "Cancella i filtri",
    details: "Vedi annuncio",
    contact: "Continua con il mio account",
    priceOnRequest: "Prezzo non specificato",
    verified: "Verifica dell’annuncio registrata",
    global: "Annuncio globale",
    more: "Mostra altri annunci",
    results: "Corrispondenze tra gli annunci recenti",
    notice:
      "Gestisci annunci e comunicazioni dal tuo account. Un pagamento non equivale a verifica o garanzia di qualità.",
    published: "Pubblicato",
    close: "Chiudi",
    categories: {
      housing: "Case & stanze",
      dormitory: "Residenze studentesche",
      roommates: "Coinquilini",
      marketplace: "Seconda mano",
      jobs: "Lavoro & tirocini",
      services: "Servizi locali",
      scholarships: "Borse di studio",
      community: "Comunità",
    },
  },
  es: {
    eyebrow: "Vida estudiantil",
    title: "Encuentra lo que necesitas en tu nueva ciudad",
    description:
      "Alojamiento, artículos, empleo y contactos. Explora anuncios publicados para el país, la ciudad y la universidad que elijas.",
    all: "Todos",
    search: "Buscar anuncios",
    searchPlaceholder: "Habitación, bicicleta, clase de idiomas…",
    city: "Ciudad",
    cityPlaceholder: "Nombre de la ciudad",
    budget: "Precio máximo",
    currency: "Moneda",
    budgetHint:
      "El presupuesto muestra solo anuncios con precio en la moneda elegida, sin conversión.",
    grid: "Vista de tarjetas",
    list: "Vista de lista",
    post: "Crear un anuncio",
    saved: "Mi espacio",
    loading: "Cargando anuncios publicados…",
    error: "No se pueden cargar los anuncios. Inténtalo de nuevo o abre tu espacio.",
    retry: "Reintentar",
    emptyTitle: "Todavía no hay anuncios para esta selección",
    emptyDescription:
      "Amplía los filtros o crea el primer anuncio de esta ciudad. Aquí solo aparecen anuncios reales publicados.",
    clear: "Borrar filtros",
    details: "Ver anuncio",
    contact: "Continuar con mi cuenta",
    priceOnRequest: "Precio no indicado",
    verified: "Verificación del anuncio registrada",
    global: "Anuncio global",
    more: "Mostrar más anuncios",
    results: "Coincidencias entre los anuncios recientes",
    notice:
      "Gestiona anuncios y comunicaciones desde tu cuenta. Pagar no supone verificación ni garantía de calidad.",
    published: "Publicado",
    close: "Cerrar",
    categories: {
      housing: "Viviendas & habitaciones",
      dormitory: "Residencias estudiantiles",
      roommates: "Compañeros de piso",
      marketplace: "Segunda mano",
      jobs: "Empleo & prácticas",
      services: "Servicios locales",
      scholarships: "Becas",
      community: "Comunidad",
    },
  },
  ar: {
    eyebrow: "الحياة الطلابية",
    title: "اعثر على احتياجاتك في مدينتك الجديدة",
    description:
      "السكن والمستلزمات والعمل والعلاقات المحلية. تصفّح الإعلانات المنشورة حسب البلد والمدينة والجامعة التي تختارها.",
    all: "الكل",
    search: "البحث في الإعلانات",
    searchPlaceholder: "غرفة، دراجة، درس لغة…",
    city: "المدينة",
    cityPlaceholder: "اسم المدينة",
    budget: "أعلى سعر",
    currency: "العملة",
    budgetHint:
      "يعرض مرشح الميزانية الإعلانات المسعّرة بالعملة المختارة فقط، من دون تحويل العملات.",
    grid: "عرض البطاقات",
    list: "عرض القائمة",
    post: "أنشئ إعلانًا",
    saved: "مساحة عملي",
    loading: "جارٍ تحميل الإعلانات المنشورة…",
    error: "تعذّر تحميل الإعلانات حاليًا. أعد المحاولة أو افتح مساحة عملك.",
    retry: "إعادة المحاولة",
    emptyTitle: "لا توجد إعلانات لهذا الاختيار بعد",
    emptyDescription:
      "وسّع المرشحات أو أنشئ أول إعلان في هذه المدينة. تظهر هنا الإعلانات الحقيقية المنشورة فقط.",
    clear: "مسح المرشحات",
    details: "عرض الإعلان",
    contact: "المتابعة بحسابي",
    priceOnRequest: "السعر غير محدد",
    verified: "توجد مراجعة لتوثيق الإعلان",
    global: "إعلان عالمي",
    more: "عرض المزيد من الإعلانات",
    results: "نتائج مطابقة بين أحدث الإعلانات",
    notice: "تُدار الإعلانات والتواصل من خلال حسابك. لا يعني الدفع توثيق الإعلان أو ضمان جودته.",
    published: "تاريخ النشر",
    close: "إغلاق",
    categories: {
      housing: "منازل وغرف",
      dormitory: "سكن طلابي",
      roommates: "شركاء سكن",
      marketplace: "مستعمل",
      jobs: "عمل وتدريب",
      services: "خدمات محلية",
      scholarships: "منح دراسية",
      community: "المجتمع",
    },
  },
  ru: {
    eyebrow: "Студенческая жизнь",
    title: "Найдите нужное в вашем новом городе",
    description:
      "Жильё, вещи, работа и местные знакомства. Смотрите опубликованные объявления по выбранной стране, городу и университету.",
    all: "Все",
    search: "Поиск объявлений",
    searchPlaceholder: "Комната, велосипед, урок языка…",
    city: "Город",
    cityPlaceholder: "Название города",
    budget: "Максимальная цена",
    currency: "Валюта",
    budgetHint:
      "Фильтр бюджета показывает только объявления с ценой в выбранной валюте, без конвертации.",
    grid: "Карточки",
    list: "Список",
    post: "Создать объявление",
    saved: "Моё рабочее пространство",
    loading: "Загрузка опубликованных объявлений…",
    error:
      "Сейчас не удаётся загрузить объявления. Повторите попытку или откройте рабочее пространство.",
    retry: "Повторить",
    emptyTitle: "Для этого выбора пока нет объявлений",
    emptyDescription:
      "Расширьте фильтры или создайте первое объявление в этом городе. Здесь только реальные опубликованные объявления.",
    clear: "Сбросить фильтры",
    details: "Посмотреть объявление",
    contact: "Продолжить с моим аккаунтом",
    priceOnRequest: "Цена не указана",
    verified: "Проверка объявления зарегистрирована",
    global: "Глобальное объявление",
    more: "Показать ещё объявления",
    results: "Совпадения среди последних объявлений",
    notice:
      "Объявления и общение управляются через ваш аккаунт. Оплата не означает проверку или подтверждение качества.",
    published: "Опубликовано",
    close: "Закрыть",
    categories: {
      housing: "Дома и комнаты",
      dormitory: "Общежития",
      roommates: "Соседи по жилью",
      marketplace: "Подержанные вещи",
      jobs: "Работа и стажировки",
      services: "Местные услуги",
      scholarships: "Стипендии",
      community: "Сообщество",
    },
  },
  zh: {
    eyebrow: "学生生活",
    title: "找到新城市生活所需",
    description: "住宿、生活用品、工作与本地联系。按所选国家、城市和大学浏览已发布的信息。",
    all: "全部",
    search: "搜索信息",
    searchPlaceholder: "房间、自行车、语言课程…",
    city: "城市",
    cityPlaceholder: "城市名称",
    budget: "最高价格",
    currency: "币种",
    budgetHint: "预算筛选仅显示所选币种且标明价格的信息，不进行汇率换算。",
    grid: "卡片视图",
    list: "列表视图",
    post: "发布信息",
    saved: "我的工作空间",
    loading: "正在加载已发布信息…",
    error: "暂时无法加载信息。请重试或进入工作空间。",
    retry: "重试",
    emptyTitle: "当前选择暂无信息",
    emptyDescription: "请放宽筛选条件，或发布该城市的第一条信息。这里只展示真实且已发布的信息。",
    clear: "清除筛选",
    details: "查看详情",
    contact: "使用我的账户继续",
    priceOnRequest: "未注明价格",
    verified: "已记录信息核验",
    global: "全球信息",
    more: "显示更多信息",
    results: "最新信息中的匹配结果",
    notice: "请通过账户管理信息与沟通。付款不代表核验通过或质量认可。",
    published: "发布时间",
    close: "关闭",
    categories: {
      housing: "住房与房间",
      dormitory: "学生宿舍",
      roommates: "室友",
      marketplace: "二手物品",
      jobs: "工作与实习",
      services: "本地服务",
      scholarships: "奖学金",
      community: "学生社区",
    },
  },
};

export function usePortalMarketplaceCopy() {
  const { i18n } = useTranslation();
  const raw = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const locale: LanguageCode = Object.prototype.hasOwnProperty.call(COPY, raw)
    ? (raw as LanguageCode)
    : "tr";
  return { copy: COPY[locale], locale };
}
