import { z } from "zod";

/** Pure input boundary shared with compatibility tests; account identity stays server-owned. */
export const portalSavedItemSchema = z.object({
  itemType: z.enum(["institution", "program", "listing", "guide"]),
  itemId: z.string().trim().min(1).max(250),
  title: z.string().trim().min(1).max(250),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});
