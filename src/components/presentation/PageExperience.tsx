import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { List, Pause, Play, ArrowUp } from "lucide-react";
import { usePresentationMotion } from "@/lib/presentation-motion";
import { presentationCopy } from "@/components/sections/presentation-copy";
import { isTaskPage, pageCopy, pageKind, type PageKind } from "./page-experience";
import { useScrollCraft } from "./scrollcraft-runtime";
import { europeBlogLocaleForPath } from "@/lib/europe-blog";
import "./education-pages.css";
import "./education-scrollcraft.css";

type Chapter = { id: string; title: string };

export function RouteExperience({ pathname, children }: { pathname: string; children: ReactNode }) {
  const kind = pageKind(pathname);
  if (kind === "home") return children;
  return (
    <PageExperience
      key={pathname}
      kind={kind}
      languageHint={europeBlogLocaleForPath(pathname) || undefined}
    >
      {children}
    </PageExperience>
  );
}

function PageExperience({
  kind,
  languageHint,
  children,
}: {
  kind: PageKind;
  languageHint?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [current, setCurrent] = useState("");
  const { i18n } = useTranslation();
  const language = kind === "legal" ? "tr" : languageHint || i18n.resolvedLanguage || "tr";
  const copy = pageCopy(language);
  const motion = presentationCopy(language);
  const { paused, reduced, toggle } = usePresentationMotion();
  const task = isTaskPage(kind);

  useEffect(() => {
    const element = root.current;
    if (!element || task) return;
    let pending = 0;
    let nextId = 0;
    const assigned = new Map<HTMLElement, string>();
    const update = () => {
      pending = 0;
      const headings = [...element.querySelectorAll<HTMLElement>("h2")]
        .filter(
          (heading) =>
            !heading.closest("[data-page-tools], form, dialog, [role=dialog], [hidden]") &&
            heading.textContent?.trim(),
        )
        .slice(0, 16);
      const next = headings.map((heading) => {
        if (!heading.id) {
          let id: string;
          do {
            id = `education-chapter-${nextId++}`;
          } while (document.getElementById(id));
          heading.id = id;
          assigned.set(heading, heading.id);
        }
        return { id: heading.id, title: heading.textContent!.trim() };
      });
      setChapters((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    };
    update();
    const observer = new MutationObserver((records) => {
      if (records.every((record) => (record.target as Element).closest?.("[data-page-tools]")))
        return;
      if (!pending) pending = requestAnimationFrame(update);
    });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(pending);
      assigned.forEach((id, heading) => {
        if (heading.id === id) heading.removeAttribute("id");
      });
    };
  }, [language, task]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const value = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      progress.current?.style.setProperty("--page-progress", String(value));
      const visible = chapters.filter(({ id }) => {
        const heading = document.getElementById(id);
        return heading && heading.getBoundingClientRect().top <= 180;
      });
      setCurrent(visible.at(-1)?.id || chapters[0]?.id || "");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [chapters]);

  useScrollCraft(root, paused, `${kind}:${language}`);
  return (
    <div
      ref={root}
      className={`education-pages page-${kind}`}
      data-page-kind={kind}
      data-motion={paused ? "paused" : "active"}
    >
      <div ref={progress} className="page-reading-progress" aria-hidden="true">
        <span />
      </div>
      {children}
      <aside className="page-tools" data-page-tools aria-label={copy.contents}>
        {!task && chapters.length > 1 && (
          <details>
            <summary>
              <List aria-hidden="true" />
              <span>{copy.contents}</span>
            </summary>
            <nav aria-label={copy.contents}>
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  aria-current={current === chapter.id ? "location" : undefined}
                  onClick={(event) =>
                    event.currentTarget.closest("details")?.removeAttribute("open")
                  }
                >
                  {chapter.title}
                </a>
              ))}
            </nav>
          </details>
        )}
        <button
          type="button"
          onClick={toggle}
          disabled={reduced}
          aria-pressed={paused}
          aria-label={reduced ? motion.reduced : paused ? motion.play : motion.pause}
          title={reduced ? motion.reduced : paused ? motion.play : motion.pause}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
        <a href="#main-content" aria-label={copy.top} title={copy.top}>
          <ArrowUp aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}
