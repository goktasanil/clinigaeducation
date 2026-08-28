import { describe, expect, it } from "vitest";

import {
  STATIC_BLOG_CATEGORY_LABELS,
  STATIC_BLOG_TRANSLATIONS,
  getStaticBlogTranslation,
} from "@/data/post-translations";
import { POSTS, POST_CATEGORIES } from "@/data/posts";
import {
  getStaticBlogPost,
  listStaticBlogCategories,
  listStaticBlogPosts,
} from "@/lib/blog-static";

const LANGUAGES = ["en", "de", "fr", "it", "es", "ar", "ru", "zh"] as const;

describe("static blog translations", () => {
  it("covers every static post in every supported non-Turkish language", () => {
    for (const language of LANGUAGES) {
      expect(Object.keys(STATIC_BLOG_TRANSLATIONS[language]).sort()).toEqual(
        POSTS.map((post) => post.slug).sort(),
      );

      for (const post of POSTS) {
        const translated = getStaticBlogTranslation(post.slug, language);
        expect(translated, `${language}:${post.slug}`).not.toBeNull();
        expect(translated?.title.trim().length).toBeGreaterThan(8);
        expect(translated?.excerpt.trim().length).toBeGreaterThan(16);
        expect(translated?.body).toHaveLength(post.body.length);
        expect(translated?.body.every((paragraph) => paragraph.trim().length > 10)).toBe(true);
      }
    }
  });

  it("covers every visible category in all nine interface languages", () => {
    const categories = POST_CATEGORIES.filter((category) => category !== "all");
    for (const labels of Object.values(STATIC_BLOG_CATEGORY_LABELS)) {
      expect(Object.keys(labels).sort()).toEqual([...categories].sort());
      expect(Object.values(labels).every((label) => label.trim().length > 0)).toBe(true);
    }
  });

  it("renders the English static list and localized categories without a server", () => {
    const list = listStaticBlogPosts("en");
    const categories = listStaticBlogCategories("en");
    expect(list.posts).toHaveLength(POSTS.length);
    expect(list.posts[0]?.language).toBe("en");
    expect(list.posts[0]?.title).toBe(
      STATIC_BLOG_TRANSLATIONS.en[POSTS[0].slug]?.title,
    );
    expect(categories.find((category) => category.id === "visa")?.label).toBe("Visa");
  });

  it("renders a German static detail page with translated HTML", () => {
    const source = POSTS.find((post) => post.slug === "almanya-bloke-hesap-sperrkonto-rehberi");
    const detail = getStaticBlogPost("almanya-bloke-hesap-sperrkonto-rehberi", "de");
    expect(source).toBeDefined();
    expect(detail?.language).toBe("de");
    expect(detail?.title).toBe(
      STATIC_BLOG_TRANSLATIONS.de["almanya-bloke-hesap-sperrkonto-rehberi"].title,
    );
    expect(detail?.html).toContain("deutschen Studentenvisum");
    expect(detail?.html.match(/<p>/g)).toHaveLength(source?.body.length ?? 0);
  });

  it("keeps Turkish as the canonical editorial source", () => {
    for (const post of POSTS) {
      expect(getStaticBlogTranslation(post.slug, "tr")).toBeNull();
    }
  });
});
