import { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import type { JournalPhoto } from "@/data/journal/types";
import { europeBlogPath, isEuropeBlogLocale } from "@/lib/europe-blog";

type Destination = {
  code: "IT" | "DE" | "FR";
  city: string;
  image: string;
  position: string;
  photo: JournalPhoto;
};

export const STUDY_DESTINATIONS: readonly Destination[] = [
  {
    code: "IT",
    city: "Bologna",
    image: "italy-archiginnasio.jpg",
    position: "35% 50%",
    photo: {
      title: "Bologna - Archiginnasio.jpg",
      url: "/scrollcraft/images/italy-archiginnasio.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Bologna_-_Archiginnasio.jpg",
      author: "Clo5919",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      width: 1280,
      height: 960,
    },
  },
  {
    code: "DE",
    city: "Tübingen",
    image: "germany-tubingen-library.jpg",
    position: "50% 50%",
    photo: {
      title: "Bonatzbau Universitätsbibliothek Tübingen März 2016.jpg",
      url: "/scrollcraft/images/germany-tubingen-library.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Bonatzbau_Universit%C3%A4tsbibliothek_T%C3%BCbingen_M%C3%A4rz_2016.jpg",
      author: "Felix König",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0",
      width: 1280,
      height: 571,
    },
  },
  {
    code: "FR",
    city: "Lyon",
    image: "france-lyon-university.jpg",
    position: "38% 60%",
    photo: {
      title: "Lyon 7e - Université Lyon 2, rotonde et vue sur Lyon au coucher du soleil.jpg",
      url: "/scrollcraft/images/france-lyon-university.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Lyon_7e_-_Universit%C3%A9_Lyon_2,_rotonde_et_vue_sur_Lyon_au_coucher_du_soleil.jpg",
      author: "Romainbehar",
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      width: 1280,
      height: 960,
    },
  },
];

type AtlasContext = { selected: number; select: (value: number) => void };
export const AtlasContext = createContext<AtlasContext>({ selected: 0, select: () => {} });

export function useStudyDestination() {
  const { selected, select } = useContext(AtlasContext);
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || "tr";
  const blogLanguage = isEuropeBlogLocale(language) ? language : "en";
  const names = new Intl.DisplayNames([language, "en"], { type: "region" });
  const destination = STUDY_DESTINATIONS[selected];
  return {
    selected,
    select,
    destination,
    countryName: names.of(destination.code) || destination.code,
    countryNameFor: (code: string) => names.of(code) || code,
    guideUrl: `${europeBlogPath(blogLanguage)}?country=${destination.code}`,
  };
}
