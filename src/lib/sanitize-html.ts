// Allow-list HTML sanitizer for untrusted/AI-generated markup.
// Worker-safe (no DOM, no jsdom): operates on the raw tag stream.

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
};

const isSafeUrl = (raw: string): boolean => {
  const v = raw.trim().replace(/[\u0000-\u001f\s]/g, "").toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("mailto:") ||
    v.startsWith("/") ||
    v.startsWith("#")
  );
};

const escapeAttr = (raw: string): string =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/g;

export type SanitizeReport = {
  /** True when the sanitizer changed the input in any way. */
  altered: boolean;
  inputLength: number;
  outputLength: number;
  /** Dangerous elements removed with their content, e.g. { script: 2 }. */
  removedDangerousElements: Record<string, number>;
  /** Tags dropped because they are not on the allow-list. */
  removedTags: Record<string, number>;
  /** Attributes dropped (event handlers, unknown attrs), e.g. { "img.onerror": 1 }. */
  removedAttributes: Record<string, number>;
  /** href/src values rejected for unsafe schemes (javascript:, data:, ...). */
  blockedUrls: number;
  /** HTML comments stripped. */
  removedComments: number;
  /** Unclosed tags the sanitizer had to close. */
  autoClosedTags: number;
};

const bump = (bag: Record<string, number>, key: string) => {
  bag[key] = (bag[key] ?? 0) + 1;
};

const emptyReport = (inputLength: number): SanitizeReport => ({
  altered: false,
  inputLength,
  outputLength: 0,
  removedDangerousElements: {},
  removedTags: {},
  removedAttributes: {},
  blockedUrls: 0,
  removedComments: 0,
  autoClosedTags: 0,
});

const sanitizeAttrs = (
  tag: string,
  rawAttrs: string,
  report: SanitizeReport,
): string => {
  const allowed = ALLOWED_ATTRS[tag];
  const out: string[] = [];
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(rawAttrs))) {
    const name = m[1].toLowerCase();
    if (!allowed || !allowed.has(name)) {
      bump(report.removedAttributes, `${tag}.${name}`);
      continue;
    }
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    if ((name === "href" || name === "src") && !isSafeUrl(value)) {
      report.blockedUrls += 1;
      bump(report.removedAttributes, `${tag}.${name}`);
      continue;
    }
    if (name === "target") {
      out.push(`target="_blank"`);
      continue;
    }
    if (name === "rel") continue; // re-added below for links
    out.push(`${name}="${escapeAttr(value)}"`);
  }
  if (tag === "a" && out.some((a) => a.startsWith("target="))) {
    out.push(`rel="noopener noreferrer"`);
  }
  return out.length ? ` ${out.join(" ")}` : "";
};

/**
 * Strips everything not on the allow-list: script/style/iframe bodies,
 * event handlers, javascript: / data: URLs, comments and unknown tags.
 * Also returns an audit report describing exactly what was removed.
 */
export function sanitizeHtmlWithReport(input: string): {
  html: string;
  report: SanitizeReport;
} {
  const report = emptyReport(input?.length ?? 0);
  if (!input) return { html: "", report };

  // Remove comments and dangerous elements together with their content.
  let html = input.replace(/<!--[\s\S]*?-->/g, () => {
    report.removedComments += 1;
    return "";
  });
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|noscript|template|svg|math|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
    (_full, tag: string) => {
      bump(report.removedDangerousElements, tag.toLowerCase());
      return "";
    },
  );

  const openStack: string[] = [];
  let out = "";
  const TAG_RE = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)\s*>/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = TAG_RE.exec(html))) {
    out += html.slice(last, m.index);
    last = m.index + m[0].length;

    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      bump(report.removedTags, tag);
      continue;
    }

    if (closing) {
      if (VOID_TAGS.has(tag)) continue;
      const idx = openStack.lastIndexOf(tag);
      if (idx === -1) continue;
      openStack.splice(idx, 1);
      out += `</${tag}>`;
      continue;
    }

    const attrs = sanitizeAttrs(tag, m[3] ?? "", report);
    if (VOID_TAGS.has(tag)) {
      out += `<${tag}${attrs} />`;
    } else if (m[4] === "/") {
      out += `<${tag}${attrs}></${tag}>`;
    } else {
      openStack.push(tag);
      out += `<${tag}${attrs}>`;
    }
  }
  out += html.slice(last);

  // Close anything left open, innermost first.
  report.autoClosedTags = openStack.length;
  for (let i = openStack.length - 1; i >= 0; i--) {
    out += `</${openStack[i]}>`;
  }

  report.outputLength = out.length;
  report.altered = out !== input;
  return { html: out, report };
}

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlWithReport(input).html;
}

/** True when the report contains something worth auditing. */
export function reportHasRemovals(report: SanitizeReport): boolean {
  return (
    report.blockedUrls > 0 ||
    report.removedComments > 0 ||
    report.autoClosedTags > 0 ||
    Object.keys(report.removedDangerousElements).length > 0 ||
    Object.keys(report.removedTags).length > 0 ||
    Object.keys(report.removedAttributes).length > 0
  );
}

