import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { CONSENT_OPEN_EVENT, readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export function CookieConsent() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const shouldFocus = useRef(false);
  const copy = (i18n.resolvedLanguage || "tr").startsWith("tr")
    ? {
        title: "Çerez tercihleri",
        description:
          "Zorunlu depolama sitenin çalışması için kullanılır. Reklamlar yalnızca tercihinizle yüklenir; bu tercihi dilediğiniz zaman değiştirebilirsiniz.",
        policy: "Çerez Politikası",
        essential: "Zorunlu depolama",
        always: "Her zaman etkin",
        marketing: "Reklam çerezleri",
        detail: "Google AdSense reklamlarının yüklenmesine izin ver.",
        reject: "Yalnızca zorunlu",
        save: "Tercihlerimi kaydet",
        accept: "Tümünü kabul et",
        close: "Tercih panelini kapat",
      }
    : {
        title: "Cookie preferences",
        description:
          "Essential storage keeps the site working. Advertising loads only with your permission. You can change this choice at any time.",
        policy: "Cookie Policy",
        essential: "Essential storage",
        always: "Always enabled",
        marketing: "Advertising cookies",
        detail: "Allow Google AdSense advertising to load.",
        reject: "Essential only",
        save: "Save preferences",
        accept: "Accept all",
        close: "Close preferences",
      };

  useEffect(() => {
    if (!readConsent()) {
      const timer = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const open = () => {
      opener.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      shouldFocus.current = true;
      setMarketing(readConsent() === "accepted");
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (visible && shouldFocus.current) {
      panel.current?.focus();
      shouldFocus.current = false;
    }
  }, [visible]);

  const close = () => {
    setVisible(false);
    opener.current?.focus();
  };

  const decide = (value: ConsentValue) => {
    writeConsent(value);
    close();
  };

  if (!visible) return null;

  return (
    <aside
      ref={panel}
      role="dialog"
      aria-labelledby="cookie-preferences-title"
      aria-describedby="cookie-preferences-description"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      className="fixed inset-x-3 bottom-3 z-[100] ml-auto max-h-[85dvh] max-w-xl overflow-y-auto rounded-xl border border-white/15 bg-navy p-5 text-navy-foreground shadow-2xl outline-offset-4 md:bottom-5 md:right-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="cookie-preferences-title" className="font-display text-lg font-semibold">
          {copy.title}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label={copy.close}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p
        id="cookie-preferences-description"
        className="mt-2 text-sm leading-relaxed text-navy-foreground/85"
      >
        {copy.description}{" "}
        <Link to="/cerez-politikasi" className="font-semibold text-gold hover:underline">
          {copy.policy}
        </Link>
        .
      </p>
      <div className="mt-4 divide-y divide-white/15 rounded-lg border border-white/15 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <span>{copy.essential}</span>
          <span className="text-xs text-white/70">{copy.always}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <label htmlFor="advertising-consent" className="cursor-pointer text-sm">
            <span className="font-semibold">{copy.marketing}</span>
            <span className="mt-1 block text-xs text-white/70">{copy.detail}</span>
          </label>
          <Switch
            id="advertising-consent"
            checked={marketing}
            onCheckedChange={setMarketing}
            className="shrink-0 data-[state=checked]:bg-teal data-[state=unchecked]:bg-white/30"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => decide("essential")}
          className="min-h-11 rounded-md border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          {copy.reject}
        </button>
        <button
          type="button"
          onClick={() => decide(marketing ? "accepted" : "essential")}
          className="min-h-11 rounded-md border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          {copy.save}
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="min-h-11 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:brightness-105"
        >
          {copy.accept}
        </button>
      </div>
    </aside>
  );
}
