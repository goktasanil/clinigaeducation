import type { LanguageCode } from "@/i18n";

export const STUDENT_RESOURCES = [
  { id: "univenter", name: "Univenter", url: "https://www.univenter.me/" },
  {
    id: "leonardo",
    name: "Scuola Leonardo da Vinci Firenze",
    url: "https://www.scuolaleonardo.com/learn-italian-in-florence.html",
  },
  { id: "magoosh", name: "Magoosh", url: "https://magoosh.com/" },
  { id: "spotahome", name: "Spotahome", url: "https://www.spotahome.com/" },
] as const;

export type StudentResourceId = (typeof STUDENT_RESOURCES)[number]["id"];

type StudentResourceCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  teaserTitle: string;
  teaserDescription: string;
  browse: string;
  official: string;
  disclosure: string;
  education: string;
  housing: string;
  consult: string;
  cards: Record<StudentResourceId, { category: string; description: string; check: string }>;
};

export const STUDENT_RESOURCE_COPY: Record<LanguageCode, StudentResourceCopy> = {
  pt: {
    eyebrow: "Recursos para estudantes",
    title: "Recursos de estudos no estrangeiro, línguas, exames e alojamento",
    intro:
      "Explore recursos para apoiar os seus planos da pesquisa de cursos à chegada. A CliniGA Education pode ajudar a avaliar opções de acordo com objetivos, orçamento e calendário.",
    teaserTitle: "Planeie os estudos de línguas, exames e alojamento",
    teaserDescription:
      "Explore recursos independentes de pesquisa universitária, italiano em Florença, preparação TOEFL/GRE/GMAT/SAT e alojamento no estrangeiro.",
    browse: "Explorar todos os recursos para estudantes",
    official: "Visitar o site oficial",
    disclosure:
      "Estão a ser consideradas possíveis colaborações com estas instituições e plataformas; não foi concluída qualquer parceria oficial, representação autorizada ou acordo de referenciação ativo. As ligações são recursos informativos independentes.",
    education: "Explore a sua estratégia de candidatura",
    housing: "Planeie a chegada no portal do estudante",
    consult: "Converse sobre o seu plano numa consulta inicial",
    cards: {
      univenter: {
        category: "Pesquisa de universidades e cursos",
        description:
          "A Univenter é uma plataforma de candidaturas que reúne universidades e cursos para agências de educação. Compare a pesquisa com as páginas oficiais de admissão.",
        check:
          "Confirme a elegibilidade, a língua de ensino, os custos e os prazos com cada instituição. A CliniGA ainda não disponibiliza candidaturas pela plataforma.",
      },
      leonardo: {
        category: "Italiano em Florença e preparação universitária",
        description:
          "Explore cursos de italiano, estudos em grupo, preparação universitária e italiano online na Scuola Leonardo da Vinci Firenze.",
        check:
          "Para objetivos de universidade, academia, conservatório ou politécnico, confirme diretamente com a escola o nível de língua, os conteúdos e o calendário atuais.",
      },
      magoosh: {
        category: "Preparação TOEFL, GRE, GMAT e SAT",
        description:
          "A Magoosh oferece aulas e exercícios online para TOEFL, GRE, GMAT e SAT. Identifique o exame aceite pelo curso e alinhe a preparação com o calendário de candidatura.",
        check:
          "Consulte os conteúdos e condições de acesso atuais na plataforma. Os recursos de preparação não garantem uma pontuação nem admissão.",
      },
      spotahome: {
        category: "Alojamento de estudantes no estrangeiro",
        description:
          "Pesquise quartos, estúdios e apartamentos na Spotahome. Considere o percurso até ao campus, o orçamento total e a duração da estadia.",
        check:
          "Antes de reservar, confirme disponibilidade, cauções, taxas, despesas, contrato e condições de cancelamento. A CliniGA não disponibiliza atualmente reservas nem referenciações pela plataforma.",
      },
    },
  },

  tr: {
    eyebrow: "Öğrenci kaynakları",
    title: "Yurt dışı eğitim, dil, sınav ve konaklama kaynakları",
    intro:
      "Program araştırmasından yerleşmeye kadar planınızı tamamlayacak kaynakları inceleyin. CliniGA Education ile hedef, bütçe ve takviminize uygun seçenekleri değerlendirebilirsiniz.",
    teaserTitle: "Dil, sınav ve konaklama planınızı tamamlayın",
    teaserDescription:
      "Üniversite araştırması, Floransa'da İtalyanca, TOEFL/GRE/GMAT/SAT hazırlığı ve yurt dışında öğrenci konaklaması için bağımsız kaynakları keşfedin.",
    browse: "Tüm öğrenci kaynaklarını incele",
    official: "Resmî sitesini incele",
    disclosure:
      "Bu kurum ve platformlarla olası iş birlikleri değerlendirme aşamasındadır; resmî ortaklık, yetkili temsilcilik veya aktif yönlendirme anlaşması henüz kesinleşmemiştir. Bağlantılar bağımsız bilgi kaynağı olarak sunulur.",
    education: "Eğitim başvuru stratejisini incele",
    housing: "Öğrenci portalında yerleşim planla",
    consult: "Ön görüşmede planını değerlendir",
    cards: {
      univenter: {
        category: "Üniversite ve program araştırması",
        description:
          "Univenter, eğitim danışmanlıkları için üniversite ve program seçeneklerini bir araya getiren bir başvuru platformudur. Ülke ve program araştırmanızı kurumların resmî kabul sayfalarıyla karşılaştırın.",
        check:
          "Program uygunluğunu, eğitim dilini, ücretleri ve son tarihleri ilgili kurumdan doğrulayın; CliniGA üzerinden platform başvurusu henüz sunulmamaktadır.",
      },
      leonardo: {
        category: "Floransa'da İtalyanca ve üniversiteye hazırlık",
        description:
          "Scuola Leonardo da Vinci Firenze'nin İtalyanca dil kurslarını, grup eğitimlerini, üniversiteye hazırlık ve çevrim içi İtalyanca seçeneklerini inceleyebilirsiniz.",
        check:
          "Hedefiniz üniversite, akademi, konservatuvar veya politeknik ise gereken dil düzeyini, hazırlık kapsamını ve güncel kurs takvimini doğrudan okuldan teyit edin.",
      },
      magoosh: {
        category: "TOEFL, GRE, GMAT ve SAT hazırlığı",
        description:
          "Magoosh, TOEFL, GRE, GMAT ve SAT için çevrim içi dersler ve alıştırmalar sunar. Hedef programın kabul ettiği sınavı belirleyerek hazırlık planınızı başvuru takviminize bağlayın.",
        check:
          "Güncel içerik ve erişim koşullarını platformdan kontrol edin. Hazırlık kaynağı kullanımı belirli bir puan veya kabul sonucu garanti etmez.",
      },
      spotahome: {
        category: "Yurt dışında öğrenci konaklaması",
        description:
          "Spotahome üzerinden odaları, stüdyoları ve kiralık daireleri araştırabilirsiniz. Öğrenci konaklamasını kampüse ulaşım, toplam bütçe ve kalış süresiyle birlikte değerlendirin.",
        check:
          "Rezervasyondan önce ilanın güncelliğini, depozito ve hizmet ücretlerini, faturaları, sözleşmeyi ve iptal koşullarını kontrol edin; CliniGA üzerinden aktif rezervasyon veya yönlendirme hizmeti sunulmamaktadır.",
      },
    },
  },
  en: {
    eyebrow: "Student resources",
    title: "Study abroad, language, test preparation and housing resources",
    intro:
      "Explore resources to support your plans from program research to arrival. CliniGA Education can help you assess options against your goals, budget and application timeline.",
    teaserTitle: "Plan your language study, tests and student housing",
    teaserDescription:
      "Explore independent resources for university research, Italian in Florence, TOEFL/GRE/GMAT/SAT preparation and accommodation abroad.",
    browse: "Explore all student resources",
    official: "Visit the official website",
    disclosure:
      "Potential collaborations with these institutions and platforms are under consideration; no official partnership, authorised representation or active referral agreement has been finalised. Links are provided as independent information resources.",
    education: "Explore your application strategy",
    housing: "Plan your arrival in the student portal",
    consult: "Discuss your plan in an introductory consultation",
    cards: {
      univenter: {
        category: "University and program research",
        description:
          "Univenter is an application platform that brings together university and program options for education agencies. Compare your research with institutions' official admissions pages.",
        check:
          "Confirm eligibility, teaching language, fees and deadlines with each institution. Applications through the platform are not yet offered by CliniGA.",
      },
      leonardo: {
        category: "Italian in Florence and university preparation",
        description:
          "Explore Italian language courses, group study, university preparation and online Italian options at Scuola Leonardo da Vinci Firenze.",
        check:
          "For a university, academy, conservatory or polytechnic goal, confirm the required language level, preparation content and current course schedule directly with the school.",
      },
      magoosh: {
        category: "TOEFL, GRE, GMAT and SAT preparation",
        description:
          "Magoosh offers online lessons and practice for TOEFL, GRE, GMAT and SAT. Identify the test accepted by your target program and align preparation with your application timeline.",
        check:
          "Check current content and access terms on the platform. Using preparation resources does not guarantee a particular score or admission.",
      },
      spotahome: {
        category: "Student accommodation abroad",
        description:
          "Research rooms, studios and rental apartments on Spotahome. Consider student housing alongside your campus commute, total budget and length of stay.",
        check:
          "Before booking, check listing availability, deposits, service fees, utilities, the contract and cancellation terms. CliniGA does not currently provide bookings or referrals through the platform.",
      },
    },
  },
  de: {
    eyebrow: "Ressourcen für Studierende",
    title: "Ressourcen für Auslandsstudium, Sprachen, Tests und Unterkunft",
    intro:
      "Entdecken Sie Ressourcen von der Studiengangsuche bis zur Ankunft. CliniGA Education hilft Ihnen, Optionen anhand Ihrer Ziele, Ihres Budgets und Ihres Zeitplans einzuordnen.",
    teaserTitle: "Sprachkurse, Tests und Unterkunft planen",
    teaserDescription:
      "Unabhängige Ressourcen zur Hochschulsuche, für Italienisch in Florenz, die TOEFL/GRE/GMAT/SAT-Vorbereitung und Unterkünfte im Ausland.",
    browse: "Alle Ressourcen ansehen",
    official: "Offizielle Website besuchen",
    disclosure:
      "Mögliche Kooperationen mit diesen Einrichtungen und Plattformen werden geprüft; eine offizielle Partnerschaft, bevollmächtigte Vertretung oder aktive Vermittlungsvereinbarung ist noch nicht abgeschlossen. Die Links dienen als unabhängige Informationsquellen.",
    education: "Bewerbungsstrategie entdecken",
    housing: "Ankunft im Studierendenportal planen",
    consult: "Plan im Erstgespräch besprechen",
    cards: {
      univenter: {
        category: "Hochschulen und Studiengänge recherchieren",
        description:
          "Univenter bündelt Hochschul- und Studiengangsangebote in einer Bewerbungsplattform für Bildungsagenturen. Vergleichen Sie Ihre Recherche mit den offiziellen Zulassungsseiten der Hochschulen.",
        check:
          "Prüfen Sie Voraussetzungen, Unterrichtssprache, Gebühren und Fristen bei der jeweiligen Hochschule. CliniGA bietet noch keine Bewerbungen über die Plattform an.",
      },
      leonardo: {
        category: "Italienisch in Florenz und Studienvorbereitung",
        description:
          "Informieren Sie sich über Italienischkurse, Gruppenunterricht, Studienvorbereitung und Online-Italienisch bei der Scuola Leonardo da Vinci Firenze.",
        check:
          "Klären Sie Sprachniveau, Vorbereitungskurs und Termine direkt mit der Schule, insbesondere für Universität, Akademie, Konservatorium oder Polytechnikum.",
      },
      magoosh: {
        category: "Vorbereitung auf TOEFL, GRE, GMAT und SAT",
        description:
          "Magoosh bietet Online-Lektionen und Übungen für TOEFL, GRE, GMAT und SAT. Ermitteln Sie den anerkannten Test Ihres Zielstudiengangs und stimmen Sie die Vorbereitung auf Ihre Fristen ab.",
        check:
          "Prüfen Sie aktuelle Inhalte und Zugangsbedingungen. Lernmaterialien garantieren weder eine bestimmte Punktzahl noch eine Zulassung.",
      },
      spotahome: {
        category: "Unterkunft für Studierende im Ausland",
        description:
          "Recherchieren Sie Zimmer, Studios und Mietwohnungen bei Spotahome. Berücksichtigen Sie den Weg zum Campus, das Gesamtbudget und Ihre Aufenthaltsdauer.",
        check:
          "Prüfen Sie Verfügbarkeit, Kaution, Servicegebühren, Nebenkosten, Vertrag und Stornierung vor der Buchung. CliniGA bietet derzeit keine Buchung oder Vermittlung über die Plattform an.",
      },
    },
  },
  fr: {
    eyebrow: "Ressources étudiantes",
    title: "Études à l'étranger, langues, examens et logement",
    intro:
      "Découvrez des ressources pour préparer votre parcours, du choix de formation à l'arrivée. CliniGA Education vous aide à évaluer les options selon vos objectifs, votre budget et votre calendrier.",
    teaserTitle: "Préparez vos langues, examens et votre logement",
    teaserDescription:
      "Des ressources indépendantes pour rechercher une université, apprendre l'italien à Florence, préparer le TOEFL/GRE/GMAT/SAT et trouver un logement à l'étranger.",
    browse: "Voir toutes les ressources étudiantes",
    official: "Consulter le site officiel",
    disclosure:
      "Des collaborations avec ces établissements et plateformes sont à l'étude ; aucun partenariat officiel, mandat de représentation ou accord de recommandation actif n'est finalisé. Les liens sont proposés comme sources d'information indépendantes.",
    education: "Découvrir la stratégie de candidature",
    housing: "Préparer son arrivée sur le portail étudiant",
    consult: "Discuter de son projet lors d'un premier entretien",
    cards: {
      univenter: {
        category: "Recherche d'universités et de formations",
        description:
          "Univenter est une plateforme de candidature qui rassemble des universités et formations pour les agences d'éducation. Comparez vos recherches aux pages officielles d'admission des établissements.",
        check:
          "Confirmez les critères, la langue d'enseignement, les frais et les dates limites auprès de chaque établissement. CliniGA ne propose pas encore de candidatures via cette plateforme.",
      },
      leonardo: {
        category: "Italien à Florence et préparation universitaire",
        description:
          "Explorez les cours d'italien, les cours en groupe, la préparation universitaire et les options d'italien en ligne de Scuola Leonardo da Vinci Firenze.",
        check:
          "Pour une université, une académie, un conservatoire ou une école polytechnique, confirmez directement auprès de l'école le niveau requis, le contenu et les dates des cours.",
      },
      magoosh: {
        category: "Préparation TOEFL, GRE, GMAT et SAT",
        description:
          "Magoosh propose des leçons et exercices en ligne pour le TOEFL, GRE, GMAT et SAT. Identifiez l'examen accepté par votre formation et adaptez votre préparation au calendrier de candidature.",
        check:
          "Vérifiez les contenus et conditions d'accès actuels. Les ressources de préparation ne garantissent ni score déterminé ni admission.",
      },
      spotahome: {
        category: "Logement étudiant à l'étranger",
        description:
          "Recherchez des chambres, studios et appartements à louer sur Spotahome. Évaluez le logement selon le trajet vers le campus, le budget total et la durée du séjour.",
        check:
          "Vérifiez la disponibilité, la caution, les frais de service, les charges, le contrat et l'annulation avant de réserver. CliniGA ne propose actuellement ni réservation ni recommandation via cette plateforme.",
      },
    },
  },
  it: {
    eyebrow: "Risorse per studenti",
    title: "Risorse per studio all'estero, lingue, test e alloggio",
    intro:
      "Scopri risorse per pianificare il percorso dalla ricerca dei corsi all'arrivo. CliniGA Education ti aiuta a valutare le opzioni in base a obiettivi, budget e scadenze.",
    teaserTitle: "Pianifica lingua, test e alloggio per studenti",
    teaserDescription:
      "Risorse indipendenti per la ricerca universitaria, l'italiano a Firenze, la preparazione TOEFL/GRE/GMAT/SAT e gli alloggi all'estero.",
    browse: "Esplora tutte le risorse per studenti",
    official: "Visita il sito ufficiale",
    disclosure:
      "Sono in valutazione possibili collaborazioni con questi enti e piattaforme; non è stato finalizzato alcun partenariato ufficiale, mandato di rappresentanza o accordo attivo di segnalazione. I link sono fonti informative indipendenti.",
    education: "Scopri la strategia di candidatura",
    housing: "Pianifica l'arrivo nel portale studenti",
    consult: "Valuta il tuo piano in un primo colloquio",
    cards: {
      univenter: {
        category: "Ricerca di università e corsi",
        description:
          "Univenter è una piattaforma di candidatura che riunisce università e corsi per le agenzie educative. Confronta la ricerca con le pagine ufficiali di ammissione degli atenei.",
        check:
          "Verifica requisiti, lingua di insegnamento, costi e scadenze con ogni istituto. CliniGA non offre ancora candidature tramite la piattaforma.",
      },
      leonardo: {
        category: "Italiano a Firenze e preparazione universitaria",
        description:
          "Esplora corsi di italiano, lezioni di gruppo, preparazione universitaria e opzioni di italiano online presso la Scuola Leonardo da Vinci Firenze.",
        check:
          "Per università, accademie, conservatori o politecnici, verifica direttamente con la scuola il livello linguistico richiesto, i contenuti e il calendario dei corsi.",
      },
      magoosh: {
        category: "Preparazione TOEFL, GRE, GMAT e SAT",
        description:
          "Magoosh offre lezioni ed esercizi online per TOEFL, GRE, GMAT e SAT. Individua il test accettato dal corso scelto e coordina la preparazione con le scadenze della candidatura.",
        check:
          "Controlla contenuti e condizioni di accesso aggiornati. Le risorse di preparazione non garantiscono un punteggio specifico o l'ammissione.",
      },
      spotahome: {
        category: "Alloggio per studenti all'estero",
        description:
          "Cerca stanze, monolocali e appartamenti in affitto su Spotahome. Valuta l'alloggio in base al tragitto verso il campus, al budget totale e alla durata del soggiorno.",
        check:
          "Prima di prenotare verifica disponibilità, deposito, commissioni di servizio, utenze, contratto e cancellazione. CliniGA non offre attualmente prenotazioni o segnalazioni tramite la piattaforma.",
      },
    },
  },
  es: {
    eyebrow: "Recursos para estudiantes",
    title: "Recursos de estudios en el extranjero, idiomas, exámenes y alojamiento",
    intro:
      "Explora recursos desde la búsqueda de programas hasta tu llegada. CliniGA Education te ayuda a valorar las opciones según tus objetivos, presupuesto y calendario de solicitud.",
    teaserTitle: "Planifica tus idiomas, exámenes y alojamiento",
    teaserDescription:
      "Recursos independientes para buscar universidades, estudiar italiano en Florencia, preparar TOEFL/GRE/GMAT/SAT y encontrar alojamiento en el extranjero.",
    browse: "Explorar todos los recursos",
    official: "Visitar el sitio oficial",
    disclosure:
      "Se están valorando posibles colaboraciones con estas instituciones y plataformas; no se ha formalizado ninguna colaboración oficial, representación autorizada ni acuerdo activo de derivación. Los enlaces son fuentes de información independientes.",
    education: "Explorar la estrategia de solicitud",
    housing: "Planificar la llegada en el portal estudiantil",
    consult: "Comentar tu plan en una consulta inicial",
    cards: {
      univenter: {
        category: "Búsqueda de universidades y programas",
        description:
          "Univenter es una plataforma de solicitudes que reúne universidades y programas para agencias educativas. Compara tu investigación con las páginas oficiales de admisión de cada institución.",
        check:
          "Confirma requisitos, idioma, tasas y plazos con cada institución. CliniGA todavía no ofrece solicitudes a través de la plataforma.",
      },
      leonardo: {
        category: "Italiano en Florencia y preparación universitaria",
        description:
          "Explora los cursos de italiano, clases en grupo, preparación universitaria y opciones de italiano en línea de Scuola Leonardo da Vinci Firenze.",
        check:
          "Para universidades, academias, conservatorios o politécnicos, confirma directamente con la escuela el nivel lingüístico, los contenidos y el calendario de los cursos.",
      },
      magoosh: {
        category: "Preparación TOEFL, GRE, GMAT y SAT",
        description:
          "Magoosh ofrece lecciones y ejercicios en línea para TOEFL, GRE, GMAT y SAT. Identifica el examen aceptado por tu programa y ajusta la preparación al calendario de solicitud.",
        check:
          "Consulta los contenidos y condiciones de acceso actuales. Los recursos de preparación no garantizan una puntuación determinada ni la admisión.",
      },
      spotahome: {
        category: "Alojamiento para estudiantes en el extranjero",
        description:
          "Busca habitaciones, estudios y pisos de alquiler en Spotahome. Valora el alojamiento según el trayecto al campus, el presupuesto total y la duración de la estancia.",
        check:
          "Antes de reservar, revisa disponibilidad, fianza, gastos de servicio, suministros, contrato y cancelación. CliniGA no ofrece actualmente reservas ni derivaciones a través de la plataforma.",
      },
    },
  },
  ar: {
    eyebrow: "موارد الطلاب",
    title: "موارد الدراسة بالخارج واللغة والاختبارات والسكن",
    intro:
      "استكشف موارد تساعدك من البحث عن البرامج حتى الوصول. تساعدك CliniGA Education على تقييم الخيارات وفق أهدافك وميزانيتك ومواعيد التقديم.",
    teaserTitle: "خطط لدراسة اللغة والاختبارات والسكن الطلابي",
    teaserDescription:
      "موارد مستقلة للبحث عن الجامعات، وتعلم الإيطالية في فلورنسا، والتحضير لاختبارات TOEFL وGRE وGMAT وSAT، والسكن بالخارج.",
    browse: "استكشف جميع موارد الطلاب",
    official: "زيارة الموقع الرسمي",
    disclosure:
      "تخضع فرص التعاون مع هذه المؤسسات والمنصات للتقييم؛ ولم تُبرم بعد شراكة رسمية أو وكالة تمثيل معتمدة أو اتفاقية إحالة نشطة. تُقدم الروابط بوصفها مصادر معلومات مستقلة.",
    education: "استكشف استراتيجية التقديم",
    housing: "خطط للوصول عبر بوابة الطلاب",
    consult: "ناقش خطتك في استشارة أولية",
    cards: {
      univenter: {
        category: "البحث عن الجامعات والبرامج",
        description:
          "Univenter منصة تقديم تجمع خيارات الجامعات والبرامج لوكالات الاستشارات التعليمية. قارن نتائج بحثك بصفحات القبول الرسمية للمؤسسات.",
        check:
          "تحقق من شروط القبول ولغة التدريس والرسوم والمواعيد لدى المؤسسة المعنية. لا تقدم CliniGA حاليًا خدمة التقديم عبر المنصة.",
      },
      leonardo: {
        category: "الإيطالية في فلورنسا والتحضير الجامعي",
        description:
          "استكشف دورات الإيطالية والدروس الجماعية والتحضير الجامعي وخيارات تعلم الإيطالية عبر الإنترنت لدى Scuola Leonardo da Vinci Firenze.",
        check:
          "إذا كنت تستهدف جامعة أو أكاديمية أو معهدًا موسيقيًا أو جامعة تقنية، فتحقق مباشرةً مع المدرسة من مستوى اللغة المطلوب والمحتوى ومواعيد الدورات.",
      },
      magoosh: {
        category: "التحضير لاختبارات TOEFL وGRE وGMAT وSAT",
        description:
          "تقدم Magoosh دروسًا وتمارين عبر الإنترنت لاختبارات TOEFL وGRE وGMAT وSAT. حدد الاختبار المقبول لدى برنامجك المستهدف واربط التحضير بمواعيد التقديم.",
        check:
          "راجع المحتوى الحالي وشروط الوصول على المنصة. استخدام موارد التحضير لا يضمن درجة محددة أو قبولًا جامعيًا.",
      },
      spotahome: {
        category: "سكن الطلاب في الخارج",
        description:
          "ابحث عن الغرف والاستوديوهات والشقق للإيجار عبر Spotahome. قيّم السكن وفق التنقل إلى الحرم الجامعي والميزانية الإجمالية ومدة الإقامة.",
        check:
          "قبل الحجز، راجع التوفر والتأمين ورسوم الخدمة والفواتير والعقد وشروط الإلغاء. لا تقدم CliniGA حاليًا خدمات حجز أو إحالة عبر المنصة.",
      },
    },
  },
  ru: {
    eyebrow: "Ресурсы для студентов",
    title: "Ресурсы для учёбы за рубежом, языков, экзаменов и жилья",
    intro:
      "Изучите ресурсы для планирования пути от поиска программы до переезда. CliniGA Education помогает оценить варианты с учётом ваших целей, бюджета и сроков подачи.",
    teaserTitle: "Планируйте языковые курсы, экзамены и жильё",
    teaserDescription:
      "Независимые ресурсы для поиска университетов, изучения итальянского во Флоренции, подготовки к TOEFL/GRE/GMAT/SAT и поиска жилья за рубежом.",
    browse: "Посмотреть все ресурсы",
    official: "Открыть официальный сайт",
    disclosure:
      "Возможности сотрудничества с этими учреждениями и платформами рассматриваются; официальное партнёрство, уполномоченное представительство или действующее реферальное соглашение ещё не оформлены. Ссылки приведены как независимые источники информации.",
    education: "Изучить стратегию поступления",
    housing: "Спланировать переезд на студенческом портале",
    consult: "Обсудить план на первой консультации",
    cards: {
      univenter: {
        category: "Поиск университетов и программ",
        description:
          "Univenter — платформа подачи заявлений, объединяющая университеты и программы для образовательных агентств. Сопоставляйте результаты поиска с официальными страницами приёма учебных заведений.",
        check:
          "Уточняйте требования, язык обучения, стоимость и сроки в выбранном учреждении. CliniGA пока не предлагает подачу заявлений через платформу.",
      },
      leonardo: {
        category: "Итальянский во Флоренции и подготовка к вузу",
        description:
          "Изучите курсы итальянского, групповые занятия, подготовку к университету и онлайн-обучение итальянскому в Scuola Leonardo da Vinci Firenze.",
        check:
          "Для поступления в университет, академию, консерваторию или политехнический вуз уточните у школы уровень языка, содержание подготовки и актуальное расписание.",
      },
      magoosh: {
        category: "Подготовка к TOEFL, GRE, GMAT и SAT",
        description:
          "Magoosh предлагает онлайн-уроки и упражнения для TOEFL, GRE, GMAT и SAT. Узнайте, какой экзамен принимает выбранная программа, и согласуйте подготовку со сроками подачи.",
        check:
          "Проверяйте актуальные материалы и условия доступа. Подготовительные ресурсы не гарантируют определённый балл или поступление.",
      },
      spotahome: {
        category: "Жильё для студентов за рубежом",
        description:
          "Ищите комнаты, студии и квартиры в аренду на Spotahome. Учитывайте дорогу до кампуса, общий бюджет и продолжительность проживания.",
        check:
          "До бронирования проверьте доступность, залог, сервисные сборы, коммунальные платежи, договор и условия отмены. CliniGA пока не предоставляет бронирование или направление клиентов через платформу.",
      },
    },
  },
  zh: {
    eyebrow: "学生资源",
    title: "留学、语言、考试备考与住宿资源",
    intro:
      "探索从专业检索到抵达目的地的实用资源。CliniGA Education 可帮助您根据目标、预算和申请时间评估不同选择。",
    teaserTitle: "规划语言学习、考试与学生住宿",
    teaserDescription:
      "了解大学检索、佛罗伦萨意大利语课程、TOEFL/GRE/GMAT/SAT 备考及海外住宿的独立资源。",
    browse: "查看全部学生资源",
    official: "访问官方网站",
    disclosure:
      "与这些机构和平台的潜在合作仍在评估中，尚未达成正式合作、授权代理或有效推荐协议。相关链接仅作为独立信息资源提供。",
    education: "了解申请规划",
    housing: "在学生门户规划抵达安排",
    consult: "通过初次咨询讨论您的计划",
    cards: {
      univenter: {
        category: "大学与专业检索",
        description:
          "Univenter 是面向教育咨询机构的申请平台，汇集大学和专业选项。请将检索结果与院校官方招生页面进行核对。",
        check:
          "向相关院校确认申请资格、授课语言、费用和截止日期。CliniGA 尚未提供通过该平台递交申请的服务。",
      },
      leonardo: {
        category: "佛罗伦萨意大利语与大学预备课程",
        description:
          "了解 Scuola Leonardo da Vinci Firenze 的意大利语课程、团体课程、大学预备课程和在线意大利语学习选项。",
        check:
          "如计划申请大学、艺术学院、音乐学院或理工院校，请直接向学校确认语言要求、预备课程内容及最新课程安排。",
      },
      magoosh: {
        category: "TOEFL、GRE、GMAT 与 SAT 备考",
        description:
          "Magoosh 提供 TOEFL、GRE、GMAT 和 SAT 的在线课程与练习。请先确认目标专业接受的考试，再根据申请时间安排备考。",
        check: "在平台查看最新内容及访问条款。使用备考资源并不保证特定成绩或录取结果。",
      },
      spotahome: {
        category: "海外学生住宿",
        description:
          "可通过 Spotahome 查询出租房间、单间公寓及整套公寓。请结合校园通勤、总预算和居住时长评估学生住宿。",
        check:
          "预订前核实房源、押金、服务费、水电等费用、合同和取消条款。CliniGA 目前未通过该平台提供预订或推荐服务。",
      },
    },
  },
};
