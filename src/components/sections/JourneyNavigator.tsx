import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, FileCheck2, Search } from "lucide-react";

const ROUTES = [
  { icon: Search, intent: "university" },
  { icon: FileCheck2, intent: "abroad" },
  { icon: BookOpenCheck, intent: "visa" },
  { icon: ChartNoAxesCombined, intent: "stats" },
] as const;

export function JourneyNavigator() {
  const { t } = useTranslation();
  const routes = t("quickStart.routes", { returnObjects: true }) as {
    title: string;
    detail: string;
  }[];
  return (
    <section
      className="atlas-quick-start relative z-10 px-4"
      aria-labelledby="journey-navigator-title"
    >
      <div
        className="container-prose rounded-3xl border border-border/70 bg-card p-4 md:p-6"
        data-sc-in
        data-sc-stagger="45"
      >
        <div className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              {t("quickStart.eyebrow")}
            </p>
            <h2
              id="journey-navigator-title"
              className="mt-1 font-display text-2xl font-semibold text-navy md:text-3xl"
            >
              {t("quickStart.title")}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("quickStart.description")}
          </p>
        </div>
        <nav
          className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4"
          aria-label={t("quickStart.label")}
        >
          {ROUTES.map(({ icon: Icon, intent }, index) => (
            <a
              key={intent}
              href={`/iletisim?intent=${intent}`}
              className="group flex min-h-[100px] items-center gap-3 rounded-2xl border border-transparent bg-muted/45 p-4 transition duration-200 hover:border-teal/25 hover:bg-background hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-white transition-colors group-hover:bg-teal">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-semibold text-navy">
                  {routes[index].title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {routes[index].detail}
                </span>
              </span>
              <ArrowRight
                className="ms-auto h-4 w-4 shrink-0 text-teal transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
