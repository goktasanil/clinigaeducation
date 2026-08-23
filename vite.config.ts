// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBase = process.env.GITHUB_PAGES_BASE;

export default defineConfig({
  tanstackStart: {
    // Keep Lovable's SSR error wrapper for normal and GitHub builds.
    server: { entry: "server" },
  },
  vite: {
    // A custom Pages domain serves at /; the github.io project fallback uses /clinigaeducation/.
    base: githubPagesBase ?? (isGitHubPages ? "/clinigaeducation/" : "/"),
  },
});
