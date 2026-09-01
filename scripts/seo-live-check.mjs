const ORIGIN = new URL(process.env.SEO_ORIGIN || "https://www.clinigaeducation.com").origin;
const REDIRECT_ORIGIN = new URL(process.env.SEO_REDIRECT_ORIGIN || "https://clinigaeducation.com")
  .origin;
const TIMEOUT_MS = Number(process.env.SEO_TIMEOUT_MS || 30_000);
const CONCURRENCY = Math.max(1, Number(process.env.SEO_CONCURRENCY || 6));
const USER_AGENT = "CliniGAEducation-SEO-Monitor/1.0";

const errors = [];

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function tags(source, name) {
  return [...source.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function normalizeUrl(value) {
  const url = new URL(value, ORIGIN);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      headers: { "User-Agent": USER_AGENT, Accept: "*/*", ...init.headers },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url, init = {}) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, init);
      if (response.status < 500 || attempt === 1) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function checkRedirect() {
  try {
    const response = await fetchWithRetry(`${REDIRECT_ORIGIN}/`, { redirect: "manual" });
    const location = response.headers.get("location");
    if (![301, 308].includes(response.status)) {
      errors.push(
        `${REDIRECT_ORIGIN}/: expected a permanent redirect, received ${response.status}`,
      );
      return;
    }
    if (!location || normalizeUrl(location) !== normalizeUrl(`${ORIGIN}/`)) {
      errors.push(`${REDIRECT_ORIGIN}/: redirect target is not ${ORIGIN}/`);
    }
  } catch (error) {
    errors.push(`${REDIRECT_ORIGIN}/: redirect check failed (${error.message})`);
  }
}

async function readText(url, label, expectedType) {
  try {
    const response = await fetchWithRetry(url);
    if (response.status !== 200) {
      errors.push(`${label}: expected 200, received ${response.status}`);
      return "";
    }
    const contentType = response.headers.get("content-type") || "";
    if (expectedType && !contentType.toLowerCase().includes(expectedType)) {
      errors.push(`${label}: unexpected content type ${contentType || "missing"}`);
    }
    return await response.text();
  } catch (error) {
    errors.push(`${label}: request failed (${error.message})`);
    return "";
  }
}

function sitemapUrls(xml) {
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim()))];
}

function inspectHtml(url, html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
  const canonicalTags = tags(head, "link").filter(
    (tag) => attribute(tag, "rel")?.toLowerCase() === "canonical",
  );
  const robotsTags = tags(head, "meta").filter(
    (tag) => attribute(tag, "name")?.toLowerCase() === "robots",
  );
  const descriptionTags = tags(head, "meta").filter(
    (tag) => attribute(tag, "name")?.toLowerCase() === "description",
  );
  const titleCount = (head.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) || []).length;
  const h1Count = (body.match(/<h1\b/gi) || []).length;

  if (canonicalTags.length !== 1) {
    errors.push(`${url}: expected exactly one canonical, found ${canonicalTags.length}`);
  } else {
    const canonical = attribute(canonicalTags[0], "href");
    if (!canonical || normalizeUrl(canonical) !== normalizeUrl(url)) {
      errors.push(`${url}: canonical is not absolute and self-referencing`);
    }
  }

  if (robotsTags.length !== 1) {
    errors.push(`${url}: expected exactly one robots meta tag, found ${robotsTags.length}`);
  } else {
    const robots = (attribute(robotsTags[0], "content") || "").toLowerCase();
    if (!robots.includes("index") || !robots.includes("follow") || robots.includes("noindex")) {
      errors.push(`${url}: sitemap URL is not index,follow`);
    }
  }

  if (descriptionTags.length !== 1 || !(attribute(descriptionTags[0], "content") || "").trim()) {
    errors.push(`${url}: a single non-empty meta description is required`);
  }
  if (titleCount !== 1) errors.push(`${url}: expected exactly one title, found ${titleCount}`);
  if (h1Count !== 1) errors.push(`${url}: expected exactly one h1, found ${h1Count}`);
}

async function inspectUrl(url) {
  try {
    const response = await fetchWithRetry(url);
    if (response.status !== 200) {
      errors.push(`${url}: expected 200, received ${response.status}`);
      return;
    }
    if (normalizeUrl(response.url) !== normalizeUrl(url)) {
      errors.push(`${url}: unexpectedly redirected to ${response.url}`);
      return;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      errors.push(`${url}: expected HTML, received ${contentType || "missing content type"}`);
      return;
    }
    const xRobotsTag = (response.headers.get("x-robots-tag") || "").toLowerCase();
    if (xRobotsTag.includes("noindex")) {
      errors.push(`${url}: X-Robots-Tag contains noindex`);
    }
    inspectHtml(url, await response.text());
  } catch (error) {
    errors.push(`${url}: request failed (${error.message})`);
  }
}

async function mapWithConcurrency(items, worker) {
  let index = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      await worker(items[current]);
    }
  });
  await Promise.all(workers);
}

await checkRedirect();

const robots = await readText(`${ORIGIN}/robots.txt`, "robots.txt", "text/plain");
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  errors.push("robots.txt: canonical sitemap directive is missing");
}
for (const path of [
  "/auth",
  "/admin/",
  "/api/",
  "/portal/account",
  "/portal/panel",
  "/portal/verify",
  "/portal/workspace",
]) {
  if (!robots.includes(`Disallow: ${path}`)) errors.push(`robots.txt: missing Disallow: ${path}`);
}

const sitemap = await readText(`${ORIGIN}/sitemap.xml`, "sitemap.xml", "xml");
const urls = sitemapUrls(sitemap);
if (urls.length < 25) errors.push(`sitemap.xml: expected at least 25 URLs, found ${urls.length}`);

for (const url of urls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    errors.push(`sitemap.xml: invalid URL ${url}`);
    continue;
  }
  if (parsed.origin !== ORIGIN) errors.push(`sitemap.xml: non-canonical origin ${url}`);
  if (parsed.search || parsed.hash)
    errors.push(`sitemap.xml: query or fragment is not allowed (${url})`);
  if (
    /^\/(?:auth|admin|api)(?:\/|$)/.test(parsed.pathname) ||
    /^\/portal\/(?:account|panel|verify|workspace)(?:\/|$)/.test(parsed.pathname)
  ) {
    errors.push(`sitemap.xml: private route included (${url})`);
  }
}

await mapWithConcurrency(urls, inspectUrl);

const summary = {
  origin: ORIGIN,
  sitemapUrls: urls.length,
  concurrency: CONCURRENCY,
  errors: errors.length,
};
console.log(`[seo-live] ${JSON.stringify(summary)}`);

if (errors.length) {
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}
