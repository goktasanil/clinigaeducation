# Lead form rollout without an Edge deployment credential

This uses the existing project `brxntrrfbodanpckhfgm` and its publishable client.
It needs no new secret, Edge Function, payment activation or unrelated frontend.

1. After source review and CI, use the supported database deployment path to
   apply only `20261108234455_prepare_public_lead_rpc.sql`. Verify the existing
   leads schema/indexes and administrator policies first. The new function must
   have the expected deployment owner, SECURITY DEFINER, empty search_path and
   explicit anon/authenticated EXECUTE. Existing raw form insertion stays open.
2. Verify function/catalog state and a deliberately invalid request (HTTP 400),
   without creating a real lead. Publish the separate frontend RPC change only
   after this backend is ready.
3. After that frontend is live, apply
   `20261108234456_require_public_lead_rpc.sql`. It revokes raw client INSERT and
   adds a restrictive INSERT deny policy, while leaving administrator reads and
   updates intact. Cached legacy forms need a page reload after this final cutover.

Do not apply both pending migrations before the new frontend is published.
No workflow automatically applies database changes.

The public function accepts a single strictly whitelisted JSON object; it accepts
no user/role/state/confirmation identifier. Required and optional types, scalar
lengths, nested quiz data, normalized UTF-8 JSON size (64 KiB), empty honeypot,
form timing and appointment/date bounds are checked in PostgreSQL. The normalized
JSON bound does not claim to measure original HTTP whitespace before PostgREST.

An advisory transaction lock serializes the fresh READ COMMITTED quota checks
and actual insertion. Limits are three accepted leads per normalized email and
sixty globally in the preceding hour. No new email/IP identity table or client
IP trust is introduced; the existing leads email column is used. Error responses
are generic PT400/429/409/503. Only the newly generated confirmation code and
requested appointment are returned; existing lead rows and role data are not.

The independent synthetic database tests execute the actual two migration files.
They cover anonymous/authenticated RPC access, raw INSERT denial, future policy
bypass attempts, strict input checks, multibyte/escaped JSON bounds, shared role
quotas, expired windows, advisory locks, stale isolation, appointment collisions,
legacy-client staging and administrator read/update preservation. They do not
claim a real two-connection production concurrency or transport load test.

Run `npm ci --prefix supabase/tests --ignore-scripts` then
`npm --prefix supabase/tests test`. No credentials or production rows are required.
