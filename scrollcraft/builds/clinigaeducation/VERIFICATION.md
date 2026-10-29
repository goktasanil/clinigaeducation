# ScrollCraft review evidence

Status: original homepage review evidence. PR #68 was subsequently published on 2026-10-29 after the user's explicit instruction. The full-property extension is documented in SITE_WIDE.md.

## Automated verification

- `npm ci --no-audit --no-fund`: passed using the existing lockfile.
- `npm run lint`: passed, zero warnings.
- `npm run check`: TypeScript and 210 Vitest tests in 34 files passed.
- `npm test`: 210 Vitest tests and 64 Node tests passed.
- `npm run build`: passed, including client/server output. Existing TanStack deprecation and large-chunk warnings remain.
- `node --check public/scrollcraft/scrollcraft.js`: passed.
- Upstream ScrollCraft JavaScript and CSS were compared byte-for-byte with the installed skill sources: identical. The CSS is retained for reference; the homepage uses a scoped brand stylesheet.
- `git diff --check`: passed.

The new SSR tests cover the complete five-step process, translated atlas labels, and genuine guide/contact/portal destinations across all ten interface languages. Existing journal data and SEO head declarations were not changed.

## Browser review

Reviewed in the managed Chrome preview, using the actual application. A temporary iframe fixture supplied narrow viewports and was removed before the final build.

| View | Evidence |
| --- | --- |
| Desktop, 1363px browser window | Full opening inspected; all three photos loaded; one H1 and the existing canonical retained. |
| Desktop journey | Sticky spread at 76px; all five descriptions present. Clicking Plan selected the third drawing state and scrolling advanced to Destek. |
| 360px and 390px, Turkish | No horizontal overflow; headline and main actions fit; mobile menu opens and closes. All five steps remain in normal flow. |
| 768px, Turkish | No horizontal overflow; clear heading and inline actions; journey uses normal flow. |
| 360px, German | Long heading wraps without overlap; main actions remain visible. |
| 360px, Arabic | Correct `lang=ar` and `dir=rtl`; translated controls and no horizontal overflow, visually inspected after paint. |

Functional observations:

- Selecting Germany changes the hero image, caption, credit, route note, and lower discovery panel together. Both guide links become `/tr/blog?country=DE`.
- Following the guide reaches the real journal with the country filter set to DE. Leaving the homepage cleans up the runtime's `sc-ready` document class.
- Hero photo and foreground note have separate measured scroll transforms; the title and actions remain stable.
- Manual pause removes runtime readiness and photo transforms, and makes the process spread relative. Resume works.
- Native FAQ details opens successfully.
- Only required cookies were accepted in the preview. No lead, payment, applicant, or production data was submitted.
- No application console errors were identified; unrelated browser-extension metadata errors were excluded.

## Feel check and boundaries

The opening presents possibility through a real campus photograph, country selection gives agency, and the paper roadmap forms the main clarity beat. Quieter scope, service and journal areas lead into existing consultation actions. The selected-country link is a working part of that journey.

The first runtime-loading attempt used a public dynamic import, which Vite rejected; the final implementation uses an ordinary script tag. The managed preview host is explicitly allowed as `terminal.local`. Both fixes were verified before final lint/build.

SSR completeness and manual pause were tested. A physical phone and a browser with the operating system's reduced-motion preference enabled were not separately tested. There are no video assets. No performance score or live deployment verification is claimed.

Three Wikimedia photographs are stored unchanged, with original author/source/license data and visible attribution. No generated assets or new dependencies were added.

## Reviewed fingerprint, awaiting publication

| Grammar | Navigation | Hero | Sequence | Close | Signature | World |
| --- | --- | --- | --- | --- | --- | --- |
| Guided atlas | Existing complete navigation | Architectural photo, independent route-note parallax and subtle tilt | Photographic opening → quick starts → one pinned roadmap → quiet expertise → selected route → services/journal → consultation | Existing complete consultation action | One country choice persists into the lower route and opens the actual filtered journal | Academic architecture and a tangible planning sheet |

The original release has now been appended to `scrollcraft/FINGERPRINTS.md`. There were no previous builds to compare.

## Release boundary

The original review stopped at a branch and pull request under AGENTS.md. The user then explicitly requested publication; PR #68 was merged as `9881d6a9c1739f647ba0fb60e9dcfe3e2a7d43da`, and GitHub Pages build and deploy both succeeded in run `40878526116`. Live country selection updated the image, route and lower discovery panel. No DNS, authentication, database or applicant-data change was performed.
