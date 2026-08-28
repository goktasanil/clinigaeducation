import {
  getStaticBlogCategoryLabel,
  getStaticBlogTranslation,
  normalizeStaticBlogLanguage,
} from "@/data/post-translations";
import { POSTS, POST_CATEGORIES, type Post } from "@/data/posts";
import type { WixCategory, WixPostDetail, WixPostSummary } from "@/lib/wix-blog.functions";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const localSummary = (post: Post, language = "tr"): WixPostSummary => {
  const code = normalizeStaticBlogLanguage(language);
  const translated = getStaticBlogTranslation(post.slug, code);
  return {
    id: `local:${post.slug}`,
    slug: post.slug,
    title: translated?.title ?? post.title,
    excerpt: translated?.excerpt ?? post.excerpt,
    coverImage: null,
    coverWidth: null,
    coverHeight: null,
    publishedDate: post.date,
    minutesToRead: post.minutes,
    language: code,
    views: 0,
    categoryIds: [post.category],
  };
};

export function listStaticBlogPosts(language = "tr") {
  return { posts: POSTS.map((post) => localSummary(post, language)), total: POSTS.length };
}

export function listStaticBlogCategories(language = "tr"): WixCategory[] {
  return POST_CATEGORIES.filter((category) => category !== "all").map((category) => ({
    id: category,
    label: getStaticBlogCategoryLabel(category, language),
    slug: category,
    postCount: POSTS.filter((post) => post.category === category).length,
  }));
}

export function getStaticBlogPost(slug: string, language = "tr"): WixPostDetail | null {
  const post = POSTS.find((candidate) => candidate.slug === slug);
  if (!post) return null;
  const translated = getStaticBlogTranslation(slug, language);
  const summary = localSummary(post, language);
  const body = translated?.body ?? post.body;
  return {
    ...summary,
    html: body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join(""),
    seoTitle: summary.title,
    seoDescription: summary.excerpt,
  };
}
