export type ConsentValue = "accepted" | "essential";

export const CONSENT_STORAGE_KEY = "cliniga-education-cookie-consent";
export const CONSENT_CHANGED_EVENT = "cliniga-education:consent-changed";
export const CONSENT_OPEN_EVENT = "cliniga-education:consent-open";

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return raw === "accepted" || raw === "essential" ? raw : null;
}

export function writeConsent(value: ConsentValue) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
}

export function hasMarketingConsent() {
  return readConsent() === "accepted";
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
