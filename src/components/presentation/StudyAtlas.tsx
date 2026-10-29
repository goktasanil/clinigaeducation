import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePresentationMotion } from "@/lib/presentation-motion";
import { AtlasContext } from "./study-destinations";
import { useScrollCraft } from "./scrollcraft-runtime";

export function StudyAtlas({ children }: { children: ReactNode }) {
  const [selected, select] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const { paused } = usePresentationMotion();
  const { i18n } = useTranslation();
  useScrollCraft(root, paused, i18n.resolvedLanguage || "tr");
  return (
    <AtlasContext.Provider value={{ selected, select }}>
      <div ref={root} className="scrollcraft-home" data-motion={paused ? "paused" : "active"}>
        {children}
      </div>
    </AtlasContext.Provider>
  );
}
