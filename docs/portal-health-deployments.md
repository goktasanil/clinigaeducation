# Read-only portal health deployment boundary

The versioned `src/data/portal-health-deployments.json` records deployment state,
not payment readiness. On 2026-11-09 at 10:28 UTC, public GET and browser-style
OPTIONS probes from both canonical origins returned HTTP 404 for `iyzico-health`
and `portal-commerce-health` on project `brxntrrfbodanpckhfgm`. GET bodies reported
`NOT_FOUND`; OPTIONS lacked Access-Control-Allow-Methods and was not successful.
No key or privileged request was needed for these read-only observations.

The frontend skips only those known missing health endpoints on that exact
project origin. It returns the existing unverified/unavailable result:
`ok: false`, `configured: false`, or disabled iyzico capabilities. It does not
fabricate an HTTP 200, mark a provider healthy, deploy functions, provision
products/prices, or enable checkout. Other project origins and endpoints marked
deployed still use real HTTP health checks. Each provider has an independent
eight-second request budget, and a failed provider does not invalidate another
provider's valid live quote. Stripe readiness requires `ok: true`, exact service
`portal-commerce` and boolean `configured` from a real successful response.

The existing account billing/customer-portal, cancellation and Connect request
functions are not gated by this deployment registry. Existing paid-access checks,
price validation and checkout's final health/price recheck remain unchanged.
Public enquiry links remain available when checkout readiness is not verified.

To remove a missing-endpoint entry, first deploy the actual read-only health
function through the existing authorized deployment path. Run
`node scripts/check-health-functions.mjs` to verify both canonical origins, real
GET JSON, OPTIONS, wrong-origin and method boundaries. Confirm that the returned
provider/service identity matches its contract. Only after those checks succeed,
change that function's deployment state to `deployed`, its observed GET status
to 200 and preflight status to 204, and update `observedAt` in a reviewed commit.
A `deployed` entry merely permits real health requests; it never supplies a
configured provider. Do not enable both entries just because one was deployed.
Rebuild and publish the frontend after that reviewed change. Already published
assets keep the previous deployment snapshot until the new build is served.

The existing health deployment workflow does not write this registry, and this
change adds no deployment or financial activation workflow. Missing deployment
access remains an infrastructure limitation. The registry prevents repeated
known-broken probes; it does not claim that the missing backend was completed.
