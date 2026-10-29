# Site-wide ScrollCraft refinement

The user's follow-up clarified that the experience must cover all pages, and supplied https://www.awwwards.com/websites/scrolling/ as a professional design reference. The existing publication authorization remains applicable.

## Reference review and design decisions

Viewed the Awwwards collection and actual ONFORM (https://www.onform.studio/) opening and intermediate scroll states. Its broad photographic composition, strong type scale and quiet section rhythm informed this refinement. Viewed Forge Automotive (https://forgeautomotive.co.uk/) entry and an intermediate typographic scene as a second pacing reference. No source code, text, branded composition or assets were copied from either site.

CliniGA retains its own navy, teal, academic imagery, real service scope and complete navigation. Warm paper tones and differentiated photographic/document mastheads now carry the same identity into the rest of the property. Task screens remain practical; the public globe and existing country/city filters retain their actual functionality.

| Family | Treatment |
| --- | --- |
| Homepage | Existing selected-country atlas and roadmap preserved; shared close refined |
| Services directory | Delft photographic opening, real education/research filters, editorial service rows |
| All six service details | Service-specific icon and independently moving document planes; complete scope, process and ethics remain |
| Packages | Layered folio opening, user-selected comparison of the existing package features and genuine consultation links |
| About | Heidelberg campus photograph explicitly labelled with its institution; large academic typography; existing team/mission content retained |
| Contact | Dark correspondence opening; mobile artwork removed to prioritize the form; existing inputs/submission logic retained |
| Process | Vienna photographic opening and the five-step atlas roadmap |
| City index and city detail | Architectural index and route-document detail; original filters, checklists and links retained |
| Native journal library | Real hero image with a flow owner and overscan for parallax; existing filters retained |
| Native and archive articles | Their existing individual cover photographs move into a split editorial opening; readable body and sidebar remain |
| Legacy articles | Shared reading surface and typography; the two standalone guides receive an editorial masthead |
| Legal pages | Quiet document masthead, reading progress and chapter links; all text retained |
| Quiz | Compact profile-test opening; mobile artwork omitted and existing question flow preserved |
| Portal, account, workspace and admin | Shared page identity, focus and task-control styling; no chapter extraction from task screens, authentication/authorization and operations unchanged |

## Shared behavior and boundaries

Every rendered route uses a classified surface from the root, including authenticated and localized families. The homepage keeps its independent atlas provider. New SSR tests enumerate actual route declarations to catch uncovered UI routes. Unknown/error routes retain a general readable surface.

Public reading pages derive a bounded chapter index from existing H2 text after hydration. IDs are unique against the document and preserved when already provided by the page. Heading text is rendered as React text. Task pages skip chapter extraction entirely. A small fixed dock offers motion pause and return-to-top; reading progress is decorative. Localized journal controls use the route locale during SSR, before client language effects run.

The engine remains byte-for-byte upstream. A shared integration owns loading and disposal. A child-list observer detects actual scene element insertion/removal after a lazy Outlet commits, batches reconciliation with requestAnimationFrame and compares element identity. It does not observe per-frame style/class changes or remount for ordinary text/tool updates. Empty task surfaces have no permanent engine instance. Three lifecycle tests guard deferred insertion, removal, unrelated changes and disposal while loading.

Route transitions use the installed router's documented `defaultViewTransition` option with reduced-motion CSS. Initial SSR remains complete and visible. No new dependencies or backend behavior were introduced.

## Asset evidence

Four photographs were downloaded unchanged from the existing reviewed journal photography registry, inspected in a contact sheet, and used with visible author/source/license credits and institution labels: TU Delft, Universität Heidelberg, TU Wien and ETH Zürich. A fifth candidate (Sorbonne entrance) was rejected and removed after visual inspection. No new image generation or invented partnerships are involved. The initial Heidelberg original was 1.77 MB; it was replaced with the unchanged 960px thumbnail served by Wikimedia (262,183 bytes, 960×720), reducing transfer size by about 85%. The thumbnail was visually inspected, with the same author and license retained. Physical-device transfer performance remains unmeasured.

## Review findings addressed

- Deferred route content originally could arrive after the engine's one-time scan. The integration now reconciles real scene identities; browser scrolling changed the about photo transform from 0.32px to -32.5px, and pause cleared readiness and yielded no transform.
- The journal background now has a flow scene owner and 32px vertical overscan.
- Dark mastheads use a light mint focus outline.
- Mobile decorative seals were removed to keep campus captions clear.
- A small RTL overflow caused by the new footer wordmark was corrected with a wrapping mobile composition; 360px Arabic article viewport measured 345px client and scroll widths, including its scrollbar.
- Duplicate in-page language controls were removed from contact and quiz because the persistent header already supplies that control. The quiz badge uses the user-facing profile-test label.

## Browser evidence and limits

Reviewed actual application pages at desktop and 360px, including services, package comparison, about, contact, quiz, and Arabic article layout. The services research filter returns thesis/statistics/publication. Comparing master and doctorate displays their original features with `/iletisim?package=master#randevu` and `/iletisim?package=phd#randevu`. Chapter navigation reaches its existing heading at a 110px offset and closes the dock. Resume/pause was exercised on an inner page. The mobile contact and quiz keep artwork hidden and show task content in normal flow.

The temporary responsive fixture is removed before the production build. No forms, payments, login, private applicant records or production mutations were exercised in UI checks. Physical-device and OS reduced-motion testing remain unperformed; manual pause, responsive compositions, SSR completeness and reduced-motion styles were reviewed. Do not infer payment/authentication end-to-end validation from this visual change.

## Final verification

- `npm run lint`: passed, zero warnings.
- `npm run check`: TypeScript and 232 Vitest tests in 36 files passed.
- `npm test`: 232 Vitest and 64 Node tests passed.
- `npm run build`: passed after the final application changes and fixture removal. Existing dependency deprecation and bundle-size warnings remain.
- The scene-mutation guard was inverted as a review experiment: two of the three lifecycle tests failed. The original source was restored, and all three passed again.
- Independent code review approved after the lifecycle, scene owner, overscan, focus contrast and chapter-ID findings were addressed.
- A fresh production-worker audit checked 26 public representatives: all rendered one H1 with correct profile, title, description, robots, Open Graph, self-canonical, locale and JSON-LD. Twenty-five returned 200 directly; the existing Roma query normalization returned 307 followed by 200. KVKK and sales/refund noindex remained intact.
- Direct HTTP access from the audit executor to the managed preview was unavailable (localhost connection refused; terminal.local timed out). The successful audit instead used the actual built worker and the same fetch path as the deployment renderer; no alternate server was started.
