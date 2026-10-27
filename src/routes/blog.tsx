import { createFileRoute, redirect } from "@tanstack/react-router";
import { europeBlogPath, isEuropeBlogLocale } from "@/lib/europe-blog";

// Keep the established entry URL while sending readers to an indexable language URL.
export const Route = createFileRoute("/blog")({
  beforeLoad: () => {
    let saved = "tr";
    if (typeof window !== "undefined") {
      try {
        saved = window.localStorage.getItem("lang") || "tr";
      } catch {
        /* Preference storage is optional. */
      }
    }
    const language = isEuropeBlogLocale(saved) ? saved : "tr";
    throw redirect({ href: europeBlogPath(language), statusCode: 302 });
  },
});
