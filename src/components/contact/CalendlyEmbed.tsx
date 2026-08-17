import { InlineWidget } from "react-calendly";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";

import { SITE } from "@/data/site";
import { Card, CardContent } from "@/components/ui/card";

export function CalendlyEmbed() {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden border-border/70">
      <CardContent className="p-0">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
            <Calendar className="h-4 w-4 text-teal" />
            {t("contact.appointment.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("contact.appointment.desc")}
          </p>
        </div>
        <div style={{ minWidth: 320, height: 680 }}>
          <InlineWidget
            url={SITE.calendlyUrl}
            styles={{ height: "680px", width: "100%" }}
            pageSettings={{
              backgroundColor: "ffffff",
              hideEventTypeDetails: false,
              hideLandingPageDetails: false,
              primaryColor: "0E7C86",
              textColor: "0B1F3A",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
