import { createServerFn } from "@tanstack/react-start";

import { ricosToHtml, type RicosContent } from "./wix-rich-content";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/wix";
const WIX_SITE_ID = "0c97ef77-d4e9-4c36-9b03-cc1968378ff6"; // anilgoktas.org

export type WixPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  publishedDate: string;
  minutesToRead: number;
  language: string;
  views: number;
  categoryIds: string[];
};

export type WixPostDetail = WixPostSummary & {
  html: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type WixCategory = {
  id: string;
  label: string;
  slug: string;
  postCount: number;
};

type WixMedia = {
  wixMedia?: {
    image?: { id?: string; url?: string; width?: number; height?: number };
  };
};

const buildImageFromMedia = (
  media: WixMedia | undefined,
): { url: string | null; width: number | null; height: number | null } => {
  const img = media?.wixMedia?.image;
  if (!img) return { url: null, width: null, height: null };
  const id = img.id;
  const url = img.url
    ? img.url
    : id
      ? `https://static.wixstatic.com/media/${id}`
      : null;
  return { url, width: img.width ?? null, height: img.height ?? null };
};

const callWix = async (path: string, init: RequestInit): Promise<Response> => {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const wixKey = process.env.WIX_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!wixKey) throw new Error("WIX_API_KEY is not configured");

  return fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": wixKey,
      "wix-site-id": WIX_SITE_ID,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSummary = (p: any): WixPostSummary => {
  const cover = buildImageFromMedia(p.media);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title ?? "",
    excerpt: p.excerpt ?? "",
    coverImage: cover.url,
    coverWidth: cover.width,
    coverHeight: cover.height,
    publishedDate: p.firstPublishedDate ?? p.lastPublishedDate ?? "",
    minutesToRead: typeof p.minutesToRead === "number" ? p.minutesToRead : 3,
    language: p.language ?? "tr",
    views: p.metrics?.views ?? p.postCountInfo?.views ?? 0,
    categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : [],
  };
};

export const listWixPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { limit?: number; offset?: number; all?: boolean } | undefined) => ({
      limit: Math.min(Math.max(input?.limit ?? 100, 1), 100),
      offset: Math.max(input?.offset ?? 0, 0),
      all: input?.all ?? false,
    }),
  )
  .handler(async ({ data }): Promise<{ posts: WixPostSummary[]; total: number }> => {
    const fetchPage = async (limit: number, offset: number) => {
      const res = await callWix(
        "/blog/v3/posts/query?fieldsets=URL&fieldsets=METRICS",
        {
          method: "POST",
          body: JSON.stringify({
            paging: { limit, offset },
            sort: [{ fieldName: "firstPublishedDate", order: "DESC" }],
          }),
        },
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Wix posts query failed [${res.status}]: ${body.slice(0, 200)}`);
      }
      return (await res.json()) as {
        posts?: unknown[];
        metaData?: { total?: number };
      };
    };

    if (!data.all) {
      const json = await fetchPage(data.limit, data.offset);
      const posts = (json.posts ?? []).map(toSummary);
      return { posts, total: json.metaData?.total ?? posts.length };
    }

    const all: WixPostSummary[] = [];
    let offset = 0;
    const pageSize = 100;
    let total = 0;
    for (let i = 0; i < 20; i++) {
      const json = await fetchPage(pageSize, offset);
      const batch = (json.posts ?? []).map(toSummary);
      all.push(...batch);
      total = json.metaData?.total ?? all.length;
      if (batch.length < pageSize || all.length >= total) break;
      offset += pageSize;
    }
    return { posts: all, total };
  });

export const listWixCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<WixCategory[]> => {
    const res = await callWix("/blog/v3/categories/query", {
      method: "POST",
      body: JSON.stringify({
        paging: { limit: 100 },
      }),
    });
    if (!res.ok) {
      // Return empty list on error rather than crashing the page.
      return [];
    }
    const json = (await res.json()) as { categories?: unknown[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.categories ?? []).map((c: any) => ({
      id: c.id,
      label: c.label ?? c.title ?? "",
      slug: c.slug ?? c.id,
      postCount: typeof c.postCount === "number" ? c.postCount : 0,
    }));
  },
);

export const getWixPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    if (!input?.slug || typeof input.slug !== "string") {
      throw new Error("slug is required");
    }
    return { slug: input.slug };
  })
  .handler(async ({ data }): Promise<WixPostDetail | null> => {
    const encoded = encodeURIComponent(data.slug);
    const res = await callWix(
      `/blog/v3/posts/slugs/${encoded}?fieldsets=RICH_CONTENT&fieldsets=SEO&fieldsets=URL&fieldsets=METRICS`,
      { method: "GET" },
    );

    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Wix post fetch failed [${res.status}]: ${body.slice(0, 200)}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = (await res.json()) as { post?: any };
    const p = json.post;
    if (!p) return null;

    const summary = toSummary(p);
    const html = ricosToHtml(p.richContent as RicosContent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seo = p.seoData as any;

    return {
      ...summary,
      html,
      seoTitle:
        seo?.tags?.find?.((t: { type?: string }) => t?.type === "title")?.children ??
        null,
      seoDescription:
        seo?.tags?.find?.((t: { type?: string; props?: { name?: string } }) =>
          t?.type === "meta" && t?.props?.name === "description",
        )?.props?.content ?? null,
    };
  });
