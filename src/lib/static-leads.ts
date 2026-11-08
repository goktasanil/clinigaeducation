import { supabase } from "@/integrations/supabase/client";
import { submitLeadWithRpc, type LeadInput } from "@/lib/lead-rpc";

export const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

/** Static hosting uses the publishable client and the bounded public lead RPC. */
export async function submitStaticLead(input: LeadInput) {
  return submitLeadWithRpc((name, args) => supabase.rpc(name as never, args as never), input);
}
