import { useTranslation } from "react-i18next";

import { PUBLIC_STUDENT_STORIES } from "@/data/about-content";

const TITLES: Record<string, string> = {
  tr: "Öğrencilerin deneyimleri",
  en: "Student experiences",
  de: "Erfahrungen von Studierenden",
  fr: "Expériences des étudiants",
  it: "Esperienze degli studenti",
  es: "Experiencias de estudiantes",
  ar: "تجارب الطلاب",
  ru: "Опыт студентов",
  zh: "学生经历",
};

export function StudentStories() {
  const { i18n } = useTranslation();
  if (PUBLIC_STUDENT_STORIES.length === 0) return null;
  const language = (i18n.resolvedLanguage || i18n.language || "tr").split("-")[0];

  return (
    <section className="container-prose pb-16 md:pb-20" aria-labelledby="student-stories-heading">
      <h2 id="student-stories-heading" className="font-display text-3xl font-semibold text-navy">
        {TITLES[language] || TITLES.en}
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PUBLIC_STUDENT_STORIES.map((story) => (
          <article key={story.id} className="rounded-2xl border border-border/70 bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-navy">{story.name}</h3>
            <p className="mt-1 text-sm font-medium text-teal">{story.service}</p>
            <blockquote className="mt-5 text-sm leading-relaxed text-foreground/85">
              {story.quote}
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{story.context}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.support}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.outcome}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
