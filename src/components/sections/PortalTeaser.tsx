import { ArrowUpRight, Building2, Globe2, GraduationCap, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePortalDiscoveryCopy } from "@/components/portal/portal-discovery-copy";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";

const STEPS = [
  { key: "country", Icon: Globe2 },
  { key: "city", Icon: MapPin },
  { key: "institution", Icon: Building2 },
  { key: "program", Icon: GraduationCap },
] as const;
export function PortalTeaser() {
  const { t } = useTranslation();
  const discoveryCopy = usePortalDiscoveryCopy();
  const copy = usePortalPublicCopy();
  return (
    <section className="container-prose py-20 md:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-10 text-white md:px-12 md:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_.85fr]">
          <div>
            <p className="text-sm font-medium text-[#a9dbd9]">
              {t("brand.name")} · {t("nav.portal")}
            </p>
            <h2 className="mt-4 max-w-[20ch] font-display text-3xl font-semibold leading-tight tracking-[-.04em] md:text-4xl">
              {copy.discovery.title}
            </h2>
            <p className="mt-5 max-w-[55ch] text-sm leading-relaxed text-white/75 md:text-base">
              {copy.discovery.subtitle}
            </p>
            <a
              href="/portal"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {t("nav.portal")}
              <ArrowUpRight className="ms-4 h-4 w-4 rtl:-rotate-90" />
            </a>
          </div>
          <ol className="divide-y divide-white/15 border-y border-white/15">
            {STEPS.map(({ key, Icon }, index) => (
              <li key={key} className="flex items-center gap-5 py-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-lg font-medium">{discoveryCopy[key]}</span>
                <span className="ms-auto text-xs text-white/50">{index + 1}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
