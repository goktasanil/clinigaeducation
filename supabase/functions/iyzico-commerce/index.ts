import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { commerceHandler } from "../_shared/iyzico-runtime.mjs";
Deno.serve(commerceHandler);
