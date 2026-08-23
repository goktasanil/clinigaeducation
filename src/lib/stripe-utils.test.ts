import { describe, expect, it } from "vitest";

import {
  calculateMarketplaceApplicationFee,
  stripeIntegrationIdentifier,
  toMinorUnits,
} from "./stripe-utils";

describe("Stripe marketplace fee utilities", () => {
  it("preserves the configured platform margin and processing reserve", () => {
    expect(calculateMarketplaceApplicationFee(10_000)).toBe(875);
  });

  it("never transfers a zero or negative amount to the seller", () => {
    expect(calculateMarketplaceApplicationFee(100, 10_000, 10_000, 10_000)).toBe(99);
  });

  it("converts euro amounts to integer minor units", () => {
    expect(toMinorUnits(19.99)).toBe(1999);
  });

  it("creates dashboard-friendly integration identifiers", () => {
    expect(stripeIntegrationIdentifier("cliniga_marketplace")).toMatch(
      /^cliniga_marketplace_[a-z]{8}$/,
    );
  });
});
