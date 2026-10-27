import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { isolateAccountCache } from "@/lib/account-cache-isolation";

export function AccountCacheBoundary() {
  const queryClient = useQueryClient();
  useEffect(() => {
    // Public editorial pages must work without an authenticated backend.
    // Private routes still enforce their own authentication requirements.
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
      return;
    return isolateAccountCache(supabase.auth, queryClient, () => {
      if (/^\/(?:portal\/|admin(?:\/|$))/.test(window.location.pathname)) {
        // A full reload also replaces stale authenticated route context and
        // removes any previous user's payment iframe from the document.
        window.location.reload();
      }
    });
  }, [queryClient]);
  return null;
}
