import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { CONSENT_OPEN_EVENT, readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) {
      const timer = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const decide = (value: ConsentValue) => {
    writeConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Çerez ve reklam tercihleri"
      className="fixed inset-x-3 bottom-3 z-[100] ml-auto max-w-xl rounded-xl border border-white/15 bg-navy p-4 text-navy-foreground shadow-2xl md:bottom-5 md:right-5"
    >
      <p className="text-sm leading-relaxed text-navy-foreground/85">
        Zorunlu depolamayı siteyi çalıştırmak için kullanıyoruz. Google AdSense yalnızca “Tümünü
        kabul et” seçeneğini seçerseniz yüklenir. Ayrıntılar için{" "}
        <Link to="/gizlilik" className="font-semibold text-gold hover:underline">
          Gizlilik Politikası
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => decide("essential")}
          className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Yalnızca zorunlu
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:brightness-105"
        >
          Tümünü kabul et
        </button>
      </div>
    </aside>
  );
}
