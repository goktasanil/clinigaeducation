import assert from "node:assert/strict";
import test from "node:test";
import { archivePath, compileWixArchive } from "./build-wix-archive.mjs";

const fixture = (extra = {}) => ({
  id: "00000000-0000-4000-8000-000000000001",
  slug: "italya-öğrenci-başvurusu",
  title: "🎓 İtalya öğrenci başvurusu",
  excerpt: "Özgün öğrenci rehberi.",
  language: "tr",
  translationId: null,
  translations: [],
  html: '<h1>Özgün başlık</h1><p>Başvuru deneyimi ve kaynaklar.</p><table><tr><th scope="col">Belge</th><td colspan="2">Transkript</td></tr></table><img src="https://static.wixstatic.com/media/source.png" alt="Özgün görsel">',
  publishedAt: "2025-12-24T10:00:00Z",
  updatedAt: "2026-01-10T10:00:00Z",
  sourceUrl: "https://www.anilgoktas.org/tr/post/italya-öğrenci-başvurusu",
  coverImage: "https://static.wixstatic.com/media/source.png",
  coverWidth: 1200,
  coverHeight: 630,
  minutesToRead: 4,
  ...extra,
});
const counts = { tr: 1, en: 0, de: 0, es: 0, it: 0 };

test("preserves original article, publication dates, real photo and table semantics", () => {
  const original = fixture();
  const result = compileWixArchive([original], counts);
  const post = result.posts[0];
  assert.equal(result.total, 1);
  assert.equal(post.publishedAt, original.publishedAt);
  assert.equal(post.updatedAt, original.updatedAt);
  assert.equal(post.sourceUrl, new URL(original.sourceUrl).href);
  assert.equal(post.coverImage, original.coverImage);
  assert.match(post.html, /<h2>Özgün başlık<\/h2>/);
  assert.doesNotMatch(post.html, /<h1/);
  assert.match(post.html, /colspan="2"/);
  assert.match(post.html, /scope="col"/);
  assert.equal(post.title, "İtalya öğrenci başvurusu");
  assert.equal(post.originalTitle, original.title);
  assert.equal(original.html, fixture().html, "source objects are not mutated");
});

test("does not infer translations from matching titles or manufacture missing languages", () => {
  const second = fixture({
    id: "00000000-0000-4000-8000-000000000002",
    language: "en",
    slug: "italy-student-applications",
    title: "İtalya öğrenci başvurusu",
  });
  const result = compileWixArchive([fixture(), second], { ...counts, en: 1 });
  assert.equal(result.topicCount, 2);
  assert.equal(result.byLanguage.de.length, 0);
  assert.ok(
    result.posts.every((post) => post.translationId === null && post.translations.length === 0),
  );
  assert.equal(
    archivePath("tr", fixture().slug),
    "/tr/blog/archive/italya-%C3%B6%C4%9Frenci-ba%C5%9Fvurusu",
  );
});

test("fails publication on incomplete export, duplicate identity/path and unsafe source boundaries", () => {
  assert.throws(() => compileWixArchive([fixture()]), /incomplete Wix export/);
  assert.throws(
    () => compileWixArchive([fixture(), fixture()], { ...counts, tr: 2 }),
    /Duplicate original ID/,
  );
  assert.throws(
    () => compileWixArchive([fixture({ slug: "../wrong" })], counts),
    /Unsafe source slug/,
  );
  assert.throws(
    () => compileWixArchive([fixture({ sourceUrl: "https://someone.example/post" })], counts),
    /source site mismatch/,
  );
  assert.throws(
    () =>
      compileWixArchive(
        [fixture({ coverImage: "https://user:pass@example.org/image.png" })],
        counts,
      ),
    /URL credentials forbidden/,
  );
});

test("removes unsafe active markup and avoids unsupported authority claims in new titles", () => {
  const input = fixture({
    translationId: "2103c931-9603-4faa-aa08-70d96bd9fa33",
    title: "Gerçek Vize Memurunun Gözünden: Schengen",
    html: '<h1>Başlık</h1><p>Özgün içerik.</p><script>secret()</script><img src="javascript:alert(1)" onerror="bad()">',
  });
  const post = compileWixArchive([input], counts).posts[0];
  assert.equal(post.title, "Schengen Vizesi: Sık Sorulan Sorular ve Başvuru Hazırlığı");
  assert.equal(post.seoTitle, post.title);
  assert.doesNotMatch(post.html, /secret\(|javascript:|onerror|<script|<h1/);
});

test("applies reviewed translations without changing original identity, language or publication date", () => {
  const original = fixture();
  const edit = {
    title: "İtalya: Başvuru Planı",
    excerpt: "Düzenlenmiş giriş.",
    html: "<p>Düzenlenmiş tam metin.</p>",
    updatedAt: "2026-10-28T00:00:00Z",
    editorialReason: "Native-language correction",
  };
  const post = compileWixArchive([original], counts, { [original.id]: edit }).posts[0];
  assert.equal(post.id, original.id);
  assert.equal(post.language, original.language);
  assert.equal(post.publishedAt, original.publishedAt);
  assert.equal(post.originalTitle, original.title);
  assert.equal(post.title, edit.title);
  assert.equal(post.html, edit.html);
  assert.equal(post.updatedAt, edit.updatedAt);
  assert.throws(
    () => compileWixArchive([original], counts, { [original.id]: { language: "en" } }),
    /cannot change source identity/,
  );
  assert.throws(
    () => compileWixArchive([original], counts, { missing: edit }),
    /no original source/,
  );
});
