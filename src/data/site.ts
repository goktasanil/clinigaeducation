export const SITE = {
  brand: "CliniGA Education",
  brandShort: "CliniGA",
  email: "clinigaeducation@gmail.com",
  whatsapp: "393446759253", // international format, no +
  whatsappDisplay: "+39 344 675 9253",
  // Replace with the real Calendly URL when the account is created.
  calendlyUrl: "https://calendly.com/clinigaeducation/discovery-call",
  address: "Roma, İtalya",
} as const;

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const openCalendly = () => {
  if (typeof window !== "undefined") {
    window.open(SITE.calendlyUrl, "_blank", "noopener,noreferrer");
  }
};
