import type { EuropeBlogLocale, EuropeGuideTopic } from "./types";

type BlogCopy = {
  name: string;
  title: string;
  intro: string;
  search: string;
  all: string;
  country: string;
  topic: string;
  read: string;
  back: string;
  checked: string;
  sources: string;
  sourcesNote: string;
  checklist: string;
  note: string;
  related: string;
  communities: string;
  communityNote: string;
  source: string;
  directory: string;
  contact: string;
  portal: string;
  services: string;
  privacy: string;
  cta: string;
  ctaBody: string;
  message: string;
  noResults: string;
  clear: string;
  older: string;
  editorial: string;
  contents: string;
  destination: string;
  titles: Record<EuropeGuideTopic, string>;
  intros: Record<EuropeGuideTopic, string>;
  steps: Record<EuropeGuideTopic, string[]>;
};

export const EUROPE_BLOG_COPY: Record<EuropeBlogLocale, BlogCopy> = {
  tr: {
    name: "Türkçe",
    title: "Eğitimle dünyanı genişlet",
    intro:
      "Ülkeni seç. Programları, başvuru yolunu, bursları ve yeni hayatının ilk adımlarını resmî kaynaklarla planla.",
    search: "Ülke veya rehber ara",
    all: "Tümü",
    country: "Ülke / destinasyon",
    topic: "Konu",
    read: "Rehberi oku",
    back: "Tüm rehberler",
    checked: "Kaynak kontrolü",
    sources: "Resmî kaynaklar",
    sourcesNote:
      "Başvuru koşulları değişebilir. Ödeme ve başvuru öncesinde bağlantıdaki güncel çağrıyı ve üniversitenin yazılı yanıtını esas al.",
    checklist: "Kendi planını oluştur",
    note: "Bu rehber genel planlama içindir. Kabul, burs veya vize garantisi verilmez. Son tarih, ücret ve uygunluk koşullarını kişisel durumun için yetkili kurumdan doğrula.",
    related: "Bu destinasyon için devam et",
    communities: "WhatsApp ve Telegram toplulukları",
    communityNote:
      "Bağlantılar aşağıdaki üniversite veya öğrenci ağı sayfalarında yayımlanmıştır. CliniGA tarafından yönetilmez. Davetler kapanabilir; üyelik veya etkinlik düzeyi doğrulanmamıştır. Telefonunun görünürlüğünü ve grup kurallarını incele; belge, ödeme ya da hesap şifresi paylaşma.",
    source: "Yayımlayan kaynak",
    directory: "Yerel ESN topluluğunu bul",
    contact: "İletişim",
    portal: "Dünyayı keşfet",
    services: "Hizmetler",
    privacy: "Gizlilik",
    cta: "Planını birlikte netleştirelim",
    ctaBody:
      "Hedef ülkeni, eğitim seviyeni ve başlangıç dönemini paylaş; sana uygun hizmetin kapsamını görüşelim.",
    message: "Merhaba, şu eğitim rehberi için danışmanlık kapsamını öğrenmek istiyorum:",
    noResults: "Bu filtrelerle rehber bulunamadı.",
    clear: "Filtreleri temizle",
    older: "Diğer akademik yazılar",
    editorial: "CliniGA Education editör ekibi",
    contents: "Bu rehberde",
    destination: "Eğitim destinasyonu",
    titles: {
      study: "{country}: üniversite ve program seçimi rehberi",
      admission: "{country}: üniversite başvurusu ve diploma tanıma",
      funding: "{country}: burs ve eğitim finansmanı rehberi",
      arrival: "{country}: konaklama, yerleşme ve öğrenci toplulukları",
    },
    intros: {
      study:
        "Doğru ülkeyi seçmek yalnızca üniversite adına bağlı değildir. Programın derecesi, ders dili, kampüsü, tanınırlığı ve mezuniyet hedefin birlikte uyuşmalıdır. Aşağıdaki ülkeye özgü ayrımlar, kısa listeni gerçek program sayfaları üzerinden oluşturman içindir.",
      admission:
        "Kabul başvurusu, diplomanın akademik tanınması ve ülkede kalma izni ayrı işlemlerdir. Aynı belgeyi farklı kurumlar farklı amaçlarla isteyebilir. Başvurunu, kendi vatandaşlığın ve önceki eğitimin için geçerli kanalı belirleyerek başlat.",
      funding:
        "Burs ararken önce uygunluğu, sonra kapsamı incele. Bir burs öğrenim ücretini, yaşam giderini veya yalnızca belirli bir hareketlilik dönemini destekleyebilir. Üniversite kabulü otomatik burs anlamına gelmez; ulusal çağrı ile kurum içi desteğin takvimi de farklı olabilir.",
      arrival:
        "Kabul aldıktan sonra şehirdeki günlük yaşamı ayrı bir proje olarak planla. Konaklama sözleşmesi, kayıt işlemleri, sağlık güvencesi ve ulaşım seçenekleri üniversite başvurusundan farklı takvimlerle ilerler. Aşağıdaki yerel kaynakları, öğrenci topluluklarının deneyimleriyle birlikte kullan.",
    },
    steps: {
      study: [
        "Üç gerçek programı seç; derece, eğitim dili ve kampüsünü resmî katalogda karşılaştır.",
        "Ders planı, değerlendirme yöntemi ve staj koşullarını bölüm sayfasından kaydet.",
        "Diplomanın hedef meslek ve ülkedeki tanınmasını ilgili yetkiliye sor.",
        "Ücret, yaşam gideri ve dil hazırlığını ayrı kalemlerle karşılaştır; sıralamayı tek ölçüt yapma.",
      ],
      admission: [
        "Vatandaşlık, ikamet ve diploma türüne göre doğru başvuru kanalını yazılı olarak doğrula.",
        "Transkript, çeviri ve varsa tanıma işlemini belge listesiyle eşleştir; gereksiz işlem satın alma.",
        "Program son tarihi ile burs, yurt ve göçmenlik tarihlerini ayrı takvimlerde tut.",
        "Başvuru ve ödeme kanıtlarını sakla; yalnızca kurumun yayımladığı güvenli sistemi kullan.",
      ],
      funding: [
        "Vatandaşlık, ikamet, derece ve alan şartlarını her çağrı için ayrı kontrol et.",
        "Bursun tutarı yerine hangi giderleri, kaç ay ve hangi koşulla karşıladığını karşılaştır.",
        "Kabulden bağımsız burs başvurusu gerekip gerekmediğini ve öneren kurum şartını öğren.",
        "Kesinleşmemiş bursu gelir sayma; depozito, seyahat ve ilk aylar için yedek bütçe ayır.",
      ],
      arrival: [
        "Resmî yurt birimi ve öğrenci hizmetleriyle başla; bekleme listesi ve sözleşme şartlarını öğren.",
        "Ev sahibini ve konutu doğrulamadan para gönderme; depozito ve iade şartlarını yazılı al.",
        "İkamet, belediye kaydı, sigorta ve üniversite kaydını kendi statüne göre yetkiliden doğrula.",
        "Toplulukları deneyim paylaşımı için kullan; akademik ve hukuki kararları kurumdan teyit et.",
      ],
    },
  },
  en: {
    name: "English",
    title: "A world of study possibilities",
    intro:
      "Choose a destination. Plan programmes, applications, funding and your first weeks with primary sources.",
    search: "Search a country or guide",
    all: "All",
    country: "Country / destination",
    topic: "Topic",
    read: "Read guide",
    back: "All guides",
    checked: "Sources checked",
    sources: "Official sources",
    sourcesNote:
      "Requirements change. Before applying or paying, use the current call at the linked source and obtain the institution's written confirmation.",
    checklist: "Build your action plan",
    note: "General planning information. Admission, scholarships and visas are not guaranteed. Confirm current deadlines, fees and eligibility with the competent institution for your circumstances.",
    related: "Continue planning this destination",
    communities: "WhatsApp and Telegram communities",
    communityNote:
      "These links were published by the universities or student networks cited below. CliniGA does not operate them. Invitations may expire; membership and activity are unverified. Check phone visibility and group rules. Never share identity documents, passwords or payments in a group.",
    source: "Publishing source",
    directory: "Find a local ESN community",
    contact: "Contact",
    portal: "Explore the world",
    services: "Services",
    privacy: "Privacy",
    cta: "Make your next step clear",
    ctaBody:
      "Share your destination, study level and intended intake to discuss the scope of support that fits your plan.",
    message: "Hello, I would like to discuss support for this study guide:",
    noResults: "No guides match these filters.",
    clear: "Clear filters",
    older: "More academic articles",
    editorial: "CliniGA Education editorial team",
    contents: "In this guide",
    destination: "Education destination",
    titles: {
      study: "{country}: choosing a university and programme",
      admission: "{country}: university applications and qualification recognition",
      funding: "{country}: scholarships and study funding",
      arrival: "{country}: housing, arrival and student communities",
    },
    intros: {
      study:
        "Choosing a destination takes more than a university name. The award, teaching language, campus, recognition and your intended career must fit together. Use the country-specific distinctions below to build a shortlist from actual programme pages rather than promotional rankings.",
      admission:
        "An admission application, academic recognition and permission to stay are different processes. Different institutions may request the same document for different purposes. Begin by identifying the application route that applies to your nationality, residence and previous qualification.",
      funding:
        "Check eligibility before comparing scholarship amounts. An award may cover tuition, living costs or only a particular mobility period. Admission does not automatically include funding, and a national call may run on a different timetable from university financial support.",
      arrival:
        "Treat the move after admission as a separate project. Housing contracts, local registration, health coverage and transport can follow different schedules from university applications. Combine the local institutional resources below with practical experience from student communities.",
    },
    steps: {
      study: [
        "Shortlist three real programmes; compare the award, teaching language and campus in official catalogues.",
        "Save the department's curriculum, assessment method and placement requirements.",
        "Ask the competent authority about recognition for your intended profession and destination.",
        "Compare tuition, living costs and language preparation separately; avoid relying on one ranking.",
      ],
      admission: [
        "Confirm the correct route in writing for your nationality, residence and qualification type.",
        "Match transcripts, translations and recognition steps to the official list before buying document services.",
        "Track programme, scholarship, housing and immigration deadlines separately.",
        "Keep submission and payment evidence; use only the institution's published secure system.",
      ],
      funding: [
        "Check nationality, residence, degree and subject restrictions for each call.",
        "Compare covered expenses, duration and conditions rather than the headline award alone.",
        "Establish whether funding needs a separate application or nomination.",
        "Do not budget an unconfirmed scholarship as income; reserve cash for travel, deposits and early months.",
      ],
      arrival: [
        "Start with official residences and student services; ask about waiting lists and contract terms.",
        "Verify the landlord and property before paying; obtain deposit and refund terms in writing.",
        "Confirm residence, local registration, insurance and enrolment steps for your own status.",
        "Use groups for shared experience; obtain academic and legal decisions from the responsible authority.",
      ],
    },
  },
  de: {
    name: "Deutsch",
    title: "Dein Weg in die internationale Bildung",
    intro:
      "Wähle dein Ziel. Plane Studiengänge, Bewerbung, Finanzierung und Ankunft mit offiziellen Quellen.",
    search: "Land oder Ratgeber suchen",
    all: "Alle",
    country: "Land / Studienziel",
    topic: "Thema",
    read: "Ratgeber lesen",
    back: "Alle Ratgeber",
    checked: "Quellen geprüft",
    sources: "Offizielle Quellen",
    sourcesNote:
      "Vorgaben ändern sich. Prüfe vor Bewerbung oder Zahlung die aktuelle Ausschreibung und hole die schriftliche Bestätigung der zuständigen Hochschule ein.",
    checklist: "Deinen Ablauf planen",
    note: "Allgemeine Planungshilfe ohne Zulassungs-, Stipendien- oder Visumsgarantie. Fristen, Gebühren und persönliche Berechtigung bestätigt die zuständige Stelle.",
    related: "Dieses Studienziel weiter planen",
    communities: "WhatsApp- und Telegram-Communitys",
    communityNote:
      "Die verlinkten Hochschulen oder Studierendennetzwerke veröffentlichen diese Einladungen. CliniGA betreibt die Gruppen nicht. Einladungen können ablaufen; Mitgliederzahl und Aktivität sind ungeprüft. Prüfe Telefonnummernsichtbarkeit und Regeln. Teile keine Ausweise, Passwörter oder Zahlungen.",
    source: "Veröffentlichende Quelle",
    directory: "Lokale ESN-Community finden",
    contact: "Kontakt",
    portal: "Die Welt entdecken",
    services: "Leistungen",
    privacy: "Datenschutz",
    cta: "Den nächsten Schritt klären",
    ctaBody:
      "Nenne Studienziel, Abschlussniveau und gewünschten Studienbeginn, damit wir einen passenden Beratungsumfang besprechen können.",
    message: "Hallo, ich möchte Unterstützung zu diesem Studienratgeber besprechen:",
    noResults: "Keine Ratgeber für diese Filter gefunden.",
    clear: "Filter zurücksetzen",
    older: "Weitere akademische Beiträge",
    editorial: "Redaktion CliniGA Education",
    contents: "In diesem Ratgeber",
    destination: "Studienziel",
    titles: {
      study: "{country}: Hochschule und Studiengang auswählen",
      admission: "{country}: Bewerbung und Anerkennung von Abschlüssen",
      funding: "{country}: Stipendien und Studienfinanzierung",
      arrival: "{country}: Wohnen, Ankunft und studentische Communitys",
    },
    intros: {
      study:
        "Ein Hochschulname allein reicht für die Entscheidung nicht. Abschluss, Unterrichtssprache, Campus, Anerkennung und Berufsziel müssen zusammenpassen. Die landesspezifischen Hinweise helfen dir, konkrete Studiengangsseiten statt bloßer Ranglisten für deine Auswahl zu verwenden.",
      admission:
        "Zulassung, akademische Anerkennung und Aufenthaltsrecht sind eigenständige Verfahren. Mehrere Stellen können dasselbe Dokument für unterschiedliche Zwecke verlangen. Kläre zuerst den Bewerbungsweg für deine Staatsangehörigkeit, deinen Wohnsitz und deinen bisherigen Abschluss.",
      funding:
        "Prüfe zuerst die Berechtigung und dann die Fördersumme. Ein Stipendium kann Gebühren, Lebenshaltung oder nur einen Austauschzeitraum abdecken. Eine Zulassung bedeutet keine automatische Förderung. Nationale Ausschreibungen und hochschuleigene Hilfen können unterschiedliche Fristen haben.",
      arrival:
        "Plane den Umzug nach der Zulassung als eigenes Vorhaben. Mietvertrag, Anmeldung, Krankenversicherung und Verkehr folgen anderen Abläufen als die Hochschulbewerbung. Nutze die offiziellen Anlaufstellen unten und ergänze sie durch Erfahrungen anderer Studierender.",
    },
    steps: {
      study: [
        "Vergleiche drei echte Studiengänge nach Abschluss, Sprache und Campus im offiziellen Katalog.",
        "Speichere Curriculum, Prüfungsformen und Praktikumsanforderungen der Fakultät.",
        "Frage die zuständige Stelle nach der Anerkennung für deinen Zielberuf.",
        "Stelle Gebühren, Lebenshaltung und Sprachvorbereitung getrennt gegenüber; entscheide nicht nur nach Rankings.",
      ],
      admission: [
        "Lass den Bewerbungsweg für Staatsangehörigkeit, Wohnsitz und Abschluss schriftlich bestätigen.",
        "Gleiche Zeugnisse, Übersetzungen und Anerkennung mit der offiziellen Dokumentenliste ab.",
        "Führe getrennte Fristen für Studiengang, Förderung, Wohnheim und Aufenthalt.",
        "Bewahre Einreichungs- und Zahlungsbelege auf; nutze das veröffentlichte sichere Hochschulsystem.",
      ],
      funding: [
        "Prüfe Staatsangehörigkeit, Wohnsitz, Abschlussniveau und Fachbindung jeder Ausschreibung.",
        "Vergleiche gedeckte Kosten, Förderdauer und Bedingungen statt nur des Gesamtbetrags.",
        "Kläre, ob ein eigener Antrag oder eine Nominierung notwendig ist.",
        "Rechne unbestätigte Förderung nicht als Einkommen; halte Rücklagen für Anreise, Kaution und Anfangszeit.",
      ],
      arrival: [
        "Beginne bei Wohnheimverwaltung und Studierendenwerk; kläre Warteliste und Vertrag.",
        "Prüfe Vermieter und Wohnung vor Zahlung; verlange schriftliche Kautions- und Rückzahlungsbedingungen.",
        "Lass Aufenthalt, Anmeldung, Versicherung und Einschreibung für deinen Status bestätigen.",
        "Nutze Gruppen zum Erfahrungsaustausch; akademische und rechtliche Auskünfte kommen von zuständigen Stellen.",
      ],
    },
  },
  fr: {
    name: "Français",
    title: "Ouvrez votre horizon avec les études",
    intro:
      "Choisissez une destination et préparez formation, candidature, financement et installation avec des sources officielles.",
    search: "Rechercher un pays ou un guide",
    all: "Tous",
    country: "Pays / destination",
    topic: "Sujet",
    read: "Lire le guide",
    back: "Tous les guides",
    checked: "Sources consultées",
    sources: "Sources officielles",
    sourcesNote:
      "Les conditions évoluent. Avant toute candidature ou tout paiement, consultez l'appel actuel et demandez une confirmation écrite à l'établissement.",
    checklist: "Construire votre plan d'action",
    note: "Informations générales de préparation, sans garantie d'admission, de bourse ou de visa. Confirmez délais, frais et éligibilité personnelle auprès de l'autorité compétente.",
    related: "Poursuivre votre préparation",
    communities: "Communautés WhatsApp et Telegram",
    communityNote:
      "Ces liens sont publiés par les universités ou réseaux étudiants cités. CliniGA ne gère pas ces groupes. Les invitations peuvent expirer ; effectifs et activité ne sont pas vérifiés. Vérifiez la visibilité de votre numéro et les règles. Ne partagez ni papiers d'identité, ni mots de passe, ni paiements.",
    source: "Source de publication",
    directory: "Trouver une communauté ESN locale",
    contact: "Contact",
    portal: "Explorer le monde",
    services: "Services",
    privacy: "Confidentialité",
    cta: "Précisons votre prochaine étape",
    ctaBody:
      "Indiquez destination, niveau d'études et rentrée envisagée pour discuter de l'accompagnement adapté à votre projet.",
    message: "Bonjour, je souhaite discuter d'un accompagnement pour ce guide d'études :",
    noResults: "Aucun guide ne correspond à ces filtres.",
    clear: "Réinitialiser les filtres",
    older: "Autres articles académiques",
    editorial: "Équipe éditoriale CliniGA Education",
    contents: "Dans ce guide",
    destination: "Destination d'études",
    titles: {
      study: "{country} : choisir son université et sa formation",
      admission: "{country} : candidature et reconnaissance des diplômes",
      funding: "{country} : bourses et financement des études",
      arrival: "{country} : logement, installation et communautés étudiantes",
    },
    intros: {
      study:
        "Le nom d'une université ne suffit pas à choisir. Diplôme, langue d'enseignement, campus, reconnaissance et projet professionnel doivent être cohérents. Les particularités ci-dessous permettent de comparer de véritables programmes à partir de leurs pages officielles, au-delà des classements.",
      admission:
        "Admission, reconnaissance académique et droit au séjour sont des démarches distinctes. Plusieurs organismes peuvent demander le même document pour des usages différents. Identifiez d'abord la procédure correspondant à votre nationalité, résidence et diplôme antérieur.",
      funding:
        "Vérifiez l'éligibilité avant de comparer les montants. Une bourse peut couvrir les frais d'études, la vie quotidienne ou une seule mobilité. Une admission n'inclut pas automatiquement un financement et les calendriers nationaux peuvent différer de ceux des établissements.",
      arrival:
        "Après l'admission, préparez l'installation comme un projet distinct. Bail, enregistrement local, couverture santé et transports suivent des calendriers différents de la candidature. Associez les ressources institutionnelles ci-dessous aux expériences pratiques des communautés étudiantes.",
    },
    steps: {
      study: [
        "Comparez trois formations réelles : diplôme, langue et campus dans le catalogue officiel.",
        "Conservez programme des cours, modalités d'évaluation et conditions de stage du département.",
        "Interrogez l'autorité compétente sur la reconnaissance pour votre profession cible.",
        "Distinguez frais d'études, coût de vie et préparation linguistique ; ne choisissez pas sur un seul classement.",
      ],
      admission: [
        "Faites confirmer par écrit la procédure adaptée à votre nationalité, résidence et diplôme.",
        "Comparez relevés, traductions et reconnaissance avec la liste officielle avant toute dépense.",
        "Séparez les échéances de formation, bourse, logement et séjour.",
        "Conservez les preuves de dépôt et paiement ; utilisez le système sécurisé publié par l'établissement.",
      ],
      funding: [
        "Vérifiez nationalité, résidence, niveau et discipline pour chaque appel.",
        "Comparez dépenses couvertes, durée et obligations plutôt que le seul montant annoncé.",
        "Vérifiez si une candidature séparée ou une nomination est nécessaire.",
        "Ne comptez pas une bourse non confirmée comme revenu ; prévoyez voyage, dépôt et premiers mois.",
      ],
      arrival: [
        "Commencez par les résidences officielles et services étudiants ; demandez conditions et liste d'attente.",
        "Vérifiez propriétaire et logement avant paiement ; obtenez dépôt et remboursement par écrit.",
        "Confirmez séjour, enregistrement, assurance et inscription selon votre statut.",
        "Utilisez les groupes pour les expériences vécues ; faites confirmer les décisions académiques et juridiques par l'autorité.",
      ],
    },
  },
  es: {
    name: "Español",
    title: "Amplía tu mundo con la educación",
    intro:
      "Elige destino y prepara programas, solicitudes, financiación y llegada con fuentes oficiales.",
    search: "Buscar país o guía",
    all: "Todos",
    country: "País / destino",
    topic: "Tema",
    read: "Leer guía",
    back: "Todas las guías",
    checked: "Fuentes consultadas",
    sources: "Fuentes oficiales",
    sourcesNote:
      "Los requisitos pueden cambiar. Antes de solicitar o pagar, consulta la convocatoria vigente y pide confirmación escrita a la institución.",
    checklist: "Prepara tu plan de acción",
    note: "Información general de planificación, sin garantía de admisión, beca o visado. Confirma plazos, tasas y elegibilidad personal con la autoridad competente.",
    related: "Sigue preparando este destino",
    communities: "Comunidades de WhatsApp y Telegram",
    communityNote:
      "Los enlaces aparecen en las páginas universitarias o redes estudiantiles citadas. CliniGA no administra estos grupos. Las invitaciones pueden caducar; no verificamos miembros ni actividad. Revisa la visibilidad del teléfono y las normas. No compartas documentos, contraseñas ni pagos.",
    source: "Fuente que publica el enlace",
    directory: "Encontrar una comunidad ESN local",
    contact: "Contacto",
    portal: "Explorar el mundo",
    services: "Servicios",
    privacy: "Privacidad",
    cta: "Aclaremos tu siguiente paso",
    ctaBody:
      "Comparte destino, nivel de estudios y fecha de inicio para hablar del apoyo que encaja con tu plan.",
    message: "Hola, me gustaría consultar el apoyo para esta guía de estudios:",
    noResults: "No hay guías para estos filtros.",
    clear: "Borrar filtros",
    older: "Más artículos académicos",
    editorial: "Equipo editorial de CliniGA Education",
    contents: "En esta guía",
    destination: "Destino educativo",
    titles: {
      study: "{country}: cómo elegir universidad y programa",
      admission: "{country}: solicitud universitaria y reconocimiento de títulos",
      funding: "{country}: becas y financiación de estudios",
      arrival: "{country}: alojamiento, llegada y comunidades estudiantiles",
    },
    intros: {
      study:
        "Elegir destino exige más que un nombre universitario. Titulación, idioma, campus, reconocimiento y objetivo profesional deben encajar. Utiliza las particularidades del país para comparar programas reales en sus páginas oficiales, sin depender únicamente de los rankings.",
      admission:
        "Admisión, reconocimiento académico y permiso de estancia son trámites diferentes. Varias instituciones pueden solicitar un documento con finalidades distintas. Empieza por identificar la vía aplicable a tu nacionalidad, residencia y titulación previa.",
      funding:
        "Comprueba primero los requisitos de acceso y después los importes. Una beca puede cubrir matrícula, manutención o solo una movilidad concreta. La admisión no incluye financiación automática y las convocatorias nacionales pueden seguir calendarios distintos a las ayudas universitarias.",
      arrival:
        "Tras la admisión, trata la mudanza como un proyecto separado. Contrato de vivienda, registro local, cobertura sanitaria y transporte pueden seguir otros plazos. Combina las fuentes institucionales indicadas con la experiencia práctica de las comunidades estudiantiles.",
    },
    steps: {
      study: [
        "Compara tres programas reales: título, idioma y campus en el catálogo oficial.",
        "Guarda el plan docente, evaluación y requisitos de prácticas del departamento.",
        "Consulta al organismo competente el reconocimiento para tu profesión objetivo.",
        "Separa matrícula, manutención y preparación lingüística; no decidas por un solo ranking.",
      ],
      admission: [
        "Confirma por escrito la vía para tu nacionalidad, residencia y título.",
        "Contrasta expedientes, traducciones y reconocimiento con la lista oficial antes de pagar servicios.",
        "Lleva plazos separados para programa, becas, vivienda e inmigración.",
        "Conserva justificantes de envío y pago; utiliza el sistema seguro publicado por la institución.",
      ],
      funding: [
        "Comprueba nacionalidad, residencia, nivel y disciplina para cada convocatoria.",
        "Compara gastos cubiertos, duración y obligaciones, además del importe anunciado.",
        "Averigua si la beca requiere otra solicitud o una nominación.",
        "No cuentes una beca sin confirmar como ingreso; reserva fondos para viaje, fianza y primeros meses.",
      ],
      arrival: [
        "Empieza por residencias oficiales y servicios estudiantiles; consulta lista de espera y contrato.",
        "Verifica arrendador y vivienda antes de pagar; exige condiciones de fianza y devolución por escrito.",
        "Confirma estancia, registro, seguro y matrícula según tu situación.",
        "Usa los grupos para experiencias; confirma decisiones académicas y legales con el organismo responsable.",
      ],
    },
  },
  it: {
    name: "Italiano",
    title: "Allarga i tuoi orizzonti con lo studio",
    intro: "Scegli la destinazione. Pianifica corsi, domande, borse e arrivo con fonti ufficiali.",
    search: "Cerca paese o guida",
    all: "Tutti",
    country: "Paese / destinazione",
    topic: "Argomento",
    read: "Leggi la guida",
    back: "Tutte le guide",
    checked: "Fonti consultate",
    sources: "Fonti ufficiali",
    sourcesNote:
      "I requisiti cambiano. Prima di presentare domanda o pagare, consulta il bando attuale e chiedi conferma scritta all'istituzione.",
    checklist: "Costruisci il tuo piano",
    note: "Informazioni generali di pianificazione, senza garanzie di ammissione, borsa o visto. Verifica scadenze, costi e idoneità personale con l'ente competente.",
    related: "Continua a preparare questa destinazione",
    communities: "Comunità WhatsApp e Telegram",
    communityNote:
      "I link sono pubblicati dalle università o reti studentesche citate. CliniGA non gestisce i gruppi. Gli inviti possono scadere; membri e attività non sono verificati. Controlla visibilità del numero e regole. Non condividere documenti, password o pagamenti.",
    source: "Fonte del collegamento",
    directory: "Trova una comunità ESN locale",
    contact: "Contatti",
    portal: "Esplora il mondo",
    services: "Servizi",
    privacy: "Privacy",
    cta: "Definiamo il prossimo passo",
    ctaBody:
      "Condividi destinazione, livello di studi e periodo di inizio per discutere l'assistenza adatta al tuo progetto.",
    message: "Salve, vorrei informazioni sull'assistenza per questa guida di studio:",
    noResults: "Nessuna guida corrisponde ai filtri.",
    clear: "Azzera i filtri",
    older: "Altri articoli accademici",
    editorial: "Redazione CliniGA Education",
    contents: "In questa guida",
    destination: "Destinazione di studio",
    titles: {
      study: "{country}: scegliere università e corso di studi",
      admission: "{country}: domanda universitaria e riconoscimento dei titoli",
      funding: "{country}: borse e finanziamento degli studi",
      arrival: "{country}: alloggio, arrivo e comunità studentesche",
    },
    intros: {
      study:
        "Il nome di un'università non basta per scegliere. Titolo, lingua, campus, riconoscimento e obiettivo professionale devono essere coerenti. Le particolarità locali qui sotto aiutano a confrontare corsi reali nelle pagine ufficiali, oltre alle classifiche promozionali.",
      admission:
        "Ammissione, riconoscimento accademico e permesso di soggiorno sono procedure distinte. Enti diversi possono richiedere lo stesso documento per finalità differenti. Identifica prima il percorso applicabile alla tua cittadinanza, residenza e qualifica precedente.",
      funding:
        "Verifica l'idoneità prima degli importi. Una borsa può coprire tasse, mantenimento o soltanto un periodo di mobilità. L'ammissione non include automaticamente un finanziamento e i bandi nazionali possono avere scadenze diverse dagli aiuti d'ateneo.",
      arrival:
        "Dopo l'ammissione, pianifica il trasferimento come un progetto separato. Contratto d'alloggio, registrazione locale, copertura sanitaria e trasporti seguono percorsi diversi dalla candidatura. Integra le risorse istituzionali indicate con le esperienze pratiche delle comunità studentesche.",
    },
    steps: {
      study: [
        "Confronta tre corsi reali: titolo, lingua e campus nel catalogo ufficiale.",
        "Salva piano didattico, modalità d'esame e requisiti di tirocinio del dipartimento.",
        "Chiedi all'autorità competente il riconoscimento per la professione desiderata.",
        "Confronta separatamente tasse, vita quotidiana e preparazione linguistica; non affidarti a una sola classifica.",
      ],
      admission: [
        "Conferma per iscritto il percorso per cittadinanza, residenza e titolo posseduto.",
        "Confronta certificati, traduzioni e riconoscimento con la lista ufficiale prima di acquistare servizi.",
        "Separa le scadenze di corso, borsa, alloggio e soggiorno.",
        "Conserva ricevute di invio e pagamento; usa il sistema sicuro pubblicato dall'istituzione.",
      ],
      funding: [
        "Verifica cittadinanza, residenza, livello e disciplina per ogni bando.",
        "Confronta spese coperte, durata e obblighi, non solo l'importo annunciato.",
        "Accerta se servono domanda separata o nomina dell'istituzione.",
        "Non contare una borsa non confermata come reddito; prevedi viaggio, deposito e primi mesi.",
      ],
      arrival: [
        "Parti da residenze ufficiali e servizi studenti; chiedi lista d'attesa e condizioni contrattuali.",
        "Verifica proprietario e immobile prima di pagare; ottieni deposito e rimborso per iscritto.",
        "Conferma soggiorno, registrazione, assicurazione e immatricolazione secondo il tuo status.",
        "Usa i gruppi per esperienze condivise; conferma decisioni accademiche e legali con l'ente competente.",
      ],
    },
  },
  hi: {
    name: "हिन्दी",
    title: "पढ़ाई से अपनी दुनिया बढ़ाएँ",
    intro:
      "अपना गंतव्य चुनें। आधिकारिक स्रोतों से पाठ्यक्रम, आवेदन, छात्रवृत्ति और आगमन की योजना बनाएँ।",
    search: "देश या मार्गदर्शिका खोजें",
    all: "सभी",
    country: "देश / अध्ययन गंतव्य",
    topic: "विषय",
    read: "मार्गदर्शिका पढ़ें",
    back: "सभी मार्गदर्शिकाएँ",
    checked: "स्रोत जाँच की तारीख",
    sources: "आधिकारिक स्रोत",
    sourcesNote:
      "नियम बदल सकते हैं। आवेदन या भुगतान से पहले स्रोत पर वर्तमान सूचना देखें और संबंधित संस्थान से लिखित पुष्टि लें।",
    checklist: "अपनी कार्ययोजना बनाएँ",
    note: "यह सामान्य योजना संबंधी जानकारी है। प्रवेश, छात्रवृत्ति या वीज़ा की गारंटी नहीं है। अपनी स्थिति के लिए समयसीमा, शुल्क और पात्रता संबंधित प्राधिकरण से जाँचें।",
    related: "इस गंतव्य की आगे की योजना",
    communities: "WhatsApp और Telegram समुदाय",
    communityNote:
      "ये लिंक नीचे दिए विश्वविद्यालयों या छात्र नेटवर्क ने प्रकाशित किए हैं। CliniGA इन समूहों का संचालन नहीं करता। आमंत्रण समाप्त हो सकते हैं; सदस्यता और सक्रियता सत्यापित नहीं हैं। फ़ोन नंबर की दृश्यता और नियम देखें। पहचान पत्र, पासवर्ड या भुगतान साझा न करें।",
    source: "लिंक प्रकाशित करने वाला स्रोत",
    directory: "स्थानीय ESN समुदाय खोजें",
    contact: "संपर्क",
    portal: "दुनिया खोजें",
    services: "सेवाएँ",
    privacy: "गोपनीयता",
    cta: "अपना अगला कदम स्पष्ट करें",
    ctaBody:
      "गंतव्य, अध्ययन स्तर और इच्छित सत्र साझा करके अपने लिए उपयुक्त सहायता के दायरे पर बात करें।",
    message: "नमस्ते, मैं इस अध्ययन मार्गदर्शिका के लिए सहायता पर बात करना चाहता/चाहती हूँ:",
    noResults: "इन फ़िल्टरों से कोई मार्गदर्शिका नहीं मिली।",
    clear: "फ़िल्टर हटाएँ",
    older: "अन्य शैक्षणिक लेख",
    editorial: "CliniGA Education संपादकीय टीम",
    contents: "इस मार्गदर्शिका में",
    destination: "अध्ययन गंतव्य",
    titles: {
      study: "{country}: विश्वविद्यालय और पाठ्यक्रम कैसे चुनें",
      admission: "{country}: विश्वविद्यालय आवेदन और डिग्री की मान्यता",
      funding: "{country}: छात्रवृत्ति और पढ़ाई का खर्च",
      arrival: "{country}: आवास, आगमन और छात्र समुदाय",
    },
    intros: {
      study:
        "अध्ययन का स्थान केवल विश्वविद्यालय के नाम से नहीं चुनना चाहिए। डिग्री, शिक्षण भाषा, परिसर, मान्यता और करियर लक्ष्य में तालमेल ज़रूरी है। नीचे दी गई देश की विशेष जानकारी से वास्तविक आधिकारिक पाठ्यक्रमों की सूची बनाएँ, केवल रैंकिंग पर निर्भर न रहें।",
      admission:
        "प्रवेश आवेदन, शैक्षणिक मान्यता और रहने की अनुमति अलग प्रक्रियाएँ हैं। अलग संस्थान एक ही दस्तावेज़ अलग कारणों से माँग सकते हैं। पहले अपनी नागरिकता, निवास और पिछली योग्यता के अनुसार सही आवेदन मार्ग पहचानें।",
      funding:
        "छात्रवृत्ति की राशि देखने से पहले पात्रता जाँचें। सहायता में फीस, जीवनयापन या केवल किसी विशेष विनिमय अवधि का खर्च शामिल हो सकता है। प्रवेश के साथ धन सहायता अपने आप नहीं मिलती और राष्ट्रीय तथा विश्वविद्यालय योजनाओं की समयसीमा अलग हो सकती है।",
      arrival:
        "प्रवेश के बाद स्थानांतरण की योजना अलग बनाएँ। आवास अनुबंध, स्थानीय पंजीकरण, स्वास्थ्य बीमा और परिवहन की प्रक्रिया विश्वविद्यालय आवेदन से अलग हो सकती है। नीचे के संस्थागत स्रोतों के साथ छात्र समुदायों के व्यावहारिक अनुभव का उपयोग करें।",
    },
    steps: {
      study: [
        "तीन वास्तविक पाठ्यक्रम चुनकर आधिकारिक सूची में डिग्री, भाषा और परिसर की तुलना करें।",
        "विभाग का पाठ्यक्रम, मूल्यांकन पद्धति और इंटर्नशिप की शर्तें सुरक्षित रखें।",
        "लक्षित पेशे के लिए डिग्री की मान्यता संबंधित प्राधिकरण से पूछें।",
        "फीस, जीवनयापन और भाषा तैयारी अलग तुलना करें; केवल एक रैंकिंग से निर्णय न लें।",
      ],
      admission: [
        "नागरिकता, निवास और योग्यता के लिए सही आवेदन मार्ग लिखित रूप में जाँचें।",
        "सेवाओं पर खर्च से पहले अंकपत्र, अनुवाद और मान्यता को आधिकारिक सूची से मिलाएँ।",
        "पाठ्यक्रम, छात्रवृत्ति, आवास और आव्रजन की समयसीमा अलग रखें।",
        "आवेदन और भुगतान की रसीद रखें; संस्थान की प्रकाशित सुरक्षित प्रणाली ही प्रयोग करें।",
      ],
      funding: [
        "हर योजना की नागरिकता, निवास, डिग्री और विषय संबंधी शर्तें जाँचें।",
        "केवल राशि के बजाय शामिल खर्च, अवधि और दायित्व की तुलना करें।",
        "पता करें कि अलग आवेदन या संस्थान का नामांकन आवश्यक है या नहीं।",
        "अपुष्ट छात्रवृत्ति को आय न मानें; यात्रा, जमा राशि और शुरुआती महीनों की व्यवस्था रखें।",
      ],
      arrival: [
        "आधिकारिक छात्रावास और छात्र सेवा से शुरू करें; प्रतीक्षा सूची और अनुबंध पूछें।",
        "भुगतान से पहले मकान और मकान मालिक जाँचें; जमा तथा वापसी की शर्तें लिखित लें।",
        "अपनी स्थिति के अनुसार निवास, पंजीकरण, बीमा और दाखिले के चरण सत्यापित करें।",
        "समूहों से अनुभव लें; शैक्षणिक और कानूनी निर्णय संबंधित प्राधिकरण से पुष्ट करें।",
      ],
    },
  },
  ar: {
    name: "العربية",
    title: "وسّع آفاقك بالتعليم",
    intro: "اختر وجهتك وخطط للبرامج والتقديم والمنح والاستقرار بالرجوع إلى المصادر الرسمية.",
    search: "ابحث عن دولة أو دليل",
    all: "الكل",
    country: "الدولة / الوجهة",
    topic: "الموضوع",
    read: "اقرأ الدليل",
    back: "جميع الأدلة",
    checked: "تاريخ مراجعة المصادر",
    sources: "المصادر الرسمية",
    sourcesNote:
      "قد تتغير الشروط. قبل التقديم أو الدفع، راجع الإعلان الحالي في المصدر واطلب تأكيداً مكتوباً من المؤسسة المعنية.",
    checklist: "أنشئ خطة عملك",
    note: "معلومات عامة للتخطيط دون ضمان قبول أو منحة أو تأشيرة. تحقق من المواعيد والرسوم وأهليتك الشخصية لدى الجهة المختصة.",
    related: "تابع التخطيط لهذه الوجهة",
    communities: "مجتمعات WhatsApp وTelegram",
    communityNote:
      "نشرت الجامعات أو الشبكات الطلابية المذكورة هذه الروابط. لا تدير CliniGA هذه المجموعات. قد تنتهي الدعوات؛ لم نتحقق من العضوية أو النشاط. راجع ظهور رقم هاتفك والقواعد. لا تشارك وثائق الهوية أو كلمات المرور أو المدفوعات.",
    source: "مصدر نشر الرابط",
    directory: "اعثر على مجتمع ESN المحلي",
    contact: "تواصل معنا",
    portal: "استكشف العالم",
    services: "الخدمات",
    privacy: "الخصوصية",
    cta: "لنحدد خطوتك التالية",
    ctaBody: "شارك وجهتك ومستوى الدراسة والفصل المستهدف لمناقشة نطاق الدعم المناسب لخُطتك.",
    message: "مرحباً، أود مناقشة الدعم المتاح لهذا الدليل الدراسي:",
    noResults: "لا توجد أدلة تطابق هذه الخيارات.",
    clear: "مسح الخيارات",
    older: "مقالات أكاديمية أخرى",
    editorial: "فريق تحرير CliniGA Education",
    contents: "في هذا الدليل",
    destination: "وجهة دراسية",
    titles: {
      study: "{country}: اختيار الجامعة والبرنامج الدراسي",
      admission: "{country}: التقديم الجامعي والاعتراف بالمؤهلات",
      funding: "{country}: المنح وتمويل الدراسة",
      arrival: "{country}: السكن والوصول والمجتمعات الطلابية",
    },
    intros: {
      study:
        "اختيار وجهة الدراسة لا يعتمد على اسم الجامعة وحده. يجب أن تتناسب الدرجة ولغة التدريس والحرم والاعتراف مع هدفك المهني. استخدم الفروق الخاصة بالدولة أدناه لبناء قائمة من برامج حقيقية عبر صفحاتها الرسمية، دون الاكتفاء بالتصنيفات.",
      admission:
        "طلب القبول والاعتراف الأكاديمي وإذن الإقامة إجراءات منفصلة. قد تطلب جهات مختلفة الوثيقة نفسها لأغراض مختلفة. ابدأ بتحديد مسار التقديم المناسب لجنسيتك وإقامتك ومؤهلك السابق.",
      funding:
        "تحقق من الأهلية قبل مقارنة قيمة المنح. فقد تغطي المنحة الرسوم أو المعيشة أو فترة تنقل محددة فقط. القبول لا يعني تمويلاً تلقائياً، وقد تختلف مواعيد الدعوات الوطنية عن دعم الجامعات.",
      arrival:
        "خطط للانتقال بعد القبول كمشروع مستقل. عقد السكن والتسجيل المحلي والتغطية الصحية والنقل لها إجراءات ومواعيد قد تختلف عن التقديم الجامعي. اجمع بين الموارد المؤسسية أدناه وتجارب المجتمعات الطلابية العملية.",
    },
    steps: {
      study: [
        "قارن ثلاثة برامج حقيقية من حيث الدرجة واللغة والحرم في الكتالوج الرسمي.",
        "احتفظ بالخطة الدراسية وطريقة التقييم وشروط التدريب من صفحة القسم.",
        "اسأل الجهة المختصة عن الاعتراف اللازم لمهنتك المستهدفة.",
        "قارن الرسوم والمعيشة والتحضير اللغوي منفصلة؛ لا تعتمد على تصنيف واحد.",
      ],
      admission: [
        "أكد كتابياً مسار التقديم المناسب للجنسية والإقامة ونوع المؤهل.",
        "طابق السجلات والترجمة والاعتراف مع القائمة الرسمية قبل دفع تكاليف الخدمات.",
        "افصل مواعيد البرنامج والمنحة والسكن والهجرة في جدولك.",
        "احتفظ بإثبات التقديم والدفع واستخدم النظام الآمن المنشور للمؤسسة فقط.",
      ],
      funding: [
        "راجع شروط الجنسية والإقامة والدرجة والتخصص في كل إعلان.",
        "قارن المصروفات المغطاة والمدة والالتزامات بدلاً من المبلغ المعلن وحده.",
        "اعرف هل تحتاج المنحة طلباً منفصلاً أو ترشيحاً من مؤسسة.",
        "لا تعتبر المنحة غير المؤكدة دخلاً؛ خصص احتياطاً للسفر والتأمين والأشهر الأولى.",
      ],
      arrival: [
        "ابدأ بالسكن الرسمي وخدمات الطلبة واسأل عن قائمة الانتظار وشروط العقد.",
        "تحقق من العقار والمالك قبل الدفع واحصل على شروط التأمين والاسترداد كتابياً.",
        "أكد إجراءات الإقامة والتسجيل والتأمين والقيد حسب وضعك الشخصي.",
        "استفد من تجارب المجموعات وأكد القرارات الأكاديمية والقانونية لدى الجهة المسؤولة.",
      ],
    },
  },
  ru: {
    name: "Русский",
    title: "Откройте мир через образование",
    intro:
      "Выберите направление и спланируйте программу, поступление, финансирование и переезд по официальным источникам.",
    search: "Найти страну или руководство",
    all: "Все",
    country: "Страна / направление",
    topic: "Тема",
    read: "Читать руководство",
    back: "Все руководства",
    checked: "Источники проверены",
    sources: "Официальные источники",
    sourcesNote:
      "Требования меняются. Перед подачей или оплатой проверьте актуальное объявление и получите письменное подтверждение учреждения.",
    checklist: "Составьте план действий",
    note: "Общая информация для планирования без гарантии поступления, стипендии или визы. Сроки, сборы и личное соответствие требованиям уточняйте у компетентного органа.",
    related: "Продолжить планирование",
    communities: "Сообщества WhatsApp и Telegram",
    communityNote:
      "Ссылки опубликованы указанными вузами или студенческими сетями. CliniGA не управляет группами. Приглашения могут истечь; состав и активность не проверены. Изучите видимость номера и правила. Не передавайте документы, пароли и платежи.",
    source: "Источник публикации",
    directory: "Найти местное сообщество ESN",
    contact: "Контакты",
    portal: "Исследовать мир",
    services: "Услуги",
    privacy: "Конфиденциальность",
    cta: "Определим следующий шаг",
    ctaBody:
      "Сообщите страну, уровень образования и желаемый набор, чтобы обсудить подходящий объём сопровождения.",
    message: "Здравствуйте, хочу обсудить сопровождение по этому руководству:",
    noResults: "По этим фильтрам руководства не найдены.",
    clear: "Сбросить фильтры",
    older: "Другие академические статьи",
    editorial: "Редакция CliniGA Education",
    contents: "В этом руководстве",
    destination: "Учебное направление",
    titles: {
      study: "{country}: выбор университета и программы",
      admission: "{country}: поступление и признание квалификаций",
      funding: "{country}: стипендии и финансирование учёбы",
      arrival: "{country}: жильё, переезд и студенческие сообщества",
    },
    intros: {
      study:
        "Для выбора направления недостаточно известного названия вуза. Степень, язык обучения, кампус, признание и карьерная цель должны сочетаться. Особенности страны ниже помогут составить список реальных программ по официальным страницам, а не только рейтингам.",
      admission:
        "Поступление, академическое признание и разрешение на пребывание — отдельные процедуры. Разные органы могут запрашивать один документ для разных целей. Сначала определите путь подачи для своего гражданства, места жительства и предыдущей квалификации.",
      funding:
        "Сначала проверьте условия участия, затем размер поддержки. Стипендия может покрывать обучение, проживание или только конкретный период обмена. Зачисление не означает автоматического финансирования, а национальные конкурсы и помощь вузов могут иметь разные сроки.",
      arrival:
        "После поступления планируйте переезд как отдельный проект. Договор аренды, местная регистрация, медицинское покрытие и транспорт имеют иные процедуры и сроки, чем заявка в вуз. Дополняйте официальные местные ресурсы опытом студенческих сообществ.",
    },
    steps: {
      study: [
        "Сравните три реальные программы: степень, язык и кампус по официальному каталогу.",
        "Сохраните учебный план, формы оценки и требования к практике со страницы факультета.",
        "Уточните признание для выбранной профессии у компетентного органа.",
        "Сопоставляйте обучение, жизнь и языковую подготовку отдельно; не полагайтесь на один рейтинг.",
      ],
      admission: [
        "Письменно подтвердите процедуру для своего гражданства, проживания и типа диплома.",
        "Сверьте выписки, переводы и признание с официальным перечнем до покупки услуг.",
        "Ведите отдельные сроки программы, стипендии, жилья и миграционных процедур.",
        "Храните подтверждения подачи и платежей; используйте опубликованную защищённую систему учреждения.",
      ],
      funding: [
        "Проверяйте гражданство, проживание, уровень и специальность в каждом конкурсе.",
        "Сравнивайте покрываемые расходы, длительность и обязательства, а не только сумму.",
        "Уточните необходимость отдельной заявки или номинации учреждения.",
        "Не учитывайте неподтверждённую стипендию как доход; отложите на дорогу, залог и первые месяцы.",
      ],
      arrival: [
        "Начните с официальных общежитий и студенческих служб; уточните очередь и условия договора.",
        "Проверьте владельца и жильё до оплаты; получите условия залога и возврата письменно.",
        "Подтвердите процедуры пребывания, регистрации, страхования и зачисления для своего статуса.",
        "Используйте группы для обмена опытом; академические и правовые решения подтверждайте у ответственного органа.",
      ],
    },
  },
  zh: {
    name: "中文",
    title: "以教育拓展世界",
    intro: "选择目的地，通过官方来源规划课程、申请、奖学金与抵达后的生活。",
    search: "搜索国家或指南",
    all: "全部",
    country: "国家／留学目的地",
    topic: "主题",
    read: "阅读指南",
    back: "全部指南",
    checked: "来源核查日期",
    sources: "官方来源",
    sourcesNote:
      "申请条件可能变化。申请或付款前，请阅读链接中的最新通知，并向相关院校取得书面确认。",
    checklist: "制定你的行动计划",
    note: "本文提供一般规划信息，不保证录取、奖学金或签证结果。请根据个人情况向主管机构核实最新期限、费用和资格。",
    related: "继续规划这个目的地",
    communities: "WhatsApp 与 Telegram 学生社群",
    communityNote:
      "以下链接由所列大学或学生网络公开发布，CliniGA 不运营这些群组。邀请可能失效，成员与活跃度未核实。加入前查看电话号码可见性和群规，不要分享身份证件、密码或付款。",
    source: "链接发布来源",
    directory: "寻找当地 ESN 社群",
    contact: "联系我们",
    portal: "探索世界",
    services: "服务",
    privacy: "隐私政策",
    cta: "明确你的下一步",
    ctaBody: "告诉我们目标国家、学习阶段和计划入学时间，一起讨论适合你的支持范围。",
    message: "你好，我想咨询这篇留学指南相关的服务：",
    noResults: "没有符合筛选条件的指南。",
    clear: "清除筛选",
    older: "更多学术文章",
    editorial: "CliniGA Education 编辑团队",
    contents: "本指南内容",
    destination: "留学目的地",
    titles: {
      study: "{country}：如何选择大学与课程",
      admission: "{country}：大学申请与学历认可",
      funding: "{country}：奖学金与留学资金规划",
      arrival: "{country}：住宿、抵达安排与学生社群",
    },
    intros: {
      study:
        "选择留学目的地不能只看大学名称。学位类型、授课语言、校区、学历认可和职业目标需要相互匹配。请利用下方当地特点，在官方课程页面中筛选真实项目，而不是仅凭排名作决定。",
      admission:
        "录取申请、学术学历认可和居留许可属于不同程序。不同机构可能为了不同目的要求同一份材料。首先根据你的国籍、居住情况和既有学历，确认适用的申请渠道。",
      funding:
        "比较奖学金金额前，先核实申请资格。资助可能只覆盖学费、生活费或某一交流阶段。获得录取不代表自动获得资助，国家项目与学校资助也可能采用不同的时间安排。",
      arrival:
        "获得录取后，应将搬迁作为独立项目规划。租房合同、当地登记、医疗保障和交通安排的流程与时间可能不同于大学申请。请结合下方机构资源与学生社群的实际经验作准备。",
    },
    steps: {
      study: [
        "选择三个真实课程，在官方目录比较学位、授课语言和校区。",
        "保存院系公布的课程表、考核方式与实习条件。",
        "向主管机构核实目标职业所需的学历认可。",
        "分别比较学费、生活费和语言准备成本，不要只依赖一份排名。",
      ],
      admission: [
        "按国籍、居住情况与学历类型，取得正确申请流程的书面确认。",
        "购买材料服务前，将成绩单、翻译及认可要求与官方清单逐项核对。",
        "分别记录课程、奖学金、住宿与移民手续的截止日期。",
        "保存提交及付款凭证，只使用院校公开的安全系统。",
      ],
      funding: [
        "逐项检查每个项目的国籍、居住、学位和专业限制。",
        "比较覆盖费用、资助期限与义务，而不仅是宣传金额。",
        "确认是否需要单独申请，或由所在机构提名。",
        "不要把未确认的奖学金计入收入，预留旅费、押金和最初几个月开支。",
      ],
      arrival: [
        "先联系官方宿舍和学生服务，了解候补名单及合同条款。",
        "付款前核实房东与房屋，取得押金及退款条件的书面说明。",
        "根据个人身份核实居留、当地登记、保险与入学手续。",
        "用社群交流经验，学术与法律决定仍须向负责机构确认。",
      ],
    },
  },
};
