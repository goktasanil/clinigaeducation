import { createFileRoute, notFound } from "@tanstack/react-router";
import { EuropeBlogLibrary } from "@/components/blog/EuropeBlogLibrary";
import { europeBlogHead, isEuropeBlogLocale, loadEuropeBlog } from "@/lib/europe-blog";
import { loadWixArchiveSummaries } from "@/lib/wix-archive";

export const Route = createFileRoute("/$language/blog/")({
  loader: async ({ params }) => {
    if (!isEuropeBlogLocale(params.language)) throw notFound();
    const [guides, archivePosts] = await Promise.all([
      loadEuropeBlog(params.language),
      loadWixArchiveSummaries(params.language),
    ]);
    return { language: params.language, guides, archivePosts };
  },
  head: ({ loaderData }) => (loaderData ? europeBlogHead(loaderData.language) : {}),
  component: EuropeBlogIndexPage,
});
function EuropeBlogIndexPage() {
  const { language, guides, archivePosts } = Route.useLoaderData();
  return <EuropeBlogLibrary language={language} guides={guides} archivePosts={archivePosts} />;
}
