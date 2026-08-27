import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

import { listWixPosts, listWixCategories, type WixPostSummary } from "@/lib/wix-blog.functions";
import { listStaticBlogCategories, listStaticBlogPosts } from "@/lib/blog-static";
import { translatePostSummaries, translateCategories } from "@/lib/translate.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { blogCspMeta } from "@/lib/csp";
import { StudentInsightsFeature } from "@/components/blog/StudentInsightsFeature";

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

const postsQueryOptions = queryOptions({
  queryKey: ["wix-posts", { all: true }],
  queryFn: () =>
    isStaticHost ? Promise.resolve(listStaticBlogPosts()) : listWixPosts({ data: { all: true } }),
  staleTime: 5 * 60_000,
});

const categoriesQueryOptions = queryOptions({
  queryKey: ["wix-categories"],
  queryFn: () => (isStaticHost ? Promise.resolve(listStaticBlogCategories()) : listWixCategories()),
  staleTime: 10 * 60_000,
});

const translationsQueryOptions = (
  lang: string,
  items: { id: string; title: string; excerpt: string }[],
) =>
  queryOptions({
    queryKey: ["wix-post-translations", lang, items.map((i) => i.id).join(",")],
    queryFn: () => translatePostSummaries({ data: { lang, items } }),
    staleTime: 60 * 60_000,
    enabled: !isStaticHost && lang !== "tr" && items.length > 0,
  });

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
  page: fallback(z.number().int().min(1), 1).default(1),
});

const PAGE_SIZE = 18;

export const Route = createFileRoute("/blog")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(postsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]);
  },
  head: () => ({
    meta: [
      blogCspMeta(),
      {
        title: "Akademik Blog | Yurt Dışı Eğitim & Vize Rehberleri",
      },
      {
        name: "description",
        content:
          "Erasmus, vize, niyet mektubu (SOP), istatistik ve tez konularında uzman akademisyenler tarafından hazırlanan güncel rehberler.",
      },
      { property: "og:title", content: "Akademik Blog | CliniGA Education" },
      {
        property: "og:description",
        content: "Yurt dışı eğitim, vize, tez ve istatistik üzerine rehber içerikler.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/blog" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Blog" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Akademik Blog | CliniGA Education" },
      {
        name: "twitter:description",
        content: "Yurt dışı eğitim, vize, tez ve istatistik üzerine rehber içerikler.",
      },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/blog" }],
  }),
  component: BlogPage,
  errorComponent: ({ error }) => (
    <div className="container-prose py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-navy">Yazılar yüklenemedi</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="container-prose py-20 text-center">Not found</div>,
});

function BlogPage() {
  const { t, i18n } = useTranslation();
  const { q, cat, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/blog" });

  const { data: postsData } = useSuspenseQuery(postsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const posts = postsData.posts;

  // Trigger translations only when a server runtime exists. Static GitHub Pages
  // builds intentionally keep the original Turkish editorial copy instead of
  // invoking server-only Lovable AI endpoints from the browser.
  const translationInput = useMemo(
    () => posts.map((p) => ({ id: p.id, title: p.title, excerpt: p.excerpt })),
    [posts],
  );
  const { data: translations } = useQuery(
    translationsQueryOptions(i18n.language, translationInput),
  );
  const tMap = useMemo(() => {
    const m = new Map<string, { title: string; excerpt: string }>();
    translations?.forEach((tr) => m.set(tr.id, { title: tr.title, excerpt: tr.excerpt }));
    return m;
  }, [translations]);

  // Only keep categories that appear in the loaded posts.
  const usedCategoryIds = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.categoryIds.forEach((id) => s.add(id)));
    return s;
  }, [posts]);

  // Wix can return several category records sharing the same label.
  // Merge them into a single chip (all ids kept for filtering), drop empties,
  // and sort by post volume then alphabetically.
  const mergedCategories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) =>
      new Set(p.categoryIds).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1)),
    );

    const groups = new Map<string, { key: string; label: string; ids: string[]; count: number }>();
    categories
      .filter((c) => usedCategoryIds.has(c.id) && c.label.trim().length > 0)
      .forEach((c) => {
        const label = c.label.trim();
        const key = label.toLocaleLowerCase("tr");
        const existing = groups.get(key);
        if (existing) {
          existing.ids.push(c.id);
          existing.count += counts.get(c.id) ?? 0;
        } else {
          groups.set(key, {
            key: c.id,
            label,
            ids: [c.id],
            count: counts.get(c.id) ?? 0,
          });
        }
      });

    return [...groups.values()]
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
  }, [categories, usedCategoryIds, posts]);

  // Translate category labels only on deployments with a real server runtime.
  const categoryInput = useMemo(
    () => mergedCategories.map((c) => ({ id: c.key, label: c.label })),
    [mergedCategories],
  );
  const { data: categoryTranslations } = useQuery({
    queryKey: [
      "wix-category-translations",
      i18n.language,
      categoryInput.map((c) => c.id).join(","),
    ],
    queryFn: () =>
      translateCategories({
        data: { lang: i18n.language, items: categoryInput },
      }),
    enabled: !isStaticHost && i18n.language !== "tr" && categoryInput.length > 0,
    staleTime: 60 * 60_000,
  });
  const catLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    mergedCategories.forEach((g) => {
      const label = categoryTranslations?.find((c) => c.id === g.key)?.label ?? g.label;
      g.ids.forEach((id) => m.set(id, label));
    });
    return m;
  }, [categoryTranslations, mergedCategories]);

  // Selected chip expands to every id sharing that label.
  const selectedIds = useMemo(() => {
    if (!cat) return null;
    const group = mergedCategories.find((g) => g.ids.includes(cat));
    return new Set(group ? group.ids : [cat]);
  }, [cat, mergedCategories]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase(i18n.language);
    return posts.filter((p) => {
      if (selectedIds && !p.categoryIds.some((id) => selectedIds.has(id))) return false;
      if (!needle) return true;
      const tr = tMap.get(p.id);
      const catLabels = p.categoryIds.map((id) => catLabelMap.get(id) ?? "").join(" ");
      const hay =
        `${tr?.title ?? p.title} ${tr?.excerpt ?? p.excerpt} ${catLabels}`.toLocaleLowerCase(
          i18n.language,
        );
      return hay.includes(needle);
    });
  }, [posts, q, selectedIds, tMap, catLabelMap, i18n.language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const setSearch = (next: { q?: string; cat?: string; page?: number }) =>
    navigate({
      search: (prev: { q: string; cat: string; page: number }) => {
        const merged = { ...prev, ...next };
        // Reset page when filters change and page is not explicitly set.
        if ((next.q !== undefined || next.cat !== undefined) && next.page === undefined) {
          merged.page = 1;
        }
        return merged;
      },
      replace: true,
    });

  return (
    <div className="container-prose py-16 md:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          {t("nav.blog")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy md:text-5xl">
          {t("blog.title")}
        </h1>
        <p className="mt-4 text-muted-foreground">{t("blog.subtitle")}</p>
      </header>

      <StudentInsightsFeature />

      {isStaticHost && i18n.language !== "tr" ? (
        <div
          role="status"
          className="mx-auto mt-8 max-w-2xl rounded-xl border border-teal/20 bg-teal/5 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground"
        >
          Blog yazılarının editoryal içeriği şu anda Türkçe gösteriliyor. Menü ve arayüz seçtiğiniz
          dilde kullanılmaya devam eder.
        </div>
      ) : null}

      {/* Search */}
      <div className="mx-auto mt-10 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder={t("blog.searchPlaceholder")}
            className="h-12 pl-10 pr-10"
            aria-label={t("blog.searchPlaceholder")}
          />
          {q ? (
            <button
              type="button"
              onClick={() => setSearch({ q: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-navy"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Category chips */}
      {mergedCategories.length > 0 ? (
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <CategoryChip
            label={t("blog.allCategories")}
            active={!cat}
            onClick={() => setSearch({ cat: "" })}
          />
          {mergedCategories.map((c) => {
            const active = Boolean(selectedIds?.has(c.key));
            return (
              <CategoryChip
                key={c.key}
                label={`${catLabelMap.get(c.key) ?? c.label} (${c.count})`}
                active={active}
                onClick={() => setSearch({ cat: active ? "" : c.key })}
              />
            );
          })}
        </div>
      ) : null}

      <p className="mt-6 text-center text-xs text-muted-foreground/80">
        {filtered.length} / {posts.length}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">{t("blog.noResults")}</div>
      ) : (
        <>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((post) => {
              const tr = tMap.get(post.id);
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  title={tr?.title ?? post.title}
                  excerpt={tr?.excerpt ?? post.excerpt}
                  locale={i18n.language}
                  t={t}
                />
              );
            })}
          </div>

          {totalPages > 1 ? (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setSearch({ page: currentPage - 1 })}
                aria-label="Previous page"
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal disabled:opacity-40 disabled:hover:border-border disabled:hover:text-navy"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                // Show first, last, current, current±1; ellipses elsewhere
                const show = p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                if (!show) {
                  if (p === 2 || p === totalPages - 1) {
                    return (
                      <span key={p} className="px-1 text-muted-foreground">
                        …
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSearch({ page: p })}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={cn(
                      "min-w-9 rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                      p === currentPage
                        ? "border-gold bg-gold text-gold-foreground"
                        : "border-border bg-white text-navy hover:border-teal hover:text-teal",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setSearch({ page: currentPage + 1 })}
                aria-label="Next page"
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:border-teal hover:text-teal disabled:opacity-40 disabled:hover:border-border disabled:hover:text-navy"
              >
                ›
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-gold bg-gold text-gold-foreground shadow-sm"
          : "border-border bg-white text-navy hover:border-teal hover:text-teal",
      )}
    >
      {label}
    </button>
  );
}

function PostCard({
  post,
  title,
  excerpt,
  locale,
  t,
}: {
  post: WixPostSummary;
  title: string;
  excerpt: string;
  locale: string;
  t: (k: string) => string;
}) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group">
      <Card className="h-full overflow-hidden border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-premium">
        <div className="relative aspect-[16/10] overflow-hidden bg-navy">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full gradient-navy" />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-navy/80 to-transparent p-4">
            <Badge className="bg-gold/95 text-gold-foreground hover:bg-gold">
              {new Date(post.publishedDate).toLocaleDateString(locale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-white/85">
              <Clock className="h-3 w-3" /> {post.minutesToRead} {t("blog.minutes")}
            </span>
          </div>
        </div>
        <CardContent className="p-6">
          <h2 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-teal">
            {title}
          </h2>
          <p className="mt-2.5 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal group-hover:gap-2.5">
            {t("blog.readMore")} <ArrowRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}