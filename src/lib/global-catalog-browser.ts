import { ISO_COUNTRY_CODES } from "@/data/portal";
import { getVerifiedInstitutions, getVerifiedPrograms } from "@/data/verified-education-catalog";

const OPENALEX_BASE_URL = "https://api.openalex.org/";
const OPENALEX_MAILTO = "clinigaeducation@gmail.com";
const COUNTRY_CODES = new Set(ISO_COUNTRY_CODES);
const CITY_CACHE_MS = 10 * 60_000;

export type CatalogCoordinates = { latitude: number | null; longitude: number | null };

export type OpenAlexInstitution = {
  id?: string;
  display_name?: string;
  type?: string;
  country_code?: string;
  homepage_url?: string;
  image_thumbnail_url?: string;
  works_count?: number;
  geo?: {
    city?: string;
    region?: string;
    country?: string;
    country_code?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

export type CatalogInstitution = CatalogCoordinates & {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  homepageUrl: string | null;
  logoUrl: string | null;
  worksCount: number;
  source: "openalex" | "official";
  checkedAt?: string;
  coordinatePrecision?: "city" | "institution";
};

export type GlobalCitySearchResult = {
  cities: Array<
    CatalogCoordinates & {
      name: string;
      institutionCount: number;
      geonameId: number | null;
      population: number;
      aliases?: readonly string[];
    }
  >;
  requiresQuery?: boolean;
  partial?: boolean;
};

export type CatalogProgram = {
  id: string;
  program_name: string;
  degree_level: string | null;
  language: string | null;
  official_url: string | null;
  checkedAt?: string;
  source_checked_at?: string | null;
};

export function mergeVerifiedCatalogPrograms(...lists: CatalogProgram[][]): CatalogProgram[] {
  const programs = new Map<string, CatalogProgram>();
  for (const program of lists.flat()) {
    if (!program.program_name?.trim() || !program.official_url) continue;
    try {
      const source = new URL(program.official_url);
      if (!["https:", "http:"].includes(source.protocol)) continue;
    } catch {
      continue;
    }
    const key = [program.program_name, program.degree_level, program.language]
      .map((value) => (value || "").trim().toLocaleLowerCase())
      .join("|");
    if (!programs.has(key)) programs.set(key, program);
  }
  return [...programs.values()];
}

type CatalogFetcher = (path: string) => Promise<unknown>;
const cityCache = new Map<string, { until: number; value: Promise<GlobalCitySearchResult> }>();

export function normalizeCountryCode(value: string) {
  const countryCode = value.trim().toUpperCase();
  if (!COUNTRY_CODES.has(countryCode)) throw new Error("Invalid country code");
  return countryCode;
}

export function sameCatalogText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "base" }) === 0;
}

export function catalogCoordinates(latitude: unknown, longitude: unknown): CatalogCoordinates {
  const latitudeNumber = typeof latitude === "number" ? latitude : NaN;
  const longitudeNumber = typeof longitude === "number" ? longitude : NaN;
  return Number.isFinite(latitudeNumber) &&
    latitudeNumber >= -90 &&
    latitudeNumber <= 90 &&
    Number.isFinite(longitudeNumber) &&
    longitudeNumber >= -180 &&
    longitudeNumber <= 180
    ? { latitude: latitudeNumber, longitude: longitudeNumber }
    : { latitude: null, longitude: null };
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

export function normalizeCatalogInstitution(
  item: OpenAlexInstitution,
  countryCode: string,
  city: string,
): CatalogInstitution | null {
  const itemCountryCode = item.geo?.country_code || item.country_code || "";
  if (
    item.type !== "education" ||
    itemCountryCode.toUpperCase() !== countryCode ||
    (city && !sameCatalogText(item.geo?.city || "", city)) ||
    !/^https:\/\/openalex\.org\/I\d+$/.test(item.id || "") ||
    !item.display_name?.trim()
  ) {
    return null;
  }
  return {
    id: item.id!,
    name: item.display_name.trim(),
    type: "education",
    city: item.geo?.city || "",
    region: item.geo?.region || "",
    country: item.geo?.country || "",
    countryCode,
    homepageUrl: safeUrl(item.homepage_url),
    logoUrl: safeUrl(item.image_thumbnail_url),
    worksCount: item.works_count || 0,
    source: "openalex",
    coordinatePrecision: "city",
    ...catalogCoordinates(item.geo?.latitude, item.geo?.longitude),
  };
}

async function fetchOpenAlex(path: string): Promise<unknown> {
  const url = new URL(path, OPENALEX_BASE_URL);
  url.searchParams.set("mailto", OPENALEX_MAILTO);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Global catalog temporarily unavailable");
  return response.json();
}

/**
 * OpenAlex's geo.city grouping is geographic. Its search= parameter searches
 * institution names and must not be used as a substitute for a city filter.
 * Reference: https://help.openalex.org/data/institutions/#geo and
 * https://help.openalex.org/api/grouping/ (cursor paging for city groups).
 */
export async function loadCountryCatalogCities(
  countryInput: string,
  fetchCatalog: CatalogFetcher,
): Promise<GlobalCitySearchResult> {
  const countryCode = normalizeCountryCode(countryInput);
  const cities = new Map<string, GlobalCitySearchResult["cities"][number]>();
  const seenCursors = new Set<string>();
  let cursor: string | null = "*";
  do {
    if (seenCursors.has(cursor) || seenCursors.size >= 50) {
      throw new Error("Country city catalogue could not be fully loaded");
    }
    seenCursors.add(cursor);
    const params = new URLSearchParams({
      filter: `country_code:${countryCode.toLowerCase()},type:education`,
      group_by: "geo.city",
      per_page: "200",
      cursor,
    });
    const payload = (await fetchCatalog(`institutions?${params.toString()}`)) as {
      meta?: { next_cursor?: string | null };
      group_by?: Array<{ key?: string; key_display_name?: string; count?: number }>;
    };
    for (const group of payload.group_by || []) {
      const name = (group.key_display_name || group.key || "").trim();
      if (!name || name === "unknown") continue;
      cities.set(name, {
        name,
        institutionCount: group.count || 0,
        geonameId: null,
        population: 0,
        latitude: null,
        longitude: null,
      });
    }
    cursor = payload.meta?.next_cursor || null;
  } while (cursor);
  return {
    cities: [...cities.values()].sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    ),
    requiresQuery: false,
  };
}

export function filterCountryCatalogCities(
  result: GlobalCitySearchResult,
  query = "",
): GlobalCitySearchResult {
  const term = query.trim().toLocaleLowerCase().slice(0, 80);
  return {
    ...result,
    cities: term
      ? result.cities.filter((city) =>
          [city.name, ...(city.aliases || [])].some((value) =>
            value.toLocaleLowerCase().includes(term),
          ),
        )
      : result.cities,
  };
}

export function getStarterCatalogInstitutions(
  countryCode: string,
  city = "",
  query = "",
): CatalogInstitution[] {
  return getVerifiedInstitutions(countryCode, city, query).map((institution) => ({
    ...institution,
    region: "",
    logoUrl: null,
    worksCount: 0,
  }));
}

export function getStarterCatalogCities(countryCode: string): GlobalCitySearchResult {
  const cities: GlobalCitySearchResult["cities"] = [];
  for (const institution of getVerifiedInstitutions(countryCode)) {
    const found = cities.find((city) => sameCatalogText(city.name, institution.city));
    if (found) {
      found.institutionCount += 1;
      if (found.latitude === null && institution.latitude !== null) {
        found.latitude = institution.latitude;
        found.longitude = institution.longitude;
      }
      found.aliases = [...new Set([...(found.aliases || []), ...institution.cityAliases])];
    } else {
      cities.push({
        name: institution.city,
        institutionCount: 1,
        geonameId: null,
        population: 0,
        latitude: institution.latitude,
        longitude: institution.longitude,
        aliases: institution.cityAliases,
      });
    }
  }
  return { cities, requiresQuery: false, partial: true };
}

export function matchesCatalogCity(city: GlobalCitySearchResult["cities"][number], name: string) {
  return [city.name, ...(city.aliases || [])].some((value) => sameCatalogText(value, name));
}

export function mergeCatalogCities(
  live: GlobalCitySearchResult | undefined,
  starter: GlobalCitySearchResult,
): GlobalCitySearchResult {
  const cities = starter.cities.map((city) => ({ ...city }));
  for (const item of live?.cities || []) {
    const match = cities.find((city) => matchesCatalogCity(city, item.name));
    if (match) {
      match.institutionCount = Math.max(match.institutionCount, item.institutionCount);
      match.latitude = match.latitude ?? item.latitude;
      match.longitude = match.longitude ?? item.longitude;
      match.aliases = [...new Set([...(match.aliases || []), item.name, ...(item.aliases || [])])];
    } else {
      cities.push({ ...item });
    }
  }
  return {
    cities: cities.sort((left, right) => left.name.localeCompare(right.name)),
    requiresQuery: false,
    partial: live?.partial ?? !live,
  };
}

export async function searchCatalogCitiesWithFallback(
  countryCode: string,
  fetchCatalog: CatalogFetcher,
): Promise<GlobalCitySearchResult> {
  const starter = getStarterCatalogCities(normalizeCountryCode(countryCode));
  try {
    return mergeCatalogCities(await loadCountryCatalogCities(countryCode, fetchCatalog), starter);
  } catch (error) {
    if (starter.cities.length) return starter;
    throw error;
  }
}

export function mergeCatalogInstitutions(
  live: readonly CatalogInstitution[],
  starter: readonly CatalogInstitution[],
): CatalogInstitution[] {
  const institutions = [...starter];
  for (const item of live) {
    const verifiedProgramIds = new Set(getVerifiedPrograms(item).map((program) => program.id));
    const duplicate = institutions.some(
      (record) =>
        record.id === item.id ||
        (record.source === "official" &&
          getVerifiedPrograms(record).some((program) => verifiedProgramIds.has(program.id))),
    );
    if (!duplicate) institutions.push(item);
  }
  return institutions;
}

export async function searchGlobalCitiesClient(input: {
  countryCode: string;
  query?: string;
}): Promise<GlobalCitySearchResult> {
  const countryCode = normalizeCountryCode(input.countryCode);
  let cached = cityCache.get(countryCode);
  if (!cached || cached.until <= Date.now()) {
    const value = searchCatalogCitiesWithFallback(countryCode, fetchOpenAlex);
    cached = { until: Date.now() + CITY_CACHE_MS, value };
    cityCache.set(countryCode, cached);
    void value.catch(() => {
      if (cityCache.get(countryCode)?.value === value) cityCache.delete(countryCode);
    });
  }
  return filterCountryCatalogCities(await cached.value, input.query);
}

export async function searchCatalogInstitutions(
  input: { countryCode: string; query?: string; city?: string; page?: number },
  fetchCatalog: CatalogFetcher,
) {
  const countryCode = normalizeCountryCode(input.countryCode);
  const query = (input.query ?? "").trim().slice(0, 100);
  const city = (input.city ?? "").trim().slice(0, 100);
  const page = Math.min(Math.max(input.page ?? 1, 1), 100);
  const filters = [`country_code:${countryCode.toLowerCase()}`, "type:education"];
  // JSON quotes preserve punctuation and spaces as one city value rather than
  // interpreting a user-controlled city as additional filter syntax.
  if (city) filters.push(`geo.city:${JSON.stringify(city)}`);
  const params = new URLSearchParams({
    filter: filters.join(","),
    per_page: "100",
    page: String(page),
    sort: "display_name:asc",
    select: "id,display_name,type,country_code,geo,homepage_url,image_thumbnail_url,works_count",
  });
  if (query) params.set("search", query);
  const payload = (await fetchCatalog(`institutions?${params.toString()}`)) as {
    meta?: { count?: number };
    results?: OpenAlexInstitution[];
  };
  const institutions = (payload.results || [])
    .map((item) => normalizeCatalogInstitution(item, countryCode, city))
    .filter((item): item is CatalogInstitution => item !== null);
  return { institutions, total: payload.meta?.count ?? institutions.length, page };
}

export async function searchCatalogInstitutionsWithFallback(
  input: { countryCode: string; query?: string; city?: string; page?: number },
  fetchCatalog: CatalogFetcher,
) {
  const countryCode = normalizeCountryCode(input.countryCode);
  const starter = getStarterCatalogInstitutions(countryCode, input.city, input.query);
  const page = Math.min(Math.max(input.page ?? 1, 1), 100);
  try {
    const live = await searchCatalogInstitutions(input, fetchCatalog);
    const institutions = mergeCatalogInstitutions(live.institutions, page === 1 ? starter : []);
    return {
      ...live,
      institutions,
      total: Math.max(live.total, institutions.length),
      partial: false,
    };
  } catch (error) {
    const institutions = starter.slice((page - 1) * 100, page * 100);
    if (institutions.length) return { institutions, total: starter.length, page, partial: true };
    throw error;
  }
}

export async function searchGlobalInstitutionsClient(input: {
  countryCode: string;
  query?: string;
  city?: string;
  page?: number;
}) {
  return searchCatalogInstitutionsWithFallback(input, fetchOpenAlex);
}
