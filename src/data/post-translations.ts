import type { LanguageCode } from "@/i18n";
import type { Post } from "@/data/posts";

export type StaticBlogTranslation = {
  title: string;
  excerpt: string;
  body: string[];
};

type StaticBlogLanguage = Exclude<LanguageCode, "tr">;
type PostCategory = Post["category"];

export const STATIC_BLOG_TRANSLATIONS: Record<
  StaticBlogLanguage,
  Record<string, StaticBlogTranslation>
> = {
  en: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "The Questions Students Ask Most in Europe: 2026 Visual Guide",
      excerpt:
        "Official-source answers to visa, university, work, document, housing and banking questions identified from 20,701 anonymous messages across 22 student communities.",
      body: [
        "We brought together the visa, university, work, document, housing and finance questions most often asked by students planning to study in Europe.",
        "Each section highlights real student decision points, checklists verified against official sources and practical next steps.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Germany Blocked Account (Sperrkonto) Guide 2026",
      excerpt:
        "How do you open a blocked account for a German student visa? The 2026 amount, required documents and provider comparison.",
      body: [
        "For a German student visa, a blocked account is one of the main financial documents used to prove that you can cover your living expenses.",
        "Before applying, check the current required amount, provider fees, transfer time and the blocked-account confirmation document together.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Study-Abroad Master's Application Guide 2026",
      excerpt:
        "Timeline, documents and scholarship opportunities for master's applications in Germany, the United States and the United Kingdom.",
      body: [
        "Good planning directly affects the quality of an international master's application. Many programs require preparation 12–18 months in advance.",
        "The first step is choosing the target country and program. GPA, language proficiency (IELTS/TOEFL), motivation and research profile should align.",
        "The document set usually includes an SOP, academic CV, two or three reference letters, transcripts and proof of language proficiency. Each university's specific format must also be checked.",
        "Scholarship options include DAAD in Germany, Chevening in the UK, Fulbright in the US, Erasmus Mundus and university-funded GA/TA positions.",
        "Professional guidance can optimize the application calendar and reduce last-minute document gaps and weak SOP submissions.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Schengen Student Visa: Academic Application Tips",
      excerpt:
        "Document lists, financial evidence and interview preparation for student visas in Germany, the Netherlands and France.",
      body: [
        "Schengen student-visa document sets vary by country, but financial evidence, health insurance and an admission letter are common requirements.",
        "Germany generally requires a blocked account (Sperrkonto); in the Netherlands the university often handles much of the residence application; in France a Campus France pre-approval step may apply.",
        "Visa appointments can take 4–8 weeks during busy periods, so plan the application as soon as the admission letter is available.",
        "Answer interview questions clearly, briefly and consistently. Explain your study purpose and financial plan in a coherent way.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "How to Write an Effective Statement of Purpose (SOP)",
      excerpt:
        "The structure of an SOP that holds an admissions committee's attention: hook, academic background, goals and program fit.",
      body: [
        "An SOP is the story of your academic direction. Avoid generic openings and build a concrete, personal narrative tailored to the program.",
        "A strong structure includes an engaging opening, academic background, research experience, career goals and a clear explanation of program fit.",
        "Every sentence should contribute evidence or an argument. Avoid vague claims such as 'I have always loved science.'",
        "A common target is 700–1,000 words, but always follow the program's own instructions when a specific format or limit is provided.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Statistical Analysis for Theses with SPSS and R",
      excerpt:
        "Which analysis to use and when: t-test, ANOVA, regression, structural equation modeling (SEM) and reporting.",
      body: [
        "The choice of statistical analysis depends on the hypothesis and the structure of the data. Selecting the wrong test can undermine the validity of a thesis.",
        "For two-group comparisons, independent-samples t-tests or Mann–Whitney tests are common; for three or more groups, ANOVA or Kruskal–Wallis may be appropriate.",
        "Multiple regression is often used for relational models, while SEM (AMOS/SmartPLS) is used for structural models. Validity and reliability measures such as CFA and Cronbach's alpha should also be reported where relevant.",
        "APA 7 reporting should present the test statistic, degrees of freedom, p value and effect size together.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: New Opportunities and Application Strategy",
      excerpt:
        "Key points for 2026 applications for Erasmus+ study, traineeship and doctoral mobility.",
      body: [
        "Erasmus+ supports study or traineeship mobility, commonly lasting from 3 to 12 months, across participating and partner countries.",
        "The application process usually includes an initial university application, language proficiency, academic performance and a motivation assessment or interview.",
        "For doctoral mobility, finding a suitable host institution is especially important; work with your supervisor and academic network to identify a host.",
        "Grant amounts vary by destination category and may not cover all living costs, so plan an additional budget.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 Strategies to Keep Your PhD Thesis on Track",
      excerpt:
        "Evidence-informed working techniques to finish your thesis on time, from literature review to defense.",
      body: [
        "A PhD thesis is a marathon. Short daily writing sessions, including focused-work techniques such as Pomodoro or deep work, make large tasks more manageable.",
        "Set chapter-level milestones: literature review → methodology → data collection → analysis → discussion.",
        "Use a reference manager such as Zotero or Mendeley instead of collecting citations manually.",
        "Schedule regular progress meetings with your supervisor every 2–4 weeks and keep the feedback loop short.",
        "Academic writing coaching can help reduce stalled periods and improve consistency.",
      ],
    },
  },
  de: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "Die häufigsten Fragen von Studierenden in Europa: Visueller Leitfaden 2026",
      excerpt:
        "Antworten mit offiziellen Quellen zu Visa, Hochschulen, Arbeit, Dokumenten, Wohnen und Bankthemen aus 20.701 anonymen Nachrichten in 22 Studierenden-Communities.",
      body: [
        "Wir haben die häufigsten Fragen zu Visa, Hochschulen, Arbeit, Dokumenten, Wohnen und Finanzen von Studierenden zusammengestellt, die ein Studium in Europa planen.",
        "Jeder Abschnitt zeigt reale Entscheidungspunkte, anhand offizieller Quellen geprüfte Checklisten und konkrete nächste Schritte.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Sperrkonto für Deutschland: Leitfaden 2026",
      excerpt:
        "Wie eröffnet man ein Sperrkonto für ein deutsches Studentenvisum? Betrag 2026, erforderliche Unterlagen und Anbietervergleich.",
      body: [
        "Beim deutschen Studentenvisum gehört das Sperrkonto zu den wichtigsten finanziellen Nachweisen dafür, dass die Lebenshaltungskosten gedeckt werden können.",
        "Prüfen Sie vor dem Antrag gemeinsam den aktuellen Mindestbetrag, Anbietergebühren, Überweisungsdauer und die Bestätigung über die Kontoeröffnung.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Leitfaden für Masterbewerbungen im Ausland 2026",
      excerpt:
        "Zeitplan, Unterlagen und Stipendienmöglichkeiten für Masterbewerbungen in Deutschland, den USA und Großbritannien.",
      body: [
        "Eine gute Planung beeinflusst die Qualität einer Masterbewerbung im Ausland unmittelbar. Viele Programme erfordern eine Vorbereitung 12–18 Monate im Voraus.",
        "Der erste Schritt ist die Wahl von Zielland und Studiengang. Notendurchschnitt, Sprachkenntnisse (IELTS/TOEFL), Motivation und Forschungsprofil sollten zusammenpassen.",
        "Zu den Unterlagen gehören meist SOP/Motivationsschreiben, akademischer Lebenslauf, zwei bis drei Empfehlungsschreiben, Zeugnisse und Sprachnachweis. Zusätzlich müssen die Vorgaben jeder Hochschule geprüft werden.",
        "Mögliche Förderungen sind DAAD, Chevening, Fulbright, Erasmus Mundus sowie hochschulfinanzierte GA-/TA-Stellen.",
        "Professionelle Beratung kann den Bewerbungszeitplan optimieren und kurzfristige Dokumentenlücken sowie schwache SOPs vermeiden.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Schengen-Studentenvisum: Tipps für akademische Anträge",
      excerpt:
        "Unterlagen, Finanzierungsnachweise und Interviewvorbereitung für Studentenvisa in Deutschland, den Niederlanden und Frankreich.",
      body: [
        "Die Unterlagen für Studentenvisa unterscheiden sich je nach Land; gemeinsame Kernelemente sind Finanzierungsnachweis, Krankenversicherung und Zulassungsbescheid.",
        "Für Deutschland ist in vielen Fällen ein Sperrkonto erforderlich; in den Niederlanden übernimmt die Hochschule häufig einen großen Teil des Aufenthaltsverfahrens; in Frankreich kann eine Vorprüfung über Campus France erforderlich sein.",
        "In stark ausgelasteten Zeiten können Visumtermine 4–8 Wochen dauern. Planen Sie den Antrag daher unmittelbar nach Erhalt der Zulassung.",
        "Beantworten Sie Interviewfragen klar, kurz und konsistent und erläutern Sie Studienziel sowie Finanzierungsplan nachvollziehbar.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "Wie schreibt man ein überzeugendes Statement of Purpose (SOP)?",
      excerpt:
        "Aufbau eines überzeugenden SOP: Einstieg, akademischer Hintergrund, Ziele und Passung zum Studiengang.",
      body: [
        "Das SOP erzählt Ihre akademische Entwicklung. Vermeiden Sie austauschbare Einstiege und entwickeln Sie eine konkrete, persönliche und programmspezifische Argumentation.",
        "Eine starke Struktur umfasst einen guten Einstieg, akademischen Hintergrund, Forschungserfahrung, Karriereziele und eine klare Begründung der Programmpassung.",
        "Jeder Satz sollte einen Beleg oder ein Argument beitragen. Vermeiden Sie allgemeine Aussagen wie 'Ich habe Wissenschaft schon immer geliebt.'",
        "Als Richtwert gelten häufig 700–1.000 Wörter; verbindlich sind jedoch immer die Format- und Längenvorgaben des jeweiligen Programms.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Statistische Analyse für Abschlussarbeiten mit SPSS und R",
      excerpt:
        "Welche Analyse wann eingesetzt wird: t-Test, ANOVA, Regression, Strukturgleichungsmodell (SEM) und Berichterstattung.",
      body: [
        "Die Wahl der statistischen Analyse hängt von Hypothese und Datenstruktur ab. Ein ungeeigneter Test kann die Aussagekraft einer Abschlussarbeit beeinträchtigen.",
        "Für Vergleiche zwischen zwei Gruppen kommen häufig t-Tests für unabhängige Stichproben oder Mann–Whitney-Tests infrage; bei drei oder mehr Gruppen ANOVA oder Kruskal–Wallis.",
        "Für Zusammenhangsmodelle wird oft multiple Regression eingesetzt, für Strukturmodelle SEM (AMOS/SmartPLS). Relevante Validitäts- und Reliabilitätsmaße wie CFA und Cronbachs Alpha sollten berichtet werden.",
        "Nach APA 7 werden Teststatistik, Freiheitsgrade, p-Wert und Effektgröße gemeinsam angegeben.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: Neue Chancen und Bewerbungsstrategie",
      excerpt:
        "Wichtige Punkte für Bewerbungen 2026 für Erasmus+-Studium, Praktikum und Promotionsmobilität.",
      body: [
        "Erasmus+ unterstützt Studien- und Praktikumsaufenthalte, häufig mit einer Dauer von 3 bis 12 Monaten, in teilnehmenden und Partnerländern.",
        "Der Bewerbungsprozess umfasst meist eine Bewerbung an der Hochschule, Sprachnachweis, akademische Leistung und eine Motivationsbewertung oder ein Gespräch.",
        "Bei Promotionsmobilität ist die Suche nach einer geeigneten Gastinstitution besonders wichtig; nutzen Sie die Zusammenarbeit mit Betreuung und akademischem Netzwerk.",
        "Die Förderhöhe unterscheidet sich nach Länderkategorie und deckt nicht immer alle Lebenshaltungskosten. Planen Sie daher zusätzliches Budget ein.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 Strategien, um bei der Dissertation im Zeitplan zu bleiben",
      excerpt:
        "Evidenzorientierte Arbeitstechniken vom Literaturreview bis zur Verteidigung, damit die Dissertation planmäßig fertig wird.",
      body: [
        "Eine Dissertation ist ein Marathon. Kurze tägliche Schreibphasen und fokussierte Methoden wie Pomodoro oder Deep Work machen große Aufgaben beherrschbarer.",
        "Definieren Sie Meilensteine auf Kapitelebene: Literaturreview → Methodik → Datenerhebung → Analyse → Diskussion.",
        "Nutzen Sie Literaturverwaltungsprogramme wie Zotero oder Mendeley statt Quellen manuell zu sammeln.",
        "Planen Sie alle 2–4 Wochen regelmäßige Fortschrittsgespräche mit der Betreuung und halten Sie die Feedbackschleife kurz.",
        "Akademisches Schreibcoaching kann Blockaden reduzieren und die Arbeitskontinuität verbessern.",
      ],
    },
  },
  fr: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "Les questions les plus fréquentes des étudiants en Europe : guide visuel 2026",
      excerpt:
        "Réponses fondées sur des sources officielles aux questions de visa, université, travail, documents, logement et banque issues de 20 701 messages anonymes dans 22 communautés étudiantes.",
      body: [
        "Nous avons réuni les questions les plus fréquentes sur les visas, les universités, le travail, les documents, le logement et les finances posées par les étudiants qui préparent des études en Europe.",
        "Chaque section présente de vrais points de décision, des listes de contrôle vérifiées à partir de sources officielles et des prochaines étapes concrètes.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Compte bloqué en Allemagne (Sperrkonto) : guide 2026",
      excerpt:
        "Comment ouvrir un compte bloqué pour un visa étudiant allemand ? Montant 2026, documents requis et comparaison des prestataires.",
      body: [
        "Pour un visa étudiant allemand, le compte bloqué fait partie des principaux justificatifs financiers permettant de démontrer que vous pouvez couvrir vos frais de vie.",
        "Avant la demande, vérifiez ensemble le montant requis à jour, les frais du prestataire, le délai de transfert et l'attestation d'ouverture du compte.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Guide 2026 des candidatures en master à l'étranger",
      excerpt:
        "Calendrier, documents et possibilités de bourses pour les candidatures en master en Allemagne, aux États-Unis et au Royaume-Uni.",
      body: [
        "Une bonne planification influence directement la qualité d'une candidature en master à l'étranger. De nombreux programmes nécessitent une préparation 12 à 18 mois à l'avance.",
        "La première étape consiste à choisir le pays et le programme cibles. Moyenne académique, niveau de langue (IELTS/TOEFL), motivation et profil de recherche doivent être cohérents.",
        "Le dossier comprend généralement un SOP ou une lettre de motivation, un CV académique, deux ou trois lettres de recommandation, les relevés de notes et une preuve de niveau linguistique. Il faut aussi vérifier le format propre à chaque université.",
        "Parmi les possibilités de financement figurent le DAAD, Chevening, Fulbright, Erasmus Mundus et les postes GA/TA financés par les universités.",
        "Un accompagnement professionnel peut optimiser le calendrier et réduire les documents manquants de dernière minute ainsi que les SOP insuffisamment travaillés.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Visa étudiant Schengen : conseils pour la demande académique",
      excerpt:
        "Listes de documents, preuves financières et préparation à l'entretien pour les visas étudiants en Allemagne, aux Pays-Bas et en France.",
      body: [
        "Les dossiers de visa étudiant varient selon le pays, mais la preuve de ressources, l'assurance maladie et la lettre d'admission sont des exigences fréquentes.",
        "L'Allemagne demande généralement un compte bloqué (Sperrkonto) ; aux Pays-Bas, l'université gère souvent une grande partie de la procédure de séjour ; en France, une étape préalable via Campus France peut s'appliquer.",
        "En période chargée, un rendez-vous de visa peut prendre 4 à 8 semaines. Préparez donc la demande dès réception de la lettre d'admission.",
        "Répondez aux questions d'entretien de façon claire, concise et cohérente, en expliquant votre projet d'études et votre plan financier.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "Comment rédiger un Statement of Purpose (SOP) convaincant ?",
      excerpt:
        "Structure d'un SOP efficace : accroche, parcours académique, objectifs et adéquation avec le programme.",
      body: [
        "Le SOP raconte votre trajectoire académique. Évitez les introductions génériques et construisez un récit concret, personnel et adapté au programme.",
        "Une structure solide comprend une bonne accroche, le parcours académique, l'expérience de recherche, les objectifs professionnels et une justification claire de l'adéquation avec le programme.",
        "Chaque phrase doit apporter une preuve ou un argument. Évitez les affirmations vagues comme « j'ai toujours aimé la science ».",
        "Une longueur de 700 à 1 000 mots est fréquente, mais les consignes précises du programme restent prioritaires.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Analyse statistique des mémoires et thèses avec SPSS et R",
      excerpt:
        "Quel test utiliser et quand : test t, ANOVA, régression, modèle d'équations structurelles (SEM) et rédaction des résultats.",
      body: [
        "Le choix de l'analyse statistique dépend de l'hypothèse et de la structure des données. Un test inadapté peut fragiliser la validité du travail de recherche.",
        "Pour comparer deux groupes, on utilise souvent le test t pour échantillons indépendants ou Mann–Whitney ; pour trois groupes ou plus, ANOVA ou Kruskal–Wallis peuvent convenir.",
        "La régression multiple est fréquente pour les modèles relationnels, tandis que le SEM (AMOS/SmartPLS) sert aux modèles structurels. Les indicateurs pertinents de validité et de fiabilité, comme la CFA et l'alpha de Cronbach, doivent aussi être rapportés.",
        "Selon APA 7, présentez ensemble la statistique de test, les degrés de liberté, la valeur p et la taille d'effet.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026 : nouvelles opportunités et stratégie de candidature",
      excerpt:
        "Points essentiels pour les candidatures 2026 aux mobilités d'études, de stage et de doctorat Erasmus+.",
      body: [
        "Erasmus+ soutient les mobilités d'études ou de stage, souvent de 3 à 12 mois, dans les pays participants et partenaires.",
        "La candidature comprend généralement une présélection universitaire, une preuve de langue, les résultats académiques et une évaluation de la motivation ou un entretien.",
        "Pour la mobilité doctorale, trouver un établissement d'accueil adapté est particulièrement important ; mobilisez votre directeur de recherche et votre réseau académique.",
        "Le montant de la bourse varie selon la catégorie du pays et peut ne pas couvrir tous les frais de vie ; prévoyez donc un budget complémentaire.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 stratégies pour garder sa thèse de doctorat sur les rails",
      excerpt:
        "Techniques de travail fondées sur les bonnes pratiques, de la revue de littérature à la soutenance, pour terminer dans les délais.",
      body: [
        "Une thèse de doctorat est un marathon. De courtes séances quotidiennes et des méthodes de concentration comme Pomodoro ou le deep work rendent les grands blocs plus faciles à gérer.",
        "Fixez des jalons par chapitre : revue de littérature → méthodologie → collecte des données → analyse → discussion.",
        "Utilisez un gestionnaire bibliographique comme Zotero ou Mendeley plutôt que de collecter les références manuellement.",
        "Planifiez un point d'avancement régulier avec votre directeur ou directrice toutes les 2 à 4 semaines et gardez une boucle de retour courte.",
        "Un accompagnement en écriture académique peut réduire les périodes de blocage et améliorer la régularité.",
      ],
    },
  },
  it: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "Le domande più frequenti degli studenti in Europa: guida visuale 2026",
      excerpt:
        "Risposte basate su fonti ufficiali a domande su visti, università, lavoro, documenti, alloggio e banca ricavate da 20.701 messaggi anonimi in 22 comunità studentesche.",
      body: [
        "Abbiamo raccolto le domande più frequenti su visti, università, lavoro, documenti, alloggio e finanze poste dagli studenti che pianificano di studiare in Europa.",
        "Ogni sezione presenta reali punti decisionali, checklist verificate su fonti ufficiali e passi successivi concretamente applicabili.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Conto bloccato in Germania (Sperrkonto): guida 2026",
      excerpt:
        "Come si apre un conto bloccato per il visto studentesco tedesco? Importo 2026, documenti richiesti e confronto tra fornitori.",
      body: [
        "Per il visto studentesco tedesco, il conto bloccato è uno dei principali documenti finanziari usati per dimostrare la capacità di sostenere le spese di vita.",
        "Prima della domanda, controlla l'importo aggiornato, le commissioni del fornitore, i tempi di trasferimento e il documento di conferma dell'apertura del conto.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Guida 2026 alla candidatura per un master all'estero",
      excerpt:
        "Tempistiche, documenti e opportunità di borsa per candidature a master in Germania, Stati Uniti e Regno Unito.",
      body: [
        "Una buona pianificazione incide direttamente sulla qualità di una candidatura a un master all'estero. Molti programmi richiedono una preparazione iniziata 12–18 mesi prima.",
        "Il primo passo è scegliere paese e programma obiettivo. Media accademica, competenza linguistica (IELTS/TOEFL), motivazione e profilo di ricerca devono essere coerenti.",
        "Il dossier comprende di solito SOP o lettera motivazionale, CV accademico, due o tre lettere di referenza, transcript e certificazione linguistica. Va inoltre verificato il formato richiesto da ogni università.",
        "Tra le opportunità di finanziamento: DAAD, Chevening, Fulbright, Erasmus Mundus e posizioni GA/TA finanziate dalle università.",
        "Una consulenza professionale può ottimizzare il calendario e ridurre documenti mancanti all'ultimo momento e SOP poco efficaci.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Visto studentesco Schengen: consigli per la candidatura accademica",
      excerpt:
        "Liste documenti, prove finanziarie e preparazione al colloquio per i visti studenteschi in Germania, Paesi Bassi e Francia.",
      body: [
        "I documenti per il visto studentesco cambiano da paese a paese, ma prova finanziaria, assicurazione sanitaria e lettera di ammissione sono requisiti comuni.",
        "La Germania richiede in genere un conto bloccato (Sperrkonto); nei Paesi Bassi l'università spesso gestisce gran parte della procedura di soggiorno; in Francia può essere necessario un passaggio preliminare con Campus France.",
        "Nei periodi di maggiore domanda gli appuntamenti per il visto possono richiedere 4–8 settimane; pianifica quindi la domanda appena ricevi la lettera di ammissione.",
        "Rispondi al colloquio in modo chiaro, breve e coerente, spiegando con precisione il progetto di studio e il piano finanziario.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "Come scrivere uno Statement of Purpose (SOP) efficace",
      excerpt:
        "La struttura di un SOP convincente: apertura, percorso accademico, obiettivi e coerenza con il programma.",
      body: [
        "Il SOP racconta la tua direzione accademica. Evita aperture generiche e costruisci una narrazione concreta, personale e specifica per il programma.",
        "Una struttura solida comprende un'apertura efficace, il background accademico, l'esperienza di ricerca, gli obiettivi di carriera e una chiara motivazione della scelta del programma.",
        "Ogni frase dovrebbe portare una prova o un argomento. Evita affermazioni vaghe come 'ho sempre amato la scienza'.",
        "Una lunghezza di 700–1.000 parole è comune, ma le istruzioni specifiche del programma hanno sempre la priorità.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Analisi statistica per tesi con SPSS e R",
      excerpt:
        "Quale analisi usare e quando: t-test, ANOVA, regressione, modelli di equazioni strutturali (SEM) e reporting.",
      body: [
        "La scelta dell'analisi statistica dipende dall'ipotesi e dalla struttura dei dati. Un test inadeguato può compromettere la validità della tesi.",
        "Per confrontare due gruppi si usano spesso t-test per campioni indipendenti o Mann–Whitney; per tre o più gruppi possono essere appropriati ANOVA o Kruskal–Wallis.",
        "La regressione multipla è comune nei modelli relazionali, mentre il SEM (AMOS/SmartPLS) è usato per modelli strutturali. Quando pertinenti, vanno riportati anche indicatori di validità e affidabilità come CFA e alfa di Cronbach.",
        "Nel reporting APA 7, statistica del test, gradi di libertà, valore p ed effect size vanno presentati insieme.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: nuove opportunità e strategia di candidatura",
      excerpt:
        "Punti chiave per le candidature 2026 a mobilità Erasmus+ per studio, tirocinio e dottorato.",
      body: [
        "Erasmus+ sostiene periodi di studio o tirocinio, spesso da 3 a 12 mesi, nei paesi partecipanti e partner.",
        "La candidatura comprende normalmente preselezione universitaria, competenza linguistica, rendimento accademico e valutazione motivazionale o colloquio.",
        "Per la mobilità di dottorato è particolarmente importante trovare un'istituzione ospitante adatta; coinvolgi il tuo supervisore e la rete accademica.",
        "Gli importi delle borse variano per categoria del paese e possono non coprire tutte le spese di vita; pianifica quindi un budget aggiuntivo.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 strategie per mantenere la tesi di dottorato nei tempi",
      excerpt:
        "Tecniche di lavoro basate su buone pratiche, dalla revisione della letteratura alla discussione finale, per concludere nei tempi previsti.",
      body: [
        "Una tesi di dottorato è una maratona. Brevi sessioni quotidiane e tecniche di concentrazione come Pomodoro o deep work rendono gestibili i blocchi più grandi.",
        "Definisci milestone per capitolo: revisione della letteratura → metodologia → raccolta dati → analisi → discussione.",
        "Usa un reference manager come Zotero o Mendeley invece di raccogliere citazioni manualmente.",
        "Programma incontri di avanzamento ogni 2–4 settimane con il supervisore e mantieni breve il ciclo di feedback.",
        "Il coaching di scrittura accademica può ridurre i periodi di blocco e migliorare la continuità.",
      ],
    },
  },
  es: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "Las preguntas más frecuentes de los estudiantes en Europa: guía visual 2026",
      excerpt:
        "Respuestas con fuentes oficiales sobre visados, universidad, trabajo, documentos, alojamiento y banca a partir de 20.701 mensajes anónimos de 22 comunidades estudiantiles.",
      body: [
        "Hemos reunido las preguntas más frecuentes sobre visados, universidades, trabajo, documentos, alojamiento y finanzas de estudiantes que planean estudiar en Europa.",
        "Cada sección muestra puntos de decisión reales, listas de verificación contrastadas con fuentes oficiales y próximos pasos prácticos.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Cuenta bloqueada en Alemania (Sperrkonto): guía 2026",
      excerpt:
        "¿Cómo abrir una cuenta bloqueada para el visado de estudiante alemán? Importe de 2026, documentos necesarios y comparación de proveedores.",
      body: [
        "Para el visado de estudiante alemán, la cuenta bloqueada es uno de los principales justificantes financieros para demostrar que puedes cubrir tus gastos de manutención.",
        "Antes de presentar la solicitud, comprueba el importe actualizado, las comisiones del proveedor, el plazo de transferencia y el certificado de apertura de la cuenta.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Guía 2026 para solicitar un máster en el extranjero",
      excerpt:
        "Calendario, documentos y oportunidades de becas para solicitudes de máster en Alemania, Estados Unidos y Reino Unido.",
      body: [
        "Una buena planificación influye directamente en la calidad de una solicitud de máster internacional. Muchos programas requieren preparación con 12–18 meses de antelación.",
        "El primer paso es elegir el país y el programa objetivo. Nota media, nivel de idioma (IELTS/TOEFL), motivación y perfil de investigación deben estar alineados.",
        "El expediente suele incluir SOP o carta de motivación, CV académico, dos o tres cartas de recomendación, expediente académico y certificado de idioma. También hay que comprobar el formato específico de cada universidad.",
        "Entre las opciones de financiación están DAAD, Chevening, Fulbright, Erasmus Mundus y puestos GA/TA financiados por universidades.",
        "La orientación profesional puede optimizar el calendario y reducir documentos de última hora y SOP poco trabajados.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Visado Schengen de estudiante: consejos para la solicitud académica",
      excerpt:
        "Listas de documentos, prueba financiera y preparación de entrevista para visados de estudiante en Alemania, Países Bajos y Francia.",
      body: [
        "Los documentos del visado de estudiante cambian según el país, pero la prueba financiera, el seguro médico y la carta de admisión son requisitos habituales.",
        "Alemania suele exigir una cuenta bloqueada (Sperrkonto); en Países Bajos la universidad gestiona a menudo gran parte del procedimiento de residencia; en Francia puede aplicarse un paso previo con Campus France.",
        "En épocas de alta demanda, las citas de visado pueden tardar 4–8 semanas, así que planifica la solicitud en cuanto recibas la carta de admisión.",
        "Responde a la entrevista de forma clara, breve y coherente y explica bien tu objetivo académico y tu plan financiero.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "Cómo escribir un Statement of Purpose (SOP) eficaz",
      excerpt:
        "La estructura de un SOP que capta la atención del comité de admisiones: apertura, trayectoria académica, objetivos y encaje con el programa.",
      body: [
        "El SOP cuenta la dirección de tu trayectoria académica. Evita comienzos genéricos y construye una narrativa concreta, personal y adaptada al programa.",
        "Una estructura sólida incluye una buena apertura, trayectoria académica, experiencia investigadora, objetivos profesionales y una explicación clara del encaje con el programa.",
        "Cada frase debe aportar una prueba o un argumento. Evita afirmaciones vagas como 'siempre me ha gustado la ciencia'.",
        "Una extensión de 700–1.000 palabras es habitual, pero las instrucciones específicas del programa siempre tienen prioridad.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Análisis estadístico para tesis con SPSS y R",
      excerpt:
        "Qué análisis usar y cuándo: prueba t, ANOVA, regresión, modelos de ecuaciones estructurales (SEM) e informe de resultados.",
      body: [
        "La elección del análisis estadístico depende de la hipótesis y de la estructura de los datos. Elegir una prueba inadecuada puede debilitar la validez de una tesis.",
        "Para comparar dos grupos se utilizan con frecuencia la prueba t de muestras independientes o Mann–Whitney; para tres o más grupos, ANOVA o Kruskal–Wallis.",
        "La regresión múltiple es habitual en modelos relacionales, mientras que SEM (AMOS/SmartPLS) se emplea en modelos estructurales. Cuando corresponda, también deben informarse medidas de validez y fiabilidad como CFA y alfa de Cronbach.",
        "Según APA 7, la estadística de prueba, los grados de libertad, el valor p y el tamaño del efecto deben presentarse juntos.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: nuevas oportunidades y estrategia de solicitud",
      excerpt:
        "Aspectos clave de las solicitudes 2026 para movilidad Erasmus+ de estudios, prácticas y doctorado.",
      body: [
        "Erasmus+ apoya movilidades de estudios o prácticas, normalmente de 3 a 12 meses, en países participantes y asociados.",
        "El proceso suele incluir solicitud previa en la universidad, acreditación lingüística, rendimiento académico y evaluación de motivación o entrevista.",
        "En movilidad doctoral es especialmente importante encontrar una institución anfitriona adecuada; trabaja con tu supervisor y red académica para localizarla.",
        "Las ayudas varían según la categoría del país y pueden no cubrir todos los gastos de vida, por lo que conviene planificar un presupuesto adicional.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 estrategias para mantener tu tesis doctoral en plazo",
      excerpt:
        "Técnicas de trabajo basadas en buenas prácticas para terminar a tiempo, desde la revisión bibliográfica hasta la defensa.",
      body: [
        "Una tesis doctoral es una maratón. Las sesiones breves de escritura diaria y técnicas de concentración como Pomodoro o deep work hacen más manejables los grandes bloques de trabajo.",
        "Define hitos por capítulo: revisión bibliográfica → metodología → recogida de datos → análisis → discusión.",
        "Utiliza un gestor bibliográfico como Zotero o Mendeley en lugar de recopilar citas manualmente.",
        "Programa reuniones de progreso con tu supervisor cada 2–4 semanas y mantén corto el ciclo de retroalimentación.",
        "El acompañamiento en escritura académica puede reducir los periodos de bloqueo y mejorar la constancia.",
      ],
    },
  },
  ar: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "أكثر الأسئلة التي يطرحها الطلاب في أوروبا: دليل مرئي 2026",
      excerpt:
        "إجابات تستند إلى مصادر رسمية عن التأشيرات والجامعات والعمل والوثائق والسكن والخدمات المصرفية، مستخلصة من 20,701 رسالة مجهولة في 22 مجتمعًا طلابيًا.",
      body: [
        "جمعنا أكثر الأسئلة شيوعًا حول التأشيرات والجامعات والعمل والوثائق والسكن والتمويل لدى الطلاب الذين يخططون للدراسة في أوروبا.",
        "يعرض كل قسم نقاط القرار الفعلية للطلاب وقوائم تحقق موثقة من مصادر رسمية وخطوات تالية قابلة للتنفيذ.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "دليل الحساب البنكي المغلق في ألمانيا (Sperrkonto) لعام 2026",
      excerpt:
        "كيف تفتح حسابًا مغلقًا لتأشيرة الطالب الألمانية؟ مبلغ 2026 والوثائق المطلوبة ومقارنة مقدمي الخدمة.",
      body: [
        "يُعد الحساب المغلق من أهم الإثباتات المالية في طلب تأشيرة الطالب الألمانية لإثبات القدرة على تغطية تكاليف المعيشة.",
        "قبل التقديم، تحقّق من المبلغ المطلوب حاليًا ورسوم مقدم الخدمة ومدة التحويل ووثيقة تأكيد فتح الحساب.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "دليل التقديم لبرامج الماجستير في الخارج 2026",
      excerpt:
        "الجدول الزمني والوثائق وفرص المنح لطلبات الماجستير في ألمانيا والولايات المتحدة والمملكة المتحدة.",
      body: [
        "يؤثر التخطيط الجيد مباشرة في جودة طلب الماجستير الدولي. تتطلب برامج كثيرة الاستعداد قبل 12–18 شهرًا.",
        "الخطوة الأولى هي اختيار البلد والبرنامج المستهدفين. يجب أن يتوافق المعدل الأكاديمي ومستوى اللغة (IELTS/TOEFL) والدافع والملف البحثي.",
        "يتضمن الملف عادةً SOP أو خطاب دافع وسيرة أكاديمية ورسالتين أو ثلاث رسائل توصية وكشف الدرجات وإثبات اللغة. كما يجب مراجعة متطلبات كل جامعة على حدة.",
        "تشمل خيارات التمويل DAAD وChevening وFulbright وErasmus Mundus ومناصب GA/TA الممولة من الجامعات.",
        "يمكن للإرشاد المهني تحسين الجدول الزمني وتقليل نقص الوثائق في اللحظات الأخيرة وضعف خطاب الغرض.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "تأشيرة شنغن للطلاب: نصائح للتقديم الأكاديمي",
      excerpt:
        "قوائم الوثائق والإثبات المالي والتحضير للمقابلة لتأشيرات الطلاب في ألمانيا وهولندا وفرنسا.",
      body: [
        "تختلف وثائق تأشيرة الطالب من بلد إلى آخر، لكن الإثبات المالي والتأمين الصحي وخطاب القبول متطلبات شائعة.",
        "تطلب ألمانيا عادةً حسابًا مغلقًا (Sperrkonto)، وفي هولندا تتولى الجامعة غالبًا جزءًا كبيرًا من إجراءات الإقامة، وفي فرنسا قد تكون هناك خطوة مسبقة عبر Campus France.",
        "قد تستغرق مواعيد التأشيرة 4–8 أسابيع في المواسم المزدحمة، لذلك خطط للتقديم فور توفر خطاب القبول.",
        "أجب عن أسئلة المقابلة بوضوح واختصار واتساق، واشرح هدفك الدراسي وخطتك المالية بصورة مترابطة.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "كيف تكتب بيان غرض (SOP) فعّالًا؟",
      excerpt:
        "بنية بيان الغرض المقنع: افتتاحية قوية، خلفية أكاديمية، أهداف، وملاءمة البرنامج.",
      body: [
        "يروي بيان الغرض اتجاه مسيرتك الأكاديمية. تجنب الافتتاحيات العامة وابنِ سردًا ملموسًا وشخصيًا ومخصصًا للبرنامج.",
        "تشمل البنية القوية افتتاحية جذابة وخلفية أكاديمية وخبرة بحثية وأهدافًا مهنية وشرحًا واضحًا لسبب ملاءمة البرنامج.",
        "ينبغي أن تقدم كل جملة دليلًا أو حجة. تجنب العبارات العامة مثل «لطالما أحببت العلم».",
        "يشيع طول 700–1,000 كلمة، لكن تعليمات البرنامج الخاصة بالطول والتنسيق لها الأولوية دائمًا.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "التحليل الإحصائي للرسائل الجامعية باستخدام SPSS وR",
      excerpt:
        "متى تستخدم كل تحليل: اختبار t وANOVA والانحدار ونمذجة المعادلات الهيكلية (SEM) وكتابة النتائج.",
      body: [
        "يعتمد اختيار التحليل الإحصائي على الفرضية وبنية البيانات. اختيار اختبار غير مناسب قد يضعف صلاحية الرسالة العلمية.",
        "لمقارنة مجموعتين يُستخدم غالبًا اختبار t للعينات المستقلة أو Mann–Whitney، ولثلاث مجموعات أو أكثر قد يكون ANOVA أو Kruskal–Wallis مناسبًا.",
        "يشيع استخدام الانحدار المتعدد للنماذج العلاقية، بينما يستخدم SEM (AMOS/SmartPLS) للنماذج الهيكلية. وعند الحاجة يجب الإبلاغ عن مؤشرات الصلاحية والثبات مثل CFA وألفا كرونباخ.",
        "وفق APA 7، تُعرض إحصائية الاختبار ودرجات الحرية وقيمة p وحجم الأثر معًا.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: فرص جديدة واستراتيجية التقديم",
      excerpt:
        "أهم النقاط في طلبات 2026 لتنقل Erasmus+ للدراسة والتدريب والدكتوراه.",
      body: [
        "يدعم Erasmus+ فترات الدراسة أو التدريب التي تمتد غالبًا من 3 إلى 12 شهرًا في الدول المشاركة والشريكة.",
        "تتضمن عملية التقديم عادةً طلبًا أوليًا في الجامعة وإثبات اللغة والأداء الأكاديمي وتقييم الدافع أو مقابلة.",
        "في تنقل الدكتوراه، يعد العثور على مؤسسة مضيفة مناسبة أمرًا مهمًا بشكل خاص؛ تعاون مع المشرف وشبكتك الأكاديمية للعثور عليها.",
        "تختلف قيمة المنحة حسب فئة الدولة وقد لا تغطي جميع تكاليف المعيشة، لذا خطط لميزانية إضافية.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 استراتيجيات للحفاظ على تقدم أطروحة الدكتوراه وفق الجدول",
      excerpt:
        "أساليب عمل مبنية على ممارسات فعالة لإنهاء الأطروحة في الوقت المحدد، من مراجعة الأدبيات حتى المناقشة.",
      body: [
        "أطروحة الدكتوراه ماراثون طويل. تجعل جلسات الكتابة اليومية القصيرة وأساليب التركيز مثل Pomodoro أو deep work المهام الكبيرة أكثر قابلية للإدارة.",
        "حدد مراحل إنجاز لكل فصل: مراجعة الأدبيات → المنهجية → جمع البيانات → التحليل → المناقشة.",
        "استخدم مدير مراجع مثل Zotero أو Mendeley بدل جمع الاستشهادات يدويًا.",
        "حدد اجتماع تقدم منتظمًا مع المشرف كل 2–4 أسابيع واجعل دورة الملاحظات قصيرة.",
        "يمكن للتوجيه في الكتابة الأكاديمية تقليل فترات التعثر وتحسين الاستمرارية.",
      ],
    },
  },
  ru: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "Самые частые вопросы студентов в Европе: наглядный гид 2026",
      excerpt:
        "Ответы с опорой на официальные источники о визах, университетах, работе, документах, жилье и банках на основе 20 701 анонимного сообщения из 22 студенческих сообществ.",
      body: [
        "Мы собрали самые частые вопросы о визах, университетах, работе, документах, жилье и финансах от студентов, планирующих учебу в Европе.",
        "В каждом разделе показаны реальные точки принятия решений, чек-листы, сверенные с официальными источниками, и практические следующие шаги.",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "Блокированный счет в Германии (Sperrkonto): гид 2026",
      excerpt:
        "Как открыть блокированный счет для студенческой визы в Германию? Сумма на 2026 год, необходимые документы и сравнение провайдеров.",
      body: [
        "Для студенческой визы в Германию блокированный счет является одним из основных финансовых доказательств способности покрывать расходы на проживание.",
        "Перед подачей заявления проверьте актуальную требуемую сумму, комиссии провайдера, срок перевода и подтверждение открытия счета.",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "Гид по поступлению в магистратуру за рубежом 2026",
      excerpt:
        "Сроки, документы и возможности финансирования для магистратуры в Германии, США и Великобритании.",
      body: [
        "Хорошее планирование напрямую влияет на качество заявки в зарубежную магистратуру. Многие программы требуют подготовки за 12–18 месяцев.",
        "Первый шаг — выбрать страну и программу. Средний балл, знание языка (IELTS/TOEFL), мотивация и исследовательский профиль должны соответствовать друг другу.",
        "Пакет обычно включает SOP или мотивационное письмо, академическое CV, две-три рекомендации, транскрипт и языковой сертификат. Также необходимо проверить требования каждого университета.",
        "Варианты финансирования включают DAAD, Chevening, Fulbright, Erasmus Mundus и финансируемые университетами позиции GA/TA.",
        "Профессиональное сопровождение помогает оптимизировать календарь и уменьшить риск недостающих документов и слабого SOP в последний момент.",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "Студенческая виза Шенген: советы по академической подаче",
      excerpt:
        "Списки документов, финансовые подтверждения и подготовка к интервью для студенческих виз в Германию, Нидерланды и Францию.",
      body: [
        "Пакет документов для студенческой визы различается по странам, но финансовое подтверждение, медицинская страховка и письмо о зачислении являются типичными требованиями.",
        "Германия обычно требует блокированный счет (Sperrkonto); в Нидерландах университет часто ведет значительную часть процедуры ВНЖ; во Франции может потребоваться предварительный этап через Campus France.",
        "В загруженные периоды ожидание визового приема может составлять 4–8 недель, поэтому начинайте планирование сразу после получения письма о зачислении.",
        "Отвечайте на интервью ясно, кратко и последовательно, четко объясняя учебную цель и финансовый план.",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "Как написать сильный Statement of Purpose (SOP)",
      excerpt:
        "Структура убедительного SOP: сильное начало, академический опыт, цели и соответствие программе.",
      body: [
        "SOP рассказывает о направлении вашей академической траектории. Избегайте шаблонных вступлений и создавайте конкретный, личный и ориентированный на программу рассказ.",
        "Сильная структура включает выразительное начало, академический опыт, исследовательскую практику, карьерные цели и ясное объяснение соответствия программе.",
        "Каждое предложение должно давать доказательство или аргумент. Избегайте общих фраз вроде «я всегда любил науку».",
        "Частый ориентир — 700–1 000 слов, но требования конкретной программы к формату и объему всегда имеют приоритет.",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "Статистический анализ для дипломных и диссертационных работ в SPSS и R",
      excerpt:
        "Какой анализ использовать и когда: t-тест, ANOVA, регрессия, моделирование структурными уравнениями (SEM) и отчетность.",
      body: [
        "Выбор статистического анализа зависит от гипотезы и структуры данных. Неподходящий тест может снизить валидность исследования.",
        "Для сравнения двух групп часто используют t-тест независимых выборок или Mann–Whitney; для трех и более групп — ANOVA или Kruskal–Wallis.",
        "Для моделей взаимосвязей часто применяют множественную регрессию, а для структурных моделей — SEM (AMOS/SmartPLS). При необходимости следует также сообщать показатели валидности и надежности, например CFA и альфу Кронбаха.",
        "В формате APA 7 статистику теста, степени свободы, значение p и размер эффекта указывают вместе.",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026: новые возможности и стратегия подачи",
      excerpt:
        "Ключевые моменты подачи в 2026 году на Erasmus+ для учебы, стажировки и докторской мобильности.",
      body: [
        "Erasmus+ поддерживает учебную и стажировочную мобильность, обычно на 3–12 месяцев, в участвующих и партнерских странах.",
        "Процесс обычно включает предварительную заявку в университете, подтверждение языка, академические результаты и оценку мотивации или интервью.",
        "Для докторантов особенно важно найти подходящую принимающую организацию; используйте помощь научного руководителя и академической сети.",
        "Размер гранта зависит от категории страны и может не покрывать все расходы на проживание, поэтому предусмотрите дополнительный бюджет.",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "6 стратегий, чтобы писать докторскую диссертацию по графику",
      excerpt:
        "Практические методы работы от обзора литературы до защиты, помогающие завершить диссертацию вовремя.",
      body: [
        "Докторская диссертация — это марафон. Короткие ежедневные сессии и методы концентрации, такие как Pomodoro или deep work, делают большие задачи управляемыми.",
        "Установите этапы по главам: обзор литературы → методология → сбор данных → анализ → обсуждение.",
        "Используйте менеджер библиографии, например Zotero или Mendeley, вместо ручного сбора ссылок.",
        "Проводите регулярные встречи с научным руководителем каждые 2–4 недели и держите цикл обратной связи коротким.",
        "Коучинг по академическому письму может уменьшить периоды застоя и улучшить регулярность работы.",
      ],
    },
  },
  zh: {
    "avrupada-ogrencilerin-en-cok-sordugu-sorular": {
      title: "欧洲学生最常问的问题：2026 图文指南",
      excerpt:
        "基于 22 个学生社群的 20,701 条匿名消息，提供有官方来源支持的签证、大学、工作、材料、住房和银行问题解答。",
      body: [
        "我们整理了计划赴欧洲学习的学生最常提出的签证、大学、工作、材料、住房和财务问题。",
        "每个部分都呈现真实的决策节点、经官方来源核对的清单以及可直接执行的下一步。",
      ],
    },
    "almanya-bloke-hesap-sperrkonto-rehberi": {
      title: "德国冻结账户（Sperrkonto）2026 指南",
      excerpt:
        "德国学生签证的冻结账户如何开设？2026 年所需金额、材料要求与服务商比较。",
      body: [
        "申请德国学生签证时，冻结账户是证明你有能力承担生活费用的主要财务材料之一。",
        "提交申请前，应同时核对最新所需金额、服务商费用、汇款时间以及冻结账户开立证明。",
      ],
    },
    "yurt-disi-yuksek-lisans-basvuru-rehberi": {
      title: "2026 海外硕士申请指南",
      excerpt:
        "德国、美国和英国硕士申请的时间表、材料与奖学金机会。",
      body: [
        "合理规划会直接影响海外硕士申请的质量。许多项目需要提前 12–18 个月开始准备。",
        "第一步是确定目标国家和项目。GPA、语言成绩（IELTS/TOEFL）、申请动机与研究背景应形成一致的申请画像。",
        "申请材料通常包括 SOP/动机信、学术简历、2–3 封推荐信、成绩单和语言证明，同时还要逐一核对每所大学的具体格式。",
        "常见资助机会包括 DAAD、Chevening、Fulbright、Erasmus Mundus，以及大学资助的 GA/TA 岗位。",
        "专业指导可以优化申请时间表，减少临近截止日期时材料缺失和 SOP 质量不足的问题。",
      ],
    },
    "schengen-vizesi-akademik-basvuru": {
      title: "申根学生签证：学业申请要点",
      excerpt:
        "德国、荷兰和法国学生签证的材料清单、资金证明与面试准备。",
      body: [
        "学生签证材料因国家而异，但资金证明、医疗保险和录取通知书通常是核心要求。",
        "德国通常要求冻结账户（Sperrkonto）；荷兰的大学往往会处理大部分居留申请流程；法国可能需要先完成 Campus France 相关步骤。",
        "旺季的签证预约可能需要等待 4–8 周，因此拿到录取通知后应尽快安排申请。",
        "面试回答要清晰、简洁且前后一致，并明确说明学习目的和资金计划。",
      ],
    },
    "etkili-niyet-mektubu-sop-yazimi": {
      title: "如何写出有效的 Statement of Purpose（SOP）",
      excerpt:
        "吸引招生委员会注意的 SOP 结构：开场、学术背景、目标与项目匹配度。",
      body: [
        "SOP 讲述的是你的学术发展方向。避免模板化开头，建立具体、个人化并针对目标项目的叙事。",
        "一个有力的结构通常包括有效开场、学术背景、研究经历、职业目标以及清晰的项目匹配说明。",
        "每一句话都应提供证据或论点，避免“我一直热爱科学”这类空泛表达。",
        "700–1,000 词是常见范围，但如项目有明确格式或字数要求，应始终以项目要求为准。",
      ],
    },
    "spss-r-istatistik-analiz-tez": {
      title: "使用 SPSS 和 R 进行论文统计分析",
      excerpt:
        "何时使用哪种分析：t 检验、ANOVA、回归、结构方程模型（SEM）与结果报告。",
      body: [
        "统计方法的选择取决于研究假设和数据结构。错误的检验方法会削弱论文结论的有效性。",
        "比较两组时常用独立样本 t 检验或 Mann–Whitney；三组及以上可考虑 ANOVA 或 Kruskal–Wallis。",
        "关系模型常使用多元回归，结构模型则常使用 SEM（AMOS/SmartPLS）。在适用情况下，还应报告 CFA、Cronbach α 等效度与信度指标。",
        "按照 APA 7，应同时报告检验统计量、自由度、p 值和效应量。",
      ],
    },
    "erasmus-plus-2026-firsatlari": {
      title: "Erasmus+ 2026：新机会与申请策略",
      excerpt:
        "2026 年 Erasmus+ 学习、实习和博士流动申请的关键注意事项。",
      body: [
        "Erasmus+ 支持在参与国和伙伴国开展学习或实习流动，常见期限为 3–12 个月。",
        "申请通常包括校内初选、语言能力、学业表现以及动机评估或面试。",
        "对于博士流动，找到合适的接收机构尤其重要；可以与导师及学术网络合作寻找 host institution。",
        "资助金额因国家类别而异，可能无法覆盖全部生活成本，因此应准备额外预算。",
      ],
    },
    "doktora-tez-yazimi-aksamak": {
      title: "让博士论文按计划推进的 6 个策略",
      excerpt:
        "从文献综述到答辩，帮助你按时完成博士论文的实践型工作方法。",
      body: [
        "博士论文是一场马拉松。每天进行短时写作，并使用 Pomodoro、deep work 等专注方法，可以把大型任务拆解得更可管理。",
        "按章节设置里程碑：文献综述 → 方法学 → 数据收集 → 分析 → 讨论。",
        "使用 Zotero 或 Mendeley 等文献管理工具，不要手工收集引用。",
        "每 2–4 周与导师进行一次固定进度会议，并尽量缩短反馈周期。",
        "学术写作辅导有助于减少停滞期并提高持续推进的能力。",
      ],
    },
  },
};

export const STATIC_BLOG_CATEGORY_LABELS: Record<LanguageCode, Record<PostCategory, string>> = {
  tr: {
    erasmus: "Erasmus",
    visa: "Vize",
    sop: "Niyet Mektubu",
    statistics: "İstatistik",
    thesis: "Tez",
    scholarship: "Burslar",
  },
  en: {
    erasmus: "Erasmus",
    visa: "Visa",
    sop: "Statement of Purpose",
    statistics: "Statistics",
    thesis: "Thesis",
    scholarship: "Scholarships",
  },
  de: {
    erasmus: "Erasmus",
    visa: "Visum",
    sop: "Motivationsschreiben",
    statistics: "Statistik",
    thesis: "Abschlussarbeit",
    scholarship: "Stipendien",
  },
  fr: {
    erasmus: "Erasmus",
    visa: "Visa",
    sop: "Lettre de motivation",
    statistics: "Statistiques",
    thesis: "Mémoire & thèse",
    scholarship: "Bourses",
  },
  it: {
    erasmus: "Erasmus",
    visa: "Visto",
    sop: "Lettera motivazionale",
    statistics: "Statistica",
    thesis: "Tesi",
    scholarship: "Borse di studio",
  },
  es: {
    erasmus: "Erasmus",
    visa: "Visado",
    sop: "Carta de motivación",
    statistics: "Estadística",
    thesis: "Tesis",
    scholarship: "Becas",
  },
  ar: {
    erasmus: "إيراسموس",
    visa: "التأشيرة",
    sop: "خطاب الدافع",
    statistics: "الإحصاء",
    thesis: "الرسالة الأكاديمية",
    scholarship: "المنح الدراسية",
  },
  ru: {
    erasmus: "Erasmus",
    visa: "Виза",
    sop: "Мотивационное письмо",
    statistics: "Статистика",
    thesis: "Диссертация",
    scholarship: "Стипендии",
  },
  zh: {
    erasmus: "Erasmus",
    visa: "签证",
    sop: "动机信",
    statistics: "统计分析",
    thesis: "论文",
    scholarship: "奖学金",
  },
};

export const STATIC_BLOG_TRANSLATION_NOTICES: Record<StaticBlogLanguage, string> = {
  en: "This article is available in an editorial translation for the selected language.",
  de: "Dieser Artikel ist in einer redaktionellen Übersetzung für die ausgewählte Sprache verfügbar.",
  fr: "Cet article est disponible dans une traduction éditoriale pour la langue sélectionnée.",
  it: "Questo articolo è disponibile in una traduzione editoriale per la lingua selezionata.",
  es: "Este artículo está disponible en una traducción editorial para el idioma seleccionado.",
  ar: "هذه المقالة متاحة بترجمة تحريرية باللغة المحددة.",
  ru: "Эта статья доступна в редакционном переводе на выбранный язык.",
  zh: "本文提供所选语言的编辑译文。",
};

export function normalizeStaticBlogLanguage(value: string): LanguageCode {
  const code = (value || "tr").split("-")[0] as LanguageCode;
  return code in STATIC_BLOG_CATEGORY_LABELS ? code : "tr";
}

export function getStaticBlogTranslation(slug: string, language: string) {
  const code = normalizeStaticBlogLanguage(language);
  if (code === "tr") return null;
  return STATIC_BLOG_TRANSLATIONS[code][slug] ?? null;
}

export function getStaticBlogCategoryLabel(category: PostCategory, language: string) {
  const code = normalizeStaticBlogLanguage(language);
  return STATIC_BLOG_CATEGORY_LABELS[code][category];
}

export function getStaticBlogTranslationNotice(language: string) {
  const code = normalizeStaticBlogLanguage(language);
  if (code === "tr") return null;
  return STATIC_BLOG_TRANSLATION_NOTICES[code];
}
