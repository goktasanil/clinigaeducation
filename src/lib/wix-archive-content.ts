import { sanitizeHtml } from "./sanitize-html.ts";

/** Keep the original rich text while giving the reader one document headline. */
export function sanitizeArchiveHtml(input: string): string {
  const clean = sanitizeHtml(input.replace(/<(\/?\s*)h1\b/gi, "<$1h2"));
  // Wix HTML already encodes query-string separators. Preserve their original
  // meaning after the shared sanitizer has escaped attribute values again.
  return clean.replace(/<[a-z]+\b[^>]*>/gi, (tag) =>
    tag.replace(
      /="([^"]*)"/g,
      (_attribute, value: string) =>
        `="${value.replace(/&amp;(amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, "&$1;")}"`,
    ),
  );
}
