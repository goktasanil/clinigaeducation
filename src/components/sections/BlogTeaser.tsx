import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";

import { listWixPosts } from "@/lib/wix-blog.functions";
import { Card, CardContent } from "@/components/ui/card";

export function BlogTeaser({ limit = 3 }: { limit?: number }) {
  const { t, i18n } = useTranslation();
  const fetchPosts = useServerFn(listWixPosts);

  const { data, isLoading } = useQuery({
    queryKey: ["home-blog-teaser", i18n.language, limit],
    queryFn: () => fetchPosts({ data: { limit: 20, offset: 0 } }),
    staleTime: 5 * 60 * 1000,
  });

  const posts = (data?.posts ?? [])
    .filter((p) => p.slug && p.title)
    .filter((p) => !i18n.language || !p.language || p.language === i18n.language)
    .slice(0, limit);

  // Hide the section entirely when nothing usable is available.
  if (isLoading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="container-prose py-20 md:py-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            {t("nav.blog")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
            {t("blog.title")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("blog.subtitle")}</p>
        </div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:gap-2.5"
        >
          {t("blog.categories.all")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group"
          >
            <Card className="h-full overflow-hidden border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-premium">
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt=""
                    loading="lazy"
                    width={post.coverWidth ?? undefined}
                    height={post.coverHeight ?? undefined}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full gradient-navy" />
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                  {post.publishedDate && (
                    <span>
                      {new Date(post.publishedDate).toLocaleDateString(i18n.language, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {post.minutesToRead ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.minutesToRead} {t("blog.minutes")}
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-teal">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal group-hover:gap-2.5">
                  {t("blog.readMore")} <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
