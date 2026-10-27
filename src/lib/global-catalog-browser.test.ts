import { describe, expect, it, vi } from "vitest";

import {
  catalogCoordinates,
  getStarterCatalogInstitutions,
  matchesCatalogCity,
  mergeCatalogInstitutions,
  mergeVerifiedCatalogPrograms,
  searchCatalogCitiesWithFallback,
  searchCatalogInstitutionsWithFallback,
  filterCountryCatalogCities,
  loadCountryCatalogCities,
  normalizeCatalogInstitution,
  normalizeCountryCode,
  searchCatalogInstitutions,
  type OpenAlexInstitution,
} from "./global-catalog-browser";

const institution: OpenAlexInstitution = {
  id: "https://openalex.org/I123",
  display_name: "Example Institution",
  type: "education",
  country_code: "DE",
  geo: {
    city: "Berlin",
    country_code: "DE",
    country: "Germany",
    latitude: 52.52,
    longitude: 13.405,
  },
  homepage_url: "https://example.edu/",
};

describe("geographic education catalogue", () => {
  it("accepts real ISO country codes and rejects filter injection or unknown codes", () => {
    expect(normalizeCountryCode(" tr ")).toBe("TR");
    expect(() => normalizeCountryCode("ZZ")).toThrow("Invalid country code");
    expect(() => normalizeCountryCode("DE,type:company")).toThrow("Invalid country code");
  });

  it("keeps legitimate zero coordinates but does not manufacture them from missing data", () => {
    expect(catalogCoordinates(0, 0)).toEqual({ latitude: 0, longitude: 0 });
    expect(catalogCoordinates(null, null)).toEqual({ latitude: null, longitude: null });
    expect(catalogCoordinates(91, 10)).toEqual({ latitude: null, longitude: null });
    expect(catalogCoordinates(52, Infinity)).toEqual({ latitude: null, longitude: null });
  });

  it("rejects universities outside the selected country or city and non-education records", () => {
    expect(normalizeCatalogInstitution(institution, "DE", "Berlin")?.latitude).toBe(52.52);
    expect(normalizeCatalogInstitution(institution, "FR", "Berlin")).toBeNull();
    expect(normalizeCatalogInstitution(institution, "DE", "Bonn")).toBeNull();
    expect(
      normalizeCatalogInstitution({ ...institution, type: "healthcare" }, "DE", "Berlin"),
    ).toBeNull();
    expect(
      normalizeCatalogInstitution(
        { ...institution, id: "https://example.com/I123" },
        "DE",
        "Berlin",
      ),
    ).toBeNull();
  });

  it("drops unsafe institution URLs and preserves absent coordinates as null", () => {
    const result = normalizeCatalogInstitution(
      {
        ...institution,
        homepage_url: "javascript:alert(1)",
        image_thumbnail_url: "data:image/svg+xml,unsafe",
        geo: { city: "Berlin", country_code: "DE" },
      },
      "DE",
      "Berlin",
    );
    expect(result).toMatchObject({
      homepageUrl: null,
      logoUrl: null,
      latitude: null,
      longitude: null,
    });
  });

  it("uses cursor-paged geographic city groups without searching institution names", async () => {
    const fetchCatalog = vi
      .fn()
      .mockResolvedValueOnce({
        meta: { next_cursor: "second-page" },
        group_by: [{ key: "Berlin", key_display_name: "Berlin", count: 56 }],
      })
      .mockResolvedValueOnce({
        meta: { next_cursor: null },
        group_by: [
          { key: "Bonn", key_display_name: "Bonn", count: 8 },
          { key: "unknown", count: 1 },
        ],
      });
    const result = await loadCountryCatalogCities("DE", fetchCatalog);
    expect(result.cities.map((city) => city.name)).toEqual(["Berlin", "Bonn"]);
    expect(result.cities[0]).toMatchObject({
      institutionCount: 56,
      latitude: null,
      longitude: null,
    });
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
    for (const [path] of fetchCatalog.mock.calls) {
      const params = new URL(path, "https://api.openalex.org/").searchParams;
      expect(params.get("group_by")).toBe("geo.city");
      expect(params.get("filter")).toBe("country_code:de,type:education");
      expect(params.has("search")).toBe(false);
    }
    expect(filterCountryCatalogCities(result, "ber").cities.map((city) => city.name)).toEqual([
      "Berlin",
    ]);
  });

  it("fails on a repeated grouping cursor instead of reporting partial results as complete", async () => {
    const fetchCatalog = vi
      .fn()
      .mockResolvedValue({ meta: { next_cursor: "*" }, group_by: [{ key: "Berlin", count: 1 }] });
    await expect(loadCountryCatalogCities("DE", fetchCatalog)).rejects.toThrow("fully loaded");
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
  });

  it("filters institutions by the selected city separately from institution-name search", async () => {
    const fetchCatalog = vi.fn().mockResolvedValue({
      meta: { count: 2 },
      results: [
        institution,
        {
          ...institution,
          id: "https://openalex.org/I124",
          geo: { ...institution.geo, city: "Bonn" },
        },
      ],
    });
    const result = await searchCatalogInstitutions(
      { countryCode: "DE", city: "Berlin", query: "Example" },
      fetchCatalog,
    );
    const params = new URL(fetchCatalog.mock.calls[0][0], "https://api.openalex.org/").searchParams;
    expect(params.get("filter")).toBe('country_code:de,type:education,geo.city:"Berlin"');
    expect(params.get("search")).toBe("Example");
    expect(result.institutions.map((item) => item.id)).toEqual(["https://openalex.org/I123"]);
  });

  it("keeps a real, scoped starter path usable when the live provider is rate limited", async () => {
    const unavailable = vi.fn().mockRejectedValue(new Error("429 Too Many Requests"));
    const cities = await searchCatalogCitiesWithFallback("IT", unavailable);
    expect(cities.partial).toBe(true);
    expect(cities.cities.some((city) => matchesCatalogCity(city, "Roma"))).toBe(true);
    const result = await searchCatalogInstitutionsWithFallback(
      { countryCode: "IT", city: "Roma", query: "Sapienza" },
      unavailable,
    );
    expect(result.partial).toBe(true);
    expect(result.institutions).toHaveLength(1);
    expect(result.institutions[0]).toMatchObject({
      id: "official:uniroma1.it",
      source: "official",
      countryCode: "IT",
    });
    expect(result.institutions.every((record) => record.countryCode === "IT")).toBe(true);
    await expect(searchCatalogCitiesWithFallback("AQ", unavailable)).rejects.toThrow("429");
  });

  it("deduplicates an identified university but never inherits a parent's catalogue by shared domain alone", () => {
    const official = getStarterCatalogInstitutions("IT", "Rome", "Sapienza")[0];
    const identified = {
      ...official,
      id: "https://openalex.org/I123",
      source: "openalex" as const,
    };
    expect(mergeCatalogInstitutions([identified], [official])).toHaveLength(1);
    const department = { ...identified, name: "Example Department at Sapienza" };
    expect(mergeCatalogInstitutions([department], [official])).toHaveLength(2);
  });

  it("publishes program choices only with a usable official source URL and removes duplicate source records", () => {
    const program = {
      id: "fixture-program",
      program_name: "Example Programme",
      degree_level: "Master",
      language: null,
      official_url: "https://example.edu/programme",
    };
    const result = mergeVerifiedCatalogPrograms(
      [program],
      [
        { ...program, id: "duplicate" },
        { ...program, id: "unsafe", program_name: "Unsafe", official_url: "javascript:alert(1)" },
        { ...program, id: "missing-source", program_name: "No source", official_url: null },
      ],
    );
    expect(result).toEqual([program]);
  });
});
