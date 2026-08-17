// Correlation IDs that tie a blog page response to its sanitization audit logs.
//
// IDs are DERIVED (not random) from stable inputs so that the value rendered
// into the page during SSR, the value sent back on the response header, and the
// value written to the server logs all match — a random id would differ between
// SSR and hydration and break correlation.

export const AUDIT_ID_HEADER = "X-Audit-Id";

/** FNV-1a — small, sync, no crypto needed (this is a correlation id, not a secret). */
function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** UTC day bucket, so ids rotate daily but stay stable within a page view. */
export function auditDayBucket(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Deterministic id from arbitrary parts, e.g. slug + language + day. */
export function deriveAuditId(parts: (string | undefined)[]): string {
  const seed = parts.filter(Boolean).join("|");
  return `aud_${hash(seed)}${hash(`${seed}#salt`)}`;
}

/** Id for one blog page view (slug + language + day). */
export function blogAuditId(slug: string, lang: string, day = auditDayBucket()): string {
  return deriveAuditId(["blog", slug, lang, day]);
}

const ID_RE = /^aud_[0-9a-f]{16}$/;

export const isAuditId = (v: string | null | undefined): boolean => !!v && ID_RE.test(v);

/** Reuse a caller-supplied id when it is well-formed, otherwise derive one. */
export function auditIdForPath(pathname: string, incoming?: string | null): string {
  if (isAuditId(incoming)) return incoming!;
  return deriveAuditId(["path", pathname, auditDayBucket()]);
}
