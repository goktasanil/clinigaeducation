import assert from "node:assert/strict";
import test from "node:test";
import {
  compileCompleteJournal,
  applyVerifiedFacts,
  applyTranslationCorrections,
  restoreSourceUrlLabels,
  journalSourceHash,
  JOURNAL_LANGUAGES,
} from "./journal-content.mjs";
const source = {
  id: "source-1",
  title: "Admission requirements",
  excerpt: "A complete source article.",
  slug: "admission-requirements",
  language: "en",
  translationId: null,
  html: "<p>A complete source article with verified requirements and links.</p>",
  updatedAt: "2026-10-28T00:00:00Z",
  publishedAt: "2022-01-01T00:00:00Z",
  sourceUrl: "https://www.anilgoktas.org/source",
};
const topics = { "source-1": { countryCodes: ["JP"], topic: "admission" } };
const photos = {
  "source-1": {
    url: "https://upload.wikimedia.org/photo.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:photo.jpg",
    width: 1280,
    height: 720,
    license: "CC BY 4.0",
  },
};
const translations = JOURNAL_LANGUAGES.filter((l) => l !== "en").map((language) => ({
  id: "translation-" + language,
  topicKey: "source-1",
  sourceId: source.id,
  sourceHash: journalSourceHash(source),
  language,
  slug: source.slug,
  title: "Translated title " + language,
  excerpt: "Full translated introductory text.",
  html: "<p>Fully translated article preserving the source meaning and content.</p>",
}));
test("restores exact source URL labels even when different links get the same failed translation", () => {
  const sourceHtml =
    '<p><a href="https://example.org/a">https://example.org/a</a><a href="https://example.org/b">https://example.org/b</a><a href="https://example.org/c">Read more</a></p>';
  const translated =
    '<p><a href="https://example.org/a">WEB WEB</a><a href="https://example.org/b">WEB WEB</a><a href="https://example.org/c">了解更多</a></p>';
  assert.equal(
    restoreSourceUrlLabels(translated, sourceHtml),
    '<p><a href="https://example.org/a">https://example.org/a</a><a href="https://example.org/b">https://example.org/b</a><a href="https://example.org/c">了解更多</a></p>',
  );
});
test("bilingual corrections require exact text nodes and never alter matching fragments or markup", () => {
  const html = '<p>十一</p><p>十一月的课程</p><a href="https://example.org/11">link</a>';
  const result = applyTranslationCorrections(html, [{ before: "十一", after: "A/T 11" }]);
  assert.equal(result, '<p>A/T 11</p><p>十一月的课程</p><a href="https://example.org/11">link</a>');
  assert.throws(
    () => applyTranslationCorrections(result, [{ before: "十一", after: "A/T 11" }]),
    /reviewed exact text node count/,
  );
});
test("repeated bilingual corrections require an explicit exact reviewed count", () => {
  const html = "<td>Wrong term</td><td>Wrong term</td><p>Wrong term fragment</p>";
  const correction = { before: "Wrong term", after: "Reviewed term", expectedMatches: 2 };
  assert.equal(
    applyTranslationCorrections(html, [correction]),
    "<td>Reviewed term</td><td>Reviewed term</td><p>Wrong term fragment</p>",
  );
  assert.throws(
    () => applyTranslationCorrections(html, [{ ...correction, expectedMatches: 1 }]),
    /reviewed exact text node count/,
  );
  for (const expectedMatches of [0, -1, 1.5, "2", null])
    assert.throws(
      () => applyTranslationCorrections(html, [{ ...correction, expectedMatches }]),
      /positive reviewed match count/,
    );
});
test("requires the full article in every locale and preserves publication provenance", () => {
  const result = compileCompleteJournal([source], translations, topics, photos);
  assert.equal(result.posts.length, 10);
  for (const p of result.posts) {
    assert.equal(p.editorialTopicKey, source.id);
    assert.equal(p.publishedAt, source.publishedAt);
    assert.deepEqual(p.countryCodes, ["JP"]);
    assert.equal(p.coverImage, photos["source-1"].url);
    assert.equal(result.counts[p.language], 1);
  }
  assert.equal(source.coverImage, undefined, "source data is immutable");
});
test("requires a source-bound native headline for every new translation", () => {
  const titles = Object.fromEntries(
    translations.map((post) => [post.language, "Native headline " + post.language]),
  );
  const review = { "source-1": { sourceHash: journalSourceHash(source), titles } };
  const result = compileCompleteJournal([source], translations, topics, photos, {
    nativeTitles: review,
  });
  assert.equal(result.posts.find((post) => post.language === "zh").title, "Native headline zh");
  const missing = { ...titles };
  delete missing.zh;
  assert.throws(
    () =>
      compileCompleteJournal([source], translations, topics, photos, {
        nativeTitles: { "source-1": { ...review["source-1"], titles: missing } },
      }),
    /Missing reviewed native title/,
  );
});
test("source-backed editorial corrections expose official citations in every affected locale", () => {
  const edit = {
    topicKey: source.id,
    language: "en",
    sourceHash: journalSourceHash(source),
    checkedAt: "2026-10-28",
    sources: [{ label: "Official requirements", url: "https://example.org/requirements" }],
    replacements: [
      {
        before: "A complete source article with verified requirements and links.",
        after: "Use the institution’s current published requirements.",
      },
    ],
  };
  const result = compileCompleteJournal([source], translations, topics, photos, {
    translationEdits: [edit],
  });
  const updated = result.posts.find((post) => post.language === "en");
  assert.match(updated.html, /institution’s current published requirements/);
  assert.deepEqual(updated.editorialSources, [{ ...edit.sources[0], checkedAt: edit.checkedAt }]);
  assert.equal(updated.updatedAt, edit.checkedAt);
  assert.throws(
    () =>
      compileCompleteJournal([source], translations, topics, photos, {
        translationEdits: [
          { ...edit, sources: [{ label: "Unsafe", url: "https://user:password@example.org" }] },
        ],
      }),
    /public HTTPS source/,
  );
});
test("uses reviewed native facts in the corresponding full-article paragraphs", () => {
  const sourcePost = {
    ...source,
    html: "<h2>Current requirements</h2><p>Funding is 15 times the minimum.</p><p>Keep this separate paragraph.</p>",
  };
  const html = applyVerifiedFacts(
    "<h2>最新要求</h2><p>有误的机器翻译。</p><p>保留的第二段。</p>",
    sourcePost,
    "zh",
    [
      {
        id: "funding",
        text: { en: "Funding is 15 times the minimum.", zh: "资金为最低标准的15倍。" },
      },
    ],
  );
  assert.match(html, /资金为最低标准的15倍/);
  assert.match(html, /保留的第二段/);
  assert.doesNotMatch(html, /有误的机器翻译/);
});
test("replaces original cover art while preserving unrelated instructional figures", () => {
  const coverSource = {
    ...source,
    coverImage: "https://example.org/cover.jpg",
    html: '<figure><img src="https://example.org/cover.jpg" /><figcaption>Old cover</figcaption></figure><p>Article content preserved in full.</p><figure><img src="https://example.org/diagram.jpg" /></figure>',
  };
  const result = compileCompleteJournal(
    [coverSource],
    translations.map((post) => ({
      ...post,
      sourceHash: journalSourceHash(coverSource),
      html: coverSource.html,
    })),
    topics,
    photos,
  );
  assert.ok(result.posts.every((post) => !post.html.includes("https://example.org/cover.jpg")));
  assert.ok(result.posts.every((post) => post.html.includes("https://example.org/diagram.jpg")));
});
test("links between source posts open the matching destination in the reader’s language", () => {
  const first = {
    ...source,
    html: '<p>See <a href="https://www.anilgoktas.org/target">the next article</a>.</p>',
  };
  const second = {
    ...source,
    id: "source-2",
    slug: "next-article",
    sourceUrl: "https://www.anilgoktas.org/target",
  };
  const translated = [first, second].flatMap((post) =>
    JOURNAL_LANGUAGES.filter((language) => language !== "en").map((language) => ({
      ...translations[0],
      id: post.id + language,
      topicKey: post.id,
      sourceId: post.id,
      sourceHash: journalSourceHash(post),
      slug: post.slug,
      language,
      html: post.html,
    })),
  );
  const result = compileCompleteJournal(
    [first, second],
    translated,
    { ...topics, "source-2": topics["source-1"] },
    { ...photos, "source-2": photos["source-1"] },
  );
  for (const post of result.posts.filter((p) => p.editorialTopicKey === first.id)) {
    assert.ok(post.html.includes(`href="/${post.language}/blog/archive/next-article"`));
    assert.equal(post.sourceUrl, first.sourceUrl);
  }
});
test("fails publication for missing, stale, or wrongly attributed translations", () => {
  assert.throws(
    () => compileCompleteJournal([source], translations.slice(1), topics, photos),
    /Missing full journal translation/,
  );
  assert.throws(
    () =>
      compileCompleteJournal(
        [{ ...source, html: source.html + "<p>New rule.</p>" }],
        translations,
        topics,
        photos,
      ),
    /Translation is stale/,
  );
  assert.throws(
    () =>
      compileCompleteJournal(
        [source],
        [{ ...translations[0], sourceId: "other" }, ...translations.slice(1)],
        topics,
        photos,
      ),
    /source identity mismatch/,
  );
});
test("requires explicit destination and photographic attribution and sanitizes translated HTML", () => {
  assert.throws(
    () => compileCompleteJournal([source], translations, {}, photos),
    /country classification/,
  );
  assert.throws(() => compileCompleteJournal([source], translations, topics, {}), /photograph/);
  const result = compileCompleteJournal(
    [source],
    translations.map((x) => ({ ...x, html: x.html + "<script>alert(1)</script>" })),
    topics,
    photos,
  );
  assert.ok(result.posts.every((p) => !p.html.includes("<script")));
});
