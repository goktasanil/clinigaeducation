import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileExpansionArticles, loadExpansion } from "./journal-expansion.mjs";
import { JOURNAL_LANGUAGES } from "./journal-content.mjs";

const photo = (key) => ({
  title: "University library reading room.jpg",
  url: `https://images.example.org/${key}.jpg`,
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${key}.jpg`,
  author: "Example photographer",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  width: 1280,
  height: 720,
  countryCode: "XX",
  subject: "library",
  selectionReason: "Reviewed named library context and actual location; no partnership is implied.",
  reviewedAt: "2026-10-28",
});
const record = (key = "example-country-missing-document") => ({
  topicKey: key,
  slug: key,
  countryCodes: ["XX"],
  topic: "admission",
  issueKey: "missing-document",
  evidence: { kind: "anonymized-chat-theme", themeKey: "missing-document" },
  checkedAt: "2026-10-28",
  sources: [
    { label: "Official university", url: "https://university.example/admissions" },
    { label: "Official authority", url: "https://authority.example/documents" },
  ],
  photo: photo(key),
  localWorkflow: Object.fromEntries(
    JOURNAL_LANGUAGES.map((language) => [
      language,
      `${language}: The institution publishes its own document procedure and applicant support contact. This local workflow distinguishes document submission, written clarification and the final decision; keep the dated receipt and ask the named office before its published deadline.`,
    ]),
  ),
  locales: Object.fromEntries(
    JOURNAL_LANGUAGES.map((language) => {
      const native =
        {
          hi: "विश्वविद्यालय आवेदन दस्तावेज प्रक्रिया",
          ar: "الجامعة طلب الوثائق خطوات",
          ru: "университет заявление документы процедура",
          zh: "大学申请文件办理流程",
        }[language] || `${language} university application document procedure`;
      const paragraph = `${key} ${native} `.repeat(language === "zh" ? 75 : 90);
      return [
        language,
        {
          title: `${language}: Missing documents in a university application`,
          excerpt: `${language}: Practical institution-specific document preparation and escalation guidance.`,
          html: `<h2>Understand the issue</h2><p>${paragraph}</p><h2>Local procedure</h2><p>${language}: The institution publishes its own document procedure and applicant support contact. This local workflow distinguishes document submission, written clarification and the final decision; keep the dated receipt and ask the named office before its published deadline.</p><h2>Action checklist</h2><ol><li>Check the official list.</li><li>Request written clarification.</li><li>Keep the submitted receipt.</li></ol>`,
        },
      ];
    }),
  ),
});

test("compiles complete native articles with explicit issue, source and photographic identity", () => {
  const result = compileExpansionArticles([record()], { expectedTopics: 1 });
  assert.equal(result.topicCount, 1);
  assert.equal(result.posts.length, 10);
  assert.deepEqual(
    result.posts.map((post) => post.language),
    JOURNAL_LANGUAGES,
  );
  assert.equal(new Set(result.posts.map((post) => post.id)).size, 10);
  for (const post of result.posts) {
    assert.equal(post.authorType, "Organization");
    assert.equal(post.editorialSources.length, 2);
    assert.deepEqual(post.countryCodes, ["XX"]);
    assert.ok(post.editorialContentHash.length === 64);
    assert.ok(post.html.includes("Action checklist"));
  }
});

test("fails publication for incomplete locales, thin bodies, native-script loss or language fallback", () => {
  const missing = record();
  delete missing.locales.ar;
  assert.throws(() => compileExpansionArticles([missing]), /all ten complete locales/);
  const thin = record();
  thin.locales.en.html = "<p>Only a short summary.</p>";
  assert.throws(
    () => compileExpansionArticles([thin]),
    /local workflow proof is absent|300 word-equivalents/,
  );
  const wrongScript = record();
  wrongScript.locales.hi.html = wrongScript.locales.en.html.replaceAll(
    "example-country",
    "other-country",
  );
  wrongScript.localWorkflow.hi = wrongScript.localWorkflow.en;
  assert.throws(() => compileExpansionArticles([wrongScript]), /native script missing/);
  const fallback = record();
  fallback.locales.en.html = fallback.locales.tr.html;
  fallback.localWorkflow.en = fallback.localWorkflow.tr;
  assert.throws(() => compileExpansionArticles([fallback]), /duplicated language fallback/);
});

test("rejects duplicate problem intents, duplicate photographs, unsafe citations and incorrect release counts", () => {
  const first = record(),
    second = record("example-country-missing-document-again");
  assert.throws(
    () => compileExpansionArticles([first, second]),
    /Duplicate country\/problem intent/,
  );
  second.issueKey = "deadline-expired";
  second.photo = first.photo;
  assert.throws(() => compileExpansionArticles([first, second]), /photograph duplicates/);
  const unsafe = record();
  unsafe.sources[0].url = "https://user:password@university.example/private";
  assert.throws(() => compileExpansionArticles([unsafe]), /public HTTPS/);
  const repeated = record();
  repeated.sources[1].url = repeated.sources[0].url;
  assert.throws(() => compileExpansionArticles([repeated]), /distinct official source/);
  assert.throws(
    () => compileExpansionArticles([first], { expectedTopics: 623 }),
    /explicit release target/,
  );
});

test("keeps the original journal boundary and rejects unreviewed imagery or unknown provenance", () => {
  const input = record();
  assert.throws(
    () =>
      compileExpansionArticles([input], {
        baselinePosts: [
          {
            editorialTopicKey: input.topicKey,
            language: "en",
            slug: "old",
            html: "Original article.",
          },
        ],
      }),
    /Duplicate expansion topic identity/,
  );
  const unreviewed = record();
  delete unreviewed.photo.selectionReason;
  assert.throws(() => compileExpansionArticles([unreviewed]), /missing reviewed photo/);
  const wrongCountry = record();
  wrongCountry.photo.countryCode = "YY";
  assert.throws(() => compileExpansionArticles([wrongCountry]), /actual destination/);
  const privateEvidence = record();
  privateEvidence.evidence = { kind: "raw-private-chat", themeKey: "group-name" };
  assert.throws(() => compileExpansionArticles([privateEvidence]), /anonymized theme/);
});

test("rejects country-name-only local adaptations and local evidence absent from the reader body", () => {
  const first = record(),
    second = record("other-country-missing-document");
  second.countryCodes = ["YY"];
  second.photo.countryCode = "YY";
  assert.throws(() => compileExpansionArticles([first, second]), /country name alone/);
  const missingContext = record();
  missingContext.localWorkflow.en =
    "This local workflow proof was never inserted into the primary article text. ".repeat(5);
  assert.throws(() => compileExpansionArticles([missingContext]), /local workflow proof is absent/);
});

test("preparation explicitly skips incomplete expansion and production never accepts the shortfall", async () => {
  const root = await mkdtemp(join(tmpdir(), "cliniga-expansion-test-"));
  const previous = process.env.JOURNAL_PREPARE_ONLY;
  try {
    const directory = join(root, "src/data/journal/expansion");
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, "release.json"),
      JSON.stringify({ targetTopics: 1000, expectedExpansionTopics: 623 }),
    );
    await writeFile(join(directory, "../photography.json"), "{}");
    process.env.JOURNAL_PREPARE_ONLY = "1";
    const preparing = await loadExpansion(root, { posts: [] });
    assert.equal(preparing.release.preparationOnly, true);
    assert.equal(preparing.release.requestedTargetTopics, 1000);
    assert.equal(preparing.topicCount, 0);
    delete process.env.JOURNAL_PREPARE_ONLY;
    await assert.rejects(() => loadExpansion(root, { posts: [] }), /explicit release target/);
  } finally {
    if (previous === undefined) delete process.env.JOURNAL_PREPARE_ONLY;
    else process.env.JOURNAL_PREPARE_ONLY = previous;
    await rm(root, { recursive: true, force: true });
  }
});
