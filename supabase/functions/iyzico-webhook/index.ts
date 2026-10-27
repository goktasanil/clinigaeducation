import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { webhookHandler } from "../_shared/iyzico-runtime.mjs";
Deno.serve(webhookHandler);
