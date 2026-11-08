import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { EuropeBlogArticle } from "@/components/blog/EuropeBlogArticle";
import { EuropeBlogLibrary } from "@/components/blog/EuropeBlogLibrary";
import { WixArchiveArticle } from "@/components/blog/WixArchiveArticle";
import { BlogTeaser } from "@/components/sections/BlogTeaser";
import type { WixArchivePost } from "@/data/wix-archive/types";
import type { EuropeGuide } from "./europe-blog";
import { sanitizeArchiveHtml } from "./wix-archive-content";
import { wikimediaImagePrivacyProps } from "./wikimedia-image-privacy";

const upload = "https://upload.wikimedia.org/wikipedia/commons/8/89/university.jpg";
const thumb =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/campus.jpg/1280px-campus.jpg";
const guide: EuropeGuide = {
  slug: "poland-study",
  countryCode: "PL",
  countrySlug: "poland",
  countryName: "Poland",
  kind: "country",
  topic: "study",
  brief: "Synthetic campus guide.",
  sources: [],
  checkedAt: "2026-10-27",
  coverImage: upload,
};
const post: WixArchivePost = {
  id: "synthetic-post",
  slug: "synthetic-campus",
  title: "Synthetic campus",
  excerpt: "Synthetic editorial fixture.",
  language: "en",
  publishedAt: "2026-10-27T12:00:00Z",
  updatedAt: "2026-10-27T12:00:00Z",
  sourceUrl: "https://source.example.test/post",
  coverImage: thumb,
  coverWidth: 1200,
  coverHeight: 630,
  minutesToRead: 3,
  translationId: null,
  countryCodes: ["PL"],
  topic: "study",
  html: `<p>Campus.</p><img src="${upload}" alt="Campus" width="800" height="600">`,
};
const imageWithSource = (html: string, src: string) =>
  [...html.matchAll(/<img\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => tag.includes(`src="${src}"`));
const expectPrivateImage = (html: string, src: string) => {
  const image = imageWithSource(html, src);
  expect(image).toBeDefined();
  expect(image?.toLowerCase()).toContain('crossorigin="anonymous"');
  expect(image?.toLowerCase()).toContain('referrerpolicy="no-referrer"');
};

describe("verified Wikimedia image privacy", () => {
  it("renders all three real homepage blog teaser photos anonymously", async () => {
    const i18n = createInstance();
    await i18n.init({ lng: "en", fallbackLng: "en", resources: { en: { translation: {} } } });
    const html = renderToStaticMarkup(
      createElement(I18nextProvider, { i18n, children: createElement(BlogTeaser) }),
    );
    const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => tag);
    expect(images).toHaveLength(3);
    for (const image of images) {
      const src = /\ssrc="([^"]*)"/i.exec(image)?.[1];
      expect(wikimediaImagePrivacyProps(src)).toEqual({
        crossOrigin: "anonymous",
        referrerPolicy: "no-referrer",
      });
      expect(image.toLowerCase()).toContain('crossorigin="anonymous"');
      expect(image.toLowerCase()).toContain('referrerpolicy="no-referrer"');
      expect(image).toContain('loading="lazy"');
    }
    expect(html).toContain("<figcaption");
  });
  it.each([upload, thumb])("opts the verified origin into anonymous CORS: %s", (src) => {
    expect(wikimediaImagePrivacyProps(src)).toEqual({
      crossOrigin: "anonymous",
      referrerPolicy: "no-referrer",
    });
  });
  it.each([
    null,
    undefined,
    "",
    "/journal/local.webp",
    "//upload.wikimedia.org/image.jpg",
    "https://static.wixstatic.com/media/image.jpg",
    "https://images.example.test/image.jpg",
    "http://upload.wikimedia.org/image.jpg",
    "https://upload.wikimedia.org:444/image.jpg",
    "https://upload.wikimedia.org.example.test/image.jpg",
    "https://upload.wikimedia.org@example.test/image.jpg",
    "https://user@upload.wikimedia.org/image.jpg",
    "data:image/png;base64,synthetic",
    "blob:https://upload.wikimedia.org/synthetic",
  ])("preserves the image request behavior of other URLs: %s", (src) => {
    expect(wikimediaImagePrivacyProps(src)).toEqual({});
  });
  it("renders both article cover paths and the sanitized inline image anonymously", () => {
    const guideHtml = renderToStaticMarkup(
      createElement(EuropeBlogArticle, { language: "en", guide, related: [] }),
    );
    expectPrivateImage(guideHtml, upload);
    // React's eager image hint must use the same credential policy as the image.
    const preload = [...guideHtml.matchAll(/<link\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .find((tag) => tag.includes(`href="${upload}"`));
    // React may serialize anonymous as the equivalent empty CORS attribute.
    expect(preload?.toLowerCase()).toMatch(/\scrossorigin="(?:anonymous)?"/);
    expect(preload?.toLowerCase()).toContain('referrerpolicy="no-referrer"');
    const archive = renderToStaticMarkup(
      createElement(WixArchiveArticle, { post, translations: [post], related: [] }),
    );
    expectPrivateImage(archive, thumb);
    expectPrivateImage(archive, upload);
  });
  it("protects library card images from both native guide and archive data", () => {
    const html = renderToStaticMarkup(
      createElement(EuropeBlogLibrary, { language: "en", guides: [guide], archivePosts: [post] }),
    );
    expectPrivateImage(html, upload);
    expectPrivateImage(html, thumb);
    expect(imageWithSource(html, "/journal/education-journal-hero.webp")).not.toContain(
      "crossorigin=",
    );
  });
  it("leaves first-party and unsupported third-party covers unchanged", () => {
    for (const coverImage of [
      "/journal/local.webp",
      "https://static.wixstatic.com/media/image.jpg",
    ]) {
      const html = renderToStaticMarkup(
        createElement(EuropeBlogArticle, {
          language: "en",
          guide: { ...guide, coverImage },
          related: [],
        }),
      );
      const image = imageWithSource(html, coverImage);
      expect(image).toBeDefined();
      expect(image).not.toContain("crossorigin=");
      expect(image).not.toContain("referrerpolicy=");
    }
  });
  it("preserves inline content, source query, dimensions and safe attributes after repeated sanitization", () => {
    const src = `${upload}?width=800&height=600`;
    const html = sanitizeArchiveHtml(
      `<figure><img src="${src.replaceAll("&", "&amp;")}" alt="Campus" width="800" height="600" loading="lazy" crossorigin="use-credentials" referrerpolicy="unsafe-url" onerror="bad()"><figcaption>Credit retained.</figcaption></figure>`,
    );
    expectPrivateImage(html, src.replaceAll("&", "&amp;"));
    expect(html).toContain('width="800" height="600" loading="lazy"');
    expect(html).toContain("<figcaption>Credit retained.</figcaption>");
    expect(html).not.toMatch(/use-credentials|unsafe-url|onerror/);
    expect(sanitizeArchiveHtml(html)).toBe(html);
    expect((html.match(/crossorigin=/g) || []).length).toBe(1);
  });
  it("does not enable CORS on unsupported inline hosts or allow unsafe markup", () => {
    const html = sanitizeArchiveHtml(
      '<img src="https://images.example.test/campus.jpg" crossorigin="use-credentials"><img src="/local.webp"><img src="javascript:bad()" onerror="bad()">',
    );
    expect(html).toContain('src="https://images.example.test/campus.jpg"');
    expect(html).not.toMatch(/crossorigin=|referrerpolicy=|javascript:|onerror=/);
  });
});
