import { useSyncExternalStore } from "react";

const PREFERENCE_KEY = "cliniga-motion-paused";
const PREFERENCE_EVENT = "cliniga:motion-preference";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
let memoryPaused = false;

function isPaused() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia(REDUCED_MOTION).matches) return true;
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) === "true";
  } catch {
    return memoryPaused;
  }
}

function subscribe(listener: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  window.addEventListener(PREFERENCE_EVENT, listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener(PREFERENCE_EVENT, listener);
  };
}

export function usePresentationMotion() {
  const paused = useSyncExternalStore(subscribe, isPaused, () => true);
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  return {
    paused,
    reduced,
    toggle: () => {
      memoryPaused = !paused;
      try {
        window.localStorage.setItem(PREFERENCE_KEY, String(memoryPaused));
      } catch {
        // Keep the control usable when browser preference storage is blocked.
      }
      window.dispatchEvent(new Event(PREFERENCE_EVENT));
    },
  };
}

export function journeyProgress(top: number, height: number, viewport: number) {
  const travel = height - viewport;
  return travel > 0 ? Math.min(1, Math.max(0, (76 - top) / travel)) : 0;
}

export function journeyStep(progress: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}
