import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";

import { SERVICES } from "@/data/services";

const COLORS = [
  "bg-[#e0f1f0] text-teal",
  "bg-[#e6edff] text-[#315fd6]",
  "bg-[#fae8ec] text-[#a64362]",
  "bg-[#eee8fa] text-[#7350a7]",
  "bg-[#f7edda] text-[#946722]",
  "bg-[#e8eff4] text-navy",
];

export function ServicesGrid() {
  const { t } = useTranslation();
  return (
    <section className="container-prose py-20 md:py-28">
      <div className="grid items-end gap-5 md:grid-cols-[1fr_.7fr]">
        <div>
          <p className="text-sm font-semibold text-teal">{t("nav.services")}</p>
          <h2 className="education-section-heading mt-3">{t("services.title")}</h2>
        </div>
        <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
          {t("services.subtitle")}
        </p>
      </div>
      <div className="mt-10 grid gap-x-10 md:grid-cols-2">
        {SERVICES.map(({ key, slug, icon: Icon }, index) => (
          <article key={key} className="group flex gap-5 border-t border-navy/15 py-7">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${COLORS[index % COLORS.length]}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-navy">
                <Link
                  to="/hizmetler/$slug"
                  params={{ slug }}
                  className="inline-flex items-start justify-between gap-4 hover:text-teal"
                >
                  {t(`services.${key}.title`)}
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 rtl:-rotate-90" />
                </Link>
              </h3>
              <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
                {t(`services.${key}.desc`)}
              </p>
              <Link
                to="/hizmetler/$slug"
                params={{ slug }}
                className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-teal underline-offset-4 hover:underline"
              >
                {t("cta.learnMore")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
