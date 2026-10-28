# Education journal refresh

The journal uses one country and topic catalogue, without archive/previous-article categories. Existing article URLs remain valid. The 710 immutable Wix source records are retained for provenance; 8 original Education articles are expanded into complete editorial baselines. The complete journal has 169 source topics in all 10 supported languages, alongside 208 country guides in the same 10 languages: 377 topics and 3,770 native article pages.

## Editorial review

`src/data/journal/topics.json` assigns real destination codes and topics explicitly. International academic subjects use `GLOBAL` rather than a guessed country. `verified-facts.json` records dated official sources and complete native updates. Revision data removes superseded fees, past deadlines presented as current, unsupported statistics and duplicated source cover art. Original source exports and first-publication dates are preserved. The 39 dated official fact updates have explicit native text. Three clinical topics have distinct source-backed expansions rather than duplicated regulatory summaries. New translations are bound to the exact reviewed source ID and SHA256; a missing or stale full translation fails production generation.

## Photographs

`photography.json` contains 377 distinct Wikimedia Commons photographs, their file pages, creator attribution and licence links. Article readers display those credits. Photographs are editorial context, not claims of institutional partnerships. HTTP checks verified the selected image URLs. Do not remove attribution when reusing an asset.

The follow-up selection replaces 375 covers after a subject and location review. Every record has an explicit country, subject, selection rationale and review date. Campus and library images replace location-tagged wildlife, specimens and unrelated objects; laboratory images provide clearly contextual research subjects. Discovery now writes candidates only and cannot silently publish search results. Run `python3 scripts/fetch-journal-photography.py validate` and `python3 scripts/test-journal-photography.py` to validate the catalogue and discovery regression cases.

The homepage feature cards use the same selected photographs and credits as their article pages. The compact generated `featured-photography.json` contains only the three homepage selections; it does not load the complete photography manifest into the homepage bundle. The static journal audit checks this consistency.

The journal masthead is generated editorial imagery and does not depict a claimed real event or named partner campus. Production asset: `public/journal/education-journal-hero.webp`. Generated using the built-in image generation tool, then encoded as WebP for delivery.

Final generation prompt: “A premium panoramic editorial photograph for CliniGA Education’s international study journal. Three adult international university students walk through a sunlit historic European courtyard. Natural expressions and realistic details; warm autumn light, limestone arcades and greenery, teal and terracotta clothing accents. Students on the right, calm architectural space on the left for an HTML headline. Wide landscape, documentary travel-magazine photography. No text, logos, flags or watermark. No specific named university and no claim of a real event.”

## Full translations

Offline translation preparation uses the MIT-licensed `facebook/m2m100_418M` model through CTranslate2 int8. The converted weights are pinned to revision `d1eca4826e8939f93f1390bae9e71b473d8a18ff`; no remote executable model code is loaded. Model weights and the SQLite working cache are not website dependencies. The preparation tools require CTranslate24.6.3, SentencePiece0.2.1 and BeautifulSoup4.14.3. Sentence-oriented batching preserves later sentences, and HTML structure and links are retained separately. This is machine translation preparation, not a claim of certified human translation.

Generated complete translations are checked into `src/data/journal/translations/`. There is no runtime translation request or source-language fallback. Every one of the 972 newly translated headlines has a separately curated native title in `native-titles.json`, bound to the reviewed source hash. Exact-node bilingual corrections preserve numerical values, document codes and city identities. Source URL labels remain literal URLs, and links between imported articles resolve to the reader’s native journal. Duplicate full primary bodies within a locale fail generation. The publication checks cover every locale, canonical/hreflang group, source hash, complete body and article structure. `JOURNAL_PREPARE_ONLY=1` is exclusively for local preparation; production builds omit it and fail until every article has every required language.

The follow-up editorial review corrects Russian and English academic and administrative terminology, and a wrongly Italian English headline. Repeated exact nodes require an explicit positive `expectedMatches` count; a source change or a different occurrence count fails the build. Ten-language substantive updates distinguish Italian qualification assessment from Apostille, translation and Dichiarazione di Valore; remove unverifiable customer anecdotes; clarify Universitaly and foreign-income evidence; and separate DSU scholarship payments from visa funding and regional-tax refunds. These corrections retain the immutable originals and source hashes. Dated official sources are merged into the rendered article source list and its structured-data citations.

## Validation

Run the repository’s install, lint, check, test and production build scripts. Render the 4,619 public and redirect routes, then run `npm run journal:audit` to check all 3,770 native article pages, 10 reciprocal locale versions, 377 country-directory links per language, photographic attribution, and 718 legacy replacements. The Pages workflow runs this gate before deployment. Inspect desktop/mobile/RTL interaction and run the live SEO and Lighthouse checks after publication. No payment, database or account configuration is changed by this journal release.
