import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePresentationMotion } from "@/lib/presentation-motion";
import { AtlasContext } from "./study-destinations";

type ScrollCraftInstance = { destroy: () => void };
type ScrollCraftRuntime = { mount: (root: HTMLElement) => ScrollCraftInstance };
declare global {
  interface Window {
    ScrollCraft?: ScrollCraftRuntime;
  }
}

let runtimePromise: Promise<ScrollCraftRuntime> | undefined;
function loadRuntime() {
  if (window.ScrollCraft) return Promise.resolve(window.ScrollCraft);
  if (!runtimePromise) {
    runtimePromise = new Promise<ScrollCraftRuntime>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${import.meta.env.BASE_URL}scrollcraft/scrollcraft.js`;
      script.async = true;
      script.onload = () => {
        if (window.ScrollCraft) resolve(window.ScrollCraft);
        else reject(new Error("ScrollCraft runtime did not initialize"));
      };
      script.onerror = () => {
        script.remove();
        runtimePromise = undefined;
        reject(new Error("ScrollCraft runtime could not be loaded"));
      };
      document.head.append(script);
    });
  }
  return runtimePromise;
}

export function StudyAtlas({ children }: { children: ReactNode }) {
  const [selected, select] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const { paused } = usePresentationMotion();
  const { i18n } = useTranslation();
  useEffect(() => {
    const element = root.current;
    if (!element || paused) return;
    let cancelled = false;
    let instance: ScrollCraftInstance | undefined;
    const start = async () => {
      // Keep the upstream runtime unchanged and use scoped brand styles.
      const runtime = await loadRuntime();
      if (cancelled) return;
      instance = runtime.mount(element);
      element.dataset.scReady = "true";
    };
    void start().catch(() => element.removeAttribute("data-sc-ready"));
    return () => {
      cancelled = true;
      instance?.destroy();
      element.removeAttribute("data-sc-ready");
    };
  }, [paused, i18n.resolvedLanguage]);
  return (
    <AtlasContext.Provider value={{ selected, select }}>
      <div ref={root} className="scrollcraft-home" data-motion={paused ? "paused" : "active"}>
        {children}
      </div>
    </AtlasContext.Provider>
  );
}
