# Security hardening and hosting boundary

The application now supplies a baseline Content Security Policy to every page,
including prerendered GitHub Pages HTML. It restricts base URLs to the same
origin, disables plugin/object embedding and inline event attributes, and
upgrades insecure subresources. React event listeners and feature-specific
checkout, map and consented advertising policies remain available. This baseline
is not a complete script-source allowlist.

The Pages build installs the committed lockfile with `npm ci`, so reviewed
dependency resolutions are used consistently for deployment.

For the canonical `clinigaeducation.com` and `www.clinigaeducation.com` hosts,
the SSR entry also returns `X-Frame-Options: DENY` and CSP
`frame-ancestors 'none'`, while preserving stricter route CSPs. Noncanonical
preview hosts retain their existing framing behavior for the Lovable editor.
Existing nosniff, referrer, permissions and HSTS headers remain enabled.

The catastrophic error page binds its retry button with `addEventListener`,
so it continues to work when inline HTML event attributes are blocked.

GitHub Pages serves captured HTML, not the SSR `Response` headers. Therefore the
SSR headers do not automatically reach the custom domain. To enable response
headers on the live static site, configure the same policies in an authorized
CDN/reverse proxy or move to the SSR host. Do not claim that a meta element
enables HSTS, nosniff, Permissions-Policy, or frame-ancestors.

The static contact form currently inserts into Supabase using the publishable
role and a constrained RLS insert policy. Its honeypot and timing gate run in the
browser; they do not enforce server-side rate limits. A separate deployment is
needed to move this ingress behind an Edge Function with validated input,
server-side bot/rate controls, and no direct anonymous table insertion. Preserve
the current form until that backend is deployed and verified.

## Dependency audit — 2026-11-08

The lockfile review reduced npm audit package records from 31 (10 critical,
10 high, 11 moderate) to 10 (0 critical, 1 high, 9 moderate). Transitive package
records are not counts of independent exploitable vulnerabilities.

The updated dependency graph uses TanStack Start 1.169.5 / start-server-core
1.169.45 (including the fix for
[GHSA-qx66-fv34-fjm8](https://github.com/advisories/GHSA-qx66-fv34-fjm8)),
seroval 1.7.10 and Vite 8.3.6. Server functions now use the supported `validator`
API with their existing schema validation unchanged. Vitest was explicitly
upgraded to 5.1.0 to remove the vulnerable test-worker graph, without applying a
blanket forced audit fix. CI Node.js 22 is compatible with its Node 22.12+
requirement.

Bare or malformed checkout URLs now enter an invalid-checkout state without
throwing an SSR error. Only a strictly validated session UUID mounts the payment
query component. The route no longer needs `@tanstack/zod-adapter`, so that
dependency was removed. This also allows static capture of `/portal/checkout`
without inventing or persisting a payment session.

Vitest runs at most four workers concurrently so the large journal and lazy
locale transforms do not oversubscribe high-core developer hosts. The normal
per-test timeout is retained.

Remaining advisory families:

| Advisory | Type / package | Scope and next fix |
| --- | --- | --- |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | High, collection-validation memory exhaustion; Zod 3.25.76. | Browser validation and SSR input validators. GitHub Pages does not expose the TanStack SSR functions; this is not evidence of a live static-site exploit. Migrate to Zod 4.6.6+ with schema compatibility and request-size tests before an SSR release. A blanket major upgrade was not applied. |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Moderate, glob amplification DoS; minimatch 10.2.6 via TypeScript ESLint. | Lint/development graph, not the browser runtime. Adopt a compatible upstream tool release with minimatch 11.0.1+; npm currently proposes a tool downgrade outside the declared range. |
| [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | Moderate, selector-parser CPU exhaustion; postcss-selector-parser 6.0.10 via Tailwind typography. | CSS generation/build graph. Adopt a compatible typography/parser update with parser 6.1.5+ and verify generated CSS; npm currently proposes an older typography release outside the declared range. |

The current deployment is static GitHub Pages; its browser bundle and Supabase
backend have different exposure from a deployed SSR server. Neither the audit
nor the header change validates production Supabase RLS or anti-abuse controls.
