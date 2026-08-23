import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { CONSENT_CHANGED_EVENT, hasMarketingConsent } from "@/lib/consent";

const ADSENSE_SCRIPT_ID = "cliniga-education-adsense";
const ADSENSE_CLIENT = "ca-pub-3896490322101711";
const PRIVATE_ROUTE = /^\/(?:admin|auth|portal)(?:\/|$)/;

function adSenseScripts() {
  return Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com"]',
    ),
  );
}

function removeAdSense() {
  if (typeof document === "undefined") return false;
  const scripts = adSenseScripts();
  scripts.forEach((script) => script.remove());
  return scripts.length > 0;
}

function loadAdSense(pathname: string) {
  if (
    typeof document === "undefined" ||
    PRIVATE_ROUTE.test(pathname) ||
    !hasMarketingConsent()
  ) {
    return;
  }
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

export function AdSenseLoader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (PRIVATE_ROUTE.test(pathname)) {
      if (removeAdSense()) {
        window.location.reload();
      }
      return;
    }

    loadAdSense(pathname);

    const handleConsentChange = () => {
      if (hasMarketingConsent()) {
        loadAdSense(pathname);
        return;
      }

      if (removeAdSense()) {
        window.location.reload();
      }
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
  }, [pathname]);

  return null;
}
