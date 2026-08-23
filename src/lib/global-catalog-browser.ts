const OPENALEX_BASE_URL = "https://api.openalex.org/";
const OPENALEX_MAILTO = "clinigaeducation@gmail.com";

type OpenAlexInstitution = {
  id?: string;
  display_name?: string;
  type?: string;
  homepage_url?: string;
  image_thumbnail_url?: string;
  works_count?: number;
  geo?: { city?: string; region?: string; country?: string };
};

export type GlobalCitySearchResult = {
  cities: Array<{
    name: string;
    institutionCount: number;
    geonameId: number | null;
    population: number;
  }>;
  requiresQuery?: boolean;
};

function normalizeCountryCode(value: string) {
  const countryCode = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) throw new Error("Geçersiz ülke kodu.");
  return countryCode;
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

async function fetchOpenAlex(path: string) {
  const url = new URL(path, OPENALEX_BASE_URL);
  url.searchParams.set("mailto", OPENALEX_MAILTO);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Küresel eğitim kataloğuna şu anda ulaşılamıyor.");
  return response.json();
}

export async function searchGlobalCitiesClient(input: {
  countryCode: string;
  query?: string;
}): Promise<GlobalCitySearchResult> {
  const countryCode = normalizeCountryCode(input.countryCode);
  const query = (input.query ?? "").trim().slice(0, 80);
  if (query.length < 2) return { cities: [], requiresQuery: true };

  const params = new URLSearchParams({
    filter: `country_code:${countryCode.toLowerCase()},type:education`,
    per_page: "200",
    search: query,
  });
  const payload = (await fetchOpenAlex(`institutions?${params.toString()}`)) as {
    results?: OpenAlexInstitution[];
  };
  const counts = new Map<string, number>();
  for (const item of payload.results ?? []) {
    const city = item.geo?.city?.trim();
    if (city && city.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
      counts.set(city, (counts.get(city) ?? 0) + 1);
    }
  }

  return {
    cities: Array.from(counts.entries())
      .map(([name, institutionCount]) => ({
        name,
        institutionCount,
        geonameId: null as number | null,
        population: 0,
      }))
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
      )
      .slice(0, 100),
    requiresQuery: false,
  };
}

export async function searchGlobalInstitutionsClient(input: {
  countryCode: string;
  query?: string;
  city?: string;
  page?: number;
}) {
  const countryCode = normalizeCountryCode(input.countryCode);
  const query = (input.query ?? "").trim().slice(0, 100);
  const city = (input.city ?? "").trim().slice(0, 100);
  const page = Math.min(Math.max(input.page ?? 1, 1), 100);
  const params = new URLSearchParams({
    filter: `country_code:${countryCode.toLowerCase()},type:education`,
    per_page: "30",
    page: String(page),
    sort: "works_count:desc",
  });
  const search = [query, city].filter(Boolean).join(" ");
  if (search) params.set("search", search);

  const payload = (await fetchOpenAlex(`institutions?${params.toString()}`)) as {
    meta?: { count?: number };
    results?: OpenAlexInstitution[];
  };
  const institutions = (payload.results ?? []).map((item) => ({
    id: item.id ?? "",
    name: item.display_name ?? "Unnamed institution",
    type: item.type ?? "education",
    city: item.geo?.city ?? "",
    region: item.geo?.region ?? "",
    country: item.geo?.country ?? "",
    homepageUrl: safeUrl(item.homepage_url),
    logoUrl: safeUrl(item.image_thumbnail_url),
    worksCount: item.works_count ?? 0,
    source: "openalex" as const,
  }));

  return { institutions, total: payload.meta?.count ?? institutions.length, page };
}
