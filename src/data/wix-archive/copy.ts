import type { EuropeBlogLocale } from "../europe-blog/types";

type ArchiveCopy = {
  title: string;
  intro: string;
  all: string;
  guides: string;
  previous: string;
  search: string;
  read: string;
  published: string;
  updated: string;
  formatLabel: string;
  formatNote: string;
  noticeTitle: string;
  noticeBody: string;
  source: string;
  author: string;
  availableTitle: string;
  availableBody: string;
  related: string;
  allGuides: string;
  minutes: string;
  noResults: string;
};

export const WIX_ARCHIVE_COPY: Record<EuropeBlogLocale, ArchiveCopy> = {
  tr: {
    title: "Önceki eğitim yazıları",
    intro:
      "CliniGA'nın önceki blogundan özgün metinleri, görselleri ve yayın tarihleriyle taşınan yazıları keşfet.",
    all: "Tüm yazılar",
    guides: "Ülke rehberleri",
    previous: "Önceki yazılar",
    search: "Rehber veya önceki yazı ara",
    read: "Yazıyı oku",
    published: "İlk yayın",
    updated: "Son içerik düzenlemesi",
    formatLabel: "Biçim düzenlemesi",
    formatNote:
      "Metin ve görseller yeni okuma düzenine aktarıldı. Bu işlem, içerikteki bilgilerin güncelliğinin veya doğruluğunun yeniden teyit edildiği anlamına gelmez.",
    noticeTitle: "Bu yazı arşivden taşındı",
    noticeBody:
      "Yazı, ilk yayınlandığı dönemin bilgisini yansıtır. Ücretler, burslar, vize koşulları ve son başvuru tarihleri değişmiş olabilir. Başvuru veya ödeme öncesinde ilgili kurumun güncel resmî bilgisini doğrula.",
    source: "Özgün yayını görüntüle",
    author: "Özgün yazar",
    availableTitle: "Arşivdeki yazıların dilleri",
    availableBody:
      "Önceki yazılar Türkçe, İngilizce, Almanca, İspanyolca ve İtalyanca olarak mevcut. Bu dildeki ülke rehberlerini okuyabilir veya arşivi aşağıdaki dillerden biriyle açabilirsin.",
    related: "Bu ülke için kaynak kontrollü rehberler",
    allGuides: "Ülke rehberlerine göz at",
    minutes: "dk okuma",
    noResults: "Bu filtrelerle yazı bulunamadı.",
  },
  en: {
    title: "Previous education articles",
    intro:
      "Explore articles from CliniGA's earlier blog, with their original text, images and publication dates.",
    all: "All articles",
    guides: "Country guides",
    previous: "Previous articles",
    search: "Search guides or previous articles",
    read: "Read article",
    published: "First published",
    updated: "Last content revision",
    formatLabel: "Formatting reviewed",
    formatNote:
      "The text and images were adapted to this reading layout. This does not mean the information has been checked again for accuracy or current validity.",
    noticeTitle: "This article comes from the archive",
    noticeBody:
      "The article reflects information available when it was published. Fees, scholarships, visa requirements and deadlines may have changed. Check the relevant institution's current official information before applying or paying.",
    source: "View original publication",
    author: "Original author",
    availableTitle: "Languages in the article archive",
    availableBody:
      "Previous articles are available in Turkish, English, German, Spanish and Italian. Read the country guides in your language, or open the archive in one of the languages below.",
    related: "Source-checked guides for this country",
    allGuides: "Browse country guides",
    minutes: "min read",
    noResults: "No articles match these filters.",
  },
  de: {
    title: "Frühere Bildungsartikel",
    intro:
      "Entdecke Artikel aus dem früheren CliniGA-Blog mit ihren ursprünglichen Texten, Bildern und Veröffentlichungsdaten.",
    all: "Alle Artikel",
    guides: "Länderleitfäden",
    previous: "Frühere Artikel",
    search: "Leitfäden oder frühere Artikel suchen",
    read: "Artikel lesen",
    published: "Erstveröffentlichung",
    updated: "Letzte inhaltliche Überarbeitung",
    formatLabel: "Formatierung geprüft",
    formatNote:
      "Text und Bilder wurden an diese Leseansicht angepasst. Dabei wurden die Informationen nicht erneut auf Richtigkeit oder Aktualität geprüft.",
    noticeTitle: "Dieser Artikel stammt aus dem Archiv",
    noticeBody:
      "Der Artikel gibt den Informationsstand seiner Veröffentlichung wieder. Gebühren, Stipendien, Visabedingungen und Fristen können sich geändert haben. Prüfe vor einer Bewerbung oder Zahlung die aktuellen offiziellen Angaben der zuständigen Einrichtung.",
    source: "Ursprüngliche Veröffentlichung",
    author: "Ursprünglicher Autor",
    availableTitle: "Sprachen des Artikelarchivs",
    availableBody:
      "Frühere Artikel sind auf Türkisch, Englisch, Deutsch, Spanisch und Italienisch verfügbar. Lies die Länderleitfäden in deiner Sprache oder öffne das Archiv in einer der folgenden Sprachen.",
    related: "Quellengeprüfte Leitfäden zu diesem Land",
    allGuides: "Länderleitfäden ansehen",
    minutes: "Min. Lesezeit",
    noResults: "Keine Artikel entsprechen diesen Filtern.",
  },
  es: {
    title: "Artículos educativos anteriores",
    intro:
      "Explora los artículos del blog anterior de CliniGA con sus textos, imágenes y fechas de publicación originales.",
    all: "Todos los artículos",
    guides: "Guías por país",
    previous: "Artículos anteriores",
    search: "Buscar guías o artículos anteriores",
    read: "Leer artículo",
    published: "Primera publicación",
    updated: "Última revisión del contenido",
    formatLabel: "Revisión de formato",
    formatNote:
      "El texto y las imágenes se adaptaron a este formato de lectura. Esto no significa que se haya vuelto a comprobar la exactitud o la vigencia de la información.",
    noticeTitle: "Este artículo procede del archivo",
    noticeBody:
      "El artículo refleja la información disponible al publicarse. Las tasas, becas, condiciones de visado y fechas límite pueden haber cambiado. Antes de solicitar una plaza o pagar, consulta la información oficial vigente de la institución correspondiente.",
    source: "Ver publicación original",
    author: "Autor original",
    availableTitle: "Idiomas del archivo de artículos",
    availableBody:
      "Los artículos anteriores están disponibles en turco, inglés, alemán, español e italiano. Lee las guías por país en tu idioma o abre el archivo en uno de los siguientes idiomas.",
    related: "Guías con fuentes revisadas para este país",
    allGuides: "Explorar guías por país",
    minutes: "min de lectura",
    noResults: "No hay artículos que coincidan con estos filtros.",
  },
  it: {
    title: "Articoli precedenti sullo studio",
    intro:
      "Esplora gli articoli del precedente blog CliniGA con testi, immagini e date di pubblicazione originali.",
    all: "Tutti gli articoli",
    guides: "Guide per paese",
    previous: "Articoli precedenti",
    search: "Cerca guide o articoli precedenti",
    read: "Leggi l’articolo",
    published: "Prima pubblicazione",
    updated: "Ultima revisione dei contenuti",
    formatLabel: "Revisione dell’impaginazione",
    formatNote:
      "Il testo e le immagini sono stati adattati a questa impaginazione. Ciò non significa che l’accuratezza o l’attualità delle informazioni siano state nuovamente verificate.",
    noticeTitle: "Questo articolo proviene dall’archivio",
    noticeBody:
      "L’articolo riflette le informazioni disponibili alla pubblicazione. Costi, borse di studio, requisiti per il visto e scadenze potrebbero essere cambiati. Prima di candidarti o pagare, verifica le informazioni ufficiali aggiornate dell’istituzione competente.",
    source: "Vedi la pubblicazione originale",
    author: "Autore originale",
    availableTitle: "Lingue dell’archivio degli articoli",
    availableBody:
      "Gli articoli precedenti sono disponibili in turco, inglese, tedesco, spagnolo e italiano. Leggi le guide per paese nella tua lingua oppure apri l’archivio in una delle lingue seguenti.",
    related: "Guide con fonti verificate per questo paese",
    allGuides: "Esplora le guide per paese",
    minutes: "min di lettura",
    noResults: "Nessun articolo corrisponde a questi filtri.",
  },
  fr: {
    title: "Anciens articles sur les études",
    intro: "Retrouve les articles de l’ancien blog CliniGA dans leurs langues de publication.",
    all: "Tous les articles",
    guides: "Guides par pays",
    previous: "Anciens articles",
    search: "Rechercher un guide ou un article",
    read: "Lire l’article",
    published: "Première publication",
    updated: "Dernière révision du contenu",
    formatLabel: "Mise en page revue",
    formatNote:
      "La mise en page a été adaptée. Les informations n’ont pas été vérifiées à nouveau.",
    noticeTitle: "Article d’archive",
    noticeBody:
      "Les frais, bourses, conditions de visa et échéances peuvent avoir changé. Consulte les informations officielles actuelles avant toute démarche ou tout paiement.",
    source: "Voir la publication originale",
    author: "Auteur d’origine",
    availableTitle: "Langues des articles archivés",
    availableBody:
      "Les anciens articles sont disponibles en turc, anglais, allemand, espagnol et italien. Consulte les guides par pays en français ou ouvre les archives dans l’une des langues ci-dessous.",
    related: "Guides de ce pays aux sources vérifiées",
    allGuides: "Voir les guides par pays",
    minutes: "min de lecture",
    noResults: "Aucun article ne correspond à ces filtres.",
  },
  hi: {
    title: "शिक्षा से जुड़े पुराने लेख",
    intro: "CliniGA के पुराने ब्लॉग के लेख उनकी मूल प्रकाशन भाषाओं में पढ़ें।",
    all: "सभी लेख",
    guides: "देशों की मार्गदर्शिकाएँ",
    previous: "पुराने लेख",
    search: "मार्गदर्शिका या पुराना लेख खोजें",
    read: "लेख पढ़ें",
    published: "पहली बार प्रकाशित",
    updated: "सामग्री का अंतिम संशोधन",
    formatLabel: "प्रारूप की समीक्षा",
    formatNote:
      "पाठ और चित्रों का प्रारूप बदला गया है। जानकारी की सटीकता या वर्तमान वैधता की दोबारा जाँच नहीं की गई है।",
    noticeTitle: "यह संग्रह का पुराना लेख है",
    noticeBody:
      "शुल्क, छात्रवृत्तियाँ, वीज़ा शर्तें और अंतिम तिथियाँ बदल सकती हैं। आवेदन या भुगतान से पहले संबंधित संस्था की वर्तमान आधिकारिक जानकारी जाँचें।",
    source: "मूल प्रकाशन देखें",
    author: "मूल लेखक",
    availableTitle: "पुराने लेखों की उपलब्ध भाषाएँ",
    availableBody:
      "पुराने लेख तुर्की, अंग्रेज़ी, जर्मन, स्पेनिश और इतालवी में उपलब्ध हैं। हिंदी में देशों की मार्गदर्शिकाएँ पढ़ें या नीचे दी गई किसी भाषा में पुराने लेख खोलें।",
    related: "इस देश की स्रोत-जाँची गई मार्गदर्शिकाएँ",
    allGuides: "देशों की मार्गदर्शिकाएँ देखें",
    minutes: "मिनट का पठन",
    noResults: "इन फ़िल्टर से कोई लेख नहीं मिला।",
  },
  ar: {
    title: "مقالات تعليمية سابقة",
    intro: "اقرأ مقالات مدونة CliniGA السابقة بلغات نشرها الأصلية.",
    all: "جميع المقالات",
    guides: "أدلة الدول",
    previous: "المقالات السابقة",
    search: "ابحث عن دليل أو مقال سابق",
    read: "اقرأ المقال",
    published: "تاريخ النشر الأول",
    updated: "آخر مراجعة للمحتوى",
    formatLabel: "مراجعة التنسيق",
    formatNote:
      "أُعيد تنسيق النص والصور. لا يعني ذلك إعادة التحقق من صحة المعلومات أو سريانها حاليًا.",
    noticeTitle: "هذا المقال من الأرشيف",
    noticeBody:
      "قد تكون الرسوم والمنح وشروط التأشيرة والمواعيد النهائية قد تغيرت. راجع المعلومات الرسمية الحالية للمؤسسة المعنية قبل التقديم أو الدفع.",
    source: "عرض المنشور الأصلي",
    author: "الكاتب الأصلي",
    availableTitle: "اللغات المتاحة في أرشيف المقالات",
    availableBody:
      "تتوفر المقالات السابقة بالتركية والإنجليزية والألمانية والإسبانية والإيطالية. يمكنك قراءة أدلة الدول بالعربية أو فتح الأرشيف بإحدى اللغات التالية.",
    related: "أدلة لهذا البلد بمصادر جرى التحقق منها",
    allGuides: "تصفح أدلة الدول",
    minutes: "دقائق للقراءة",
    noResults: "لا توجد مقالات تطابق هذه الخيارات.",
  },
  ru: {
    title: "Предыдущие статьи об образовании",
    intro: "Читайте статьи прежнего блога CliniGA на языках их первоначальной публикации.",
    all: "Все статьи",
    guides: "Гиды по странам",
    previous: "Предыдущие статьи",
    search: "Поиск гидов и прежних статей",
    read: "Читать статью",
    published: "Первая публикация",
    updated: "Последняя редакция текста",
    formatLabel: "Проверка оформления",
    formatNote:
      "Текст и изображения адаптированы к новому оформлению. Актуальность и точность информации повторно не проверялись.",
    noticeTitle: "Это статья из архива",
    noticeBody:
      "Стоимость, стипендии, визовые требования и сроки могли измениться. Перед подачей заявления или оплатой проверьте актуальные официальные сведения соответствующей организации.",
    source: "Открыть исходную публикацию",
    author: "Автор оригинала",
    availableTitle: "Языки архивных статей",
    availableBody:
      "Прежние статьи доступны на турецком, английском, немецком, испанском и итальянском. Читайте гиды по странам на русском или откройте архив на одном из языков ниже.",
    related: "Гиды по этой стране с проверенными источниками",
    allGuides: "Смотреть гиды по странам",
    minutes: "мин. чтения",
    noResults: "По этим фильтрам статьи не найдены.",
  },
  zh: {
    title: "往期留学文章",
    intro: "按原始发表语言阅读 CliniGA 旧博客的文章。",
    all: "全部文章",
    guides: "国家指南",
    previous: "往期文章",
    search: "搜索指南或往期文章",
    read: "阅读文章",
    published: "首次发表",
    updated: "内容最近修订",
    formatLabel: "排版审阅",
    formatNote: "文章文字和图片已适配新的阅读版式。这并不表示已重新核实信息的准确性或时效性。",
    noticeTitle: "本文来自历史归档",
    noticeBody:
      "费用、奖学金、签证条件和截止日期可能已经变化。申请或付款前，请查阅相关机构当前的官方信息。",
    source: "查看原始文章",
    author: "原作者",
    availableTitle: "往期文章的可用语言",
    availableBody:
      "往期文章提供土耳其语、英语、德语、西班牙语和意大利语版本。你可以继续阅读中文国家指南，或选择以下语言浏览往期文章。",
    related: "该国家的已核查来源指南",
    allGuides: "浏览国家指南",
    minutes: "分钟阅读",
    noResults: "没有符合筛选条件的文章。",
  },
};
