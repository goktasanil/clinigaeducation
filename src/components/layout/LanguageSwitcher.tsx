import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";

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
          className="min-h-11 gap-2 rounded-full border border-navy/15 bg-white px-3 text-sm hover:border-teal/40 hover:bg-teal/5"
          aria-label={`Language · ${current.label}`}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium" aria-hidden="true">
            {current.flag}
          </span>
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronDown
            className="h-3 w-3 opacity-60 transition-transform [[data-state=open]_&]:rotate-180"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(32rem,80dvh)] min-w-52 overflow-y-auto rounded-2xl p-2"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => void setLanguage(lang.code)}
            className="min-h-10 gap-3 rounded-lg"
          >
            <span className="text-base" aria-hidden="true">
              {lang.flag}
            </span>
            <span className="flex-1" lang={lang.code}>
              {lang.label}
            </span>
            {lang.code === current.code && (
              <Check className="h-4 w-4 text-teal" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
