import { POSTS, POST_CATEGORIES, type Post } from "@/data/posts";
import type { WixCategory, WixPostDetail, WixPostSummary } from "@/lib/wix-blog.functions";

const categoryLabels: Record<Post["category"], string> = {
  erasmus: "Erasmus",
  visa: "Vize",
  sop: "Niyet Mektubu",
  statistics: "İstatistik",
  thesis: "Tez",
  scholarship: "Burslar",
};

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

const localSummary = (post: Post): WixPostSummary => ({
  id: `local:${post.slug}`,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  coverImage: null,
  coverWidth: null,
  coverHeight: null,
  publishedDate: post.date,
  minutesToRead: post.minutes,
  language: "tr",
  views: 0,
  categoryIds: [post.category],
});

export function listStaticBlogPosts() {
  return { posts: POSTS.map(localSummary), total: POSTS.length };
}

export function listStaticBlogCategories(): WixCategory[] {
  return POST_CATEGORIES.filter((category) => category !== "all").map((category) => ({
    id: category,
    label: categoryLabels[category],
    slug: category,
    postCount: POSTS.filter((post) => post.category === category).length,
  }));
}

export function getStaticBlogPost(slug: string): WixPostDetail | null {
  const post = POSTS.find((candidate) => candidate.slug === slug);
  if (!post) return null;
  return {
    ...localSummary(post),
    html: post.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join(""),
    seoTitle: post.title,
    seoDescription: post.excerpt,
  };
}
