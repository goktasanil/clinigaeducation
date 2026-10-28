import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WixArchiveArticle } from "@/components/blog/WixArchiveArticle";
import { EuropeBlogLibrary } from "@/components/blog/EuropeBlogLibrary";
import { WIX_ARCHIVE_COPY } from "@/data/wix-archive/copy";
import {
  WIX_ARCHIVE_LOCALES,
  type WixArchivePost,
  type WixArchiveSummary,
} from "@/data/wix-archive/types";
import type { EuropeGuide } from "./europe-blog";
import { loadEuropeBlog } from "./europe-blog";
import countryNames from "@/data/generated/country-names.json";
import {
  isWixArchiveLocale,
  loadWixArchiveSummaries,
  wixArchiveCountryCodes,
  wixArchiveCountryOptions,
  wixArchiveCardImageUrl,
  resolveWixArchiveTranslations,
  sanitizeArchiveHtml,
  wixArchiveAlternates,
  wixArchiveHead,
  wixArchivePath,
  wixArchiveRelatedGuides,
} from "./wix-archive";

const fixture: WixArchivePost = {
  id: "old-tr-post",
  slug: "italya’da-eğitim-ve-burslar",
  title: "İtalya’da eğitim ve burslar",
  excerpt: "İtalya'da öğrenim hakkında önceki yazımız.",
  language: "tr",
  translationId: "source-group",
  publishedAt: "2022-05-10T09:30:00.000Z",
  updatedAt: "2023-01-16T12:00:00.000Z",
  sourceUrl: "https://old.example.com/post/italya",
  coverImage: "https://static.wixstatic.com/media/original.jpg",
  coverWidth: 1200,
  coverHeight: 800,
  minutesToRead: 5,
  html: '<h1>Özgün bölüm başlığı</h1><p>Özgün yazının tamamı.</p><figure><img src="https://static.wixstatic.com/media/photo.jpg" alt="Roma kampüsü" width="800" height="600" /><figcaption>Özgün görsel</figcaption></figure><table><tbody><tr><th>Program</th><td>Özgün tablo içeriği</td></tr></tbody></table><p><a href="https://university.example/apply?a=1&amp;b=2" target="_blank">Üniversite</a></p>',
};
const english: WixArchiveSummary = {
  ...fixture,
  id: "old-en-post",
  language: "en",
  slug: "studying-in-italy",
  title: "Studying in Italy",
};
const guide: EuropeGuide = {
  slug: "italy-study",
  countryCode: "IT",
  countrySlug: "italy",
  countryName: "Italy",
  kind: "country",
  topic: "study",
  brief: "Üniversitenin resmî program kataloğunu kontrol edin.",
  sources: [],
  checkedAt: "2026-10-27",
  coverImage: "/blog-covers/italy-study.svg",
};

describe("Wix archive reader", () => {
  it("preserves complete safe rich content and removes execution paths and duplicate H1s", () => {
    const html = sanitizeArchiveHtml(
      `${fixture.html}<script>bad()</script><img src="javascript:bad()" onerror="bad()"><a href="data:text/html,bad">unsafe</a>`,
    );
    expect(html).toContain("<h2>Özgün bölüm başlığı</h2>");
    expect(html).toContain("Özgün yazının tamamı.");
    expect(html).toContain(
      '<img src="https://static.wixstatic.com/media/photo.jpg" alt="Roma kampüsü" width="800" height="600"',
    );
    expect(html).toContain("<table><tbody><tr><th>Program</th><td>Özgün tablo içeriği</td>");
    expect(html).toContain('href="https://university.example/apply?a=1&amp;b=2"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toMatch(/<h1\b|<script\b|javascript:|onerror=|data:text/i);
    expect(sanitizeArchiveHtml(html)).toBe(html);
  });

  it("uses real source translation identity and never invents a missing language", () => {
    const unrelated = {
      ...fixture,
      id: "unrelated",
      language: "de" as const,
      translationId: "other",
    };
    const resolved = resolveWixArchiveTranslations(fixture, [fixture, english, unrelated]);
    expect(resolved.map((post) => post.language)).toEqual(["tr", "en"]);
    const links = wixArchiveAlternates(fixture, [fixture, english, unrelated]);
    expect(links.find((link) => link.rel === "canonical")?.href).toBe(
      `https://www.clinigaeducation.com/tr/blog/archive/${encodeURIComponent(fixture.slug)}`,
    );
    expect(links.filter((link) => link.rel === "alternate").map((link) => link.hrefLang)).toEqual([
      "tr",
      "en",
      "x-default",
    ]);
    expect(links.find((link) => link.hrefLang === "x-default")?.href).toContain(
      "/tr/blog/archive/",
    );
    expect(
      wixArchiveAlternates(english, resolved).filter((link) => link.rel === "alternate"),
    ).toEqual(links.filter((link) => link.rel === "alternate"));
  });

  it("requires reciprocal explicit references when a shared group is absent", () => {
    const tr = {
      ...fixture,
      translationId: null,
      translations: [{ postId: english.id, language: "en" as const }],
    };
    const en = {
      ...english,
      translationId: null,
      translations: [{ postId: fixture.id, language: "tr" as const }],
    };
    expect(resolveWixArchiveTranslations(tr, [en]).map((post) => post.language)).toEqual([
      "tr",
      "en",
    ]);
    expect(
      resolveWixArchiveTranslations(tr, [{ ...en, translations: [] }]).map((post) => post.language),
    ).toEqual(["tr"]);
    const links = wixArchiveAlternates(en, [en]);
    expect(links.find((link) => link.hrefLang === "x-default")?.href).toContain(
      "/en/blog/archive/",
    );
  });

  it("renders one headline, original dates, a historical notice, source attribution and current guides", () => {
    const html = renderToStaticMarkup(
      createElement(WixArchiveArticle, {
        post: fixture,
        translations: [fixture, english],
        related: [guide],
      }),
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('lang="tr"');
    expect(html).toContain(WIX_ARCHIVE_COPY.tr.noticeBody);
    expect(html).toContain(WIX_ARCHIVE_COPY.tr.formatNote);
    expect(html).toContain('dateTime="2022-05-10T09:30:00.000Z"');
    expect(html).toContain('dateTime="2026-10-28"');
    expect(html).toContain('href="https://old.example.com/post/italya"');
    expect(html).toContain('href="/tr/blog/italy-study"');
    expect(html).toContain("https://wa.me/393446759253?text=");
    expect(html).toContain(wixArchivePath("en", english.slug));
    expect(html).not.toContain('hrefLang="fr"');
    expect(html).not.toContain(WIX_ARCHIVE_COPY.en.noticeBody);
    expect(html).not.toContain(WIX_ARCHIVE_COPY.tr.author);
  });

  it("preserves source publication metadata and omits an unknown author", () => {
    const head = wixArchiveHead({ ...fixture, title: `${fixture.title} </script>` }, [
      fixture,
      english,
    ]);
    const source = head.scripts[0].children;
    expect(source).not.toContain("</script>");
    const post = JSON.parse(source)["@graph"][0];
    expect(post.datePublished).toBe(fixture.publishedAt);
    expect(post.dateModified).toBe(fixture.updatedAt);
    expect(post.inLanguage).toBe("tr");
    expect(post.isBasedOn).toBe(fixture.sourceUrl);
    expect(post.author).toBeUndefined();
    expect(post.dateModified).not.toContain("2026-10-28");
  });

  it.each(WIX_ARCHIVE_LOCALES)(
    "uses the %s archive reader without a fallback locale",
    (language) => {
      const post = { ...fixture, language, translationId: null };
      const html = renderToStaticMarkup(
        createElement(WixArchiveArticle, { post, translations: [], related: [] }),
      );
      expect(html).toContain(`lang="${language}"`);
      expect(html).toContain(WIX_ARCHIVE_COPY[language].noticeTitle);
      expect(html).toContain(WIX_ARCHIVE_COPY[language].published);
      expect(html).toContain('href="/' + language + '/blog"');
      if (language !== "en") expect(html).not.toContain(WIX_ARCHIVE_COPY.en.noticeTitle);
      expect(html.match(/hrefLang=/g)).toHaveLength(1);
      expect(
        wixArchiveHead(post, [])
          .links.filter((link) => link.rel === "alternate")
          .map((link) => link.hrefLang),
      ).toEqual([language, "x-default"]);
    },
  );

  it("only links country guides when a country is present in the article's own title or excerpt", () => {
    expect(wixArchiveRelatedGuides(fixture, [guide])).toEqual([guide]);
    expect(
      wixArchiveRelatedGuides(
        { ...fixture, title: "Başvuru hazırlığı", excerpt: "Belgelerinizi düzenleyin." },
        [guide],
      ),
    ).toEqual([]);
  });

  it("keeps all 52 guide destinations, including Kosovo, and appends actual archive-only countries in generated order", async () => {
    const guides = await loadEuropeBlog("tr");
    const guideCodes = [...new Set(guides.map((item) => item.countryCode))];
    const archiveCodes = wixArchiveCountryCodes({
      title: "Study in Canada and the United States",
      excerpt: "",
    });
    expect(archiveCodes).toContain("US");
    expect(archiveCodes).toContain("CA");
    const options = wixArchiveCountryOptions("tr", guides, [...archiveCodes].reverse());
    expect(guideCodes).toHaveLength(52);
    expect(options.slice(0, 52).map((option) => option.code)).toEqual(guideCodes);
    expect(options.find((option) => option.code === "XK")?.name).toBe("Kosova");
    expect(options.slice(52)).toEqual(
      countryNames.tr.filter(
        (country) => archiveCodes.includes(country.code) && !guideCodes.includes(country.code),
      ),
    );
    expect(options.find((option) => option.code === "US")?.name).toBe(
      "Amerika Birleşik Devletleri",
    );
    expect(options.some((option) => option.code === "AU")).toBe(false);
    expect(new Set(options.map((option) => option.code)).size).toBe(options.length);
    expect(wixArchiveCountryOptions("tr", guides, [])).toHaveLength(52);
  });

  it("renders archive-only countries in the selector without adding empty entries to the guide directory", () => {
    const post = {
      ...fixture,
      title: "Study in the United States",
      excerpt: "Planning your studies.",
    };
    const html = renderToStaticMarkup(
      createElement(EuropeBlogLibrary, { language: "en", guides: [guide], archivePosts: [post] }),
    );
    expect(html).toContain('<option value="US">United States</option>');
    expect(html).toContain('<option value="IT">Italy</option>');
    expect(html.match(/<details\b/g)).toHaveLength(1);
    expect(html).not.toContain('<option value="CA">');
  });

  it("keeps Spanish Granada and Turkish financial wording out of automatic country matching", () => {
    expect(
      wixArchiveCountryCodes({
        title: "Valencia mı Granada mı? İspanya’da Yüksek Lisans",
        excerpt: "",
      }),
    ).not.toContain("GD");
    expect(
      wixArchiveCountryCodes({
        title: "Romanya Öğrenci Vizesinde Mali Yeterlilik Rehberi",
        excerpt: "",
      }),
    ).not.toContain("ML");
    expect(
      wixArchiveCountryCodes({ title: "Türkiye'den Japonya'da Eğitim", excerpt: "" }),
    ).toContain("JP");
    expect(wixArchiveCountryCodes({ title: "Study in Grenada", excerpt: "" })).toContain("GD");
  });

  it("makes bounded Wix card derivatives without changing full reader images", () => {
    const original = "https://static.wixstatic.com/media/abc_123~mv2.png";
    const thumbnail = original + "/v1/fill/w_640,h_336/archive-card.webp";
    expect(wixArchiveCardImageUrl(original)).toBe(thumbnail);
    expect(
      wixArchiveCardImageUrl(original + "/v1/fill/w_1536,h_1024/file.png?quality=100#image"),
    ).toBe(thumbnail);
    expect(wixArchiveCardImageUrl("https://images.example.org/original.png")).toBe(
      "https://images.example.org/original.png",
    );
    const post = { ...fixture, coverImage: original };
    const card = renderToStaticMarkup(
      createElement(EuropeBlogLibrary, { language: "tr", guides: [guide], archivePosts: [post] }),
    );
    expect(card).toContain(`src="${thumbnail}"`);
    expect(card).not.toContain(`src="${original}"`);
    const reader = renderToStaticMarkup(
      createElement(WixArchiveArticle, { post, translations: [], related: [] }),
    );
    expect(reader).toContain(`src="${original}"`);
    expect(reader).not.toContain("archive-card.webp");
  });

  it("does not transform lookalike hosts, unsafe media paths, ports or credential-bearing URLs", () => {
    for (const original of [
      "https://static.wixstatic.com.evil.example/media/photo.png",
      "https://static.wixstatic.com:444/media/photo.png",
      "https://static.wixstatic.com/not-media/photo.png",
      "https://static.wixstatic.com/media/photo.png/../private.png",
      "https://static.wixstatic.com/media/photo%2Fprivate.png",
      "https://static.wixstatic.com/media/a..b.png",
      "https://static.wixstatic.com/media/photo.svg",
    ])
      expect(wixArchiveCardImageUrl(original)).toBe(original);
    expect(
      wixArchiveCardImageUrl("https://user:password@static.wixstatic.com/media/photo.png"),
    ).toBeNull();
    expect(wixArchiveCardImageUrl("https://user@images.example.org/photo.png")).toBeNull();
    expect(wixArchiveCardImageUrl(null)).toBeNull();
  });

  it("keeps the library's ten native locales while offering only real archive languages", async () => {
    expect(isWixArchiveLocale("hi")).toBe(false);
    expect(await loadWixArchiveSummaries("hi")).toEqual([]);
    const html = renderToStaticMarkup(
      createElement(EuropeBlogLibrary, { language: "hi", guides: [guide], archivePosts: [] }),
    );
    expect(html).toContain(WIX_ARCHIVE_COPY.hi.availableBody);
    expect(html).toContain('href="/hi/blog/italy-study"');
    expect(html).toContain('href="/tr/blog#previous-articles"');
    expect(html).not.toContain(WIX_ARCHIVE_COPY.en.availableBody);
    const archiveHtml = renderToStaticMarkup(
      createElement(EuropeBlogLibrary, {
        language: "tr",
        guides: [guide],
        archivePosts: [fixture],
      }),
    );
    expect(archiveHtml).toContain(wixArchivePath("tr", fixture.slug));
    expect(archiveHtml).toContain('href="/tr/blog/italy-study"');
    expect(archiveHtml).toContain(WIX_ARCHIVE_COPY.tr.previous);
  });
});
