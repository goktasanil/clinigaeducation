import { createFileRoute, notFound } from "@tanstack/react-router";
import { EuropeBlogArticle } from "@/components/blog/EuropeBlogArticle";
import { europeBlogHead, isEuropeBlogLocale, loadEuropeBlog } from "@/lib/europe-blog";

export const Route = createFileRoute("/$language/blog/$slug")({
  loader: async ({ params }) => {
    if (!isEuropeBlogLocale(params.language)) throw notFound();
    const guides = await loadEuropeBlog(params.language);
    const guide = guides.find((item) => item.slug === params.slug);
    if (!guide) throw notFound();
    return {
      language: params.language,
      guide,
      related: guides.filter(
        (item) => item.countryCode === guide.countryCode && item.slug !== guide.slug,
      ),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? europeBlogHead(loaderData.language, loaderData.guide) : {},
  component: EuropeBlogArticlePage,
});
function EuropeBlogArticlePage() {
  const { language, guide, related } = Route.useLoaderData();
  return <EuropeBlogArticle language={language} guide={guide} related={related} />;
}
