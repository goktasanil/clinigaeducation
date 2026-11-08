import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it } from "vitest";
import { portalSavedItemSchema } from "./portal-saved-item";

const item = { itemType: "program" as const, itemId: "I123", title: "Synthetic program" };

describe("portal saved-item validation after the Zod upgrade", () => {
  it("preserves arbitrary string-keyed metadata and normalizes the visible fields", () => {
    const metadata = { country: "PL", nested: { source: "synthetic" }, years: [2026, 2027] };
    expect(
      portalSavedItemSchema.parse({
        ...item,
        itemId: " I123 ",
        title: " Synthetic program ",
        metadata,
      }),
    ).toEqual({ ...item, metadata });
  });

  it("supplies an independent empty metadata object when optional metadata is omitted", () => {
    const first = portalSavedItemSchema.parse(item);
    first.metadata.changed = true;
    expect(portalSavedItemSchema.parse({ ...item, metadata: undefined }).metadata).toEqual({});
  });

  it("continues to reject invalid kinds, missing titles and non-record metadata", () => {
    for (const input of [
      { ...item, itemType: "admin" },
      { ...item, title: " " },
      { ...item, metadata: [] },
      { ...item, metadata: null },
    ]) {
      expect(portalSavedItemSchema.safeParse(input).success).toBe(false);
    }
  });

  it("strips caller-supplied ownership fields before the authenticated server handler", () => {
    expect(portalSavedItemSchema.parse({ ...item, user_id: "synthetic-owner" })).toEqual({
      ...item,
      metadata: {},
    });
  });

  it("returns parsed defaults and field errors through the existing React Hook Form resolver", async () => {
    const resolve = zodResolver(portalSavedItemSchema);
    const options = { criteriaMode: "all" as const, fields: {}, shouldUseNativeValidation: false };
    const valid = await resolve(item, undefined, options);
    expect(valid.errors).toEqual({});
    expect(valid.values).toEqual({ ...item, metadata: {} });
    const invalid = await resolve({ ...item, title: " " }, undefined, options);
    expect(invalid.values).toEqual({});
    expect(invalid.errors.title?.message).toBeTruthy();
  });
});
