import type { ReactNode } from "react";
import {
  Compass,
  FileCheck2,
  Mail,
  Layers3,
  MapPinned,
  ClipboardCheck,
  ArrowDownRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SERVICES } from "@/data/services";
import { JournalPhotoCredit } from "@/components/blog/JournalPhotoCredit";
import photos from "./page-photos.json";

type Kind =
  | "services"
  | "packages"
  | "about"
  | "contact"
  | "process"
  | "service"
  | "cities"
  | "city"
  | "legal"
  | "editorial"
  | "quiz";
const PHOTOS: Partial<Record<Kind, keyof typeof photos>> = {
  services: "netherlands-study",
  about: "germany-admission",
  process: "austria-study",
  cities: "switzerland-study",
};
const LOCATIONS = {
  "netherlands-study": "TU Delft",
  "germany-admission": "Universität Heidelberg",
  "austria-study": "TU Wien",
  "switzerland-study": "ETH Zürich",
};
const TARGETS: Partial<Record<Kind, string>> = {
  services: "service-directory",
  packages: "packages-catalog",
  process: "education-journey",
  contact: "randevu",
};

export function PageMasthead({
  kind,
  topic,
  children,
}: {
  kind: Kind;
  topic?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const photo = PHOTOS[kind] ? photos[PHOTOS[kind]!] : undefined;
  const location = PHOTOS[kind] ? LOCATIONS[PHOTOS[kind]!] : "";
  const Icon =
    kind === "contact"
      ? Mail
      : kind === "packages"
        ? Layers3
        : kind === "city"
          ? MapPinned
          : kind === "quiz"
            ? ClipboardCheck
            : SERVICES.find((service) => service.slug === topic)?.icon || FileCheck2;
  return (
    <section
      className={`page-masthead masthead-${kind}`}
      data-sc-act="flow"
      lang={kind === "legal" ? "tr" : undefined}
      dir={kind === "legal" ? "ltr" : undefined}
    >
      <div className="page-masthead-orbit" data-sc-parallax="-0.2" aria-hidden="true" />
      <div className="container-prose page-masthead-layout">
        <div className="page-masthead-copy">
          {children}
          {TARGETS[kind] && (
            <a className="page-masthead-link" href={`#${TARGETS[kind]}`}>
              {t("cta.learnMore")}
              <ArrowDownRight aria-hidden="true" />
            </a>
          )}
        </div>
        {kind !== "legal" && kind !== "editorial" && (
          <div className="page-masthead-art">
            {photo ? (
              <div data-sc-parallax="-0.65" className="page-photo-plane">
                <figure>
                  <div className="page-photo-window" data-sc-tilt="2">
                    <img
                      src={`${import.meta.env.BASE_URL}${photo.url.slice(1)}`}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      fetchPriority="high"
                    />
                  </div>
                  <p className="page-photo-location">{location}</p>
                  <JournalPhotoCredit photo={photo} />
                </figure>
              </div>
            ) : (
              <div className="page-folio" data-topic={topic} aria-hidden="true">
                <div className="page-folio-back" data-sc-parallax="-0.55" />
                <div className="page-folio-paper" data-sc-parallax="0.55">
                  <div className="page-folio-header">
                    <span>CliniGA Education</span>
                    <Compass />
                  </div>
                  <Icon className="page-folio-icon" strokeWidth={1} />
                  <svg viewBox="0 0 300 130" className="page-folio-route" fill="none">
                    <path d="M12 104C70 104 50 27 120 27S182 91 218 62 244 16 285 16" />
                    <circle cx="12" cy="104" r="5" />
                    <circle cx="120" cy="27" r="5" />
                    <circle cx="218" cy="62" r="5" />
                    <circle cx="285" cy="16" r="5" />
                  </svg>
                  <div className="page-folio-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            )}
            <div className="page-masthead-seal" data-sc-parallax="0.8" aria-hidden="true">
              <Compass strokeWidth={1} />
              <span>
                CLINIGA
                <br />
                EDUCATION
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
