import { describe, expect, it } from "vitest";

import {
  STATIC_BLOG_CATEGORY_LABELS,
  STATIC_BLOG_TRANSLATIONS,
  getStaticBlogTranslation,
} from "@/data/post-translations";
import { POSTS, POST_CATEGORIES } from "@/data/posts";

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

  it("keeps Turkish as the canonical editorial source", () => {
    for (const post of POSTS) {
      expect(getStaticBlogTranslation(post.slug, "tr")).toBeNull();
    }
  });
});
