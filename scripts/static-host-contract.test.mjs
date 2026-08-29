import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("static host blocks privileged routes but allows browser-safe student routes", async () => {
  const source = await read("src/routes/_authenticated/route.tsx");
  assert.match(source, /VITE_STATIC_HOST/);
  assert.match(source, /pathname\.startsWith\("\/admin"\)/);
  assert.match(source, /pathname\.startsWith\("\/portal\/"\)/);
  assert.match(source, /StaticServerRuntimeNotice/);
  assert.match(source, /STATIC_BROWSER_SAFE_PORTAL_ROUTES/);
  assert.match(source, /"\/portal\/workspace"/);
  assert.match(source, /"\/portal\/verify"/);
  assert.match(source, /"\/portal\/account"/);
});

test("legacy static panel callbacks redirect to the browser-safe account center", async () => {
  const auth = await read("src/routes/auth.tsx");
  const guard = await read("src/routes/_authenticated/route.tsx");
  assert.match(auth, /DEFAULT_PORTAL_DESTINATION\s*=\s*"\/portal\/workspace"/);
  assert.match(auth, /LEGACY_PANEL_PATH\s*=\s*"\/portal\/panel"/);
  assert.match(auth, /SAFE_ACCOUNT_PATH\s*=\s*"\/portal\/account"/);
  assert.match(auth, /SAFE_ACCOUNT_PATH \+ value\.slice\(LEGACY_PANEL_PATH\.length\)/);
  assert.match(guard, /location\.pathname === "\/portal\/panel"/);
  assert.match(guard, /StaticPortalPanelRedirect/);
  assert.match(guard, /`\/portal\/account\$\{searchStr \|\| ""\}`/);
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

test("public portal uses browser-safe Edge commerce surfaces on GitHub Pages", async () => {
  const source = await read("src/routes/portal.tsx");
  assert.match(source, /StaticPortalCommerceNotice/);
  assert.match(source, /StaticPortalPricing/);
  assert.match(source, /PortalStaticCommunityFeed/);
  assert.match(source, /isStaticHost/);
});

test("Student Journey document uploads match the production private-document constraint", async () => {
  const source = await read("src/components/portal/PortalJourneyWorkspace.tsx");
  assert.match(source, /review_status:\s*"private"/);
  assert.doesNotMatch(source, /review_status:\s*"uploaded"/);
  assert.match(source, /storage\.from\("portal-documents"\)/);
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

test("Lighthouse audits the rendered homepage without production secrets", async () => {
  const workflow = await read(".github/workflows/lighthouse.yml");
  const config = await read("lighthouserc.cjs");
  const renderer = await read("scripts/render-lighthouse-page.mjs");
  assert.match(workflow, /npm run lhci:prepare/);
  assert.match(workflow, /include-hidden-files:\s*true/);
  assert.doesNotMatch(workflow, /secrets\./);
  assert.match(config, /vite preview --config vite\.lighthouse\.config\.ts/);
  assert.match(renderer, /https:\/\/www\.clinigaeducation\.com\//);
  assert.match(renderer, /\.output\/public\/index\.html/);
});

test("crawler rules exclude authenticated and API surfaces", async () => {
  const robots = await read("public/robots.txt");
  assert.match(robots, /Disallow: \/admin\//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/portal\/account/);
  assert.match(robots, /Disallow: \/portal\/panel/);
  assert.match(robots, /Disallow: \/portal\/verify/);
  assert.match(robots, /Disallow: \/portal\/workspace/);
});
