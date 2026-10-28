const COPY = {
  tr: {
    location: "Roma, İtalya · çevrim içi danışmanlık",
    country:
      "Ana iletişim kanalımız WhatsApp’tır. Telefon ve WhatsApp için İtalya ülke kodu +39’u kullanın.",
    address: "Adres bilgisi",
    addressPending: "[DOLDUR: açık adres, posta kodu ve yüz yüze görüşme kabul durumu]",
    response: "Ortalama yanıt süresi",
    responsePending: "[DOLDUR: doğrulanmış ortalama yanıt süresi]",
    timeZone: "Saat dilimi: Roma, İtalya (Europe/Rome)",
    call: "Aynı numarayı telefonla ara",
    preference: "Görüşme saati talebiniz, ekibimiz sizinle iletişim kurduktan sonra kesinleşir.",
    receipt: "Talep numaranız kaydınızı takip etmek içindir; görüşme saatinin onayı değildir.",
    package: "İlgilendiğiniz paket",
  },
  en: {
    location: "Rome, Italy · online consulting",
    country:
      "WhatsApp is our primary contact channel. Calls and WhatsApp use Italy’s +39 country code.",
    address: "Address details",
    addressPending: "[DOLDUR: street address, postcode and in-person meeting availability]",
    response: "Average response time",
    responsePending: "[DOLDUR: verified average response time]",
    timeZone: "Time zone: Rome, Italy (Europe/Rome)",
    call: "Call the same number",
    preference: "Your requested meeting time will be confirmed after our team contacts you.",
    receipt:
      "Your request number identifies the saved request; it does not confirm a meeting time.",
    package: "Package of interest",
  },
} as const;

export const contactCopy = (language: string) =>
  COPY[language.split("-")[0] === "tr" ? "tr" : "en"];
