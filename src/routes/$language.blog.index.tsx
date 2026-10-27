import { createFileRoute, notFound } from "@tanstack/react-router";
import { EuropeBlogLibrary } from "@/components/blog/EuropeBlogLibrary";
import { europeBlogHead, isEuropeBlogLocale, loadEuropeBlog } from "@/lib/europe-blog";

export const Route = createFileRoute("/$language/blog/")({
  loader: async ({ params }) => {
    if (!isEuropeBlogLocale(params.language)) throw notFound();
    return { language: params.language, guides: await loadEuropeBlog(params.language) };
  },
  head: ({ loaderData }) => (loaderData ? europeBlogHead(loaderData.language) : {}),
  component: EuropeBlogIndexPage,
});
function EuropeBlogIndexPage() {
  const { language, guides } = Route.useLoaderData();
  return <EuropeBlogLibrary language={language} guides={guides} />;
}
