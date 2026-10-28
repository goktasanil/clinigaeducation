import { describe, expect, it } from "vitest";

import { contactPrefillService, validateContactSearch } from "./contact-prefill";

const services = ["education", "visa", "thesis", "statistics", "documents", "hourly"];

describe("contact request context", () => {
  it("accepts only known package/intent keys", () => {
    expect(validateContactSearch({ intent: "visa", package: "master" })).toEqual({
      intent: "visa",
      package: "master",
    });
    expect(validateContactSearch({ intent: ["visa"], package: "toString" })).toEqual({});
    expect(validateContactSearch({ intent: "__proto__", package: "<script>" })).toEqual({});
  });

  it("selects the actual service option for quiz, journey and package links", () => {
    expect(contactPrefillService({ intent: "visa" }, services)).toBe("visa");
    expect(contactPrefillService({ intent: "abroad" }, services)).toBe("education");
    expect(contactPrefillService({ intent: "stats" }, services)).toBe("statistics");
    expect(contactPrefillService({ package: "master" }, services)).toBe("education");
    expect(contactPrefillService({ package: "thesis", intent: "visa" }, services)).toBe("thesis");
    expect(contactPrefillService({}, services)).toBeNull();
  });
});
