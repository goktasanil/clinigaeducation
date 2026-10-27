/**
 * Partial starter catalogue, checked against the linked university-owned pages.
 * This is not a complete list of universities, departments or admission offers.
 * Names describe degree programmes, never OpenAlex research topics. No entry
 * asserts an admission deadline, a fee, a partnership or eligibility.
 *
 * A null coordinate means no location was verified. Where ROR/GeoNames supplies
 * a point, coordinatePrecision is explicitly `city`: it is NOT a campus,
 * department, building or entrance coordinate. `institution` points come from
 * the linked university's campus map and identify its campus map centre, not a
 * particular programme's classroom, building entrance or navigation guarantee.
 */
export const VERIFIED_CATALOG_CHECKED_AT = "2026-10-27";

export type VerifiedEducationProgram = {
  id: string;
  program_name: string;
  degree_level: string;
  language: string | null;
  official_url: string;
  checkedAt: string;
};

export type VerifiedEducationInstitution = {
  id: string;
  name: string;
  type: "education";
  city: string;
  countryCode: string;
  country: string;
  homepageUrl: string;
  latitude: number | null;
  longitude: number | null;
  coordinatePrecision?: "city" | "institution";
  coordinateSourceUrl?: string;
  source: "official";
  checkedAt: string;
  cityAliases: readonly string[];
  searchAliases: readonly string[];
  programs: readonly VerifiedEducationProgram[];
};

function program(
  id: string,
  name: string,
  degree: string,
  language: string | null,
  officialUrl: string,
): VerifiedEducationProgram {
  return {
    id,
    program_name: name,
    degree_level: degree,
    language,
    official_url: officialUrl,
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
  };
}

export const VERIFIED_EDUCATION_CATALOG: readonly VerifiedEducationInstitution[] = [
  {
    id: "official:uniroma1.it",
    name: "Sapienza University of Rome",
    type: "education",
    city: "Rome",
    cityAliases: ["Roma"],
    countryCode: "IT",
    country: "Italy",
    homepageUrl: "https://www.uniroma1.it/",
    // Città Universitaria: ll= in the official page's linked Google campus map.
    latitude: 41.903714,
    longitude: 12.514415,
    coordinatePrecision: "institution",
    coordinateSourceUrl: "https://dctf.web.uniroma1.it/en/where",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["Sapienza", "Università di Roma"],
    programs: [
      program(
        "sapienza-applied-computer-science-ai",
        "Applied Computer Science and Artificial Intelligence",
        "Bachelor",
        "English",
        "https://corsidilaurea.uniroma1.it/en/course/33502",
      ),
      program(
        "sapienza-data-science",
        "Data Science",
        "Master",
        "English",
        "https://corsidilaurea.uniroma1.it/en/course/33519",
      ),
    ],
  },
  {
    id: "official:unibo.it",
    name: "University of Bologna",
    type: "education",
    city: "Bologna",
    cityAliases: [],
    countryCode: "IT",
    country: "Italy",
    homepageUrl: "https://www.unibo.it/",
    latitude: 44.49381,
    longitude: 11.33875,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/01111rn36",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["Università di Bologna", "Alma Mater Studiorum"],
    programs: [
      program(
        "bologna-artificial-intelligence",
        "Artificial Intelligence",
        "Master",
        "English",
        "https://www.unibo.it/en/study/second-cycle-degree/programme/2026/6700",
      ),
      program(
        "bologna-economics-econometrics",
        "Economics and Econometrics",
        "Master",
        "English",
        "https://www.unibo.it/en/study/second-cycle-degree/programme/2026/6757",
      ),
    ],
  },
  {
    id: "official:polimi.it",
    name: "Politecnico di Milano",
    type: "education",
    city: "Milano",
    cityAliases: ["Milan"],
    countryCode: "IT",
    country: "Italy",
    homepageUrl: "https://www.polimi.it/",
    latitude: 45.46427,
    longitude: 9.18951,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/01nffqt88",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["PoliMi", "Polytechnic University of Milan"],
    programs: [
      program(
        "polimi-computer-science-engineering",
        "Computer Science and Engineering",
        "Master of Science",
        "English",
        "https://www.polimi.it/en/education/laurea-magistrale-programmes/programme-detail/computer-science-and-engineering",
      ),
      // The official page currently identifies this as a Bachelor despite its URL path.
      program(
        "polimi-mathematical-engineering",
        "Mathematical Engineering",
        "Bachelor of Science",
        "Italian",
        "https://www.polimi.it/en/education/laurea-magistrale-programmes/programme-detail/mathematical-engineering",
      ),
    ],
  },
  {
    id: "official:tu.berlin",
    name: "Technische Universität Berlin",
    type: "education",
    city: "Berlin",
    cityAliases: [],
    countryCode: "DE",
    country: "Germany",
    homepageUrl: "https://www.tu.berlin/",
    latitude: 52.52437,
    longitude: 13.41053,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/03v4gjf40",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["TU Berlin", "Technical University of Berlin"],
    programs: [
      program(
        "tu-berlin-computer-science",
        "Computer Science (Informatik)",
        "Master of Science",
        "English",
        "https://www.tu.berlin/en/studying/study-programs/all-programs-offered/study-course/computer-science-informatik-m-sc",
      ),
      program(
        "tu-berlin-scientific-computing",
        "Scientific Computing",
        "Master of Science",
        "English",
        "https://www.tu.berlin/en/studying/study-programs/all-programs-offered/study-course/scientific-computing-m-sc",
      ),
    ],
  },
  {
    id: "official:tum.de",
    name: "Technical University of Munich",
    type: "education",
    city: "Munich",
    cityAliases: ["München", "Munchen"],
    countryCode: "DE",
    country: "Germany",
    homepageUrl: "https://www.tum.de/",
    // Stammgelände: official campus page's /en/map#16/48.14903/11.56735 link.
    latitude: 48.14903,
    longitude: 11.56735,
    coordinatePrecision: "institution",
    coordinateSourceUrl: "https://nav.tum.de/en/campus/stammgelaende",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["TUM", "Technische Universität München"],
    // Both linked programmes identify Munich as their main location. Garching
    // programmes are deliberately not assigned to this Munich starter record.
    programs: [
      program(
        "tum-data-society",
        "Data & Society",
        "Master of Science",
        "English",
        "https://www.tum.de/en/studies/degree-programs/detail/data-and-society-master-of-science-msc",
      ),
      program(
        "tum-management-technology",
        "Management and Technology",
        "Master of Science",
        "English",
        "https://www.tum.de/en/studies/degree-programs/detail/management-and-technology-tum-bwl-master-of-science-msc",
      ),
    ],
  },
  {
    id: "official:ucl.ac.uk",
    name: "University College London",
    type: "education",
    city: "London",
    cityAliases: ["Londra"],
    countryCode: "GB",
    country: "United Kingdom",
    homepageUrl: "https://www.ucl.ac.uk/",
    latitude: 51.50853,
    longitude: -0.12574,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/02jx3x895",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["UCL"],
    // These linked pages describe the 2026 entry, not an assertion that intake is open.
    programs: [
      program(
        "ucl-computer-science",
        "Computer Science",
        "Bachelor of Science",
        null,
        "https://www.ucl.ac.uk/prospective-students/undergraduate/degrees/computer-science-bsc-2026",
      ),
      program(
        "ucl-data-science",
        "Data Science",
        "Bachelor of Science",
        null,
        "https://www.ucl.ac.uk/prospective-students/undergraduate/degrees/data-science-bsc-2026",
      ),
    ],
  },
  {
    id: "official:uva.nl",
    name: "University of Amsterdam",
    type: "education",
    city: "Amsterdam",
    cityAliases: [],
    countryCode: "NL",
    country: "Netherlands",
    homepageUrl: "https://www.uva.nl/",
    latitude: 52.37403,
    longitude: 4.88969,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/04dkp9463",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["UvA", "Universiteit van Amsterdam"],
    programs: [
      program(
        "uva-artificial-intelligence",
        "Artificial Intelligence",
        "Master",
        "English",
        "https://www.uva.nl/shared-content/programmas/en/masters/artificial-intelligence/artificial-intelligence.html",
      ),
      program(
        "uva-data-science-business-analytics",
        "Data Science and Business Analytics",
        "Master of Science",
        "English",
        "https://www.uva.nl/en/programmes/masters/data-science-and-business-analytics/data-science-and-business-analytics.html",
      ),
    ],
  },
  {
    id: "official:metu.edu.tr",
    name: "Middle East Technical University (ODTÜ)",
    type: "education",
    city: "Ankara",
    cityAliases: [],
    countryCode: "TR",
    country: "Türkiye",
    homepageUrl: "https://www.metu.edu.tr/",
    // Ankara campus: official map's Leaflet setView centre, zoom 16.
    latitude: 39.89488839207621,
    longitude: 32.78000593185425,
    coordinatePrecision: "institution",
    coordinateSourceUrl: "https://map.metu.edu.tr/",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: [
      "METU",
      "ODTU",
      "Orta Doğu Teknik Üniversitesi",
      "Middle East Technical University",
    ],
    programs: [
      program(
        "metu-computer-engineering",
        "Computer Engineering",
        "Bachelor of Science",
        null,
        "https://ceng.metu.edu.tr/en/general-information",
      ),
      program(
        "metu-electrical-electronics",
        "Electrical and Electronics Engineering",
        "Bachelor of Science",
        null,
        "https://eee.metu.edu.tr/undergraduate-program",
      ),
    ],
  },
  {
    id: "official:itu.edu.tr",
    name: "Istanbul Technical University (İTÜ)",
    type: "education",
    city: "Istanbul",
    cityAliases: ["İstanbul"],
    countryCode: "TR",
    country: "Türkiye",
    homepageUrl: "https://www.itu.edu.tr/",
    latitude: 41.01384,
    longitude: 28.94966,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/059636586",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["ITU", "İstanbul Teknik Üniversitesi", "Istanbul Technical University"],
    programs: [
      program(
        "itu-computer-engineering",
        "Computer Engineering",
        "Bachelor",
        "English",
        "https://bm.itu.edu.tr/en/education/undergraduate/computer-engineering/general-information",
      ),
      program(
        "itu-artificial-intelligence-data-engineering",
        "Artificial Intelligence and Data Engineering",
        "Bachelor of Science",
        "English",
        "https://tyyc.itu.edu.tr/ProgramHakkinda.php?Dili=EN&Program=YZV_LS",
      ),
    ],
  },
  {
    id: "official:utoronto.ca",
    name: "University of Toronto",
    type: "education",
    city: "Toronto",
    cityAliases: [],
    countryCode: "CA",
    country: "Canada",
    homepageUrl: "https://www.utoronto.ca/",
    latitude: 43.70643,
    longitude: -79.39864,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/03dbr7087",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["U of T"],
    // Scarborough is a Toronto campus, not a claim that these are St George programmes.
    programs: [
      program(
        "toronto-scarborough-computer-science",
        "Computer Science (Scarborough)",
        "Bachelor of Computer Science",
        null,
        "https://www.utsc.utoronto.ca/admissions/programs/computer-science",
      ),
      program(
        "toronto-scarborough-statistics",
        "Statistics (Scarborough)",
        "Honours Bachelor of Science",
        null,
        "https://www.utsc.utoronto.ca/admissions/programs/statistics",
      ),
    ],
  },
  {
    id: "official:mit.edu",
    name: "Massachusetts Institute of Technology",
    type: "education",
    city: "Cambridge",
    cityAliases: [],
    countryCode: "US",
    country: "United States",
    homepageUrl: "https://www.mit.edu/",
    // Cambridge campus: official map's all.js default Google Maps centre.
    latitude: 42.36031,
    longitude: -71.092,
    coordinatePrecision: "institution",
    coordinateSourceUrl: "https://whereis.mit.edu/",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["MIT"],
    programs: [
      program(
        "mit-computer-science-engineering",
        "Computer Science and Engineering (Course 6-3)",
        "Bachelor of Science",
        null,
        "https://catalog.mit.edu/degree-charts/computer-science-engineering-course-6-3/",
      ),
      // The university's published URL itself uses the spelling `artifical`.
      program(
        "mit-artificial-intelligence-decision-making",
        "Artificial Intelligence and Decision Making (Course 6-4)",
        "Bachelor of Science",
        null,
        "https://catalog.mit.edu/degree-charts/artifical-intelligence-decision-making-course-6-4/",
      ),
    ],
  },
  {
    id: "official:sydney.edu.au",
    name: "University of Sydney",
    type: "education",
    city: "Sydney",
    cityAliases: [],
    countryCode: "AU",
    country: "Australia",
    homepageUrl: "https://www.sydney.edu.au/",
    latitude: -33.86785,
    longitude: 151.20732,
    coordinatePrecision: "city",
    coordinateSourceUrl: "https://ror.org/0384j8v12",
    source: "official",
    checkedAt: VERIFIED_CATALOG_CHECKED_AT,
    searchAliases: ["The University of Sydney"],
    programs: [
      program(
        "sydney-advanced-computing",
        "Advanced Computing",
        "Bachelor of Advanced Computing",
        null,
        "https://www.sydney.edu.au/courses/courses/uc/bachelor-of-advanced-computing.html",
      ),
      program(
        "sydney-data-science",
        "Data Science",
        "Master of Data Science",
        null,
        "https://www.sydney.edu.au/content/courses/courses/pc/master-of-data-science0.html",
      ),
    ],
  },
];

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .trim();
}

function matchesCity(institution: VerifiedEducationInstitution, city?: string | null) {
  const expected = normalizeText(city);
  return (
    !expected ||
    [institution.city, ...institution.cityAliases].some(
      (value) => normalizeText(value) === expected,
    )
  );
}

function homepageHost(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port)
      return null;
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getVerifiedInstitutions(countryCode: string, city?: string, query?: string) {
  const country = countryCode.trim().toUpperCase();
  const search = normalizeText(query);
  return VERIFIED_EDUCATION_CATALOG.filter(
    (institution) =>
      institution.countryCode === country &&
      matchesCity(institution, city) &&
      (!search ||
        [institution.name, ...institution.searchAliases].some((value) =>
          normalizeText(value).includes(search),
        )),
  ).map((institution) => ({
    ...institution,
    programs: institution.programs.map((item) => ({ ...item })),
  }));
}

export function getVerifiedPrograms(institution: {
  id?: string | null;
  name?: string | null;
  homepageUrl?: string | null;
  countryCode?: string | null;
  city?: string | null;
}): VerifiedEducationProgram[] {
  const country = institution.countryCode?.trim().toUpperCase();
  const host = homepageHost(institution.homepageUrl);
  const match = VERIFIED_EDUCATION_CATALOG.find((record) => {
    if (country && record.countryCode !== country) return false;
    if (!matchesCity(record, institution.city)) return false;
    // An institution name or research-topic match is never proof of ownership.
    if (institution.id === record.id) return true;
    const verifiedName = [record.name, ...record.searchAliases].some(
      (name) => normalizeText(name) === normalizeText(institution.name),
    );
    return Boolean(country && host && host === homepageHost(record.homepageUrl) && verifiedName);
  });
  return match ? match.programs.map((item) => ({ ...item })) : [];
}
