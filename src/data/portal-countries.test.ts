import { afterEach, describe, expect, it, vi } from "vitest";
import { getCountries, ISO_COUNTRY_CODES } from "./portal";

afterEach(() => vi.restoreAllMocks());

describe("serialized country names", () => {
  it("returns identical labels and ordering even when the browser has different ICU data", () => {
    const expected = getCountries("tr");
    vi.spyOn(Intl, "DisplayNames").mockImplementation(() => {
      throw new Error("Browser CLDR is different or unavailable");
    });
    expect(getCountries("tr-TR")).toEqual(expected);
    expect(getCountries("TR_tr")).toEqual(expected);
    expect(expected).toHaveLength(249);
    expect(new Set(expected.map(({ code }) => code))).toEqual(new Set(ISO_COUNTRY_CODES));
    expect(expected.find(({ code }) => code === "DE")?.name).toBe("Almanya");
  });

  it("isolates caller mutations and uses a safe fallback for unsupported languages", () => {
    const first = getCountries("en");
    const original = first[0].name;
    first[0].name = "changed by one consumer";
    first.pop();
    expect(getCountries("en")).toHaveLength(249);
    expect(getCountries("en")[0].name).toBe(original);
    expect(getCountries("unsupported")).toEqual(getCountries("tr"));
  });
});
