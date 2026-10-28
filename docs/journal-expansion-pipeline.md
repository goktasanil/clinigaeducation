# Complete native problem-solution journal

The original 169 journal topics, 208 country guides and 718 legacy aliases retain their identities and addresses. New topics enter through `src/data/journal/expansion/compose.mjs`, which exports `async composeExpansionArticles(root)`, and optionally sorted `articles-*.json` arrays. No placeholder article is generated.

`release.json` declares `{ "targetTopics": 1000, "expectedExpansionTopics": 623 }`. The target counts distinct topics once; it does not count language pages or country-filter appearances. Without a release file, the existing 377-topic release can still be built while source research is prepared. With that file present, missing topics or native content fail production generation. `JOURNAL_PREPARE_ONLY=1` deliberately skips expansion while source research is incomplete and emits an explicitly non-publishable baseline manifest; both static rendering and publication auditing reject that manifest. Production builds must omit this flag.

Each composed record has:

- `topicKey`, `slug`, `countryCodes` (one actual destination), `topic`, `issueKey` and `checkedAt`.
- `evidence: { kind: "anonymized-chat-theme" | "country-research", themeKey }`. This is private-source provenance, not a copied conversation or claim that a problem was observed in every country.
- At least two distinct official `sources: [{ label, url, checkedAt }]`.
- A reviewed `photo`, or `photoKey` resolving in `expansion/photography.json`. All new photo source identities must differ from the 377 existing covers and every other new topic.
- `locales` with exactly the ten supported native `{ title, excerpt, html }` versions.
- `localWorkflow` with the exact country-specific text used inside each native article. This validation proof accepts raw or HTML-escaped text, is checked against the decoded primary content, and is not sent to the reader.

The compiler requires substantive local workflow text, at least 300 word-equivalents per full solution (600 CJK characters for Chinese), at least three explanatory headings and three actionable checklist entries, native scripts, complete titles/excerpts, distinct locale bodies and no unresolved translation tokens. It rejects duplicate country/problem intents and local adaptations differing only by country name. These mechanical checks complement review of the actual local procedures and official sources; they do not certify translation quality or legal advice.

## Loading and output

The generated reader imports one `article-<id>.json` module through a small native slug-to-ID lookup. The article carries ten minimal translation references, so opening it does not load ten complete locale catalogues. Country-library cards load only the active language's slim summary array, without full bodies, source lists or photo-review metadata. Original source exports remain immutable.

Aggregate `detail-<language>.json` files are build/audit artefacts only and are not imported by the application. `release-manifest.json` records the expected target, actual unique topics, native page counts and preserved aliases. The sitemap, static renderer and journal audit consume the generated catalogue/manifest rather than a hard-coded 1,690-page assumption. The audit still checks every native page, reciprocal canonical/hreflang cluster, country-directory link, photo credit and official source link.

Run the normal repository verification. Expansion regression tests are part of `npm test`; the native reader tests cover compact translation references and absence of reader-only metadata in card payloads. After the full source is ready, render every static route and run `npm run journal:audit`. Measure final `.output/public` bytes and file count against the actual deployment platform before release; do not infer hosting capacity from topic counts.
