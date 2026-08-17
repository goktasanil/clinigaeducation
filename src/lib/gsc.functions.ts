import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getGscDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, loadDashboard } = await import("./gsc.server");
    await assertAdmin(context.supabase, context.userId);
    return loadDashboard();
  });

export const refreshGscSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, captureSnapshot } = await import("./gsc.server");
    await assertAdmin(context.supabase, context.userId);
    return captureSnapshot();
  });
