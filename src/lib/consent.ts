export type ConsentValue = "accepted" | "essential";

export const CONSENT_STORAGE_KEY = "cliniga-education-cookie-consent";
export const CONSENT_CHANGED_EVENT = "cliniga-education:consent-changed";
export const CONSENT_OPEN_EVENT = "cliniga-education:consent-open";

let sessionConsent: ConsentValue | null = null;
let storageWriteFailed = false;
let storedAcceptanceChecked = false;

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  if (storageWriteFailed) return sessionConsent;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "accepted" && !storedAcceptanceChecked) {
      // Read-only storage must not restore an acceptance that cannot be withdrawn.
      storedAcceptanceChecked = true;
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
      } catch {
        storageWriteFailed = true;
        return sessionConsent;
      }
    }
    return raw === "accepted" || raw === "essential" ? raw : null;
  } catch {
    return sessionConsent;
  }
}

export function writeConsent(value: ConsentValue) {
  sessionConsent = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    storageWriteFailed = false;
  } catch {
    storageWriteFailed = true;
    // A browser may block persistent storage; respect the choice in this tab.
    if (value === "essential") {
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        /* A fresh page will fail closed when this old acceptance is read-only. */
      }
    }
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
}

export function hasMarketingConsent() {
  return readConsent() === "accepted";
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  window.dispatchEvent(new Event("cliniga:cookie-preferences"));
}
