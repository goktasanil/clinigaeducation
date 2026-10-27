import { useTranslation } from "react-i18next";

type PaymentCopy = {
  pending: string;
  pendingDescription: string;
  contact: string;
  students: string;
  advertisers: string;
  monthly: string;
  annual: string;
  annualTotal: string;
  currency: string;
  noPrice: string;
  continue: string;
  billingTitle: string;
  billingDescription: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  identity: string;
  address: string;
  contactName: string;
  city: string;
  country: string;
  zip: string;
  privacy: string;
  cancel: string;
  error: string;
  invalidBilling: string;
  provider: string;
  recurringMonthly: string;
  recurringAnnual: string;
  oneTime: string;
  manage: string;
  refresh: string;
  cancelRenewal: string;
  cancelTitle: string;
  cancelDescription: string;
  confirmCancel: string;
  cancellationDone: string;
  endDate: string;
  stopped: string;
  statusUnavailable: string;
  payouts: string;
  noSubscription: string;
  statuses: Record<string, string>;
};

const COPY: Record<string, PaymentCopy> = {
  tr: {
    pending: "Ödeme kurulumu tamamlanıyor",
    pendingDescription:
      "Ödeme bağlantısı hazır olduğunda üyelik ve kredi satın alma burada açılacak. Şu anda kart bilgisi veya ödeme alınmıyor.",
    contact: "Üyelik hakkında bilgi al",
    students: "Öğrenciler",
    advertisers: "İlan verenler",
    monthly: "Aylık",
    annual: "Yıllık",
    annualTotal: "Yıllık toplam",
    currency: "Para birimi",
    noPrice: "Bu para biriminde fiyat henüz tanımlı değil",
    continue: "Güvenli ödemeye devam et",
    billingTitle: "Fatura bilgileri",
    billingDescription:
      "iyzico ödeme sayfasına geçmeden önce gerekli fatura bilgilerini tamamla. E-posta, giriş yaptığın hesaba bağlıdır.",
    name: "Ad",
    surname: "Soyad",
    email: "Hesap e-postası",
    phone: "Telefon (+ülke koduyla)",
    identity: "Kimlik / pasaport numarası",
    address: "Fatura adresi",
    contactName: "Adres iletişim kişisi",
    city: "Şehir",
    country: "Ülke",
    zip: "Posta kodu (isteğe bağlı)",
    privacy:
      "Kart bilgileri bu formda alınmaz. Fatura bilgileri yalnızca ödeme talebi için iletilir; bu formda saklanmaz.",
    cancel: "Vazgeç",
    error: "İşlem tamamlanamadı. Lütfen bilgilerini ve bağlantını kontrol edip yeniden dene.",
    invalidBilling:
      "Lütfen zorunlu alanları gerçek bilgilerle doldur ve telefonu uluslararası biçimde yaz.",
    provider: "Ödeme sağlayıcısı",
    recurringMonthly: "Aylık yenilenen üyelik. Yenilemeyi hesap sayfandan durdurabilirsin.",
    recurringAnnual:
      "Yıllık toplam tutar tahsil edilir; üyelik yıllık yenilenir. Yenilemeyi hesap sayfandan durdurabilirsin.",
    oneTime: "Tek seferlik kredi satın alma; üyelik aboneliğinden ayrıdır.",
    manage: "Üyeliği yönet",
    refresh: "Durumu yenile",
    cancelRenewal: "Yenilemeyi durdur",
    cancelTitle: "Üyelik yenilemesi durdurulsun mu?",
    cancelDescription:
      "Yeni yenileme ödemeleri durdurulur. Mevcut ücretli erişim, hesapta görünen dönem sonuna kadar devam eder.",
    confirmCancel: "Yenilemeyi durdur",
    cancellationDone: "Yenileme durduruldu.",
    endDate: "Ücretli dönem sonu",
    stopped: "Yenileme kapalı",
    statusUnavailable:
      "Sağlayıcı durumu doğrulanamadı. Sayfayı yenileyebilir veya destekle iletişime geçebilirsin.",
    payouts: "İlan veren ödeme hesabı",
    noSubscription: "Doğrulanmış aktif üyelik yok",
    statuses: {
      pending: "Onay bekliyor",
      active: "Aktif",
      trialing: "Deneme dönemi",
      past_due: "Ödeme gecikmiş",
      cancelled: "İptal edilmiş",
      expired: "Süresi dolmuş",
      inactive: "Aktif değil",
    },
  },
  en: {
    pending: "Payment setup is being completed",
    pendingDescription:
      "Membership and credit purchases will open here when the payment connection is ready. No card details or payment are collected now.",
    contact: "Ask about membership",
    students: "Students",
    advertisers: "Advertisers",
    monthly: "Monthly",
    annual: "Annual",
    annualTotal: "Annual total",
    currency: "Currency",
    noPrice: "No price is configured in this currency yet",
    continue: "Continue to secure payment",
    billingTitle: "Billing details",
    billingDescription:
      "Complete the required billing details before opening iyzico checkout. Your email is bound to the signed-in account.",
    name: "First name",
    surname: "Last name",
    email: "Account email",
    phone: "Phone (with +country code)",
    identity: "Identity / passport number",
    address: "Billing address",
    contactName: "Address contact person",
    city: "City",
    country: "Country",
    zip: "Postal code (optional)",
    privacy:
      "This form never collects card details. Billing details are sent only for the payment request and are not stored by this form.",
    cancel: "Cancel",
    error: "The action could not be completed. Check your details and connection, then try again.",
    invalidBilling:
      "Complete required fields with genuine details and use an international phone number.",
    provider: "Payment provider",
    recurringMonthly: "Membership renews monthly. You can stop renewals from your account page.",
    recurringAnnual:
      "The annual total is charged and membership renews yearly. You can stop renewals from your account page.",
    oneTime: "One-time credit purchase, separate from your membership subscription.",
    manage: "Manage membership",
    refresh: "Refresh status",
    cancelRenewal: "Stop renewals",
    cancelTitle: "Stop membership renewals?",
    cancelDescription:
      "Future renewal payments will stop. Existing paid access continues until the period end shown in your account.",
    confirmCancel: "Stop renewals",
    cancellationDone: "Renewals stopped.",
    endDate: "Paid period ends",
    stopped: "Renewals stopped",
    statusUnavailable: "The provider status could not be verified. Refresh or contact support.",
    payouts: "Advertiser payment account",
    noSubscription: "No verified active membership",
    statuses: {
      pending: "Pending confirmation",
      active: "Active",
      trialing: "Trial period",
      past_due: "Payment overdue",
      cancelled: "Cancelled",
      expired: "Expired",
      inactive: "Inactive",
    },
  },
  de: {
    pending: "Die Zahlungseinrichtung wird abgeschlossen",
    pendingDescription:
      "Mitgliedschaften und Guthaben können hier gekauft werden, sobald die Zahlungsanbindung bereit ist. Aktuell werden keine Kartendaten oder Zahlungen angenommen.",
    contact: "Zur Mitgliedschaft nachfragen",
    students: "Studierende",
    advertisers: "Inserierende",
    monthly: "Monatlich",
    annual: "Jährlich",
    annualTotal: "Jahresgesamtbetrag",
    currency: "Währung",
    noPrice: "Für diese Währung ist noch kein Preis hinterlegt",
    continue: "Weiter zur sicheren Zahlung",
    billingTitle: "Rechnungsdaten",
    billingDescription:
      "Vervollständige die erforderlichen Rechnungsdaten für iyzico. Die E-Mail ist an dein angemeldetes Konto gebunden.",
    name: "Vorname",
    surname: "Nachname",
    email: "Konto-E-Mail",
    phone: "Telefon (mit +Ländervorwahl)",
    identity: "Ausweis- / Passnummer",
    address: "Rechnungsanschrift",
    contactName: "Kontaktperson der Anschrift",
    city: "Stadt",
    country: "Land",
    zip: "Postleitzahl (optional)",
    privacy:
      "Dieses Formular erfasst keine Kartendaten. Rechnungsdaten werden nur für die Zahlungsanfrage übermittelt und hier nicht gespeichert.",
    cancel: "Abbrechen",
    error:
      "Der Vorgang konnte nicht abgeschlossen werden. Prüfe deine Angaben und Verbindung und versuche es erneut.",
    invalidBilling:
      "Fülle Pflichtfelder mit echten Angaben aus und nutze eine internationale Telefonnummer.",
    provider: "Zahlungsanbieter",
    recurringMonthly:
      "Die Mitgliedschaft verlängert sich monatlich. Verlängerungen lassen sich im Konto beenden.",
    recurringAnnual:
      "Der Jahresgesamtbetrag wird berechnet; die Mitgliedschaft verlängert sich jährlich. Verlängerungen lassen sich im Konto beenden.",
    oneTime: "Einmaliger Guthabenkauf, getrennt vom Mitgliedschaftsabonnement.",
    manage: "Mitgliedschaft verwalten",
    refresh: "Status aktualisieren",
    cancelRenewal: "Verlängerungen beenden",
    cancelTitle: "Mitgliedschaftsverlängerungen beenden?",
    cancelDescription:
      "Künftige Verlängerungszahlungen werden beendet. Bezahlter Zugang bleibt bis zum im Konto angegebenen Periodenende bestehen.",
    confirmCancel: "Verlängerungen beenden",
    cancellationDone: "Verlängerungen wurden beendet.",
    endDate: "Bezahlter Zeitraum endet",
    stopped: "Verlängerung beendet",
    statusUnavailable:
      "Der Anbieterstatus konnte nicht bestätigt werden. Aktualisiere die Seite oder kontaktiere den Support.",
    payouts: "Zahlungskonto für Inserierende",
    noSubscription: "Keine bestätigte aktive Mitgliedschaft",
    statuses: {
      pending: "Bestätigung ausstehend",
      active: "Aktiv",
      trialing: "Testzeitraum",
      past_due: "Zahlung überfällig",
      cancelled: "Gekündigt",
      expired: "Abgelaufen",
      inactive: "Inaktiv",
    },
  },
  fr: {
    pending: "La configuration du paiement est en cours",
    pendingDescription:
      "Les achats d’abonnement et de crédits seront disponibles ici lorsque la connexion de paiement sera prête. Aucune donnée bancaire ni paiement n’est collecté actuellement.",
    contact: "Se renseigner sur l’abonnement",
    students: "Étudiants",
    advertisers: "Annonceurs",
    monthly: "Mensuel",
    annual: "Annuel",
    annualTotal: "Total annuel",
    currency: "Devise",
    noPrice: "Aucun prix n’est encore défini dans cette devise",
    continue: "Continuer vers le paiement sécurisé",
    billingTitle: "Informations de facturation",
    billingDescription:
      "Complétez les informations requises avant le paiement iyzico. L’e-mail est lié au compte connecté.",
    name: "Prénom",
    surname: "Nom",
    email: "E-mail du compte",
    phone: "Téléphone (avec +indicatif)",
    identity: "Numéro d’identité / de passeport",
    address: "Adresse de facturation",
    contactName: "Contact à cette adresse",
    city: "Ville",
    country: "Pays",
    zip: "Code postal (facultatif)",
    privacy:
      "Ce formulaire ne recueille pas de données bancaires. Les informations de facturation sont transmises uniquement pour la demande de paiement et ne sont pas enregistrées ici.",
    cancel: "Annuler",
    error:
      "L’action n’a pas pu aboutir. Vérifiez vos informations et votre connexion, puis réessayez.",
    invalidBilling:
      "Renseignez les champs obligatoires avec des informations réelles et un numéro international.",
    provider: "Prestataire de paiement",
    recurringMonthly:
      "L’abonnement est renouvelé chaque mois. Vous pouvez arrêter les renouvellements depuis votre compte.",
    recurringAnnual:
      "Le total annuel est facturé et l’abonnement est renouvelé chaque année. Les renouvellements peuvent être arrêtés dans votre compte.",
    oneTime: "Achat de crédits unique, distinct de l’abonnement.",
    manage: "Gérer l’abonnement",
    refresh: "Actualiser le statut",
    cancelRenewal: "Arrêter les renouvellements",
    cancelTitle: "Arrêter le renouvellement de l’abonnement ?",
    cancelDescription:
      "Les prochains paiements de renouvellement seront arrêtés. L’accès payé reste disponible jusqu’à la fin de période affichée dans votre compte.",
    confirmCancel: "Arrêter les renouvellements",
    cancellationDone: "Renouvellements arrêtés.",
    endDate: "Fin de la période payée",
    stopped: "Renouvellement arrêté",
    statusUnavailable:
      "Le statut du prestataire n’a pas pu être vérifié. Actualisez ou contactez l’assistance.",
    payouts: "Compte de paiement annonceur",
    noSubscription: "Aucun abonnement actif confirmé",
    statuses: {
      pending: "Confirmation en attente",
      active: "Actif",
      trialing: "Période d’essai",
      past_due: "Paiement en retard",
      cancelled: "Résilié",
      expired: "Expiré",
      inactive: "Inactif",
    },
  },
  it: {
    pending: "Configurazione dei pagamenti in corso",
    pendingDescription:
      "Gli acquisti di abbonamenti e crediti saranno disponibili quando il collegamento di pagamento sarà pronto. Al momento non vengono raccolti dati della carta né pagamenti.",
    contact: "Informazioni sull’abbonamento",
    students: "Studenti",
    advertisers: "Inserzionisti",
    monthly: "Mensile",
    annual: "Annuale",
    annualTotal: "Totale annuale",
    currency: "Valuta",
    noPrice: "Nessun prezzo ancora configurato in questa valuta",
    continue: "Continua al pagamento sicuro",
    billingTitle: "Dati di fatturazione",
    billingDescription:
      "Completa i dati richiesti prima del checkout iyzico. L’e-mail è collegata all’account connesso.",
    name: "Nome",
    surname: "Cognome",
    email: "E-mail dell’account",
    phone: "Telefono (con +prefisso)",
    identity: "Numero documento / passaporto",
    address: "Indirizzo di fatturazione",
    contactName: "Referente all’indirizzo",
    city: "Città",
    country: "Paese",
    zip: "CAP (facoltativo)",
    privacy:
      "Questo modulo non raccoglie dati della carta. I dati di fatturazione vengono trasmessi solo per la richiesta di pagamento e non vengono salvati qui.",
    cancel: "Annulla",
    error: "Impossibile completare l’operazione. Controlla dati e connessione e riprova.",
    invalidBilling: "Compila i campi obbligatori con dati reali e usa un numero internazionale.",
    provider: "Fornitore di pagamento",
    recurringMonthly:
      "L’abbonamento si rinnova mensilmente. Puoi interrompere i rinnovi dalla pagina del tuo account.",
    recurringAnnual:
      "Viene addebitato il totale annuale e l’abbonamento si rinnova ogni anno. Puoi interrompere i rinnovi dal tuo account.",
    oneTime: "Acquisto di crediti una tantum, separato dall’abbonamento.",
    manage: "Gestisci abbonamento",
    refresh: "Aggiorna stato",
    cancelRenewal: "Interrompi rinnovi",
    cancelTitle: "Interrompere i rinnovi dell’abbonamento?",
    cancelDescription:
      "I prossimi pagamenti di rinnovo verranno interrotti. L’accesso pagato continua fino alla scadenza mostrata nell’account.",
    confirmCancel: "Interrompi rinnovi",
    cancellationDone: "Rinnovi interrotti.",
    endDate: "Fine del periodo pagato",
    stopped: "Rinnovi interrotti",
    statusUnavailable:
      "Impossibile verificare lo stato del fornitore. Aggiorna o contatta l’assistenza.",
    payouts: "Conto di pagamento inserzionista",
    noSubscription: "Nessun abbonamento attivo verificato",
    statuses: {
      pending: "In attesa di conferma",
      active: "Attivo",
      trialing: "Periodo di prova",
      past_due: "Pagamento scaduto",
      cancelled: "Annullato",
      expired: "Scaduto",
      inactive: "Non attivo",
    },
  },
  es: {
    pending: "Se está completando la configuración del pago",
    pendingDescription:
      "Las compras de membresías y créditos se habilitarán cuando la conexión de pago esté lista. Ahora no se recogen datos de tarjeta ni pagos.",
    contact: "Consultar sobre la membresía",
    students: "Estudiantes",
    advertisers: "Anunciantes",
    monthly: "Mensual",
    annual: "Anual",
    annualTotal: "Total anual",
    currency: "Moneda",
    noPrice: "Todavía no hay un precio configurado en esta moneda",
    continue: "Continuar al pago seguro",
    billingTitle: "Datos de facturación",
    billingDescription:
      "Completa los datos requeridos antes del pago iyzico. El correo está vinculado a la cuenta conectada.",
    name: "Nombre",
    surname: "Apellidos",
    email: "Correo de la cuenta",
    phone: "Teléfono (con +prefijo)",
    identity: "Número de identidad / pasaporte",
    address: "Dirección de facturación",
    contactName: "Persona de contacto",
    city: "Ciudad",
    country: "País",
    zip: "Código postal (opcional)",
    privacy:
      "Este formulario no recoge datos de tarjeta. Los datos de facturación solo se envían para la solicitud de pago y no se guardan aquí.",
    cancel: "Cancelar",
    error:
      "No se pudo completar la acción. Comprueba los datos y la conexión e inténtalo de nuevo.",
    invalidBilling:
      "Completa los campos obligatorios con datos reales y un teléfono internacional.",
    provider: "Proveedor de pago",
    recurringMonthly:
      "La membresía se renueva mensualmente. Puedes detener las renovaciones desde tu cuenta.",
    recurringAnnual:
      "Se cobra el total anual y la membresía se renueva cada año. Puedes detener las renovaciones desde tu cuenta.",
    oneTime: "Compra de créditos de un solo pago, separada de la membresía.",
    manage: "Gestionar membresía",
    refresh: "Actualizar estado",
    cancelRenewal: "Detener renovaciones",
    cancelTitle: "¿Detener las renovaciones de la membresía?",
    cancelDescription:
      "Se detendrán los próximos pagos de renovación. El acceso pagado continúa hasta el fin del período mostrado en tu cuenta.",
    confirmCancel: "Detener renovaciones",
    cancellationDone: "Renovaciones detenidas.",
    endDate: "Fin del período pagado",
    stopped: "Renovaciones detenidas",
    statusUnavailable:
      "No se pudo verificar el estado del proveedor. Actualiza o contacta con soporte.",
    payouts: "Cuenta de pago del anunciante",
    noSubscription: "No hay una membresía activa verificada",
    statuses: {
      pending: "Pendiente de confirmación",
      active: "Activa",
      trialing: "Período de prueba",
      past_due: "Pago atrasado",
      cancelled: "Cancelada",
      expired: "Caducada",
      inactive: "Inactiva",
    },
  },
  ar: {
    pending: "جارٍ إكمال إعداد الدفع",
    pendingDescription:
      "ستتاح مشتريات العضوية والأرصدة عند جاهزية اتصال الدفع. لا يتم حاليًا جمع بيانات البطاقة أو تحصيل أي مبلغ.",
    contact: "الاستفسار عن العضوية",
    students: "الطلاب",
    advertisers: "المعلنون",
    monthly: "شهري",
    annual: "سنوي",
    annualTotal: "الإجمالي السنوي",
    currency: "العملة",
    noPrice: "لم يُحدّد سعر بهذه العملة بعد",
    continue: "المتابعة إلى الدفع الآمن",
    billingTitle: "بيانات الفوترة",
    billingDescription:
      "أكمل بيانات الفوترة المطلوبة قبل الانتقال إلى دفع iyzico. البريد مرتبط بالحساب المسجّل.",
    name: "الاسم الأول",
    surname: "اسم العائلة",
    email: "بريد الحساب",
    phone: "الهاتف (مع +رمز الدولة)",
    identity: "رقم الهوية / جواز السفر",
    address: "عنوان الفوترة",
    contactName: "جهة الاتصال في العنوان",
    city: "المدينة",
    country: "الدولة",
    zip: "الرمز البريدي (اختياري)",
    privacy:
      "لا يجمع هذا النموذج بيانات البطاقة. تُرسل بيانات الفوترة لطلب الدفع فقط ولا تُحفظ في هذا النموذج.",
    cancel: "إلغاء",
    error: "تعذّر إكمال العملية. تحقّق من البيانات والاتصال وحاول مجددًا.",
    invalidBilling: "أكمل الحقول المطلوبة ببيانات حقيقية واستخدم رقم هاتف دوليًا.",
    provider: "مزود الدفع",
    recurringMonthly: "تتجدد العضوية شهريًا. يمكنك إيقاف التجديد من صفحة حسابك.",
    recurringAnnual: "يُحصّل الإجمالي السنوي وتتجدد العضوية سنويًا. يمكنك إيقاف التجديد من حسابك.",
    oneTime: "شراء أرصدة لمرة واحدة، منفصل عن اشتراك العضوية.",
    manage: "إدارة العضوية",
    refresh: "تحديث الحالة",
    cancelRenewal: "إيقاف التجديد",
    cancelTitle: "هل تريد إيقاف تجديد العضوية؟",
    cancelDescription:
      "ستتوقف دفعات التجديد المستقبلية. يستمر الوصول المدفوع حتى نهاية الفترة المعروضة في حسابك.",
    confirmCancel: "إيقاف التجديد",
    cancellationDone: "تم إيقاف التجديد.",
    endDate: "نهاية الفترة المدفوعة",
    stopped: "التجديد متوقف",
    statusUnavailable: "تعذّر التحقق من حالة المزود. حدّث الصفحة أو تواصل مع الدعم.",
    payouts: "حساب دفع المعلن",
    noSubscription: "لا توجد عضوية نشطة مؤكدة",
    statuses: {
      pending: "بانتظار التأكيد",
      active: "نشط",
      trialing: "فترة تجريبية",
      past_due: "دفع متأخر",
      cancelled: "ملغى",
      expired: "منتهي",
      inactive: "غير نشط",
    },
  },
  ru: {
    pending: "Настройка платежей завершается",
    pendingDescription:
      "Покупки подписок и кредитов откроются после готовности платёжного подключения. Сейчас данные карты и платежи не принимаются.",
    contact: "Узнать о подписке",
    students: "Студенты",
    advertisers: "Рекламодатели",
    monthly: "Ежемесячно",
    annual: "Ежегодно",
    annualTotal: "Сумма за год",
    currency: "Валюта",
    noPrice: "Цена в этой валюте ещё не настроена",
    continue: "Перейти к безопасной оплате",
    billingTitle: "Платёжные реквизиты",
    billingDescription:
      "Заполните обязательные реквизиты перед оплатой iyzico. Электронная почта привязана к вашему аккаунту.",
    name: "Имя",
    surname: "Фамилия",
    email: "Почта аккаунта",
    phone: "Телефон (с +кодом страны)",
    identity: "Номер удостоверения / паспорта",
    address: "Платёжный адрес",
    contactName: "Контактное лицо по адресу",
    city: "Город",
    country: "Страна",
    zip: "Почтовый индекс (необязательно)",
    privacy:
      "Эта форма не собирает данные карты. Реквизиты передаются только для запроса оплаты и не сохраняются в форме.",
    cancel: "Отмена",
    error: "Не удалось завершить действие. Проверьте данные и подключение и повторите попытку.",
    invalidBilling:
      "Заполните обязательные поля реальными данными и укажите международный номер телефона.",
    provider: "Платёжный провайдер",
    recurringMonthly: "Подписка продлевается ежемесячно. Продление можно отключить в аккаунте.",
    recurringAnnual:
      "Взимается полная годовая сумма; подписка продлевается ежегодно. Продление можно отключить в аккаунте.",
    oneTime: "Разовая покупка кредитов, отдельно от подписки.",
    manage: "Управлять подпиской",
    refresh: "Обновить статус",
    cancelRenewal: "Отключить продление",
    cancelTitle: "Отключить продление подписки?",
    cancelDescription:
      "Будущие платежи за продление прекратятся. Оплаченный доступ сохранится до окончания периода, указанного в аккаунте.",
    confirmCancel: "Отключить продление",
    cancellationDone: "Продление отключено.",
    endDate: "Конец оплаченного периода",
    stopped: "Продление отключено",
    statusUnavailable:
      "Не удалось подтвердить статус провайдера. Обновите страницу или свяжитесь с поддержкой.",
    payouts: "Платёжный аккаунт рекламодателя",
    noSubscription: "Нет подтверждённой активной подписки",
    statuses: {
      pending: "Ожидает подтверждения",
      active: "Активна",
      trialing: "Пробный период",
      past_due: "Платёж просрочен",
      cancelled: "Отменена",
      expired: "Истекла",
      inactive: "Неактивна",
    },
  },
  zh: {
    pending: "支付设置正在完成",
    pendingDescription:
      "支付连接准备就绪后，可在此购买会员和积分。目前不收集银行卡信息，也不收取任何款项。",
    contact: "咨询会员信息",
    students: "学生",
    advertisers: "广告发布者",
    monthly: "按月",
    annual: "按年",
    annualTotal: "年度总额",
    currency: "币种",
    noPrice: "尚未设置此币种的价格",
    continue: "继续安全支付",
    billingTitle: "账单信息",
    billingDescription: "进入 iyzico 收银台前，请填写所需账单信息。邮箱与当前登录账户绑定。",
    name: "名",
    surname: "姓",
    email: "账户邮箱",
    phone: "电话（含 +国家代码）",
    identity: "身份证件 / 护照号码",
    address: "账单地址",
    contactName: "地址联系人",
    city: "城市",
    country: "国家",
    zip: "邮政编码（可选）",
    privacy: "本表单不收集银行卡信息。账单信息仅用于发送支付请求，不在本表单中保存。",
    cancel: "取消",
    error: "操作未能完成。请检查信息和网络连接后重试。",
    invalidBilling: "请用真实信息填写必填项，并使用国际格式的电话号码。",
    provider: "支付服务商",
    recurringMonthly: "会员按月自动续订，可在账户页面停止续订。",
    recurringAnnual: "按年度总额收费，会员每年续订，可在账户页面停止续订。",
    oneTime: "一次性购买积分，与会员订阅分开。",
    manage: "管理会员",
    refresh: "刷新状态",
    cancelRenewal: "停止续订",
    cancelTitle: "停止会员续订？",
    cancelDescription: "将停止未来的续订付款。已付费访问权限持续至账户显示的本期结束时间。",
    confirmCancel: "停止续订",
    cancellationDone: "已停止续订。",
    endDate: "付费期间结束时间",
    stopped: "已停止续订",
    statusUnavailable: "无法核实服务商状态。请刷新页面或联系支持。",
    payouts: "广告发布者支付账户",
    noSubscription: "没有已核实的有效会员",
    statuses: {
      pending: "等待确认",
      active: "有效",
      trialing: "试用期",
      past_due: "付款逾期",
      cancelled: "已取消",
      expired: "已到期",
      inactive: "未激活",
    },
  },
};

export function usePortalPaymentsCopy() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split(/[-_]/)[0];
  const locale = Object.prototype.hasOwnProperty.call(COPY, language) ? language : "en";
  return { locale, copy: COPY[locale] };
}
