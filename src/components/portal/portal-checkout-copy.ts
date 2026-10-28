import { useTranslation } from "react-i18next";
import type { LanguageCode } from "@/i18n";

const TR = {
  title: "Güvenli ödeme",
  subtitle:
    "Kart bilgilerini iyzico'nun ödeme formuna gir. Form, sağlayıcının desteklediği dilde açılır.",
  provider: "Ödeme sağlayıcısı",
  amount: "Ödenecek tutar",
  expires: "Oturumun son kullanım zamanı",
  loading: "Ödeme oturumu yükleniyor…",
  formTitle: "iyzico ödeme formu",
  statusNote:
    "Üyelik ve krediler yalnızca sağlayıcıdan doğrulanan ödeme sonucuyla etkinleşir. Sonucu hesabından kontrol edebilirsin.",
  formHelp:
    "Form görünmüyorsa veya sonuçtan emin değilsen önce hesabındaki ödeme durumunu kontrol et. Formu yeniden yüklemek yeni bir ödeme başlatmaz.",
  errorTitle: "Ödeme oturumu kullanılamıyor",
  errorDescription:
    "Bu form yüklenemedi veya oturumun süresi dolmuş olabilir. Önce hesabındaki ödeme durumunu kontrol et.",
  expiredTitle: "Ödeme oturumunun süresi doldu",
  expiredDescription:
    "Bu form kapatıldı. Yeni ödeme başlatmadan önce hesabındaki sonucu kontrol et; gerekirse planlara dönerek yeni bir oturum aç.",
  invalidTitle: "Geçersiz ödeme bağlantısı",
  invalidDescription:
    "Bu bağlantıyla güvenli ödeme açılamıyor. Hesabına veya üyelik planlarına dönerek devam et.",
  authTitle: "Hesap oturumun sona erdi",
  authDescription: "Ödeme formunu kullanmak için hesabına yeniden giriş yap.",
  retry: "Formu yeniden yükle",
  account: "Hesabım ve ödeme durumu",
  plans: "Planlara dön",
};
export type PortalCheckoutCopy = { [Key in keyof typeof TR]: string };
const COPY: Record<LanguageCode, PortalCheckoutCopy> = {
  pt: {
    title: "Pagamento seguro",
    subtitle:
      "Introduza os dados do cartão no formulário da iyzico. O formulário abre numa língua suportada pelo prestador.",
    provider: "Prestador de pagamentos",
    amount: "Valor a pagar",
    expires: "Validade da sessão",
    loading: "A carregar a sessão de pagamento…",
    formTitle: "Formulário de pagamento iyzico",
    statusNote:
      "A subscrição e os créditos só são ativados após verificação do resultado do prestador. Consulte o resultado na sua conta.",
    formHelp:
      "Se o formulário não aparecer ou o resultado não for claro, consulte primeiro o estado do pagamento na conta. Recarregar o formulário não inicia um novo pagamento.",
    errorTitle: "Sessão de pagamento indisponível",
    errorDescription:
      "Não foi possível carregar o formulário ou a sessão expirou. Consulte primeiro o estado do pagamento na conta.",
    expiredTitle: "Sessão de pagamento expirada",
    expiredDescription:
      "Este formulário foi encerrado. Consulte o resultado na conta antes de iniciar outro pagamento; regresse aos planos se precisar de nova sessão.",
    invalidTitle: "Ligação de pagamento inválida",
    invalidDescription:
      "O pagamento seguro não pode abrir com esta ligação. Continue através da conta ou dos planos.",
    authTitle: "A sessão da sua conta terminou",
    authDescription: "Inicie sessão novamente para usar o formulário de pagamento.",
    retry: "Recarregar formulário",
    account: "A minha conta e estado de pagamento",
    plans: "Voltar aos planos",
  },

  tr: TR,
  en: {
    title: "Secure checkout",
    subtitle:
      "Enter card details in iyzico's payment form. The form opens in a language supported by the provider.",
    provider: "Payment provider",
    amount: "Amount to pay",
    expires: "Session expiry",
    loading: "Loading checkout session…",
    formTitle: "iyzico payment form",
    statusNote:
      "Membership and credits activate only after the provider's payment result is verified. Check the result in your account.",
    formHelp:
      "If the form is missing or the result is unclear, check your account's payment status first. Reloading the form does not start a new payment.",
    errorTitle: "Checkout session unavailable",
    errorDescription:
      "This form could not be loaded or the session may have expired. Check your account's payment status first.",
    expiredTitle: "Checkout session expired",
    expiredDescription:
      "This form has been closed. Check the result in your account before starting another payment; return to plans if you need a new session.",
    invalidTitle: "Invalid checkout link",
    invalidDescription:
      "Secure checkout cannot open with this link. Continue through your account or membership plans.",
    authTitle: "Your account session has ended",
    authDescription: "Sign in to your account again to use the payment form.",
    retry: "Reload form",
    account: "My account and payment status",
    plans: "Back to plans",
  },
  de: {
    title: "Sicher bezahlen",
    subtitle:
      "Gib die Kartendaten im Zahlungsformular von iyzico ein. Das Formular wird in einer vom Anbieter unterstützten Sprache geöffnet.",
    provider: "Zahlungsanbieter",
    amount: "Zahlungsbetrag",
    expires: "Sitzung gültig bis",
    loading: "Zahlungssitzung wird geladen…",
    formTitle: "iyzico-Zahlungsformular",
    statusNote:
      "Mitgliedschaft und Guthaben werden erst nach Prüfung des Zahlungsergebnisses beim Anbieter aktiviert. Das Ergebnis findest du in deinem Konto.",
    formHelp:
      "Fehlt das Formular oder ist das Ergebnis unklar, prüfe zuerst den Zahlungsstatus in deinem Konto. Das Neuladen startet keine neue Zahlung.",
    errorTitle: "Zahlungssitzung nicht verfügbar",
    errorDescription:
      "Das Formular konnte nicht geladen werden oder die Sitzung ist abgelaufen. Prüfe zuerst den Zahlungsstatus in deinem Konto.",
    expiredTitle: "Zahlungssitzung abgelaufen",
    expiredDescription:
      "Dieses Formular wurde geschlossen. Prüfe vor einer weiteren Zahlung das Ergebnis in deinem Konto. Bei Bedarf kannst du über die Tarife eine neue Sitzung öffnen.",
    invalidTitle: "Ungültiger Zahlungslink",
    invalidDescription:
      "Mit diesem Link kann die sichere Zahlung nicht geöffnet werden. Fahre über dein Konto oder die Mitgliedschaftstarife fort.",
    authTitle: "Deine Kontositzung ist abgelaufen",
    authDescription: "Melde dich erneut an, um das Zahlungsformular zu nutzen.",
    retry: "Formular neu laden",
    account: "Mein Konto und Zahlungsstatus",
    plans: "Zurück zu den Tarifen",
  },
  fr: {
    title: "Paiement sécurisé",
    subtitle:
      "Saisissez les données de carte dans le formulaire de paiement iyzico. Il s’ouvre dans une langue prise en charge par le prestataire.",
    provider: "Prestataire de paiement",
    amount: "Montant à payer",
    expires: "Expiration de la session",
    loading: "Chargement de la session de paiement…",
    formTitle: "Formulaire de paiement iyzico",
    statusNote:
      "L’abonnement et les crédits sont activés uniquement après vérification du résultat auprès du prestataire. Consultez le résultat dans votre compte.",
    formHelp:
      "Si le formulaire ne s’affiche pas ou si le résultat est incertain, vérifiez d’abord le statut du paiement dans votre compte. Recharger le formulaire ne lance pas un nouveau paiement.",
    errorTitle: "Session de paiement indisponible",
    errorDescription:
      "Le formulaire n’a pas pu être chargé ou la session a expiré. Vérifiez d’abord le statut du paiement dans votre compte.",
    expiredTitle: "Session de paiement expirée",
    expiredDescription:
      "Ce formulaire a été fermé. Vérifiez le résultat dans votre compte avant de payer à nouveau. Revenez aux offres si une nouvelle session est nécessaire.",
    invalidTitle: "Lien de paiement invalide",
    invalidDescription:
      "Ce lien ne permet pas d’ouvrir le paiement sécurisé. Continuez depuis votre compte ou les offres d’abonnement.",
    authTitle: "Votre session a expiré",
    authDescription: "Reconnectez-vous à votre compte pour utiliser le formulaire de paiement.",
    retry: "Recharger le formulaire",
    account: "Mon compte et mes paiements",
    plans: "Retour aux offres",
  },
  it: {
    title: "Pagamento sicuro",
    subtitle:
      "Inserisci i dati della carta nel modulo di pagamento iyzico. Il modulo si apre in una lingua supportata dal fornitore.",
    provider: "Fornitore di pagamento",
    amount: "Importo da pagare",
    expires: "Scadenza della sessione",
    loading: "Caricamento della sessione di pagamento…",
    formTitle: "Modulo di pagamento iyzico",
    statusNote:
      "Abbonamento e crediti si attivano solo dopo la verifica dell’esito presso il fornitore. Controlla il risultato nel tuo account.",
    formHelp:
      "Se il modulo non appare o l’esito non è chiaro, controlla prima lo stato del pagamento nel tuo account. Ricaricare il modulo non avvia un nuovo pagamento.",
    errorTitle: "Sessione di pagamento non disponibile",
    errorDescription:
      "Impossibile caricare il modulo oppure la sessione è scaduta. Controlla prima lo stato del pagamento nel tuo account.",
    expiredTitle: "Sessione di pagamento scaduta",
    expiredDescription:
      "Il modulo è stato chiuso. Controlla l’esito nel tuo account prima di effettuare un altro pagamento. Torna ai piani per aprire una nuova sessione, se necessario.",
    invalidTitle: "Link di pagamento non valido",
    invalidDescription:
      "Non è possibile aprire il pagamento sicuro con questo link. Continua dal tuo account o dai piani di abbonamento.",
    authTitle: "La sessione dell’account è terminata",
    authDescription: "Accedi nuovamente per utilizzare il modulo di pagamento.",
    retry: "Ricarica il modulo",
    account: "Il mio account e i pagamenti",
    plans: "Torna ai piani",
  },
  es: {
    title: "Pago seguro",
    subtitle:
      "Introduce los datos de la tarjeta en el formulario de pago de iyzico. El formulario se abre en un idioma admitido por el proveedor.",
    provider: "Proveedor de pago",
    amount: "Importe a pagar",
    expires: "Caducidad de la sesión",
    loading: "Cargando la sesión de pago…",
    formTitle: "Formulario de pago de iyzico",
    statusNote:
      "La suscripción y los créditos se activan únicamente después de verificar el resultado con el proveedor. Consulta el resultado en tu cuenta.",
    formHelp:
      "Si no aparece el formulario o el resultado no está claro, comprueba primero el estado del pago en tu cuenta. Recargar el formulario no inicia un nuevo pago.",
    errorTitle: "Sesión de pago no disponible",
    errorDescription:
      "No se pudo cargar el formulario o la sesión ha caducado. Comprueba primero el estado del pago en tu cuenta.",
    expiredTitle: "La sesión de pago ha caducado",
    expiredDescription:
      "El formulario se ha cerrado. Comprueba el resultado en tu cuenta antes de realizar otro pago. Si necesitas una sesión nueva, vuelve a los planes.",
    invalidTitle: "Enlace de pago no válido",
    invalidDescription:
      "No se puede abrir el pago seguro con este enlace. Continúa desde tu cuenta o los planes de suscripción.",
    authTitle: "La sesión de tu cuenta ha finalizado",
    authDescription: "Vuelve a iniciar sesión para utilizar el formulario de pago.",
    retry: "Recargar formulario",
    account: "Mi cuenta y mis pagos",
    plans: "Volver a los planes",
  },
  ar: {
    title: "الدفع الآمن",
    subtitle:
      "أدخل بيانات البطاقة في نموذج الدفع الخاص بـ iyzico. يُفتح النموذج بإحدى اللغات التي يدعمها المزوّد.",
    provider: "مزوّد الدفع",
    amount: "المبلغ المطلوب",
    expires: "انتهاء صلاحية الجلسة",
    loading: "جارٍ تحميل جلسة الدفع…",
    formTitle: "نموذج الدفع iyzico",
    statusNote:
      "لا تُفعّل العضوية والأرصدة إلا بعد التحقق من نتيجة الدفع لدى المزوّد. يمكنك مراجعة النتيجة في حسابك.",
    formHelp:
      "إذا لم يظهر النموذج أو لم تتضح النتيجة، فتحقق أولاً من حالة الدفع في حسابك. إعادة تحميل النموذج لا تبدأ دفعة جديدة.",
    errorTitle: "جلسة الدفع غير متاحة",
    errorDescription:
      "تعذر تحميل النموذج أو ربما انتهت صلاحية الجلسة. تحقق أولاً من حالة الدفع في حسابك.",
    expiredTitle: "انتهت صلاحية جلسة الدفع",
    expiredDescription:
      "تم إغلاق هذا النموذج. راجع النتيجة في حسابك قبل بدء دفعة أخرى، وعد إلى الخطط لفتح جلسة جديدة عند الحاجة.",
    invalidTitle: "رابط دفع غير صالح",
    invalidDescription: "لا يمكن فتح الدفع الآمن بهذا الرابط. تابع من حسابك أو من خطط العضوية.",
    authTitle: "انتهت جلسة حسابك",
    authDescription: "سجّل الدخول مجددًا لاستخدام نموذج الدفع.",
    retry: "إعادة تحميل النموذج",
    account: "حسابي وحالة الدفع",
    plans: "العودة إلى الخطط",
  },
  ru: {
    title: "Безопасная оплата",
    subtitle:
      "Введите данные карты в платёжную форму iyzico. Она открывается на языке, который поддерживает провайдер.",
    provider: "Платёжный провайдер",
    amount: "Сумма к оплате",
    expires: "Сессия действительна до",
    loading: "Загрузка платёжной сессии…",
    formTitle: "Платёжная форма iyzico",
    statusNote:
      "Подписка и кредиты активируются только после проверки результата у провайдера. Результат доступен в вашем аккаунте.",
    formHelp:
      "Если форма не отображается или результат неясен, сначала проверьте статус оплаты в аккаунте. Перезагрузка формы не создаёт новый платёж.",
    errorTitle: "Платёжная сессия недоступна",
    errorDescription:
      "Не удалось загрузить форму или срок сессии истёк. Сначала проверьте статус оплаты в аккаунте.",
    expiredTitle: "Срок платёжной сессии истёк",
    expiredDescription:
      "Форма закрыта. Прежде чем платить повторно, проверьте результат в аккаунте. При необходимости вернитесь к тарифам и откройте новую сессию.",
    invalidTitle: "Недействительная платёжная ссылка",
    invalidDescription:
      "По этой ссылке нельзя открыть безопасную оплату. Продолжите через аккаунт или тарифы подписки.",
    authTitle: "Сессия аккаунта завершена",
    authDescription: "Войдите снова, чтобы использовать платёжную форму.",
    retry: "Перезагрузить форму",
    account: "Мой аккаунт и статус оплаты",
    plans: "Вернуться к тарифам",
  },
  zh: {
    title: "安全付款",
    subtitle: "请在 iyzico 的付款表单中输入银行卡信息。表单将使用支付服务商支持的语言。",
    provider: "支付服务商",
    amount: "应付金额",
    expires: "会话到期时间",
    loading: "正在加载付款会话…",
    formTitle: "iyzico 付款表单",
    statusNote: "会员和积分仅在核验支付服务商的付款结果后生效。请在账户中查看结果。",
    formHelp:
      "如果表单未显示或付款结果不明确，请先查看账户中的付款状态。重新加载表单不会发起新的付款。",
    errorTitle: "付款会话不可用",
    errorDescription: "无法加载表单，或会话可能已到期。请先查看账户中的付款状态。",
    expiredTitle: "付款会话已到期",
    expiredDescription:
      "此表单已关闭。再次付款前请先查看账户中的结果。如需新会话，请返回会员方案。",
    invalidTitle: "付款链接无效",
    invalidDescription: "无法通过此链接打开安全付款。请从账户或会员方案继续。",
    authTitle: "账户会话已结束",
    authDescription: "请重新登录账户后使用付款表单。",
    retry: "重新加载表单",
    account: "我的账户与付款状态",
    plans: "返回会员方案",
  },
};
export function usePortalCheckoutCopy() {
  const { i18n } = useTranslation();
  const requested = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const locale = Object.hasOwn(COPY, requested) ? (requested as LanguageCode) : "en";
  return { locale, copy: COPY[locale] };
}
