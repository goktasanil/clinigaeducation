import { describe, expect, it } from "vitest";

import { SITE, buildConsultationEmailLink, buildWhatsAppLink } from "./site";

describe("public contact channels", () => {
  it("uses the same international phone number for calls and WhatsApp", () => {
    expect(SITE.phone.replace(/\D/g, "")).toBe(SITE.whatsapp);
    expect(SITE.phoneDisplay).toBe(SITE.whatsappDisplay);
    expect(new URL(buildConsultationEmailLink()).pathname).toBe("info@clinigaeducation.com");
  });

  it("writes a meaningful enquiry instead of copying the button label", () => {
    const expected =
      "Merhaba, yurt dışı eğitim ve akademik danışmanlık hakkında bilgi almak istiyorum.";
    expect(new URL(buildWhatsAppLink()).searchParams.get("text")).toBe(expected);
    expect(new URL(buildWhatsAppLink("WhatsApp'tan Yaz")).searchParams.get("text")).toBe(expected);
    expect(new URL(buildWhatsAppLink("Message on WhatsApp")).searchParams.get("text")).toBe(
      expected,
    );
    expect(new URL(buildWhatsAppLink("tez danışmanlığı")).searchParams.get("text")).toBe(
      "Merhaba, tez danışmanlığı hakkında bilgi almak istiyorum.",
    );
  });

  it("preserves contextual multilingual article messages and encoded links", () => {
    const message =
      "Hello, I would like to discuss this article.\nVisa & funding\nhttps://www.clinigaeducation.com/en/blog?country=IT&topic=funding";
    const url = new URL(buildWhatsAppLink(message));
    expect(url.pathname).toBe(`/${SITE.whatsapp}`);
    expect(url.searchParams.get("text")).toBe(message);
    const singleLine = "Merhaba, tez danışmanlığı hakkında bilgi almak istiyorum.";
    expect(new URL(buildWhatsAppLink(singleLine)).searchParams.get("text")).toBe(singleLine);
  });
});
