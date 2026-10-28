import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCompleteJournal, JOURNAL_LANGUAGES } from "./journal-content.mjs";
import { sanitizeArchiveHtml } from "../src/lib/wix-archive-content.ts";

export const ARCHIVE_LANGUAGES = ["tr", "en", "de", "es", "it"];
const EXPECTED_COUNTS = { tr: 160, en: 139, de: 137, es: 137, it: 137 };
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "src/data/wix-archive/source");
const generated = resolve(root, "src/data/wix-archive/generated");

const titlesByGroup = {
  "2103c931-9603-4faa-aa08-70d96bd9fa33": {
    tr: "Schengen Vizesi: Sık Sorulan Sorular ve Başvuru Hazırlığı",
    en: "Schengen Visa: Common Questions and Application Preparation",
    de: "Schengen-Visum: Häufige Fragen und Vorbereitung des Antrags",
    es: "Visado Schengen: preguntas frecuentes y preparación de la solicitud",
    it: "Visto Schengen: domande frequenti e preparazione della domanda",
  },
  "9d7fb207-fdfa-4864-8f17-4ff83adfae62": {
    tr: "ESU Padova Bursları: Uygunluk ve Başvuru Rehberi",
    en: "ESU Padova Scholarships: Eligibility and Application Guide",
    de: "ESU-Padova-Stipendien: Voraussetzungen und Bewerbung",
    es: "Becas ESU Padova: requisitos y guía de solicitud",
    it: "Borse ESU Padova: requisiti e guida alla domanda",
  },
  "4c508b42-0155-46e0-a803-f50226a1d529": {
    tr: "ESU Venezia Bursları: Başvuru Koşulları ve Öğrenci Bütçesi",
    en: "ESU Venezia Scholarships: Applications and Student Budgets",
    de: "ESU-Venezia-Stipendien: Bewerbung und Studienbudget",
    es: "Becas ESU Venezia: solicitudes y presupuesto estudiantil",
    it: "Borse ESU Venezia: domanda e bilancio dello studente",
  },
  "f4d4ad72-e892-40dd-8ceb-d735e4adadf9": {
    tr: "Milano DSU Bursları: Uygunluk ve Eğitim Finansmanı",
    en: "Milan DSU Scholarships: Eligibility and Study Funding",
    de: "DSU-Stipendien in Mailand: Voraussetzungen und Finanzierung",
    es: "Becas DSU en Milán: requisitos y financiación de estudios",
    it: "Borse DSU a Milano: requisiti e finanziamento degli studi",
  },
};

const cleanText = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const withoutLeadingSymbols = (value) =>
  cleanText(value)
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
const httpsUrl = (value, label, allowedHost) => {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", `${label}: HTTPS required`);
  assert.ok(!url.username && !url.password, `${label}: URL credentials forbidden`);
  if (allowedHost) assert.equal(url.hostname, allowedHost, `${label}: source site mismatch`);
  return url.href;
};
export const archivePath = (language, slug) =>
  `/${language}/blog/archive/${encodeURIComponent(slug)}`;

/** Formatting never changes the source publication date or claims a legal review. */
export function compileWixArchive(records, expectedCounts = EXPECTED_COUNTS, overrides = {}) {
  const ids = new Set();
  const paths = new Set();
  for (const id of Object.keys(overrides))
    assert.ok(
      records.some((post) => post.id === id),
      `Editorial override has no original source: ${id}`,
    );
  const allowedEdits = new Set([
    "title",
    "excerpt",
    "html",
    "updatedAt",
    "editorialReason",
    "editorialSources",
    "seoTitle",
    "seoDescription",
  ]);
  const posts = records.map((original) => {
    const edit = overrides[original.id] || {};
    for (const key of Object.keys(edit))
      assert.ok(
        allowedEdits.has(key),
        `Editorial edit cannot change source identity: ${original.id}/${key}`,
      );
    const input = { ...original, ...edit };
    assert.ok(
      ARCHIVE_LANGUAGES.includes(input.language),
      `Unsupported source language: ${input.language}`,
    );
    assert.match(input.id, /^[a-f0-9-]{36}$/i, "Missing original Wix post ID");
    assert.ok(!ids.has(input.id), `Duplicate original ID: ${input.id}`);
    ids.add(input.id);
    const slug = String(input.slug).normalize("NFC");
    assert.ok(
      slug.length > 0 && !/[\/\\\u0000-\u001f?#]/.test(slug) && ![".", ".."].includes(slug),
      `Unsafe source slug: ${input.id}`,
    );
    const path = archivePath(input.language, slug);
    assert.ok(!paths.has(path), `Duplicate language/slug: ${path}`);
    paths.add(path);
    assert.ok(
      Number.isFinite(Date.parse(input.publishedAt)),
      `Missing original publication date: ${input.id}`,
    );
    const html = sanitizeArchiveHtml(input.html ?? "");
    assert.ok(html.trim().length > 0, `Original body missing: ${input.id}`);
    const originalTitle = cleanText(original.title);
    const title =
      edit.title ||
      titlesByGroup[input.translationId]?.[input.language] ||
      withoutLeadingSymbols(originalTitle);
    assert.ok(title.length > 2, `Original title missing: ${input.id}`);
    const excerpt = cleanText(input.excerpt) || cleanText(html);
    const { html: discardedBody, ...metadata } = input;
    return {
      ...metadata,
      slug,
      title,
      ...(title !== originalTitle ? { originalTitle } : {}),
      excerpt: [...excerpt].slice(0, 190).join("").trim(),
      seoTitle: title,
      seoDescription: [...excerpt].slice(0, 175).join("").trim(),
      sourceUrl: httpsUrl(input.sourceUrl, input.id, "www.anilgoktas.org"),
      coverImage: input.coverImage ? httpsUrl(input.coverImage, `${input.id}/cover`) : null,
      translationId:
        typeof input.translationId === "string" && input.translationId ? input.translationId : null,
      translations: Array.isArray(input.translations)
        ? input.translations.filter(
            (item) => ARCHIVE_LANGUAGES.includes(item.language) && typeof item.postId === "string",
          )
        : [],
      html,
    };
  });
  const counts = Object.fromEntries(
    ARCHIVE_LANGUAGES.map((language) => [
      language,
      posts.filter((post) => post.language === language).length,
    ]),
  );
  for (const language of ARCHIVE_LANGUAGES)
    assert.equal(
      counts[language],
      expectedCounts[language] ?? 0,
      `${language}: incomplete Wix export`,
    );
  // Group identity is retained only when supplied by Wix; never infer translations from a title.
  const groups = new Map();
  for (const post of posts)
    if (post.translationId) {
      const members = groups.get(post.translationId) || [];
      assert.ok(
        !members.some((member) => member.language === post.language),
        `Two ${post.language} versions in source translation group ${post.translationId}`,
      );
      members.push(post);
      groups.set(post.translationId, members);
    }
  const byLanguage = Object.fromEntries(
    ARCHIVE_LANGUAGES.map((language) => [
      language,
      posts
        .filter((post) => post.language === language)
        .sort(
          (a, b) =>
            Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id),
        ),
    ]),
  );
  return {
    posts,
    byLanguage,
    counts,
    total: posts.length,
    topicCount: groups.size + posts.filter((post) => !post.translationId).length,
  };
}

async function writeChanged(path, content) {
  try {
    if ((await readFile(path, "utf8")) === content) return;
  } catch {
    /* First build. */
  }
  await writeFile(path, content);
}

export async function buildWixArchive() {
  const arrays = await Promise.all(
    ARCHIVE_LANGUAGES.map(async (language) =>
      JSON.parse(await readFile(resolve(source, `posts-${language}.json`), "utf8")),
    ),
  );
  let overrides = {};
  try {
    overrides = JSON.parse(await readFile(resolve(source, "../editorial-overrides.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const revisions = Object.assign(
    {},
    ...(await Promise.all(
      ARCHIVE_LANGUAGES.map(async (language) =>
        JSON.parse(
          await readFile(resolve(root, "src/data/journal/revisions-" + language + ".json"), "utf8"),
        ),
      ),
    )),
  );
  const original = compileWixArchive(arrays.flat(), EXPECTED_COUNTS, {
    ...overrides,
    ...revisions,
  });
  const result = await loadCompleteJournal(root, original.posts);
  await mkdir(generated, { recursive: true });
  for (const language of JOURNAL_LANGUAGES) {
    const details = result.posts.filter((post) => post.language === language);
    await writeChanged(
      resolve(generated, `detail-${language}.json`),
      `${JSON.stringify(details)}\n`,
    );
    await writeChanged(
      resolve(generated, `index-${language}.json`),
      `${JSON.stringify(details.map(({ html, ...summary }) => summary))}\n`,
    );
  }
  const catalog = result.posts.map((post) => {
    const related = result.posts.filter((candidate) => {
      if (candidate.id === post.id) return true;
      if (post.editorialTopicKey === candidate.editorialTopicKey) return true;
      return (
        post.translations?.some(
          (ref) => ref.postId === candidate.id && ref.language === candidate.language,
        ) &&
        candidate.translations?.some(
          (ref) => ref.postId === post.id && ref.language === post.language,
        )
      );
    });
    const actual = JOURNAL_LANGUAGES.flatMap((language) => {
      const matches = related.filter((item) => item.language === language);
      return matches.length === 1 ? matches : [];
    });
    const preferred =
      actual.find((item) => item.language === "tr") ||
      actual.find((item) => item.language === "en") ||
      post;
    return {
      id: post.id,
      slug: post.slug,
      language: post.language,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      path: archivePath(post.language, post.slug),
      alternates: [
        ...actual.map((item) => ({
          language: item.language,
          path: archivePath(item.language, item.slug),
        })),
        { language: "x-default", path: archivePath(preferred.language, preferred.slug) },
      ],
    };
  });
  await writeChanged(resolve(generated, "catalog.json"), `${JSON.stringify(catalog)}\n`);
  const slugs = new Map();
  for (const originalPost of [
    ...original.posts,
    ...JSON.parse(await readFile(resolve(root, "src/data/journal/legacy-posts.json"), "utf8")),
  ]) {
    const key = originalPost.translationId || originalPost.id;
    const post =
      result.posts.find(
        (item) =>
          item.editorialTopicKey === key &&
          item.language ===
            (originalPost.sourceUrl.includes("www.clinigaeducation.com")
              ? "tr"
              : originalPost.language),
      ) || originalPost;
    const matches = slugs.get(post.slug) || [];
    matches.push(post);
    slugs.set(post.slug, matches);
  }
  const aliases = [...slugs]
    .filter(([, matches]) => matches.length === 1)
    .map(([slug, [post]]) => ({
      slug,
      language: post.language,
      path: archivePath(post.language, post.slug),
    }));
  await writeChanged(resolve(generated, "aliases.json"), `${JSON.stringify(aliases)}\n`);
  console.log(
    `Journal: ${result.posts.length} complete articles in ${JOURNAL_LANGUAGES.length} locales; ${result.topicCount} article groups; ${original.total} immutable Wix source records.`,
  );
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildWixArchive();
