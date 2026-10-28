import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { JOURNAL_LANGUAGES } from "./journal-content.mjs";
import { FEATURED_EUROPE_GUIDES } from "../src/data/europe-blog/featured.ts";
import { sanitizeArchiveHtml } from "../src/lib/wix-archive-content.ts";
const root = resolve(import.meta.dirname, "..");
const json = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const baselinePhotos = await json("src/data/journal/photography.json");
let expansionPhotos = {};
try {
  expansionPhotos = await json("src/data/journal/expansion/photography.json");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const photoManifest = { ...baselinePhotos, ...expansionPhotos };
const release = await json("src/data/wix-archive/generated/release-manifest.json");
const catalogue = await json("src/data/wix-archive/generated/catalog.json");
const countries = await json("src/data/europe-blog/generated/catalog.json");
const aliases = await json("src/data/wix-archive/generated/aliases.json");
const htmlFor = (path) =>
  readFile(resolve(root, ".output/public", "." + decodeURIComponent(path), "index.html"), "utf8");
const origin = "https://www.clinigaeducation.com";
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1];
const decode = (value) => value?.replace(/&amp;/g, "&");
const tags = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((m) => m[0]);
assert.equal(release.schemaVersion, 1);
assert.ok(!release.preparationOnly, "Local preparation output cannot pass publication audit");
assert.equal(
  release.topicsPerLanguage,
  release.targetTopics,
  "Explicit unique-topic publication target",
);
assert.equal(
  catalogue.length,
  release.journalArticlePages,
  "Every journal topic requires ten complete versions",
);
assert.equal(countries.length, 52);
assert.equal(Object.keys(photoManifest).length, release.targetTopics);
assert.equal(
  new Set(Object.values(photoManifest).map((photo) => photo.sourceUrl)).size,
  release.targetTopics,
  "Every topic needs a distinct photograph",
);
const groups = new Map();
const checked = [];
for (const language of JOURNAL_LANGUAGES) {
  const posts = await json(`src/data/wix-archive/generated/detail-${language}.json`);
  const guides = await json(`src/data/europe-blog/generated/${language}.json`);
  assert.equal(posts.length, release.journalTopics, language + " journal count");
  assert.equal(guides.length, release.guideTopics, language + " guide count");
  const entries = [
    ...posts.map((post) => ({ ...post, path: catalogue.find((p) => p.id === post.id)?.path })),
    ...guides.map((guide) => ({ ...guide, language, path: `/${language}/blog/${guide.slug}` })),
  ];
  for (const entry of entries) {
    assert.ok(entry.path, "Missing canonical path");
    const html = await htmlFor(entry.path);
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
    const documentLanguage = attribute(tags(html, "html")[0], "lang");
    assert.equal(documentLanguage, language, entry.path + " document language");
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, entry.path + " H1");
    assert.equal((head.match(/<title\b/gi) || []).length, 1, entry.path + " title");
    const links = tags(head, "link");
    const canonical = links.filter((tag) => attribute(tag, "rel") === "canonical");
    assert.equal(canonical.length, 1);
    assert.equal(
      decode(attribute(canonical[0], "href")),
      origin + entry.path,
      entry.path + " canonical",
    );
    const alternates = links.filter((tag) => attribute(tag, "rel") === "alternate");
    assert.deepEqual(
      alternates.map((tag) => attribute(tag, "hreflang")).sort(),
      [...JOURNAL_LANGUAGES, "x-default"].sort(),
      entry.path + " complete alternate group",
    );
    const meta = tags(head, "meta");
    assert.ok(
      meta.some(
        (tag) => attribute(tag, "name") === "description" && attribute(tag, "content")?.trim(),
      ),
      entry.path + " description",
    );
    assert.ok(
      meta.some(
        (tag) =>
          attribute(tag, "name") === "robots" &&
          /^index,?\s*follow/.test(attribute(tag, "content") || ""),
      ),
      entry.path + " robots",
    );
    assert.ok(
      meta.some(
        (tag) =>
          attribute(tag, "property") === "og:image" &&
          decode(attribute(tag, "content")) === entry.coverImage,
      ),
      entry.path + " photographic social image",
    );
    assert.ok(
      html.includes(entry.photoCredit.sourceUrl.replace(/&/g, "&amp;")),
      entry.path + " photo attribution",
    );
    for (const source of entry.editorialSources || [])
      assert.ok(
        html.includes(source.url.replace(/&/g, "&amp;")),
        entry.path + " official editorial source: " + source.url,
      );
    assert.ok(!/(?:&lt;unk&gt;|⁇)/.test(html), entry.path + " unresolved translation token");
    if (entry.editorialTopicKey) {
      assert.equal(entry.language, language);
      assert.ok(
        html.includes(sanitizeArchiveHtml(entry.html)),
        entry.path + " complete native primary body must be rendered",
      );
      assert.ok(
        entry.html.replace(/<[^>]+>/g, "").trim().length > 100,
        entry.path + " full primary text",
      );
      const members = groups.get(entry.editorialTopicKey) || [];
      members.push(language);
      groups.set(entry.editorialTopicKey, members);
    }
    checked.push(entry.path);
  }
  const library = await htmlFor(`/${language}/blog`);
  const hrefs = new Set(tags(library, "a").map((tag) => decode(attribute(tag, "href"))));
  for (const entry of entries)
    assert.ok(
      hrefs.has(entry.path),
      "Article missing from native country directory: " + entry.path,
    );
  const visibleLibrary = library
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ");
  assert.ok(
    !/Wix.{0,15}(?:arşiv|archive)|Önceki yazılar|Previously published articles/i.test(
      visibleLibrary,
    ),
    "Retired archive presentation",
  );
}
assert.equal(groups.size, release.journalTopics);
for (const [key, languages] of groups)
  assert.deepEqual(languages.sort(), [...JOURNAL_LANGUAGES].sort(), key);
for (const alias of aliases) {
  const html = await htmlFor("/blog/" + encodeURIComponent(alias.slug));
  assert.ok(
    html.includes("url=" + alias.path),
    "Missing genuine legacy replacement: " + alias.slug,
  );
}
const homepage = await htmlFor("/");
const homepageImages = tags(homepage, "img").map((tag) => decode(attribute(tag, "src")));
for (const { slug } of FEATURED_EUROPE_GUIDES) {
  const photo = photoManifest[slug];
  assert.ok(
    homepageImages.includes(photo.url),
    "Homepage must use the article photograph: " + slug,
  );
  assert.ok(
    homepage.includes(photo.sourceUrl.replace(/&/g, "&amp;")),
    "Homepage photograph requires source attribution: " + slug,
  );
}
assert.ok(
  !homepageImages.some((src) => src?.startsWith("/blog-covers/")),
  "Homepage must not use retired abstract journal covers",
);
const summary = {
  journalTopics: groups.size,
  guideTopics: release.guideTopics,
  topicsPerLanguage: release.targetTopics,
  languages: JOURNAL_LANGUAGES,
  nativeArticlePages: checked.length,
  uniquePhotographs: Object.keys(photoManifest).length,
  preservedLegacyAliases: aliases.length,
  errors: 0,
};
await mkdir(resolve(root, ".journal-work"), { recursive: true });
await writeFile(
  resolve(root, ".journal-work/static-audit.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify(summary));
