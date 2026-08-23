import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const isGitHubPages =
    typeof window !== "undefined" &&
    window.location.hostname === "goktasanil.github.io";

  const router = createRouter({
    routeTree,
    context: { queryClient },
    basepath: isGitHubPages ? "/clinigaeducation" : "/",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
