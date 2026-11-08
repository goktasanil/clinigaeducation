import { BASELINE_CSP } from "./csp";

/** HTTP protections for the SSR host; static Pages requires an edge proxy. */
export function withBaselineSecurityHeaders(response: Response, requestUrl: string): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // A second CSP is intersected with the route's policy, never replacing the
  // stricter blog allowlist. frame-ancestors is effective only as a header.
  const canonicalHosts = new Set(["clinigaeducation.com", "www.clinigaeducation.com"]);
  const isCanonicalHost = canonicalHosts.has(new URL(requestUrl).hostname);
  if (isCanonicalHost) headers.set("X-Frame-Options", "DENY");
  // Lovable embeds noncanonical preview hosts in its editor. Restrict framing
  // on the public property without granting broad third-party ancestor access.
  const framePolicy = isCanonicalHost ? "; frame-ancestors 'none'" : "";
  headers.append("Content-Security-Policy", BASELINE_CSP + framePolicy);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
