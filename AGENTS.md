<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Codex working agreement

## Product boundary

- Treat this repository as **CliniGA Education**, the education and study-abroad property.
- Keep its pages, structured data, analytics, leads, and search signals separate from the CliniGA CRO company site.
- Do not invent university partnerships, admission guarantees, visa outcomes, scholarships, prices, rankings, testimonials, or success rates.
- Preserve user trust: clearly distinguish general information from personalized academic, immigration, financial, or legal advice.

## Architecture and editing

- Follow the current TanStack Start, React, TypeScript, Vite, Tailwind, and Supabase patterns.
- Read `package.json`, route definitions, the nearest tests, and relevant server/client boundaries before editing.
- Do not hand-edit generated route-tree output. Change route source and run the appropriate generator/build.
- Reuse existing UI primitives and data modules before adding dependencies.
- Keep server-only code, credentials, and privileged Supabase operations out of browser bundles.
- Apply database changes through new migrations. Preserve row-level security, data minimization, and least-privilege access.
- Never place real applicant data, contact details, tokens, or environment values in fixtures, logs, screenshots, commits, or pull requests.

## Git and release workflow

- Work on a focused branch and use a pull request for review.
- Never force-push, rebase, amend, squash, or rewrite published Lovable history.
- Do not merge, deploy, publish, change DNS, send messages, or mutate production data unless the user explicitly requests that action.
- Preserve unrelated user changes and keep commits scoped.

## Required verification

Use the repository lockfile and current package scripts. For the npm setup, run:

```bash
npm ci
npm run lint
npm run check
npm test
npm run build
```

For search changes, also run the available live SEO and Lighthouse checks after a deployment target is available. Report any unavailable or blocked command exactly; do not infer success from partial checks.

## SEO, localization, and accessibility

- Verify rendered title, description, canonical, robots, Open Graph, JSON-LD, `lang`, H1, and internal links for each changed route.
- Keep sitemap, robots, redirects, canonical host, and internal URLs consistent.
- Require self-canonicals and reciprocal hreflang clusters for real locale pages. Translate primary content completely; do not publish thin locale shells.
- Remove retired URLs from sitemaps and internal links; use a relevant 301 only when a genuine replacement exists.
- Avoid doorway pages, fabricated reviews, unsupported schema, and mass low-value translations.
- Preserve semantic structure, keyboard access, labels, visible focus, contrast, responsive layout, alt text, and reduced-motion behavior.

## Completion standard

Run fresh verification, inspect the final diff, and report evidence. Separate repository completion from deployment, live-page behavior, Search Console state, and time-dependent indexing.
