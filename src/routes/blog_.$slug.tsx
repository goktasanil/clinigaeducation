import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, Languages } from "lucide-react";

import { getWixPost } from "@/lib/wix-blog.functions";
import { getStaticBlogPost } from "@/lib/blog-static";
import { translatePostHtml } from "@/lib/translate.functions";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { blogCspMeta } from "@/lib/csp";
import { blogRobotsContent } from "@/lib/blog-seo";
import { auditIdForPath, blogAuditId } from "@/lib/audit-id";
import { CTASection } from "@/components/sections/CTASection";

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

const postQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["wix-post", slug],
    queryFn: () =>
      isStaticHost ? Promise.resolve(getStaticBlogPost(slug)) : getWixPost({ data: { slug } }),
    staleTime: 5 * 60_000,
  });

const translatedPostQueryOptions = (
  lang: string,
  post: {
    id: string;
    title: string;
    excerpt: string;
    html: string;
  } | null,
  auditId: string,
) =>
  queryOptions({
    queryKey: ["wix-post-translated", post?.id ?? "", lang],
    queryFn: () =>
      translatePostHtml({
        data: {
          id: post!.id,
          lang,
          title: post!.title,
          excerpt: post!.excerpt,
          html: post!.html,
          auditId,
        },
      }),
    enabled: !isStaticHost && !!post && lang !== "tr",
    staleTime: 60 * 60_000,
  });

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(postQueryOptions(params.slug));
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    const FALLBACK_TITLE = "Akademik Blog | CliniGA Education";
    const FALLBACK_DESCRIPTION =
      "CliniGA Education akademik blogunda yurt dışı eğitim, vize, tez ve istatistik analizi üzerine uzman rehberleri keşfedin.";
    const title = post?.seoTitle ?? post?.title ?? FALLBACK_TITLE;
    const description = post?.seoDescription ?? (post?.excerpt || FALLBACK_DESCRIPTION);
    return {
      meta: [
        blogCspMeta(),
        { name: "x-audit-id", content: auditIdForPath(`/blog/${params.slug}`) },
        { title: post ? `${title} | CliniGA Education Blog` : FALLBACK_TITLE },
        { name: "description", content: description },
        { name: "robots", content: blogRobotsContent(Boolean(post)) },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `https://www.clinigaeducation.com/blog/${params.slug}` },
        ...(post?.coverImage
          ? [
              { property: "og:image", content: post.coverImage },
              { name: "twitter:card", content: "summary_large_image" },
              { name: "twitter:image", content: post.coverImage },
            ]
          : []),
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.clinigaeducation.com/blog/${params.slug}`,
        },
      ],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt,
                datePublished: post.publishedDate,
                image: post.coverImage ?? undefined,
                author: { "@type": "Organization", name: "CliniGA Education" },
              }),
            },
          ]
        : undefined,
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <div className="container-prose py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-navy">404</h1>
      <p className="mt-2 text-muted-foreground">Yazı bulunamadı.</p>
      <Link to="/blog" className="mt-6 inline-block text-teal">
        ← Bloga Dön
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-prose py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-navy">Bir hata oluştu</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function PostPage() {
  const params = Route.useParams();
  const { data: post } = useSuspenseQuery(postQueryOptions(params.slug));
  const { t, i18n } = useTranslation();

  const auditId = blogAuditId(params.slug, i18n.language);
  const { data: translated, isFetching: translating } = useQuery(
    translatedPostQueryOptions(i18n.language, post, auditId),
  );

  if (!post) return null;

  const displayTitle = translated?.title ?? post.title;
  const displayExcerpt = translated?.excerpt ?? post.excerpt;
  const displayHtml = translated ? sanitizeHtml(translated.html) : post.html;
  const isTranslated = i18n.language !== "tr" && !!translated;
  const staticTranslationUnavailable = isStaticHost && i18n.language !== "tr";

  return (
    <article>
      <header className="gradient-navy py-16 text-navy-foreground md:py-24">
        <div className="container-prose">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-navy-foreground/70 hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> {t("blog.backToBlog")}
          </Link>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight md:text-5xl">
            {displayTitle}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-navy-foreground/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" />
              {new Date(post.publishedDate).toLocaleDateString(i18n.language, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold" />
              {post.minutesToRead} {t("blog.minutes")}
            </span>
          </div>
        </div>
      </header>

      {post.coverImage ? (
        <div className="container-prose max-w-4xl">
          <img
            src={post.coverImage}
            alt={displayTitle}
            loading="lazy"
            decoding="async"
            className="mt-[-3rem] w-full rounded-lg shadow-premium md:mt-[-4rem]"
          />
        </div>
      ) : null}

      <div className="container-prose max-w-3xl py-14">
        {i18n.language !== "tr" ? (
          <div className="mb-6 flex items-center gap-2 rounded-md border border-teal/30 bg-teal/5 px-4 py-2.5 text-xs text-navy">
            <Languages className="h-4 w-4 text-teal" />
            {staticTranslationUnavailable
              ? "Bu makalenin otomatik çevirisi şu anda kullanılamıyor; özgün Türkçe içerik gösteriliyor."
              : translating && !isTranslated
                ? t("blog.translating")
                : isTranslated
                  ? t("blog.translatedNotice")
                  : "Çeviri yüklenemedi; özgün Türkçe içerik gösteriliyor."}
          </div>
        ) : null}

        {displayExcerpt ? (
          <p className="font-display text-lg italic leading-relaxed text-navy">{displayExcerpt}</p>
        ) : null}
        <div
          className="prose prose-lg mt-8 max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-teal prose-img:rounded-lg prose-strong:text-navy"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      </div>

      <CTASection />
    </article>
  );
}
