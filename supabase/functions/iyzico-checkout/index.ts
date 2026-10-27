import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { hostedFormHandler } from "../_shared/iyzico-runtime.mjs";
Deno.serve(hostedFormHandler);
