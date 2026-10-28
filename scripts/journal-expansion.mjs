import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sanitizeArchiveHtml } from "../src/lib/wix-archive-content.ts";
import { JOURNAL_LANGUAGES } from "./journal-content.mjs";

export const BASELINE_JOURNAL_TOPICS = 169;
export const COUNTRY_GUIDE_TOPICS = 208;
export const BASELINE_TOPIC_COUNT = BASELINE_JOURNAL_TOPICS + COUNTRY_GUIDE_TOPICS;
const TOPICS = new Set(["study", "admission", "funding", "arrival", "professional"]);
const SCRIPT = {
  hi: /[\u0900-\u097f]/gu,
  ar: /[\u0600-\u06ff]/gu,
  ru: /[\u0400-\u04ff]/gu,
  zh: /[\u3400-\u9fff]/gu,
};
const plain = (value) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(?:x([a-f0-9]+)|(\d+));?/gi, (_match, hex, decimal) => {
      const code = parseInt(hex || decimal, hex ? 16 : 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(
      /&(nbsp|amp|quot|lt|gt|apos|rsquo|lsquo|ndash|mdash);/gi,
      (_match, name) =>
        ({
          nbsp: " ",
          amp: "&",
          quot: '"',
          lt: "<",
          gt: ">",
          apos: "'",
          rsquo: "’",
          lsquo: "‘",
          ndash: "–",
          mdash: "—",
        })[name.toLowerCase()],
    )
    .replace(/\s+/g, " ")
    .trim();

const hash = (value) => createHash("sha256").update(value).digest("hex");
const uuid = (key) => {
  const bytes = hash("cliniga-expansion:" + key)
    .slice(0, 32)
    .split("");
  bytes[12] = "5";
  bytes[16] = ((parseInt(bytes[16], 16) & 3) | 8).toString(16);
  const value = bytes.join("");
  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20),
  ].join("-");
};
const safeUrl = (value, label) => {
  const url = new URL(value);
  assert.ok(
    url.protocol === "https:" && !url.username && !url.password,
    label + ": public HTTPS URL required",
  );
  return url.href;
};
const date = (value, label) => {
  assert.match(value || "", /^\d{4}-\d{2}-\d{2}$/, label + ": explicit review date required");
  assert.ok(Number.isFinite(Date.parse(value)), label + ": invalid review date");
  return value;
};
function validatePhoto(photo, key) {
  for (const name of [
    "title",
    "author",
    "license",
    "licenseUrl",
    "sourceUrl",
    "url",
    "countryCode",
    "subject",
    "selectionReason",
    "reviewedAt",
  ])
    assert.ok(
      typeof photo?.[name] === "string" && photo[name].trim(),
      key + ": missing reviewed photo " + name,
    );
  for (const name of ["url", "sourceUrl", "licenseUrl"])
    safeUrl(photo[name], key + "/photo/" + name);
  assert.ok(
    /CC BY(?:-SA)? [234]|CC0|Public domain|PDM/i.test(photo.license) &&
      !/\b(?:NC|ND)\b/.test(photo.license),
    key + ": unsupported photo licence",
  );
  assert.ok(
    photo.width >= 900 && photo.height >= 400 && photo.width > photo.height,
    key + ": inadequate landscape photograph",
  );
  assert.ok(
    ["university-campus", "library", "destination-cityscape", "research-laboratory"].includes(
      photo.subject,
    ),
    key + ": explicit photo subject required",
  );
  assert.ok(photo.selectionReason.length >= 50, key + ": photo selection rationale required");
  date(photo.reviewedAt, key + "/photo");
}

/** Rejects incomplete/duplicated locale shells; editorial facts are authored and reviewed upstream. */
export function compileExpansionArticles(
  records,
  {
    photographs = {},
    baselinePosts = [],
    baselinePhotographs = {},
    expectedTopics = records.length,
  } = {},
) {
  assert.equal(
    records.length,
    expectedTopics,
    "Expansion topic count differs from the explicit release target",
  );
  const topicKeys = new Set(baselinePosts.map((post) => post.editorialTopicKey));
  const paths = new Set(baselinePosts.map((post) => post.language + "/" + post.slug));
  const bodies = new Map(
    JOURNAL_LANGUAGES.map((language) => [
      language,
      new Set(
        baselinePosts.filter((post) => post.language === language).map((post) => plain(post.html)),
      ),
    ]),
  );
  const photos = new Set(Object.values(baselinePhotographs).map((photo) => photo.sourceUrl));
  const intents = new Set();
  const localWorkflows = new Map();
  const posts = [];
  for (const record of records) {
    const key = record.topicKey;
    assert.match(
      key || "",
      /^[a-z0-9][a-z0-9-]{3,180}$/,
      "Expansion topic identity must be explicit and stable",
    );
    assert.ok(!topicKeys.has(key), "Duplicate expansion topic identity: " + key);
    topicKeys.add(key);
    assert.match(
      record.slug || "",
      /^[a-z0-9][a-z0-9-]{3,180}$/,
      key + ": safe stable article slug required",
    );
    assert.ok(TOPICS.has(record.topic), key + ": unsupported editorial topic");
    assert.ok(
      Array.isArray(record.countryCodes) &&
        record.countryCodes.length === 1 &&
        /^[A-Z]{2}$/.test(record.countryCodes[0]),
      key + ": one explicit destination required",
    );
    assert.match(
      record.issueKey || "",
      /^[a-z0-9][a-z0-9-]{2,100}$/,
      key + ": distinct problem intent required",
    );
    const intent = record.countryCodes[0] + ":" + record.issueKey;
    assert.ok(!intents.has(intent), "Duplicate country/problem intent: " + intent);
    intents.add(intent);
    assert.ok(
      ["anonymized-chat-theme", "country-research"].includes(record.evidence?.kind) &&
        record.evidence.themeKey,
      key + ": anonymized theme or country-research provenance required",
    );
    const checkedAt = date(record.checkedAt, key);
    assert.ok(
      Array.isArray(record.sources) && record.sources.length >= 2,
      key + ": at least two relevant official sources required",
    );
    const editorialSources = record.sources.map((source) => {
      assert.ok(source.label?.trim(), key + ": official source label required");
      return {
        label: source.label,
        url: safeUrl(source.url, key + "/source"),
        checkedAt: date(source.checkedAt || checkedAt, key + "/source"),
      };
    });
    assert.ok(
      new Set(editorialSources.map((source) => source.url)).size >= 2,
      key + ": distinct official source URLs required",
    );
    const photo = record.photo || photographs[record.photoKey || key];
    validatePhoto(photo, key);
    assert.equal(
      photo.countryCode,
      record.countryCodes[0],
      key + ": photograph must match the actual destination",
    );
    assert.ok(
      !photos.has(photo.sourceUrl),
      key + ": photograph duplicates another published topic",
    );
    photos.add(photo.sourceUrl);
    assert.deepEqual(
      Object.keys(record.locales || {}).sort(),
      [...JOURNAL_LANGUAGES].sort(),
      key + ": every topic requires all ten complete locales",
    );
    assert.deepEqual(
      Object.keys(record.localWorkflow || {}).sort(),
      [...JOURNAL_LANGUAGES].sort(),
      key + ": native local workflow proof required",
    );
    const englishCountryName = new Intl.DisplayNames(["en"], { type: "region" }).of(
      record.countryCodes[0],
    );
    const localSignature = plain(record.localWorkflow.en)
      .toLowerCase()
      .replaceAll(englishCountryName.toLowerCase(), "")
      .replace(new RegExp("\\b" + record.countryCodes[0].toLowerCase() + "\\b", "g"), "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    const similar = localWorkflows.get(record.issueKey) || new Set();
    assert.ok(
      !similar.has(localSignature),
      key + ": destination workflow cannot differ by country name alone",
    );
    similar.add(localSignature);
    localWorkflows.set(record.issueKey, similar);
    const localeBodies = new Set();
    for (const language of JOURNAL_LANGUAGES) {
      const native = record.locales[language];
      assert.ok(
        native.title?.trim().length >= 12 && native.excerpt?.trim().length >= 50,
        key + "/" + language + ": complete native title and excerpt required",
      );
      assert.ok(native.html?.trim(), key + "/" + language + ": missing full native body");
      const html = sanitizeArchiveHtml(native.html);
      const text = plain(html);
      const localContext = plain(record.localWorkflow[language] || "");
      assert.ok(
        localContext.length >= (language === "zh" ? 100 : 200),
        key + "/" + language + ": substantive native country workflow required",
      );
      assert.ok(
        text.includes(localContext),
        key + "/" + language + ": local workflow proof is absent from the primary article",
      );
      const wordEquivalent =
        language === "zh"
          ? (text.match(/[\u3400-\u9fff]/g) || []).length / 2
          : text.split(/\s+/).length;
      assert.ok(
        wordEquivalent >= 300,
        key + "/" + language + ": full solution guide requires at least 300 word-equivalents",
      );
      assert.ok(
        (html.match(/<h[23]\b/gi) || []).length >= 3 && (html.match(/<li\b/gi) || []).length >= 3,
        key + "/" + language + ": solution sections and actionable checklist required",
      );
      assert.ok(
        !/<h1\b|(?:&lt;unk&gt;|⁇)/i.test(html),
        key + "/" + language + ": invalid body structure or unresolved translation token",
      );
      if (SCRIPT[language])
        assert.ok(
          (text.match(SCRIPT[language]) || []).length >= 100,
          key + "/" + language + ": native script missing",
        );
      const normalized = text.toLowerCase();
      assert.ok(!localeBodies.has(normalized), key + ": duplicated language fallback");
      localeBodies.add(normalized);
      assert.ok(
        !bodies.get(language).has(text),
        key + "/" + language + ": duplicated full primary article",
      );
      bodies.get(language).add(text);
      const path = language + "/" + record.slug;
      assert.ok(!paths.has(path), key + ": duplicate canonical path");
      paths.add(path);
      const id = uuid(key + ":" + language);
      posts.push({
        id,
        slug: record.slug,
        title: native.title.trim(),
        excerpt: native.excerpt.trim(),
        language,
        translationId: key,
        translations: [],
        publishedAt: record.publishedAt || checkedAt,
        updatedAt: checkedAt,
        sourceUrl: editorialSources[0].url,
        coverImage: photo.url,
        coverWidth: photo.width,
        coverHeight: photo.height,
        photoCredit: photo,
        editorialSources,
        editorialTopicKey: key,
        topic: record.topic,
        issueKey: record.issueKey,
        countryCodes: record.countryCodes,
        seoTitle: native.title.trim(),
        seoDescription: Array.from(native.excerpt.trim()).slice(0, 175).join(""),
        minutesToRead: Math.max(2, Math.ceil(wordEquivalent / 200)),
        author: "CliniGA Education",
        authorType: "Organization",
        html,
        editorialContentHash: hash(
          JSON.stringify([key, language, native.title, html, editorialSources]),
        ),
      });
    }
  }
  return { posts, topicCount: records.length };
}

export async function loadExpansion(root, baseline) {
  const directory = resolve(root, "src/data/journal/expansion");
  let files;
  try {
    files = await readdir(directory);
  } catch (error) {
    if (error.code === "ENOENT")
      return {
        posts: [],
        topicCount: 0,
        release: { targetTopics: BASELINE_TOPIC_COUNT, expectedExpansionTopics: 0 },
      };
    throw error;
  }
  const read = async (name) => JSON.parse(await readFile(resolve(directory, name), "utf8"));
  const release = files.includes("release.json")
    ? await read("release.json")
    : { targetTopics: BASELINE_TOPIC_COUNT, expectedExpansionTopics: 0 };
  assert.ok(
    Number.isSafeInteger(release.targetTopics) && release.targetTopics >= BASELINE_TOPIC_COUNT,
    "Explicit positive journal release target required",
  );
  assert.equal(
    release.targetTopics,
    BASELINE_TOPIC_COUNT + release.expectedExpansionTopics,
    "Release target must count unique topics rather than language pages",
  );
  // Preparation is explicitly non-publishable and preserves the existing journal
  // while native issue/country/photo research is still being authored.
  if (process.env.JOURNAL_PREPARE_ONLY === "1")
    return {
      posts: [],
      topicCount: 0,
      release: {
        targetTopics: BASELINE_TOPIC_COUNT,
        expectedExpansionTopics: 0,
        requestedTargetTopics: release.targetTopics,
        preparationOnly: true,
      },
    };
  const records = (
    await Promise.all(
      files
        .filter((name) => /^articles-[a-z0-9-]+\.json$/.test(name))
        .sort()
        .map(read),
    )
  ).flat();
  if (files.includes("compose.mjs")) {
    const composer = await import(pathToFileURL(resolve(directory, "compose.mjs")).href);
    assert.equal(
      typeof composer.composeExpansionArticles,
      "function",
      "Expansion composer export required",
    );
    records.push(...(await composer.composeExpansionArticles(root)));
  }
  const photographs = files.includes("photography.json") ? await read("photography.json") : {};
  const result = compileExpansionArticles(records, {
    photographs,
    baselinePosts: baseline.posts,
    baselinePhotographs: JSON.parse(
      await readFile(resolve(root, "src/data/journal/photography.json"), "utf8"),
    ),
    expectedTopics: release.expectedExpansionTopics,
  });
  return { ...result, release };
}
