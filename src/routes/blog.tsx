import { createFileRoute, redirect } from "@tanstack/react-router";
import { europeBlogPath } from "@/lib/europe-blog";

// One canonical destination for the legacy entry URL. Locale links stay explicit.
// GitHub Pages uses the generated static alias; its HTTP status needs a host-level rule.
export const Route = createFileRoute("/blog")({
  beforeLoad: () => {
    throw redirect({ href: europeBlogPath("tr"), statusCode: 301 });
  },
});
