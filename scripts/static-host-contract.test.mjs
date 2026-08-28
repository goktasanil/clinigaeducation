import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("authenticated server-only routes are blocked on the static host", async () => {
  const source = await read("src/routes/_authenticated/route.tsx");
  assert.match(source, /VITE_STATIC_HOST/);
  assert.match(source, /pathname\.startsWith\("\/admin"\)/);
  assert.match(source, /pathname\.startsWith\("\/portal\/"\)/);
  assert.match(source, /StaticServerRuntimeNotice/);
});

test("static blog pages never invoke server-only translation functions", async () => {
  const listSource = await read("src/routes/blog.tsx");
  const detailSource = await read("src/routes/blog_.$slug.tsx");
  assert.match(
    listSource,
    /enabled:\s*!isStaticHost\s*&&\s*lang\s*!==\s*"tr"/,
  );
  assert.match(
    listSource,
    /enabled:\s*!isStaticHost\s*&&\s*i18n\.language\s*!==\s*"tr"/,
  );
  assert.match(
    detailSource,
    /enabled:\s*!isStaticHost\s*&&\s*!!post\s*&&\s*lang\s*!==\s*"tr"/,
  );
});

test("public portal uses non-privileged commerce fallbacks on GitHub Pages", async () => {
  const source = await read("src/routes/portal.tsx");
  assert.match(source, /StaticPortalCommerceNotice/);
  assert.match(source, /StaticPortalPricing/);
  assert.match(source, /isStaticHost/);
});

test("GitHub Pages build exposes only publishable Supabase configuration", async () => {
  const workflow = await read(".github/workflows/pages.yml");
  assert.match(workflow, /VITE_STATIC_HOST:\s*"true"/);
  assert.match(workflow, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(workflow, /VITE_SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(workflow, /VITE_STRIPE_(?:SECRET|RESTRICTED|WEBHOOK)/);
  assert.doesNotMatch(workflow, /VITE_LOVABLE_API_KEY/);
  assert.doesNotMatch(workflow, /VITE_GOOGLE_SEARCH_CONSOLE_API_KEY/);
  assert.doesNotMatch(workflow, /VITE_WIX_API_KEY/);
});

test("crawler rules exclude authenticated and API surfaces", async () => {
  const robots = await read("public/robots.txt");
  assert.match(robots, /Disallow: \/admin\//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/portal\/panel/);
  assert.match(robots, /Disallow: \/portal\/verify/);
});
