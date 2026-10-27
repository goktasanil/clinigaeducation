import { QueryClient } from "@tanstack/react-query";
import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { isolateAccountCache } from "./account-cache-isolation";

describe("private query account isolation", () => {
  it("keeps same-user refreshes but clears cached account and payment data on a switch", () => {
    let listener: (event: AuthChangeEvent, session: Session | null) => void = () => {};
    const unsubscribe = vi.fn();
    const auth = {
      onAuthStateChange: (callback: typeof listener) => {
        listener = callback;
        return { data: { subscription: { unsubscribe } } };
      },
    } as unknown as Pick<SupabaseClient["auth"], "onAuthStateChange">;
    const cache = new QueryClient();
    const changed = vi.fn();
    const stop = isolateAccountCache(auth, cache, changed);
    const session = (id: string) => ({ user: { id } }) as Session;

    listener("INITIAL_SESSION", session("test-account-a"));
    cache.setQueryData(["portal-dashboard"], { balance: 42 });
    cache.setQueryData(["portal-iyzico-checkout", "test-account-a"], { privateForm: true });
    listener("TOKEN_REFRESHED", session("test-account-a"));
    expect(cache.getQueryData(["portal-dashboard"])).toEqual({ balance: 42 });
    expect(changed).not.toHaveBeenCalled();

    listener("SIGNED_IN", session("test-account-b"));
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
    expect(changed).toHaveBeenCalledTimes(1);

    cache.setQueryData(["portal-dashboard"], { balance: 7 });
    listener("SIGNED_OUT", null);
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
    expect(changed).toHaveBeenCalledTimes(2);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
