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

## Dependency audit — 2026-11-09

The current lockfile reports zero npm audit vulnerabilities. The first
hardening pass reduced 31 package records to 10; this follow-up resolves the
remaining Zod, glob-matcher and CSS-parser families. Package records are not
counts of independent exploitable vulnerabilities.

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

Resolved follow-up advisory families:

| Advisory | Updated package | Compatibility boundary |
| --- | --- | --- |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | Zod 4.6.7, pinned directly. | The saved-item record schema now supplies an explicit string-key schema. Tests cover metadata/defaults, rejected invalid input, server-owned identity fields and the existing React Hook Form resolver. Contact and quiz validators retain their existing call sites. |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | minimatch 11.0.5, overridden only under `@typescript-eslint/typescript-estree`. | The current upstream parent still requests v10. The scoped override retains its named-function API and is tested through the real parser's project-service glob boundary, including dot-files and rejected nonmatching files. Node 22 CI satisfies its engine requirement. |
| [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | postcss-selector-parser 6.1.5, overridden only under `@tailwindcss/typography`. | The current typography release pins 6.0.10. Tests run the actual plugin and preserve prose selectors, table styles, exclusions and trailing pseudo-elements; the application CSS is also built normally. |

The overrides are deliberately limited to these two parents. Revisit them when
upstream declares patched versions; do not replace them with a blanket forced
audit fix or downgrade the parent packages.

The current deployment is static GitHub Pages; its browser bundle and Supabase
backend have different exposure from a deployed SSR server. Neither the audit
nor the header change validates production Supabase RLS or anti-abuse controls.
