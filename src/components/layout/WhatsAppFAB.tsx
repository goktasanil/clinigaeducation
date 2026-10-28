import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/data/site";

export function WhatsAppFAB() {
  const { t } = useTranslation();
  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("cta.whatsapp")}
      className="fixed bottom-5 end-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#087d53] text-white shadow-premium transition-transform hover:bg-[#066643] focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-4"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
