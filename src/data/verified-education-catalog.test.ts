import { describe, expect, it } from "vitest";

import {
  getVerifiedInstitutions,
  getVerifiedPrograms,
  VERIFIED_CATALOG_CHECKED_AT,
  VERIFIED_EDUCATION_CATALOG,
} from "./verified-education-catalog";

describe("verified university starter catalogue", () => {
  it("keeps a partial, sourced catalogue of actual institution-specific programmes", () => {
    expect(VERIFIED_EDUCATION_CATALOG.length).toBeGreaterThanOrEqual(12);
    expect(new Set(VERIFIED_EDUCATION_CATALOG.map((item) => item.id)).size).toBe(
      VERIFIED_EDUCATION_CATALOG.length,
    );
    const programIds = new Set<string>();
    for (const institution of VERIFIED_EDUCATION_CATALOG) {
      expect(institution.type).toBe("education");
      expect(institution.source).toBe("official");
      expect(institution.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(institution.city.length).toBeGreaterThan(1);
      expect(institution.checkedAt).toBe(VERIFIED_CATALOG_CHECKED_AT);
      expect(institution.programs.length).toBeGreaterThanOrEqual(2);
      const home = new URL(institution.homepageUrl);
      const domain = home.hostname.replace(/^www\./, "");
      expect(home.protocol).toBe("https:");
      for (const program of institution.programs) {
        expect(programIds.has(program.id)).toBe(false);
        programIds.add(program.id);
        expect(program.program_name.length).toBeGreaterThan(3);
        expect(program.degree_level.length).toBeGreaterThan(3);
        expect(program.checkedAt).toBe(VERIFIED_CATALOG_CHECKED_AT);
        const source = new URL(program.official_url);
        expect(source.protocol).toBe("https:");
        expect(source.hostname === domain || source.hostname.endsWith("." + domain)).toBe(true);
      }
    }
  });

  it("preserves the difference between sourced campus map centres and ROR city points", () => {
    const located = VERIFIED_EDUCATION_CATALOG.filter((item) => item.latitude !== null);
    expect(located.length).toBeGreaterThanOrEqual(12);
    expect(
      located.filter((item) => item.coordinatePrecision === "institution").length,
    ).toBeGreaterThanOrEqual(4);
    expect(located.some((item) => item.coordinatePrecision === "city")).toBe(true);
    for (const institution of VERIFIED_EDUCATION_CATALOG) {
      if (institution.latitude === null) {
        expect(institution.longitude).toBeNull();
        continue;
      }
      expect(Number.isFinite(institution.latitude)).toBe(true);
      expect(Number.isFinite(institution.longitude)).toBe(true);
      expect(Math.abs(institution.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(institution.longitude!)).toBeLessThanOrEqual(180);
      if (institution.coordinatePrecision === "city") {
        expect(institution.coordinateSourceUrl).toMatch(/^https:\/\/ror\.org\/[a-z0-9]+$/);
      } else {
        expect(institution.coordinatePrecision).toBe("institution");
        const source = new URL(institution.coordinateSourceUrl!);
        const domain = new URL(institution.homepageUrl).hostname.replace(/^www\./, "");
        expect(source.protocol).toBe("https:");
        expect(source.hostname === domain || source.hostname.endsWith("." + domain)).toBe(true);
      }
    }
  });

  it("scopes institution options to the selected country and exact city or a verified city alias", () => {
    expect(getVerifiedInstitutions("it", "Roma").map((item) => item.id)).toEqual([
      "official:uniroma1.it",
    ]);
    expect(getVerifiedInstitutions("IT", "Milan", "polimi").map((item) => item.id)).toEqual([
      "official:polimi.it",
    ]);
    expect(getVerifiedInstitutions("TR", "ANKARA", "ODTU").map((item) => item.id)).toEqual([
      "official:metu.edu.tr",
    ]);
    expect(getVerifiedInstitutions("DE", "München").map((item) => item.id)).toEqual([
      "official:tum.de",
    ]);
    expect(getVerifiedInstitutions("GB", "Cambridge")).toEqual([]);
    expect(getVerifiedInstitutions("US", "Boston")).toEqual([]);
    expect(getVerifiedInstitutions("ZZ")).toEqual([]);
    expect(getVerifiedInstitutions("")).toEqual([]);
  });

  it("matches programmes directly by the curated stable institution identity", () => {
    const programs = getVerifiedPrograms({ id: "official:uniroma1.it" });
    expect(programs.map((item) => item.program_name)).toEqual([
      "Applied Computer Science and Artificial Intelligence",
      "Data Science",
    ]);
    expect(getVerifiedPrograms({ id: "official:uniroma1.it", countryCode: "DE" })).toEqual([]);
    expect(getVerifiedPrograms({ id: "official:uniroma1.it", city: "Milano" })).toEqual([]);
  });

  it("requires official host, country and a verified name together for external identities", () => {
    expect(
      getVerifiedPrograms({
        id: "https://openalex.org/I000000001",
        name: "Politecnico di Milano",
        homepageUrl: "https://POLIMI.IT/en/",
        countryCode: "IT",
        city: "Milan",
      }).length,
    ).toBe(2);
    expect(
      getVerifiedPrograms({
        name: "TUM",
        homepageUrl: "http://www.tum.de/",
        countryCode: "DE",
        city: "Munich",
      }).length,
    ).toBe(2);
    expect(
      getVerifiedPrograms({
        name: "Department of Computer Science",
        homepageUrl: "https://www.tum.de/",
        countryCode: "DE",
        city: "Munich",
      }),
    ).toEqual([]);
    expect(getVerifiedPrograms({ name: "Sapienza University of Rome" })).toEqual([]);
    expect(
      getVerifiedPrograms({
        name: "Sapienza University of Rome",
        homepageUrl: "https://www.uniroma1.it/",
      }),
    ).toEqual([]);
    expect(
      getVerifiedPrograms({
        name: "Sapienza University of Rome",
        homepageUrl: "https://www.uniroma1.it/",
        countryCode: "DE",
      }),
    ).toEqual([]);
  });

  it("rejects lookalike, unrelated, credentialed and executable homepage URLs", () => {
    for (const homepageUrl of [
      "https://uniroma1.it.evil.example/",
      "https://notuniroma1.it/",
      "https://user:password@uniroma1.it/",
      "https://uniroma1.it:8080/",
      "javascript:alert(1)",
      "/uniroma1.it",
    ]) {
      expect(
        getVerifiedPrograms({
          name: "Sapienza University of Rome",
          homepageUrl,
          countryCode: "IT",
        }),
      ).toEqual([]);
    }
    expect(getVerifiedPrograms({ id: "__proto__", name: "constructor" })).toEqual([]);
  });

  it("does not turn nearby cities into a campus claim or mix university programme ownership", () => {
    const mit = getVerifiedInstitutions("US", "Cambridge")[0];
    expect(mit?.id).toBe("official:mit.edu");
    expect(
      getVerifiedPrograms({ id: mit.id }).every(
        (item) => new URL(item.official_url).hostname === "catalog.mit.edu",
      ),
    ).toBe(true);
    const tum = getVerifiedInstitutions("DE", "Munich")[0];
    expect(tum.programs.map((item) => item.program_name)).toContain("Data & Society");
    expect(tum.programs.map((item) => item.program_name)).not.toContain(
      "Data Engineering and Analytics",
    );
    expect(getVerifiedPrograms({ id: "official:tum.de", city: "Garching" })).toEqual([]);
  });

  it("returns programme copies so a consumer cannot corrupt the shared starter catalogue", () => {
    const first = getVerifiedPrograms({ id: "official:uniroma1.it" });
    first[0].program_name = "Changed by caller";
    expect(getVerifiedPrograms({ id: "official:uniroma1.it" })[0].program_name).toBe(
      "Applied Computer Science and Artificial Intelligence",
    );
  });
});
