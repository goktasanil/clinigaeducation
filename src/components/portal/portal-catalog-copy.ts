import { useTranslation } from "react-i18next";

import type { LanguageCode } from "@/i18n";

type CatalogCopy = {
  searchMin: string;
  programsOnly: string;
  officialCatalog: string;
  requestCatalog: string;
  requesting: string;
  requestSuccess: string;
  requestError: string;
};

const COPY: Record<LanguageCode, CatalogCopy> = {
  tr: { searchMin: "En az 2 harf yazarak ara", programsOnly: "Genel alan gösterilmez. Yalnızca kuruma ait doğrulanmış programlar yayınlanır.", officialCatalog: "Resmî kataloğu aç", requestCatalog: "Gerçek bölüm listesini ekleme talebi gönder", requesting: "Talep gönderiliyor…", requestSuccess: "Resmî bölüm kataloğu inceleme sırasına alındı.", requestError: "Katalog talebi gönderilemedi. Lütfen tekrar deneyin." },
  en: { searchMin: "Type at least 2 letters to search", programsOnly: "Generic fields are not shown. Only verified programs belonging to the selected institution are published.", officialCatalog: "Open official catalogue", requestCatalog: "Request the verified program list", requesting: "Sending request…", requestSuccess: "The official program catalogue was added to the review queue.", requestError: "The catalogue request could not be sent. Please try again." },
  de: { searchMin: "Mindestens 2 Buchstaben eingeben", programsOnly: "Allgemeine Fachbereiche werden nicht angezeigt. Es erscheinen nur verifizierte Programme der ausgewählten Hochschule.", officialCatalog: "Offiziellen Katalog öffnen", requestCatalog: "Verifizierte Programmliste anfragen", requesting: "Anfrage wird gesendet…", requestSuccess: "Der offizielle Programmkatalog wurde zur Prüfung vorgemerkt.", requestError: "Die Kataloganfrage konnte nicht gesendet werden. Bitte erneut versuchen." },
  fr: { searchMin: "Saisissez au moins 2 lettres", programsOnly: "Les domaines génériques ne sont pas affichés. Seuls les programmes vérifiés de l’établissement sélectionné sont publiés.", officialCatalog: "Ouvrir le catalogue officiel", requestCatalog: "Demander la liste vérifiée des programmes", requesting: "Envoi de la demande…", requestSuccess: "Le catalogue officiel a été ajouté à la file de vérification.", requestError: "La demande de catalogue n’a pas pu être envoyée. Réessayez." },
  it: { searchMin: "Scrivi almeno 2 lettere", programsOnly: "Non vengono mostrati campi generici. Sono pubblicati solo i programmi verificati dell’istituto selezionato.", officialCatalog: "Apri il catalogo ufficiale", requestCatalog: "Richiedi l’elenco verificato dei programmi", requesting: "Invio richiesta…", requestSuccess: "Il catalogo ufficiale è stato aggiunto alla coda di revisione.", requestError: "Impossibile inviare la richiesta del catalogo. Riprova." },
  es: { searchMin: "Escribe al menos 2 letras", programsOnly: "No se muestran áreas genéricas. Solo se publican programas verificados de la institución seleccionada.", officialCatalog: "Abrir catálogo oficial", requestCatalog: "Solicitar la lista verificada de programas", requesting: "Enviando solicitud…", requestSuccess: "El catálogo oficial se añadió a la cola de revisión.", requestError: "No se pudo enviar la solicitud del catálogo. Inténtalo de nuevo." },
  ar: { searchMin: "اكتب حرفين على الأقل للبحث", programsOnly: "لا تُعرض مجالات عامة. يتم نشر البرامج الموثقة التابعة للمؤسسة المختارة فقط.", officialCatalog: "فتح الكتالوج الرسمي", requestCatalog: "طلب قائمة البرامج الموثقة", requesting: "جارٍ إرسال الطلب…", requestSuccess: "تمت إضافة الكتالوج الرسمي إلى قائمة المراجعة.", requestError: "تعذر إرسال طلب الكتالوج. حاول مرة أخرى." },
  ru: { searchMin: "Введите минимум 2 буквы", programsOnly: "Общие направления не показываются. Публикуются только проверенные программы выбранного учреждения.", officialCatalog: "Открыть официальный каталог", requestCatalog: "Запросить проверенный список программ", requesting: "Запрос отправляется…", requestSuccess: "Официальный каталог программ добавлен в очередь проверки.", requestError: "Не удалось отправить запрос каталога. Повторите попытку." },
  zh: { searchMin: "至少输入 2 个字符进行搜索", programsOnly: "不会显示笼统学科。仅发布所选院校已核验的真实项目。", officialCatalog: "打开官方目录", requestCatalog: "申请添加已核验项目列表", requesting: "正在提交…", requestSuccess: "官方项目目录已加入审核队列。", requestError: "无法提交目录申请，请重试。" },
};

export function usePortalCatalogCopy() {
  const { i18n } = useTranslation();
  const raw = i18n.resolvedLanguage || i18n.language || "tr";
  const normalized = raw.split("-")[0] as LanguageCode;
  const language: LanguageCode = normalized in COPY ? normalized : "tr";
  return COPY[language];
}
