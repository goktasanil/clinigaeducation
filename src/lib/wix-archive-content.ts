import { sanitizeHtml } from "./sanitize-html.ts";
import { wikimediaImagePrivacyProps } from "./wikimedia-image-privacy.ts";

/** Keep the original rich text while giving the reader one document headline. */
export function sanitizeArchiveHtml(input: string): string {
  const clean = sanitizeHtml(input.replace(/<(\/?\s*)h1\b/gi, "<$1h2"));
  // Wix HTML already encodes query-string separators. Preserve their original
  // meaning after the shared sanitizer has escaped attribute values again.
  const html = clean.replace(/<[a-z]+\b[^>]*>/gi, (tag) =>
    tag.replace(
      /="([^"]*)"/g,
      (_attribute, value: string) =>
        `="${value.replace(/&amp;(amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, "&$1;")}"`,
    ),
  );
  // Apply trusted attributes after sanitization; arbitrary input cannot opt into
  // credentialed CORS or change policies for hosts whose CORS was not verified.
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\ssrc="([^"]*)"/i.exec(tag)?.[1];
    if (!wikimediaImagePrivacyProps(src).crossOrigin) return tag;
    return tag.replace(/\s*\/?>$/, ' crossorigin="anonymous" referrerpolicy="no-referrer" />');
  });
}
