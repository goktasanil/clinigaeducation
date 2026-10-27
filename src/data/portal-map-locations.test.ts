import { describe, expect, it } from "vitest";

import { ISO_COUNTRY_CODES } from "./portal";
import {
  PORTAL_COUNTRY_LOCATIONS,
  resolvePortalMapFocus,
  validPortalCoordinates,
} from "./portal-map-locations";

describe("portal map coordinates", () => {
  it("covers every country and territory in the portal with sourced valid overview points", () => {
    expect(Object.keys(PORTAL_COUNTRY_LOCATIONS).sort()).toEqual([...ISO_COUNTRY_CODES].sort());
    for (const [latitude, longitude, area] of Object.values(PORTAL_COUNTRY_LOCATIONS)) {
      expect(validPortalCoordinates(latitude, longitude)).toBe(true);
      expect(Number.isFinite(area) && (area > 0 || area === -1)).toBe(true);
    }
  });

  it("never labels a country centre as an institution location when actual coordinates are missing", () => {
    const country = resolvePortalMapFocus({ level: "country", countryCode: "DE" });
    const institution = resolvePortalMapFocus({
      level: "institution",
      countryCode: "DE",
      institutionName: "An institution without a mapped point",
    });
    expect(institution).toEqual(country);
    expect(institution.precision).toBe("country");
    expect(institution.zoom).toBeLessThan(10);
  });

  it("uses the supplied city and institution points in longitude-latitude map order", () => {
    const coordinate = { latitude: 52.517, longitude: 13.388, countryCode: "DE" };
    const city = resolvePortalMapFocus({ ...coordinate, level: "city" });
    const institution = resolvePortalMapFocus({ ...coordinate, level: "institution" });
    expect(city.center).toEqual([13.388, 52.517]);
    expect(city.precision).toBe("city");
    expect(institution.precision).toBe("institution");
    expect(institution.zoom).toBeGreaterThan(city.zoom);
  });

  it("accepts zero-valued coordinates and rejects non-finite or out-of-range coordinates", () => {
    expect(validPortalCoordinates(0, 0)).toBe(true);
    for (const coordinate of [
      [Number.NaN, 13],
      [52, Number.POSITIVE_INFINITY],
      [91, 13],
      [52, -181],
      [null, 13],
      ["52", 13],
    ]) {
      expect(validPortalCoordinates(coordinate[0], coordinate[1])).toBe(false);
    }
    expect(resolvePortalMapFocus({ level: "city", latitude: 0, longitude: 0 }).precision).toBe(
      "city",
    );
  });

  it("keeps a ROR city point at city precision even when a university is selected", () => {
    const target = resolvePortalMapFocus({
      level: "institution",
      countryCode: "IT",
      institutionName: "A university with only a registry city point",
      latitude: 41.89193,
      longitude: 12.51133,
      coordinatePrecision: "city",
    });
    expect(target.precision).toBe("city");
    expect(target.zoom).toBe(10);
  });

  it("resets to a global view even if a previous location remains in the input", () => {
    expect(
      resolvePortalMapFocus({
        level: "world",
        countryCode: "DE",
        latitude: 52.517,
        longitude: 13.388,
      }),
    ).toEqual(resolvePortalMapFocus({ level: "world" }));
  });

  it("handles malformed country keys without prototype lookups or crashes", () => {
    for (const countryCode of ["__proto__", "constructor", "toString", "ZZ", ""]) {
      expect(resolvePortalMapFocus({ level: "country", countryCode }).precision).toBe("world");
    }
    expect(resolvePortalMapFocus({ level: "country", countryCode: " de " }).precision).toBe(
      "country",
    );
  });
});
