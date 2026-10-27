import type { QueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Public and private cached data must not survive a change of account. */
export function isolateAccountCache(
  auth: Pick<SupabaseClient["auth"], "onAuthStateChange">,
  queryClient: QueryClient,
  onAccountChanged: () => void,
) {
  let previousUserId: string | null | undefined;
  const { data } = auth.onAuthStateChange((_event, session) => {
    const nextUserId = session?.user.id ?? null;
    if (previousUserId !== undefined && previousUserId !== nextUserId) {
      // clear() cancels and removes queries and mutations synchronously. A
      // refreshed token for the same user deliberately keeps their cache.
      queryClient.clear();
      onAccountChanged();
    }
    previousUserId = nextUserId;
  });
  return () => data.subscription.unsubscribe();
}
