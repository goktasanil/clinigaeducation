// Strict Content-Security-Policy for blog pages.
//
// Blog article bodies come from Wix and may be machine-translated. The HTML is
// sanitized server-side; this policy is the second layer. Advertising origins
// are intentionally excluded so no third-party ad script or tracking frame can
// run on the consulting site.

const IMAGE_ORIGINS = [
  "https://static.wixstatic.com",
  "https://*.wixmp.com",
  "https://*.wixstatic.com",
];

const FRAME_ORIGINS = ["https://www.youtube-nocookie.com", "https://player.vimeo.com"];

export function isBlogPath(pathname: string): boolean {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}

export function buildBlogCsp(supabaseUrlInput?: string): string {
  const supabaseUrl =
    supabaseUrlInput ??
    (typeof process !== "undefined" ? process.env["VITE_SUPABASE_URL"] : "") ??
    "";
  const supabaseOrigins = supabaseUrl ? [supabaseUrl, supabaseUrl.replace(/^https:/, "wss:")] : [];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "script-src-attr": ["'none'"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...IMAGE_ORIGINS],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      ...supabaseOrigins,
      "https://api.openalex.org",
      "https://ai.gateway.lovable.dev",
    ],
    "frame-src": ["'self'", ...FRAME_ORIGINS],
    "media-src": ["'self'", "https://static.wixstatic.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export function blogCspMeta(): { httpEquiv: string; content: string } {
  return {
    httpEquiv: "Content-Security-Policy",
    content: buildBlogCsp(import.meta.env.VITE_SUPABASE_URL as string | undefined),
  };
}
