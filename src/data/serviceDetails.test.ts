import { describe, expect, it } from "vitest";

import { SERVICES } from "./services";
import { SERVICE_DETAILS, getServiceDetail } from "./serviceDetails";

describe("service detail catalog", () => {
  it("provides one unique detail page for every service card", () => {
    const cardSlugs = SERVICES.map((service) => service.slug);
    const detailSlugs = SERVICE_DETAILS.map((service) => service.slug);

    expect(new Set(detailSlugs).size).toBe(detailSlugs.length);
    expect(detailSlugs).toEqual(cardSlugs);
    expect(cardSlugs.every((slug) => getServiceDetail(slug))).toBe(true);
  });

  it("states an ethical boundary and concrete deliverables for every service", () => {
    for (const service of SERVICE_DETAILS) {
      expect(service.boundary.length).toBeGreaterThan(30);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(4);
      expect(service.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });
});
