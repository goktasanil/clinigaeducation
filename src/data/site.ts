export const SITE = {
  brand: "CliniGA Education",
  brandShort: "CliniGA",
  email: "info@clinigaeducation.com",
  phone: "+393446759253",
  phoneDisplay: "+39 344 675 9253",
  whatsapp: "393446759253", // international format, no +
  whatsappDisplay: "+39 344 675 9253",
  address: "Roma, İtalya",
  countryCode: "IT",
  contactTimeZone: "Europe/Rome",
  primaryContact: "whatsapp",
} as const;

const DEFAULT_WHATSAPP_SERVICE = "yurt dışı eğitim ve akademik danışmanlık";

/** Accept a service name, or preserve a complete contextual message from a blog. */
export const buildWhatsAppLink = (messageOrService?: string) => {
  const value = messageOrService?.trim();
  const isButtonLabel = !value || /whats\s?app/i.test(value);
  const isCompleteMessage =
    value &&
    (/[\r\n]|https?:\/\//i.test(value) ||
      /^(merhaba|hello|hi\b|guten tag|hallo|bonjour|ciao|hola|привет|здравствуйте|مرحب|नमस्ते|你好)/iu.test(
        value,
      ));
  const message = isCompleteMessage
    ? value
    : `Merhaba, ${isButtonLabel ? DEFAULT_WHATSAPP_SERVICE : value} hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
};

export const buildConsultationEmailLink = (subject?: string, body?: string) => {
  const params = new URLSearchParams({
    subject: subject || "Ücretsiz ön görüşme talebi",
    body:
      body ||
      "Merhaba CliniGA Education,\n\nYurt dışı eğitim hedeflerim için ücretsiz ön görüşme planlamak istiyorum.\n\nAd Soyad:\nHedef ülke / program:\nBaşlangıç dönemi:\nTelefon:\n",
  });
  return `mailto:${SITE.email}?${params.toString()}`;
};

export function openCalendly() {
  if (typeof window === "undefined") return;
  window.location.assign("/iletisim#randevu");
}
