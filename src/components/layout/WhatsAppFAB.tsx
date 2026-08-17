import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/data/site";

export function WhatsAppFAB() {
  const { t } = useTranslation();
  return (
    <a
      href={buildWhatsAppLink(t("cta.whatsapp"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("cta.whatsapp")}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-premium transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
