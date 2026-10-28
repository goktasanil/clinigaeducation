import { createFileRoute, notFound } from "@tanstack/react-router";
import { WixArchiveArticle } from "@/components/blog/WixArchiveArticle";
import { loadEuropeBlog } from "@/lib/europe-blog";
import {
  isWixArchiveLocale,
  loadWixArchivePost,
  loadWixArchiveTranslations,
  wixArchiveHead,
  wixArchiveRelatedGuides,
} from "@/lib/wix-archive";

export const Route = createFileRoute("/$language/blog/archive/$slug")({
  loader: async ({ params }) => {
    if (!isWixArchiveLocale(params.language)) throw notFound();
    const post = await loadWixArchivePost(params.language, params.slug);
    if (!post) throw notFound();
    const [translations, guides] = await Promise.all([
      loadWixArchiveTranslations(post),
      loadEuropeBlog(params.language),
    ]);
    return { post, translations, related: wixArchiveRelatedGuides(post, guides) };
  },
  head: ({ loaderData }) =>
    loaderData ? wixArchiveHead(loaderData.post, loaderData.translations) : {},
  component: WixArchiveArticlePage,
});

function WixArchiveArticlePage() {
  const { post, translations, related } = Route.useLoaderData();
  return <WixArchiveArticle post={post} translations={translations} related={related} />;
}
