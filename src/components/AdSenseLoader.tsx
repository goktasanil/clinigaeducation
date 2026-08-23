import { useEffect } from "react";

import { CONSENT_CHANGED_EVENT, hasMarketingConsent } from "@/lib/consent";

const ADSENSE_SCRIPT_ID = "cliniga-education-adsense";
const ADSENSE_CLIENT = "ca-pub-3896490322101711";
const PRIVATE_ROUTE = /^\/(?:admin|auth|portal)(?:\/|$)/;

function isPublicPage() {
  return typeof window !== "undefined" && !PRIVATE_ROUTE.test(window.location.pathname);
}

function loadAdSense() {
  if (typeof document === "undefined" || !isPublicPage() || !hasMarketingConsent()) return;
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

export function AdSenseLoader() {
  useEffect(() => {
    loadAdSense();

    const handleConsentChange = () => {
      if (hasMarketingConsent()) {
        loadAdSense();
        return;
      }

      if (document.getElementById(ADSENSE_SCRIPT_ID)) {
        window.location.reload();
      }
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
  }, []);

  return null;
}
