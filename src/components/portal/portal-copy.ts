import { useTranslation } from "react-i18next";

import type { LanguageCode } from "@/i18n";

type PortalCopy = {
  tagline: string;
  nav: {
    overview: string;
    journey: string;
    applications: string;
    documents: string;
    programs: string;
    advisor: string;
    community: string;
    notifications: string;
    account: string;
  };
  workspace: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sourceNote: string;
    programDiscovery: string;
    programDiscoveryDesc: string;
    advisorMeeting: string;
    advisorMeetingDesc: string;
    communityAccount: string;
    communityAccountDesc: string;
  };
  common: {
    retry: string;
    loading: string;
    noDate: string;
    days: string;
    today: string;
    overdue: string;
    save: string;
    cancel: string;
    complete: string;
    add: string;
    optional: string;
  };
  journey: {
    title: string;
    subtitle: string;
    nextAction: string;
    noNextAction: string;
    noNextActionDesc: string;
    deadlineRadar: string;
    noDeadline: string;
    progress: string;
    stages: Record<string, string>;
  };
  tabs: { applications: string; tasks: string; documents: string };
  applications: {
    title: string;
    add: string;
    empty: string;
    emptyDesc: string;
    institution: string;
    program: string;
    country: string;
    intake: string;
    deadline: string;
    status: string;
    statuses: Record<string, string>;
    created: string;
    createSuccess: string;
    updateError: string;
    createError: string;
    institutionRequired: string;
  };
  tasks: {
    title: string;
    add: string;
    empty: string;
    emptyDesc: string;
    task: string;
    due: string;
    createSuccess: string;
    createError: string;
    updateError: string;
    titleRequired: string;
  };
  documents: {
    title: string;
    privateBadge: string;
    privacy: string;
    category: string;
    expiry: string;
    file: string;
    upload: string;
    empty: string;
    emptyDesc: string;
    uploaded: string;
    uploadError: string;
    selectFile: string;
    invalidType: string;
    tooLarge: string;
    categories: Record<string, string>;
  };
  errors: { session: string; load: string };
};

const COPY: Record<LanguageCode, PortalCopy> = {
  tr: {
    tagline: "Yurt dışı eğitimini tek yerde yönet.",
    nav: { overview: "Genel Bakış", journey: "Yolculuğum", applications: "Başvurular", documents: "Belgeler", programs: "Programlar", advisor: "Danışman", community: "Topluluk", notifications: "Bildirimler", account: "Hesap & marketplace" },
    workspace: { eyebrow: "Student Journey OS", title: "Yolculuğunu tek bakışta yönet", subtitle: "Başvurular, son tarihler, görevler ve özel belgeler birbirine bağlı tek çalışma alanında.", sourceNote: "Resmî kaynak ayrımı korunur", programDiscovery: "Program keşfi", programDiscoveryDesc: "Ülke, şehir, kurum ve akademik alan ara.", advisorMeeting: "Danışman görüşmesi", advisorMeetingDesc: "Uygun zaman seçerek görüşme planla.", communityAccount: "Topluluk & hesap", communityAccountDesc: "Marketplace, doğrulama ve hesap ayarlarına geç." },
    common: { retry: "Yeniden dene", loading: "Yükleniyor…", noDate: "Tarih yok", days: "gün", today: "bugün", overdue: "gecikmiş", save: "Kaydet", cancel: "İptal", complete: "Tamamla", add: "Ekle", optional: "İsteğe bağlı" },
    journey: { title: "Yolculuk ilerlemesi", subtitle: "Keşiften varışa kadar durumun", nextAction: "Sıradaki en önemli adım", noNextAction: "Sıradaki adımını oluştur", noNextActionDesc: "Bir başvuru veya görev ekleyerek yolculuğunu başlat.", deadlineRadar: "Son tarih radarı", noDeadline: "Yaklaşan son tarih yok", progress: "tamamlandı", stages: { discover: "Keşif", shortlist: "Kısa liste", documents: "Belgeler", apply: "Başvuru", offer: "Teklif", visa: "Vize", housing: "Konaklama", arrival: "Varış" } },
    tabs: { applications: "Başvurular", tasks: "Görevler", documents: "Belgeler" },
    applications: { title: "Başvuru takipçisi", add: "Başvuru ekle", empty: "Henüz başvuru yok", emptyDesc: "İlgilendiğin üniversite veya programı ekleyip süreci takip et.", institution: "Kurum", program: "Program", country: "Ülke kodu", intake: "Dönem / intake", deadline: "Son tarih", status: "Durum", statuses: { draft: "Taslak", documents: "Belgeler", ready: "Hazır", submitted: "Gönderildi", under_review: "İncelemede", offer: "Teklif", accepted: "Kabul", rejected: "Reddedildi", withdrawn: "Geri çekildi" }, created: "Başvuru çalışma alanına eklendi.", createSuccess: "Başvuru eklendi.", updateError: "Başvuru durumu güncellenemedi.", createError: "Başvuru eklenemedi.", institutionRequired: "Kurum adını yazın." },
    tasks: { title: "Görevler ve kontrol listesi", add: "Görev ekle", empty: "Açık görev yok", emptyDesc: "Son tarih, vize, belge veya konaklama adımlarını görev olarak ekle.", task: "Görev", due: "Tarih", createSuccess: "Görev eklendi.", createError: "Görev eklenemedi.", updateError: "Görev güncellenemedi.", titleRequired: "Görev başlığı yazın." },
    documents: { title: "Özel belge merkezi", privateBadge: "Özel", privacy: "Dosyalar yalnızca hesabına bağlı özel depolama alanında tutulur; herkese açık URL oluşturulmaz.", category: "Belge türü", expiry: "Geçerlilik tarihi", file: "Dosya", upload: "Güvenli yükle", empty: "Henüz belge yok", emptyDesc: "Başvuru belgelerini kimlik doğrulama belgelerinden ayrı ve özel alanda sakla.", uploaded: "Belge özel dosya merkezine yüklendi.", uploadError: "Belge yüklenemedi.", selectFile: "Belge seçin.", invalidType: "Yalnız PDF, JPG veya PNG yükleyebilirsiniz.", tooLarge: "Belge en fazla 8 MB olabilir.", categories: { passport: "Pasaport", transcript: "Transkript", diploma: "Diploma", language_certificate: "Dil belgesi", cv: "CV", motivation_letter: "Niyet mektubu", recommendation: "Referans mektubu", financial_proof: "Finansal belge", visa_document: "Vize belgesi", other: "Diğer" } },
    errors: { session: "Oturum bulunamadı.", load: "Çalışma alanı yüklenemedi." },
  },
  en: {
    tagline: "Organize your study-abroad journey in one place.",
    nav: { overview: "Overview", journey: "My Journey", applications: "Applications", documents: "Documents", programs: "Programs", advisor: "Advisor", community: "Community", notifications: "Notifications", account: "Account & marketplace" },
    workspace: { eyebrow: "Student Journey OS", title: "Manage your journey at a glance", subtitle: "Applications, deadlines, tasks and private documents stay connected in one workspace.", sourceNote: "Official-source distinctions are preserved", programDiscovery: "Discover programs", programDiscoveryDesc: "Search by country, city, institution and academic field.", advisorMeeting: "Advisor meeting", advisorMeetingDesc: "Choose an available time and plan your consultation.", communityAccount: "Community & account", communityAccountDesc: "Open marketplace, verification and account settings." },
    common: { retry: "Try again", loading: "Loading…", noDate: "No date", days: "days", today: "today", overdue: "overdue", save: "Save", cancel: "Cancel", complete: "Complete", add: "Add", optional: "Optional" },
    journey: { title: "Journey progress", subtitle: "Your path from discovery to arrival", nextAction: "Next best action", noNextAction: "Create your next step", noNextActionDesc: "Add an application or task to start your journey.", deadlineRadar: "Deadline radar", noDeadline: "No upcoming deadline", progress: "complete", stages: { discover: "Discover", shortlist: "Shortlist", documents: "Documents", apply: "Apply", offer: "Offer", visa: "Visa", housing: "Housing", arrival: "Arrival" } },
    tabs: { applications: "Applications", tasks: "Tasks", documents: "Documents" },
    applications: { title: "Application tracker", add: "Add application", empty: "No applications yet", emptyDesc: "Add a university or program you are considering and track its progress.", institution: "Institution", program: "Program", country: "Country code", intake: "Intake", deadline: "Deadline", status: "Status", statuses: { draft: "Draft", documents: "Documents", ready: "Ready", submitted: "Submitted", under_review: "Under review", offer: "Offer", accepted: "Accepted", rejected: "Rejected", withdrawn: "Withdrawn" }, created: "Application added to your workspace.", createSuccess: "Application added.", updateError: "Application status could not be updated.", createError: "Application could not be added.", institutionRequired: "Enter the institution name." },
    tasks: { title: "Tasks & checklist", add: "Add task", empty: "No open tasks", emptyDesc: "Add deadlines, visa, document or housing steps as tasks.", task: "Task", due: "Due date", createSuccess: "Task added.", createError: "Task could not be added.", updateError: "Task could not be updated.", titleRequired: "Enter a task title." },
    documents: { title: "Private document center", privateBadge: "Private", privacy: "Files stay in private storage linked to your account; no public URL is created.", category: "Document type", expiry: "Expiry date", file: "File", upload: "Secure upload", empty: "No documents yet", emptyDesc: "Keep application documents separate from identity-verification files in private storage.", uploaded: "Document uploaded to your private file center.", uploadError: "Document could not be uploaded.", selectFile: "Select a document.", invalidType: "Only PDF, JPG or PNG files are allowed.", tooLarge: "The document can be up to 8 MB.", categories: { passport: "Passport", transcript: "Transcript", diploma: "Diploma", language_certificate: "Language certificate", cv: "CV", motivation_letter: "Motivation letter", recommendation: "Recommendation letter", financial_proof: "Financial proof", visa_document: "Visa document", other: "Other" } },
    errors: { session: "Session not found.", load: "Workspace could not be loaded." },
  },
  de: {
    tagline: "Organisiere dein Auslandsstudium an einem Ort.",
    nav: { overview: "Übersicht", journey: "Meine Reise", applications: "Bewerbungen", documents: "Dokumente", programs: "Programme", advisor: "Beratung", community: "Community", notifications: "Benachrichtigungen", account: "Konto & Marktplatz" },
    workspace: { eyebrow: "Student Journey OS", title: "Behalte deine Reise auf einen Blick im Griff", subtitle: "Bewerbungen, Fristen, Aufgaben und private Dokumente bleiben in einem Arbeitsbereich verbunden.", sourceNote: "Offizielle Quellen bleiben klar gekennzeichnet", programDiscovery: "Programme entdecken", programDiscoveryDesc: "Nach Land, Stadt, Hochschule und Fachgebiet suchen.", advisorMeeting: "Beratungsgespräch", advisorMeetingDesc: "Wähle einen verfügbaren Termin für dein Gespräch.", communityAccount: "Community & Konto", communityAccountDesc: "Marktplatz, Verifizierung und Kontoeinstellungen öffnen." },
    common: { retry: "Erneut versuchen", loading: "Wird geladen…", noDate: "Kein Datum", days: "Tage", today: "heute", overdue: "überfällig", save: "Speichern", cancel: "Abbrechen", complete: "Erledigen", add: "Hinzufügen", optional: "Optional" },
    journey: { title: "Fortschritt", subtitle: "Dein Weg von der Suche bis zur Ankunft", nextAction: "Nächster wichtiger Schritt", noNextAction: "Erstelle deinen nächsten Schritt", noNextActionDesc: "Füge eine Bewerbung oder Aufgabe hinzu.", deadlineRadar: "Fristen", noDeadline: "Keine bevorstehende Frist", progress: "abgeschlossen", stages: { discover: "Entdecken", shortlist: "Auswahl", documents: "Dokumente", apply: "Bewerben", offer: "Zusage", visa: "Visum", housing: "Wohnen", arrival: "Ankunft" } },
    tabs: { applications: "Bewerbungen", tasks: "Aufgaben", documents: "Dokumente" },
    applications: { title: "Bewerbungs-Tracker", add: "Bewerbung hinzufügen", empty: "Noch keine Bewerbungen", emptyDesc: "Füge eine Hochschule oder ein Programm hinzu und verfolge den Status.", institution: "Hochschule", program: "Programm", country: "Ländercode", intake: "Semester / Intake", deadline: "Frist", status: "Status", statuses: { draft: "Entwurf", documents: "Dokumente", ready: "Bereit", submitted: "Eingereicht", under_review: "In Prüfung", offer: "Zusage", accepted: "Angenommen", rejected: "Abgelehnt", withdrawn: "Zurückgezogen" }, created: "Bewerbung hinzugefügt.", createSuccess: "Bewerbung hinzugefügt.", updateError: "Status konnte nicht aktualisiert werden.", createError: "Bewerbung konnte nicht hinzugefügt werden.", institutionRequired: "Name der Hochschule eingeben." },
    tasks: { title: "Aufgaben & Checkliste", add: "Aufgabe hinzufügen", empty: "Keine offenen Aufgaben", emptyDesc: "Erfasse Fristen, Visa-, Dokument- oder Wohnschritte.", task: "Aufgabe", due: "Fällig", createSuccess: "Aufgabe hinzugefügt.", createError: "Aufgabe konnte nicht hinzugefügt werden.", updateError: "Aufgabe konnte nicht aktualisiert werden.", titleRequired: "Aufgabentitel eingeben." },
    documents: { title: "Privates Dokumentencenter", privateBadge: "Privat", privacy: "Dateien bleiben im privaten Speicher deines Kontos; es wird keine öffentliche URL erstellt.", category: "Dokumenttyp", expiry: "Gültig bis", file: "Datei", upload: "Sicher hochladen", empty: "Noch keine Dokumente", emptyDesc: "Bewahre Bewerbungsdokumente getrennt von Identitätsnachweisen privat auf.", uploaded: "Dokument sicher hochgeladen.", uploadError: "Dokument konnte nicht hochgeladen werden.", selectFile: "Dokument auswählen.", invalidType: "Nur PDF, JPG oder PNG sind erlaubt.", tooLarge: "Das Dokument darf höchstens 8 MB groß sein.", categories: { passport: "Reisepass", transcript: "Notenübersicht", diploma: "Abschlusszeugnis", language_certificate: "Sprachnachweis", cv: "Lebenslauf", motivation_letter: "Motivationsschreiben", recommendation: "Empfehlungsschreiben", financial_proof: "Finanzierungsnachweis", visa_document: "Visumdokument", other: "Sonstiges" } },
    errors: { session: "Sitzung nicht gefunden.", load: "Arbeitsbereich konnte nicht geladen werden." },
  },
  fr: {
    tagline: "Organisez votre projet d’études à l’étranger au même endroit.",
    nav: { overview: "Vue d’ensemble", journey: "Mon parcours", applications: "Candidatures", documents: "Documents", programs: "Programmes", advisor: "Conseiller", community: "Communauté", notifications: "Notifications", account: "Compte & marketplace" },
    workspace: { eyebrow: "Student Journey OS", title: "Pilotez votre parcours en un coup d’œil", subtitle: "Candidatures, échéances, tâches et documents privés restent reliés dans un espace unique.", sourceNote: "Les sources officielles restent clairement distinguées", programDiscovery: "Découvrir les programmes", programDiscoveryDesc: "Recherchez par pays, ville, établissement et domaine.", advisorMeeting: "Rendez-vous conseiller", advisorMeetingDesc: "Choisissez un créneau disponible pour votre échange.", communityAccount: "Communauté & compte", communityAccountDesc: "Accédez à la marketplace, la vérification et vos réglages." },
    common: { retry: "Réessayer", loading: "Chargement…", noDate: "Aucune date", days: "jours", today: "aujourd’hui", overdue: "en retard", save: "Enregistrer", cancel: "Annuler", complete: "Terminer", add: "Ajouter", optional: "Facultatif" },
    journey: { title: "Progression du parcours", subtitle: "De la recherche à l’arrivée", nextAction: "Prochaine action prioritaire", noNextAction: "Créez votre prochaine étape", noNextActionDesc: "Ajoutez une candidature ou une tâche pour commencer.", deadlineRadar: "Échéances", noDeadline: "Aucune échéance à venir", progress: "terminé", stages: { discover: "Explorer", shortlist: "Sélection", documents: "Documents", apply: "Candidature", offer: "Offre", visa: "Visa", housing: "Logement", arrival: "Arrivée" } },
    tabs: { applications: "Candidatures", tasks: "Tâches", documents: "Documents" },
    applications: { title: "Suivi des candidatures", add: "Ajouter une candidature", empty: "Aucune candidature", emptyDesc: "Ajoutez un établissement ou programme et suivez son avancement.", institution: "Établissement", program: "Programme", country: "Code pays", intake: "Rentrée / intake", deadline: "Échéance", status: "Statut", statuses: { draft: "Brouillon", documents: "Documents", ready: "Prêt", submitted: "Envoyé", under_review: "En cours d’examen", offer: "Offre", accepted: "Accepté", rejected: "Refusé", withdrawn: "Retiré" }, created: "Candidature ajoutée.", createSuccess: "Candidature ajoutée.", updateError: "Le statut n’a pas pu être mis à jour.", createError: "La candidature n’a pas pu être ajoutée.", institutionRequired: "Saisissez le nom de l’établissement." },
    tasks: { title: "Tâches & checklist", add: "Ajouter une tâche", empty: "Aucune tâche ouverte", emptyDesc: "Ajoutez les étapes liées aux échéances, visas, documents ou logement.", task: "Tâche", due: "Échéance", createSuccess: "Tâche ajoutée.", createError: "La tâche n’a pas pu être ajoutée.", updateError: "La tâche n’a pas pu être mise à jour.", titleRequired: "Saisissez un titre de tâche." },
    documents: { title: "Centre de documents privé", privateBadge: "Privé", privacy: "Les fichiers restent dans le stockage privé lié à votre compte; aucune URL publique n’est créée.", category: "Type de document", expiry: "Date d’expiration", file: "Fichier", upload: "Téléverser en sécurité", empty: "Aucun document", emptyDesc: "Conservez vos documents de candidature séparés des justificatifs d’identité.", uploaded: "Document téléversé dans votre espace privé.", uploadError: "Le document n’a pas pu être téléversé.", selectFile: "Sélectionnez un document.", invalidType: "Seuls les fichiers PDF, JPG ou PNG sont acceptés.", tooLarge: "Le document ne peut pas dépasser 8 Mo.", categories: { passport: "Passeport", transcript: "Relevé de notes", diploma: "Diplôme", language_certificate: "Certificat de langue", cv: "CV", motivation_letter: "Lettre de motivation", recommendation: "Lettre de recommandation", financial_proof: "Justificatif financier", visa_document: "Document de visa", other: "Autre" } },
    errors: { session: "Session introuvable.", load: "Impossible de charger l’espace de travail." },
  },
  it: {
    tagline: "Organizza il tuo percorso di studio all’estero in un unico posto.",
    nav: { overview: "Panoramica", journey: "Il mio percorso", applications: "Candidature", documents: "Documenti", programs: "Programmi", advisor: "Consulente", community: "Community", notifications: "Notifiche", account: "Account & marketplace" },
    workspace: { eyebrow: "Student Journey OS", title: "Gestisci il tuo percorso a colpo d’occhio", subtitle: "Candidature, scadenze, attività e documenti privati restano collegati in un unico spazio.", sourceNote: "Le fonti ufficiali restano chiaramente distinte", programDiscovery: "Scopri programmi", programDiscoveryDesc: "Cerca per paese, città, istituto e area accademica.", advisorMeeting: "Incontro con il consulente", advisorMeetingDesc: "Scegli un orario disponibile per la consulenza.", communityAccount: "Community & account", communityAccountDesc: "Apri marketplace, verifica e impostazioni account." },
    common: { retry: "Riprova", loading: "Caricamento…", noDate: "Nessuna data", days: "giorni", today: "oggi", overdue: "scaduto", save: "Salva", cancel: "Annulla", complete: "Completa", add: "Aggiungi", optional: "Facoltativo" },
    journey: { title: "Avanzamento percorso", subtitle: "Dalla ricerca all’arrivo", nextAction: "Prossima azione prioritaria", noNextAction: "Crea il prossimo passo", noNextActionDesc: "Aggiungi una candidatura o un’attività per iniziare.", deadlineRadar: "Scadenze", noDeadline: "Nessuna scadenza imminente", progress: "completato", stages: { discover: "Scoperta", shortlist: "Selezione", documents: "Documenti", apply: "Candidatura", offer: "Offerta", visa: "Visto", housing: "Alloggio", arrival: "Arrivo" } },
    tabs: { applications: "Candidature", tasks: "Attività", documents: "Documenti" },
    applications: { title: "Tracker candidature", add: "Aggiungi candidatura", empty: "Nessuna candidatura", emptyDesc: "Aggiungi un istituto o programma e segui lo stato.", institution: "Istituto", program: "Programma", country: "Codice paese", intake: "Intake", deadline: "Scadenza", status: "Stato", statuses: { draft: "Bozza", documents: "Documenti", ready: "Pronto", submitted: "Inviata", under_review: "In valutazione", offer: "Offerta", accepted: "Accettata", rejected: "Rifiutata", withdrawn: "Ritirata" }, created: "Candidatura aggiunta.", createSuccess: "Candidatura aggiunta.", updateError: "Impossibile aggiornare lo stato.", createError: "Impossibile aggiungere la candidatura.", institutionRequired: "Inserisci il nome dell’istituto." },
    tasks: { title: "Attività & checklist", add: "Aggiungi attività", empty: "Nessuna attività aperta", emptyDesc: "Aggiungi scadenze e passaggi per visto, documenti o alloggio.", task: "Attività", due: "Scadenza", createSuccess: "Attività aggiunta.", createError: "Impossibile aggiungere l’attività.", updateError: "Impossibile aggiornare l’attività.", titleRequired: "Inserisci un titolo." },
    documents: { title: "Centro documenti privato", privateBadge: "Privato", privacy: "I file restano nello spazio privato collegato al tuo account; non viene creato alcun URL pubblico.", category: "Tipo di documento", expiry: "Scadenza", file: "File", upload: "Carica in sicurezza", empty: "Nessun documento", emptyDesc: "Conserva i documenti di candidatura separati dai file di verifica dell’identità.", uploaded: "Documento caricato nello spazio privato.", uploadError: "Impossibile caricare il documento.", selectFile: "Seleziona un documento.", invalidType: "Sono ammessi solo PDF, JPG o PNG.", tooLarge: "Il documento può essere massimo 8 MB.", categories: { passport: "Passaporto", transcript: "Transcript", diploma: "Diploma", language_certificate: "Certificato linguistico", cv: "CV", motivation_letter: "Lettera motivazionale", recommendation: "Lettera di referenza", financial_proof: "Prova finanziaria", visa_document: "Documento visto", other: "Altro" } },
    errors: { session: "Sessione non trovata.", load: "Impossibile caricare lo spazio di lavoro." },
  },
  es: {
    tagline: "Organiza tu proceso de estudios en el extranjero en un solo lugar.",
    nav: { overview: "Resumen", journey: "Mi recorrido", applications: "Solicitudes", documents: "Documentos", programs: "Programas", advisor: "Asesor", community: "Comunidad", notifications: "Notificaciones", account: "Cuenta & marketplace" },
    workspace: { eyebrow: "Student Journey OS", title: "Gestiona tu recorrido de un vistazo", subtitle: "Solicitudes, fechas límite, tareas y documentos privados conectados en un solo espacio.", sourceNote: "Las fuentes oficiales se mantienen claramente diferenciadas", programDiscovery: "Descubrir programas", programDiscoveryDesc: "Busca por país, ciudad, institución y área académica.", advisorMeeting: "Reunión con asesor", advisorMeetingDesc: "Elige un horario disponible para tu consulta.", communityAccount: "Comunidad & cuenta", communityAccountDesc: "Accede al marketplace, verificación y ajustes." },
    common: { retry: "Reintentar", loading: "Cargando…", noDate: "Sin fecha", days: "días", today: "hoy", overdue: "vencido", save: "Guardar", cancel: "Cancelar", complete: "Completar", add: "Añadir", optional: "Opcional" },
    journey: { title: "Progreso del recorrido", subtitle: "Desde la búsqueda hasta la llegada", nextAction: "Próxima acción prioritaria", noNextAction: "Crea tu próximo paso", noNextActionDesc: "Añade una solicitud o tarea para empezar.", deadlineRadar: "Fechas límite", noDeadline: "No hay fechas próximas", progress: "completado", stages: { discover: "Explorar", shortlist: "Selección", documents: "Documentos", apply: "Solicitud", offer: "Oferta", visa: "Visado", housing: "Alojamiento", arrival: "Llegada" } },
    tabs: { applications: "Solicitudes", tasks: "Tareas", documents: "Documentos" },
    applications: { title: "Seguimiento de solicitudes", add: "Añadir solicitud", empty: "Aún no hay solicitudes", emptyDesc: "Añade una universidad o programa y sigue su progreso.", institution: "Institución", program: "Programa", country: "Código país", intake: "Convocatoria", deadline: "Fecha límite", status: "Estado", statuses: { draft: "Borrador", documents: "Documentos", ready: "Lista", submitted: "Enviada", under_review: "En revisión", offer: "Oferta", accepted: "Aceptada", rejected: "Rechazada", withdrawn: "Retirada" }, created: "Solicitud añadida.", createSuccess: "Solicitud añadida.", updateError: "No se pudo actualizar el estado.", createError: "No se pudo añadir la solicitud.", institutionRequired: "Introduce el nombre de la institución." },
    tasks: { title: "Tareas & checklist", add: "Añadir tarea", empty: "No hay tareas abiertas", emptyDesc: "Añade fechas y pasos de visado, documentos o alojamiento.", task: "Tarea", due: "Fecha", createSuccess: "Tarea añadida.", createError: "No se pudo añadir la tarea.", updateError: "No se pudo actualizar la tarea.", titleRequired: "Introduce un título." },
    documents: { title: "Centro privado de documentos", privateBadge: "Privado", privacy: "Los archivos permanecen en almacenamiento privado vinculado a tu cuenta; no se crea una URL pública.", category: "Tipo de documento", expiry: "Caducidad", file: "Archivo", upload: "Subir de forma segura", empty: "Aún no hay documentos", emptyDesc: "Mantén los documentos de solicitud separados de los archivos de verificación de identidad.", uploaded: "Documento subido al espacio privado.", uploadError: "No se pudo subir el documento.", selectFile: "Selecciona un documento.", invalidType: "Solo se permiten PDF, JPG o PNG.", tooLarge: "El documento puede tener hasta 8 MB.", categories: { passport: "Pasaporte", transcript: "Expediente académico", diploma: "Título", language_certificate: "Certificado de idioma", cv: "CV", motivation_letter: "Carta de motivación", recommendation: "Carta de recomendación", financial_proof: "Prueba financiera", visa_document: "Documento de visado", other: "Otro" } },
    errors: { session: "Sesión no encontrada.", load: "No se pudo cargar el espacio de trabajo." },
  },
  ru: {
    tagline: "Управляйте поступлением за рубеж в одном месте.",
    nav: { overview: "Обзор", journey: "Мой путь", applications: "Заявки", documents: "Документы", programs: "Программы", advisor: "Консультант", community: "Сообщество", notifications: "Уведомления", account: "Аккаунт и маркетплейс" },
    workspace: { eyebrow: "Student Journey OS", title: "Весь путь поступления — одним взглядом", subtitle: "Заявки, дедлайны, задачи и приватные документы связаны в едином рабочем пространстве.", sourceNote: "Официальные источники отмечаются отдельно", programDiscovery: "Поиск программ", programDiscoveryDesc: "Ищите по стране, городу, вузу и академической области.", advisorMeeting: "Встреча с консультантом", advisorMeetingDesc: "Выберите доступное время для консультации.", communityAccount: "Сообщество и аккаунт", communityAccountDesc: "Маркетплейс, верификация и настройки аккаунта." },
    common: { retry: "Повторить", loading: "Загрузка…", noDate: "Нет даты", days: "дн.", today: "сегодня", overdue: "просрочено", save: "Сохранить", cancel: "Отмена", complete: "Завершить", add: "Добавить", optional: "Необязательно" },
    journey: { title: "Прогресс", subtitle: "От поиска до прибытия", nextAction: "Следующий важный шаг", noNextAction: "Создайте следующий шаг", noNextActionDesc: "Добавьте заявку или задачу, чтобы начать.", deadlineRadar: "Дедлайны", noDeadline: "Нет ближайших дедлайнов", progress: "завершено", stages: { discover: "Поиск", shortlist: "Шорт-лист", documents: "Документы", apply: "Подача", offer: "Оффер", visa: "Виза", housing: "Жильё", arrival: "Прибытие" } },
    tabs: { applications: "Заявки", tasks: "Задачи", documents: "Документы" },
    applications: { title: "Трекер заявок", add: "Добавить заявку", empty: "Заявок пока нет", emptyDesc: "Добавьте вуз или программу и отслеживайте статус.", institution: "Учебное заведение", program: "Программа", country: "Код страны", intake: "Набор", deadline: "Дедлайн", status: "Статус", statuses: { draft: "Черновик", documents: "Документы", ready: "Готово", submitted: "Подано", under_review: "На рассмотрении", offer: "Оффер", accepted: "Принято", rejected: "Отказ", withdrawn: "Отозвано" }, created: "Заявка добавлена.", createSuccess: "Заявка добавлена.", updateError: "Не удалось обновить статус.", createError: "Не удалось добавить заявку.", institutionRequired: "Введите название учебного заведения." },
    tasks: { title: "Задачи и чек-лист", add: "Добавить задачу", empty: "Открытых задач нет", emptyDesc: "Добавляйте дедлайны и шаги по визе, документам или жилью.", task: "Задача", due: "Дата", createSuccess: "Задача добавлена.", createError: "Не удалось добавить задачу.", updateError: "Не удалось обновить задачу.", titleRequired: "Введите название задачи." },
    documents: { title: "Приватный центр документов", privateBadge: "Приватно", privacy: "Файлы хранятся в приватном пространстве вашего аккаунта; публичная ссылка не создаётся.", category: "Тип документа", expiry: "Срок действия", file: "Файл", upload: "Безопасно загрузить", empty: "Документов пока нет", emptyDesc: "Храните документы для поступления отдельно от файлов проверки личности.", uploaded: "Документ загружен в приватное хранилище.", uploadError: "Не удалось загрузить документ.", selectFile: "Выберите документ.", invalidType: "Разрешены только PDF, JPG и PNG.", tooLarge: "Размер документа — не более 8 МБ.", categories: { passport: "Паспорт", transcript: "Транскрипт", diploma: "Диплом", language_certificate: "Языковой сертификат", cv: "CV", motivation_letter: "Мотивационное письмо", recommendation: "Рекомендательное письмо", financial_proof: "Финансовое подтверждение", visa_document: "Визовый документ", other: "Другое" } },
    errors: { session: "Сессия не найдена.", load: "Не удалось загрузить рабочее пространство." },
  },
  ar: {
    tagline: "نظّم رحلة الدراسة في الخارج في مكان واحد.",
    nav: { overview: "نظرة عامة", journey: "رحلتي", applications: "الطلبات", documents: "المستندات", programs: "البرامج", advisor: "المستشار", community: "المجتمع", notifications: "الإشعارات", account: "الحساب والسوق" },
    workspace: { eyebrow: "نظام رحلة الطالب", title: "أدر رحلتك من شاشة واحدة", subtitle: "الطلبات والمواعيد والمهام والمستندات الخاصة مترابطة في مساحة عمل واحدة.", sourceNote: "يتم الحفاظ على التمييز بين المصادر الرسمية", programDiscovery: "اكتشاف البرامج", programDiscoveryDesc: "ابحث حسب الدولة والمدينة والمؤسسة والمجال الأكاديمي.", advisorMeeting: "موعد مع المستشار", advisorMeetingDesc: "اختر وقتاً متاحاً وحدد موعد الاستشارة.", communityAccount: "المجتمع والحساب", communityAccountDesc: "انتقل إلى السوق والتحقق وإعدادات الحساب." },
    common: { retry: "إعادة المحاولة", loading: "جارٍ التحميل…", noDate: "لا يوجد تاريخ", days: "يوم", today: "اليوم", overdue: "متأخر", save: "حفظ", cancel: "إلغاء", complete: "إكمال", add: "إضافة", optional: "اختياري" },
    journey: { title: "تقدم الرحلة", subtitle: "من الاستكشاف حتى الوصول", nextAction: "الخطوة الأهم التالية", noNextAction: "أنشئ خطوتك التالية", noNextActionDesc: "أضف طلباً أو مهمة لبدء رحلتك.", deadlineRadar: "المواعيد النهائية", noDeadline: "لا توجد مواعيد قريبة", progress: "مكتمل", stages: { discover: "استكشاف", shortlist: "قائمة مختصرة", documents: "مستندات", apply: "تقديم", offer: "عرض", visa: "تأشيرة", housing: "سكن", arrival: "وصول" } },
    tabs: { applications: "الطلبات", tasks: "المهام", documents: "المستندات" },
    applications: { title: "متابعة الطلبات", add: "إضافة طلب", empty: "لا توجد طلبات بعد", emptyDesc: "أضف جامعة أو برنامجاً وتابع حالة الطلب.", institution: "المؤسسة", program: "البرنامج", country: "رمز الدولة", intake: "دفعة القبول", deadline: "الموعد النهائي", status: "الحالة", statuses: { draft: "مسودة", documents: "مستندات", ready: "جاهز", submitted: "تم الإرسال", under_review: "قيد المراجعة", offer: "عرض", accepted: "مقبول", rejected: "مرفوض", withdrawn: "مسحوب" }, created: "تمت إضافة الطلب.", createSuccess: "تمت إضافة الطلب.", updateError: "تعذر تحديث حالة الطلب.", createError: "تعذرت إضافة الطلب.", institutionRequired: "أدخل اسم المؤسسة." },
    tasks: { title: "المهام وقائمة التحقق", add: "إضافة مهمة", empty: "لا توجد مهام مفتوحة", emptyDesc: "أضف المواعيد وخطوات التأشيرة والمستندات والسكن كمهام.", task: "المهمة", due: "التاريخ", createSuccess: "تمت إضافة المهمة.", createError: "تعذرت إضافة المهمة.", updateError: "تعذر تحديث المهمة.", titleRequired: "أدخل عنوان المهمة." },
    documents: { title: "مركز المستندات الخاص", privateBadge: "خاص", privacy: "تُحفظ الملفات في مساحة خاصة مرتبطة بحسابك ولا يتم إنشاء رابط عام.", category: "نوع المستند", expiry: "تاريخ الانتهاء", file: "الملف", upload: "رفع آمن", empty: "لا توجد مستندات بعد", emptyDesc: "احفظ مستندات التقديم منفصلة عن ملفات التحقق من الهوية.", uploaded: "تم رفع المستند إلى المساحة الخاصة.", uploadError: "تعذر رفع المستند.", selectFile: "اختر مستنداً.", invalidType: "يُسمح فقط بملفات PDF أو JPG أو PNG.", tooLarge: "الحد الأقصى لحجم المستند 8 ميغابايت.", categories: { passport: "جواز السفر", transcript: "كشف الدرجات", diploma: "الشهادة", language_certificate: "شهادة اللغة", cv: "السيرة الذاتية", motivation_letter: "خطاب الدافع", recommendation: "خطاب التوصية", financial_proof: "إثبات مالي", visa_document: "مستند التأشيرة", other: "أخرى" } },
    errors: { session: "لم يتم العثور على جلسة.", load: "تعذر تحميل مساحة العمل." },
  },
  zh: {
    tagline: "在一个平台管理你的留学旅程。",
    nav: { overview: "概览", journey: "我的旅程", applications: "申请", documents: "文件", programs: "项目", advisor: "顾问", community: "社区", notifications: "通知", account: "账户与市场" },
    workspace: { eyebrow: "学生旅程系统", title: "一目了然地管理留学进程", subtitle: "申请、截止日期、任务和私人文件都连接在同一个工作区。", sourceNote: "始终明确区分官方来源", programDiscovery: "发现项目", programDiscoveryDesc: "按国家、城市、院校和学术领域搜索。", advisorMeeting: "顾问会议", advisorMeetingDesc: "选择可用时间安排咨询。", communityAccount: "社区与账户", communityAccountDesc: "进入市场、认证和账户设置。" },
    common: { retry: "重试", loading: "加载中…", noDate: "无日期", days: "天", today: "今天", overdue: "已逾期", save: "保存", cancel: "取消", complete: "完成", add: "添加", optional: "可选" },
    journey: { title: "旅程进度", subtitle: "从探索到抵达", nextAction: "下一项重要行动", noNextAction: "创建下一步", noNextActionDesc: "添加申请或任务开始你的旅程。", deadlineRadar: "截止日期", noDeadline: "暂无临近截止日期", progress: "已完成", stages: { discover: "探索", shortlist: "候选清单", documents: "文件", apply: "申请", offer: "录取", visa: "签证", housing: "住宿", arrival: "抵达" } },
    tabs: { applications: "申请", tasks: "任务", documents: "文件" },
    applications: { title: "申请追踪", add: "添加申请", empty: "暂无申请", emptyDesc: "添加感兴趣的院校或项目并跟踪进度。", institution: "院校", program: "项目", country: "国家代码", intake: "入学季", deadline: "截止日期", status: "状态", statuses: { draft: "草稿", documents: "文件", ready: "就绪", submitted: "已提交", under_review: "审核中", offer: "录取", accepted: "已接受", rejected: "被拒", withdrawn: "已撤回" }, created: "申请已添加。", createSuccess: "申请已添加。", updateError: "无法更新申请状态。", createError: "无法添加申请。", institutionRequired: "请输入院校名称。" },
    tasks: { title: "任务与清单", add: "添加任务", empty: "没有未完成任务", emptyDesc: "把截止日期、签证、文件或住宿步骤添加为任务。", task: "任务", due: "日期", createSuccess: "任务已添加。", createError: "无法添加任务。", updateError: "无法更新任务。", titleRequired: "请输入任务标题。" },
    documents: { title: "私人文件中心", privateBadge: "私人", privacy: "文件仅保存在与你账户关联的私人存储中，不会创建公开链接。", category: "文件类型", expiry: "有效期", file: "文件", upload: "安全上传", empty: "暂无文件", emptyDesc: "将申请文件与身份认证文件分开保存在私人空间。", uploaded: "文件已上传到私人文件中心。", uploadError: "文件上传失败。", selectFile: "请选择文件。", invalidType: "仅允许 PDF、JPG 或 PNG 文件。", tooLarge: "文件最大 8 MB。", categories: { passport: "护照", transcript: "成绩单", diploma: "毕业证书", language_certificate: "语言证书", cv: "简历", motivation_letter: "动机信", recommendation: "推荐信", financial_proof: "资金证明", visa_document: "签证文件", other: "其他" } },
    errors: { session: "未找到会话。", load: "无法加载工作区。" },
  },
};

const LOCALE: Record<LanguageCode, string> = {
  tr: "tr-TR",
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  ar: "ar-SA",
  ru: "ru-RU",
  zh: "zh-CN",
};

export function usePortalCopy() {
  const { i18n } = useTranslation();
  const raw = i18n.resolvedLanguage || i18n.language || "tr";
  const normalized = raw.split("-")[0] as LanguageCode;
  const language: LanguageCode = normalized in COPY ? normalized : "tr";
  return { copy: COPY[language], language, locale: LOCALE[language] };
}
