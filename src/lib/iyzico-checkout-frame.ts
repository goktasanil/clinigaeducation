import { z } from "zod";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const checkoutSearchSchema = z.object({ session: z.string().regex(uuid) }).strict();

// The opaque origin is deliberate: the provider cannot read this app's DOM,
// session/localStorage or cookies. Popups remain sandboxed; no escape permission.
export const IYZICO_FRAME_SANDBOX =
  "allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation";

// Exact provider origins from iyzico's official CF sample and subscription docs.
// No wildcard/bank domains. New SDK/3DS origins require explicit review and E2E.
// https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-sample-imp.
// https://docs.iyzico.com/en/products/subscription/subscription-implementation/subscription-transactions
const assetOrigins = [
  "https://static.iyzipay.com",
  "https://sandbox-static.iyzipay.com",
  "https://cdnsandbox.iyzipay.com",
] as const;
const apiOrigins = [
  "https://api.iyzipay.com",
  "https://sandbox-api.iyzipay.com",
  "https://sandbox-merchantgw.iyzipay.com",
  "https://sandbox-consumerapigw.iyzipay.com",
] as const;
const frameOrigins = ["https://cpp.iyzipay.com", "https://sandbox-cpp.iyzipay.com"] as const;
const providerOrigins = new Set<string>([...assetOrigins, ...apiOrigins, ...frameOrigins]);
const hashPattern = /^sha256-[A-Za-z0-9+/]{43}=$/;

function callbackSource(callbackUrl?: string): string[] {
  if (!callbackUrl) return [];
  const url = new URL(callbackUrl);
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    [...url.searchParams.keys()].some((key) => key !== "order") ||
    (url.searchParams.has("order") && !uuid.test(url.searchParams.get("order") || "")) ||
    url.pathname !== "/functions/v1/iyzico-callback"
  )
    throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
  return [url.href];
}

export function buildIyzicoFrameCsp(scriptHashes: string[], callbackUrl?: string): string {
  if (!scriptHashes.every((hash) => hashPattern.test(hash))) {
    throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
  }
  const hashes = [...new Set(scriptHashes)].map((hash) => `'${hash}'`);
  return [
    "default-src 'none'",
    `script-src ${[...hashes, ...assetOrigins].join(" ")}`,
    "script-src-attr 'none'",
    `style-src 'unsafe-inline' ${assetOrigins.join(" ")}`,
    `img-src data: ${assetOrigins.join(" ")}`,
    `font-src ${assetOrigins.join(" ")}`,
    `connect-src ${apiOrigins.join(" ")}`,
    `frame-src ${[...frameOrigins, ...apiOrigins].join(" ")}`,
    `form-action ${[...frameOrigins, ...apiOrigins, ...callbackSource(callbackUrl)].join(" ")}`,
    "base-uri 'none'",
    "object-src 'none'",
    "worker-src 'none'",
  ].join("; ");
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ||
      character,
  );
}

async function scriptHash(source: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return "sha256-" + btoa(String.fromCharCode(...new Uint8Array(digest)));
}

export async function buildIyzicoFrameDocument(
  providerHtml: string,
  options: { locale: string; title: string; callbackUrl?: string },
): Promise<string> {
  if (!providerHtml.trim() || providerHtml.length > 1_000_000) {
    throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
  }
  // DOMParser creates an inert document. Provider HTML is never inserted into
  // the application's React DOM, and none of these scripts execute here.
  const parsed = new DOMParser().parseFromString(providerHtml, "text/html");
  const nodes = parsed.querySelectorAll("*");
  const callbackTargets = new Set(callbackSource(options.callbackUrl));
  if (
    nodes.length > 10_000 ||
    parsed.querySelector("base, object, embed, applet, meta[http-equiv]")
  ) {
    throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
  }
  for (const node of nodes) {
    for (const attribute of node.attributes) {
      if (/^on/i.test(attribute.name) || attribute.name === "srcdoc") {
        throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
      }
      if (["src", "href", "action", "formaction", "data", "poster"].includes(attribute.name)) {
        const target = new URL(attribute.value, "https://invalid.invalid/");
        if (
          target.protocol !== "https:" ||
          target.username ||
          target.password ||
          (!providerOrigins.has(target.origin) &&
            !(
              ["action", "formaction"].includes(attribute.name) && callbackTargets.has(target.href)
            ))
        ) {
          throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
        }
      }
    }
  }
  const scripts = Array.from(parsed.querySelectorAll("script"));
  if (!scripts.length || scripts.length > 16) throw new Error("CHECKOUT_FRAME_UNAVAILABLE");
  const hashes = await Promise.all(
    scripts
      .filter((script) => !script.hasAttribute("src"))
      .map((script) => scriptHash(script.textContent || "")),
  );
  const csp = buildIyzicoFrameCsp(hashes, options.callbackUrl);
  const allowedLocales = new Set(["tr", "en", "de", "fr", "it", "es", "ar", "ru", "zh"]);
  const requestedLocale = options.locale.split("-")[0];
  const locale = allowedLocales.has(requestedLocale) ? requestedLocale : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const mount = parsed.getElementById("iyzipay-checkout-form")
    ? ""
    : '<div id="iyzipay-checkout-form" class="responsive"></div>';
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(options.title)}</title><style>html,body{margin:0;min-height:100%;background:#fff;color:#12243a;font-family:system-ui,sans-serif}body{padding:12px;box-sizing:border-box}*,*::before,*::after{box-sizing:border-box}#iyzipay-checkout-form{max-width:100%;min-height:600px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}</style></head><body>${mount}${providerHtml}</body></html>`;
}
