import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

import { LANGUAGES, setLanguage, type LanguageCode } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const activeCode = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];
  const current = LANGUAGES.find((l) => l.code === (activeCode as LanguageCode)) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-10 gap-2 text-sm"
          aria-label={`Language · ${current.label}`}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium" aria-hidden="true">{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => void setLanguage(lang.code)}
            className="gap-2"
          >
            <span className="text-base" aria-hidden="true">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {lang.code === current.code && <Check className="h-4 w-4 text-teal" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
