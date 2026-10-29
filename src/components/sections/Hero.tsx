import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CalendarCheck2, ClipboardCheck, MapPin, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalPhotoCredit } from "@/components/blog/JournalPhotoCredit";
import {
  STUDY_DESTINATIONS,
  useStudyDestination,
} from "@/components/presentation/study-destinations";
import { atlasCopy } from "@/components/presentation/atlas-copy";
import { usePresentationMotion } from "@/lib/presentation-motion";
import { presentationCopy } from "./presentation-copy";

export function Hero() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || "tr";
  const copy = presentationCopy(language);
  const atlas = atlasCopy(language);
  const { paused, reduced, toggle } = usePresentationMotion();
  const { selected, select, destination, countryName, countryNameFor, guideUrl } =
    useStudyDestination();
  return (
    <section className="atlas-hero" data-sc-act="flow" aria-labelledby="atlas-headline">
      <div className="atlas-contours" data-sc-parallax="-0.3" aria-hidden="true">
        <svg viewBox="0 0 700 700" fill="none">
          <circle cx="350" cy="350" r="190" />
          <circle cx="350" cy="350" r="260" />
          <circle cx="350" cy="350" r="330" />
          <path d="M0 350h700M350 0v700" />
        </svg>
      </div>
      <div className="container-prose atlas-hero-layout">
        <div className="atlas-hero-copy">
          <p className="atlas-subject">{t("hero.title")}</p>
          <h1 id="atlas-headline" className="atlas-title">
            <span>{copy.headline[0]} </span>
            <span>{copy.headline[1]}</span>
          </h1>
          <p className="atlas-description">{t("hero.subtitle")}</p>
          <div className="atlas-actions">
            <Button asChild size="lg" className="atlas-primary">
              <a href="/iletisim#randevu">
                <CalendarCheck2 aria-hidden="true" />
                {t("cta.primary")}
                <ArrowUpRight aria-hidden="true" className="rtl:-rotate-90" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="atlas-secondary">
              <Link to="/quiz">
                <ClipboardCheck aria-hidden="true" />
                {t("cta.secondary")}
              </Link>
            </Button>
          </div>
          <p className="atlas-cta-note">{t("hero.ctaNote")}</p>
          <div className="atlas-destination-picker">
            <p id="atlas-country-label">{atlas.choose}</p>
            <div role="group" aria-labelledby="atlas-country-label">
              {STUDY_DESTINATIONS.map((place, index) => (
                <button
                  key={place.code}
                  type="button"
                  onClick={() => select(index)}
                  aria-pressed={selected === index}
                >
                  <span aria-hidden="true" />
                  {countryNameFor(place.code)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="atlas-scene">
          <div className="atlas-photo-plane" data-sc-parallax="-0.95">
            <figure className="atlas-photo-frame" data-sc-tilt="3">
              <div className="atlas-photo-stack">
                {STUDY_DESTINATIONS.map((place, index) => (
                  <img
                    key={place.code}
                    src={`${import.meta.env.BASE_URL}scrollcraft/images/${place.image}`}
                    alt={selected === index ? `${countryName}, ${place.city}` : ""}
                    aria-hidden={selected !== index}
                    data-selected={selected === index}
                    style={{ objectPosition: place.position }}
                    width={place.photo.width}
                    height={place.photo.height}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ))}
              </div>
              <div className="atlas-photo-caption">
                <MapPin aria-hidden="true" />
                <span>{destination.city}</span>
                <span>{countryName}</span>
              </div>
              <div className="atlas-photo-credit">
                <JournalPhotoCredit photo={destination.photo} />
              </div>
            </figure>
          </div>
          <div className="atlas-route-plane" data-sc-parallax="1.05">
            <a href={guideUrl} className="atlas-route-note">
              <span className="atlas-note-mark" aria-hidden="true">
                <ArrowUpRight />
              </span>
              <span className="atlas-note-label">{atlas.selected}</span>
              <span className="atlas-note-place">
                {countryName}
                <span aria-hidden="true"> · </span>
                {destination.city}
              </span>
              <span className="atlas-note-link">
                {atlas.explore}
                <ArrowUpRight aria-hidden="true" className="rtl:-rotate-90" />
              </span>
            </a>
          </div>
        </div>
        <div className="atlas-hero-foot">
          <a href="#education-journey">
            {copy.scroll}
            <ArrowUpRight aria-hidden="true" className="rtl:-rotate-90" />
          </a>
          <p>{t("hero.eyebrow")}</p>
          <button type="button" onClick={toggle} disabled={reduced} aria-pressed={paused}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {reduced ? copy.reduced : paused ? copy.play : copy.pause}
          </button>
        </div>
      </div>
    </section>
  );
}
