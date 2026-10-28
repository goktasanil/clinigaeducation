import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sanitizeArchiveHtml } from "../src/lib/wix-archive-content.ts";
export const JOURNAL_LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "hi", "ar", "ru", "zh"];
export const journalSourceHash = (post) =>
  createHash("sha256")
    .update(JSON.stringify([post.id, post.title, post.excerpt, post.html, post.updatedAt]))
    .digest("hex");
const cleanModelText = (value) => value.replace(/⁇|&lt;unk&gt;|<unk>/g, "");
const escapeText = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plainText = (value) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .trim();
export function applyVerifiedFacts(html, source, language, facts) {
  const sourceParagraphs = [...source.html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  const replacements = new Map();
  for (const fact of facts) {
    const index = sourceParagraphs.findIndex(
      (paragraph) => plainText(paragraph[1]) === fact.text[source.language]?.trim(),
    );
    if (index !== -1) {
      assert.ok(fact.text[language]?.trim(), "Missing reviewed fact locale: " + fact.id);
      replacements.set(index, fact.text[language]);
    }
  }
  let index = 0;
  return html.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (paragraph) => {
    const replacement = replacements.get(index++);
    return replacement ? `<p>${escapeText(replacement)}</p>` : paragraph;
  });
}
export function applyTranslationCorrections(html, corrections) {
  for (const { before, after, expectedMatches = 1 } of corrections || []) {
    assert.ok(
      Number.isSafeInteger(expectedMatches) && expectedMatches > 0,
      "Translation correction requires a positive reviewed match count",
    );
    let matches = 0;
    html = html.replace(/(^|>)([^<]*)(?=<|$)/g, (tag, prefix, text) => {
      if (text !== escapeText(before)) return tag;
      matches += 1;
      return prefix + escapeText(after);
    });
    assert.equal(
      matches,
      expectedMatches,
      "Translation correction must match the reviewed exact text node count",
    );
  }
  return html;
}
export function restoreSourceUrlLabels(html, sourceHtml) {
  const labels = [...sanitizeArchiveHtml(sourceHtml).matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map(
    (match) => plainText(match[1]),
  );
  let index = 0;
  return html.replace(/(<a\b[^>]*>)([\s\S]*?)(<\/a>)/gi, (anchor, open, _label, close) => {
    const sourceLabel = labels[index++];
    return /^https?:\/\/\S+$/i.test(sourceLabel || "")
      ? open + escapeText(sourceLabel) + close
      : anchor;
  });
}
function removeReplacedCover(html, coverImage) {
  if (!coverImage) return html;
  const mediaKey = (value) => value.split("?")[0].split("/v1/")[0];
  return html.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, (figure) => {
    const src = figure.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1];
    return src && mediaKey(src) === mediaKey(coverImage) ? "" : figure;
  });
}
export function compileCompleteJournal(
  base,
  translations,
  topics,
  photos,
  { allowIncomplete = false, verifiedFacts = [], translationEdits = [], nativeTitles = {} } = {},
) {
  const groups = new Map();
  for (const post of base) {
    const key = post.translationId || post.id;
    const arr = groups.get(key) || [];
    assert.ok(
      !arr.some((p) => p.language === post.language),
      "Duplicate source locale in journal group",
    );
    arr.push(post);
    groups.set(key, arr);
  }
  const posts = [];
  for (const [key, sources] of groups) {
    assert.ok(topics[key], "Missing editorial country classification: " + key);
    const source = sources.find((p) => p.language === "en") || sources[0];
    const titleReview = nativeTitles[key];
    if (Object.keys(nativeTitles).length) {
      assert.ok(titleReview, "Missing native title review: " + key);
      assert.equal(
        titleReview.sourceHash,
        journalSourceHash(source),
        "Stale native title review: " + key,
      );
    }
    const photo = photos[key];
    assert.ok(photo?.url?.startsWith("https://"), "Missing licensed journal photograph: " + key);
    for (const language of JOURNAL_LANGUAGES) {
      let post = sources.find((p) => p.language === language);
      if (!post) {
        const translated = translations.find((p) => p.topicKey === key && p.language === language);
        if (
          allowIncomplete &&
          (!translated ||
            translated.sourceHash !== journalSourceHash(source) ||
            (source.language !== "en" && translated.translationRoute !== "sentence-pivot-v2"))
        )
          continue;
        assert.ok(translated, "Missing full journal translation: " + key + "/" + language);
        assert.equal(translated.sourceId, source.id, "Translation source identity mismatch");
        assert.equal(
          translated.sourceHash,
          journalSourceHash(source),
          "Translation is stale: " + key + "/" + language,
        );
        assert.ok(
          translated.title?.trim() && translated.excerpt?.trim() && translated.html?.trim(),
          "Incomplete translated primary content",
        );
        post = {
          ...source,
          ...translated,
          translationId: source.translationId,
          publishedAt: source.publishedAt,
          updatedAt: source.updatedAt,
          sourceUrl: source.sourceUrl,
        };
      }
      let html = sanitizeArchiveHtml(post.html);
      if (post.sourceHash) {
        const structure = (value) =>
          [...sanitizeArchiveHtml(value).matchAll(/<(p|li|h2|h3|h4|table|tr|td|th|img)\b/gi)].map(
            (item) => item[1].toLowerCase(),
          );
        assert.deepEqual(
          structure(html),
          structure(source.html),
          "Translation dropped article structure: " + key + "/" + language,
        );
        if (source.language !== "en")
          assert.equal(post.translationRoute, "sentence-pivot-v2", "Unreviewed translation route");
        html = cleanModelText(html);
        html = restoreSourceUrlLabels(html, source.html);
      }
      for (const edit of translationEdits.filter(
        (item) => item.topicKey === key && item.language === language,
      )) {
        assert.equal(edit.sourceHash, journalSourceHash(source), "Stale bilingual correction");
        html = applyTranslationCorrections(html, edit.replacements);
        if (edit.title) post = { ...post, title: edit.title };
        if (edit.sources?.length) {
          assert.match(
            edit.checkedAt || "",
            /^\d{4}-\d{2}-\d{2}$/,
            "Editorial correction sources require a review date",
          );
          const sources = new Map((post.editorialSources || []).map((item) => [item.url, item]));
          for (const item of edit.sources) {
            const url = new URL(item.url);
            assert.ok(
              url.protocol === "https:" && !url.username && !url.password && item.label?.trim(),
              "Editorial correction requires a public HTTPS source and label",
            );
            sources.set(item.url, { label: item.label, url: item.url, checkedAt: edit.checkedAt });
          }
          post = { ...post, editorialSources: [...sources.values()], updatedAt: edit.checkedAt };
        }
      }
      if (post.sourceHash && titleReview)
        assert.ok(
          titleReview.titles[language]?.trim(),
          "Missing reviewed native title: " + key + "/" + language,
        );
      if (titleReview?.titles[language]) post = { ...post, title: titleReview.titles[language] };
      const factSource = post.sourceHash ? source : post;
      html = applyVerifiedFacts(html, factSource, language, verifiedFacts);
      html = removeReplacedCover(html, post.coverImage);
      if (post.sourceHash)
        post = {
          ...post,
          title: cleanModelText(post.title),
          excerpt: cleanModelText(post.excerpt),
        };
      post = {
        ...post,
        title: post.title
          .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/gu, "")
          .replace(/\s+/g, " ")
          .trim(),
      };
      const firstParagraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
      const excerpt = firstParagraph
        ? Array.from(`${post.title} — ${plainText(firstParagraph)}`)
            .slice(0, 190)
            .join("")
        : post.excerpt;
      assert.ok(html.length > 50, "Empty article body");
      assert.ok(!/<h1\b/i.test(html), "Body cannot contain a second H1");
      posts.push({
        ...post,
        html,
        excerpt,
        language,
        editorialTopicKey: key,
        topic: topics[key].topic,
        countryCodes: topics[key].countryCodes,
        coverImage: photo.url,
        coverWidth: photo.width,
        coverHeight: photo.height,
        photoCredit: photo,
        seoTitle: post.title,
        seoDescription: Array.from(excerpt).slice(0, 175).join(""),
        minutesToRead: Math.max(
          1,
          Math.ceil(
            language === "zh"
              ? Array.from(plainText(html).replace(/\s/g, "")).length / 450
              : plainText(html).split(/\s+/).filter(Boolean).length / 200,
          ),
        ),
      });
    }
  }
  // Keep links between imported articles on the same real native journal.
  // Source attribution metadata remains unchanged.
  const sourceKey = (value, baseUrl) => {
    try {
      const url = new URL(value.replace(/&amp;/g, "&"), baseUrl);
      return (
        url.hostname.replace(/^www\./, "") + decodeURIComponent(url.pathname).replace(/\/+$/, "")
      );
    } catch {
      return null;
    }
  };
  const originalTopics = new Map(
    base.map((post) => [sourceKey(post.sourceUrl), post.translationId || post.id]),
  );
  const nativePaths = new Map(
    posts.map((post) => [
      post.editorialTopicKey + ":" + post.language,
      `/${post.language}/blog/archive/${encodeURIComponent(post.slug)}`,
    ]),
  );
  for (const post of posts) {
    post.html = post.html.replace(/(<a\b[^>]*\bhref=")([^"]+)(")/gi, (tag, before, href, after) => {
      const key = originalTopics.get(sourceKey(href, post.sourceUrl));
      const target = key && nativePaths.get(key + ":" + post.language);
      if (!target) return tag;
      const fragment = new URL(href.replace(/&amp;/g, "&"), post.sourceUrl).hash;
      return before + target + fragment + after;
    });
  }
  if (!allowIncomplete)
    assert.equal(
      posts.length,
      groups.size * JOURNAL_LANGUAGES.length,
      "Every journal article requires every locale",
    );
  for (const language of JOURNAL_LANGUAGES) {
    const bodies = posts
      .filter((post) => post.language === language)
      .map((post) => plainText(post.html).replace(/\s+/g, " ").trim());
    assert.equal(
      new Set(bodies).size,
      bodies.length,
      "Duplicate full primary article: " + language,
    );
  }
  assert.equal(
    new Set(posts.map((p) => p.language + "/" + p.slug)).size,
    posts.length,
    "Duplicate canonical journal path",
  );
  return {
    posts,
    topicCount: groups.size,
    counts: Object.fromEntries(
      JOURNAL_LANGUAGES.map((l) => [l, posts.filter((p) => p.language === l).length]),
    ),
  };
}
export async function loadCompleteJournal(root, originalPosts) {
  const read = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
  const legacy = await read("src/data/journal/legacy-posts.json");
  const base = [...originalPosts, ...legacy];
  const nativeTitles = await read("src/data/journal/native-titles.json");
  assert.equal(
    Object.keys(nativeTitles).length,
    new Set(base.map((post) => post.translationId || post.id)).size,
    "Every topic requires native title review",
  );
  await mkdir(resolve(root, ".journal-work"), { recursive: true });
  await writeFile(resolve(root, ".journal-work/reviewed-base.json"), JSON.stringify(base));
  const translations = [];
  for (const language of JOURNAL_LANGUAGES) {
    try {
      translations.push(...(await read("src/data/journal/translations/" + language + ".json")));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return compileCompleteJournal(
    base,
    translations,
    await read("src/data/journal/topics.json"),
    await read("src/data/journal/photography.json"),
    {
      allowIncomplete: process.env.JOURNAL_PREPARE_ONLY === "1",
      verifiedFacts: (await read("src/data/journal/verified-facts.json")).facts,
      translationEdits: await read("src/data/journal/translation-edits.json"),
      nativeTitles,
    },
  );
}
