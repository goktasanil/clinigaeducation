import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const EUROPE_BLOG_LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "hi", "ar", "ru", "zh"];
export const EUROPE_BLOG_TOPICS = ["study", "admission", "funding", "arrival"];
export const EUROPE_BLOG_CHECKED_AT = "2026-10-27";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(projectRoot, "src/data/europe-blog");
const outputDirectory = resolve(sourceDirectory, "generated");
const coverDirectory = resolve(projectRoot, "public/blog-covers");

async function writeGenerated(path, contents) {
  try {
    if ((await readFile(path, "utf8")) === contents) return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeFile(path, contents);
}

export function extractIsoCountryCodes(source) {
  const block = source.match(
    /export const ISO_COUNTRY_CODES\s*=\s*\(([\s\S]*?)\)\s*\.split\(\s*" "\s*\)/,
  );
  assert.ok(block, "ISO_COUNTRY_CODES source block could not be located");
  const codes = [...block[1].matchAll(/"([^"]*)"/g)].flatMap((match) =>
    match[1].trim().split(/\s+/),
  );
  assert.equal(codes.length, 249, "Expected all 249 ISO country/territory codes");
  assert.equal(new Set(codes).size, 249, "ISO country/territory codes must be unique");
  for (const code of codes) assert.match(code, /^[A-Z]{2}$/);
  return codes;
}

/** Serialize CLDR labels and collation once, avoiding server/browser ICU drift. */
export function buildCountryNames(codes) {
  return Object.fromEntries(
    EUROPE_BLOG_LANGUAGES.map((language) => {
      const display = new Intl.DisplayNames([language, "en"], { type: "region" });
      return [
        language,
        codes
          .map((code) => ({ code, name: display.of(code) || code }))
          .sort(
            (left, right) =>
              left.name.localeCompare(right.name, language) || left.code.localeCompare(right.code),
          ),
      ];
    }),
  );
}

export async function writeCountryNames() {
  const source = await readFile(resolve(projectRoot, "src/data/portal.ts"), "utf8");
  const names = buildCountryNames(extractIsoCountryCodes(source));
  const directory = resolve(projectRoot, "src/data/generated");
  await mkdir(directory, { recursive: true });
  await writeGenerated(
    resolve(directory, "country-names.json"),
    `${JSON.stringify(names, null, 2)}\n`,
  );
  return names;
}

const assertHttps = (value, label) => {
  const parsed = new URL(value);
  assert.equal(parsed.protocol, "https:", `${label} must use HTTPS`);
  assert.equal(parsed.username, "", `${label} must not contain credentials`);
  assert.equal(parsed.password, "", `${label} must not contain credentials`);
  assert.ok(!["localhost", "127.0.0.1"].includes(parsed.hostname), `${label} must be public`);
};

/** Fail the build before publishing incomplete locale shells or unsourced guides. */
export function validateEuropeProfiles(profiles, { expectedCountries = 52 } = {}) {
  assert.ok(Array.isArray(profiles), "Europe profiles must be an array");
  assert.equal(
    profiles.length,
    expectedCountries,
    `Expected ${expectedCountries} editorial destinations`,
  );
  const codes = new Set();
  const slugs = new Set();
  const briefs = Object.fromEntries(EUROPE_BLOG_LANGUAGES.map((language) => [language, new Set()]));

  for (const profile of profiles) {
    assert.match(profile.code, /^[A-Z]{2}$/, "Country/destination code must contain two capitals");
    assert.match(
      profile.slug,
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Country slug must be a safe path segment",
    );
    assert.ok(
      typeof profile.name === "string" && profile.name.trim().length > 1,
      `${profile.code}: missing name`,
    );
    assert.ok(!codes.has(profile.code), `Duplicate destination code: ${profile.code}`);
    assert.ok(!slugs.has(profile.slug), `Duplicate destination slug: ${profile.slug}`);
    codes.add(profile.code);
    slugs.add(profile.slug);
    assert.ok(
      !profile.kind || ["country", "destination"].includes(profile.kind),
      `${profile.code}: invalid destination kind`,
    );
    assert.ok(
      Array.isArray(profile.sources) && profile.sources.length > 0,
      `${profile.code}: sources are required`,
    );
    const sourceIds = new Set();
    for (const source of profile.sources) {
      assert.ok(
        typeof source.id === "string" && source.id.length > 0,
        `${profile.code}: missing source id`,
      );
      assert.ok(!sourceIds.has(source.id), `${profile.code}: duplicate source ${source.id}`);
      sourceIds.add(source.id);
      assert.ok(
        typeof source.label === "string" && source.label.trim().length > 2,
        `${profile.code}: missing source label`,
      );
      assertHttps(source.url, `${profile.code}/${source.id}`);
      assert.equal(
        source.checkedAt,
        EUROPE_BLOG_CHECKED_AT,
        `${profile.code}/${source.id}: missing editorial check date`,
      );
    }
    for (const topic of EUROPE_BLOG_TOPICS) {
      const guide = profile.topics?.[topic];
      assert.ok(guide, `${profile.code}: missing ${topic} guide`);
      assert.ok(
        Array.isArray(guide.sourceIds) && guide.sourceIds.length > 0,
        `${profile.code}/${topic}: missing sources`,
      );
      for (const id of guide.sourceIds)
        assert.ok(sourceIds.has(id), `${profile.code}/${topic}: unknown source ${id}`);
      assert.deepEqual(
        Object.keys(guide.copy ?? {}).sort(),
        [...EUROPE_BLOG_LANGUAGES].sort(),
        `${profile.code}/${topic}: all ten native locales are required`,
      );
      assert.equal(
        new Set(Object.values(guide.copy)).size,
        EUROPE_BLOG_LANGUAGES.length,
        `${profile.code}/${topic}: duplicated language fallback`,
      );
      for (const language of EUROPE_BLOG_LANGUAGES) {
        const brief = guide.copy[language];
        assert.ok(
          typeof brief === "string" && brief.trim().length >= 100,
          `${profile.code}/${topic}/${language}: incomplete brief`,
        );
        const script = {
          hi: /[\u0900-\u097f]/g,
          ar: /[\u0600-\u06ff]/g,
          ru: /[\u0400-\u04ff]/g,
          zh: /[\u3400-\u9fff]/g,
        }[language];
        if (script)
          assert.ok(
            (brief.match(script) ?? []).length >= 20,
            `${profile.code}/${topic}/${language}: native script is missing`,
          );
        assert.ok(
          !briefs[language].has(brief.trim()),
          `${profile.code}/${topic}/${language}: identical country/topic copy`,
        );
        briefs[language].add(brief.trim());
      }
    }
  }
  return profiles;
}

export function compileEuropeBlog(profiles) {
  const catalog = profiles.map(({ code, slug, name, kind }) => ({
    code,
    slug,
    name,
    kind: kind ?? "country",
  }));
  const locales = Object.fromEntries(
    EUROPE_BLOG_LANGUAGES.map((language) => {
      const display = new Intl.DisplayNames([language, "en"], { type: "region" });
      const guides = profiles.flatMap((country) =>
        EUROPE_BLOG_TOPICS.map((topic) => ({
          slug: `${country.slug}-${topic}`,
          countryCode: country.code,
          countrySlug: country.slug,
          countryName: country.name,
          countryLabel: display.of(country.code) || country.name,
          kind: country.kind ?? "country",
          topic,
          brief: country.topics[topic].copy[language].trim(),
          sources: country.topics[topic].sourceIds.map((id) =>
            country.sources.find((source) => source.id === id),
          ),
          checkedAt: EUROPE_BLOG_CHECKED_AT,
          publishedAt: EUROPE_BLOG_CHECKED_AT,
          coverImage: `/blog-covers/${country.slug}-${topic}.svg`,
        })),
      );
      guides.sort(
        (left, right) =>
          left.countryLabel.localeCompare(right.countryLabel, language) ||
          EUROPE_BLOG_TOPICS.indexOf(left.topic) - EUROPE_BLOG_TOPICS.indexOf(right.topic),
      );
      return [language, guides];
    }),
  );
  return { catalog, locales };
}

const escapeXml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character],
  );
const palette = {
  study: ["#007f87", "#d8eeeb", "Universities & programmes", "01"],
  admission: ["#325cad", "#e1e8f6", "Applications & recognition", "02"],
  funding: ["#88651d", "#f6edcf", "Scholarships & funding", "03"],
  arrival: ["#a54737", "#f5e4dc", "Arrival & student life", "04"],
};

/** Abstract editorial artwork; its decorative atlas does not mark real campuses. */
export function buildEuropeCover(country, topic) {
  const [accent, tint, topicName, number] = palette[topic];
  const title = country.name;
  const titleSize = title.length > 24 ? 54 : title.length > 17 ? 68 : 86;
  const seed = [...`${country.slug}-${topic}`].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  const orbit = 108 + (seed % 70);
  const shift = seed % 68;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(title)} · ${escapeXml(topicName)}</title><desc id="description">CliniGA Education editorial guide cover with an abstract academic atlas.</desc>
<defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#12243a" stroke-opacity=".06"/></pattern><clipPath id="atlas"><circle cx="1004" cy="240" r="238"/></clipPath></defs>
<path fill="#f8faf9" d="M0 0h1200v630H0z"/><path fill="url(#grid)" d="M0 0h1200v630H0z"/>
<circle cx="1004" cy="240" r="238" fill="${tint}"/>
<g clip-path="url(#atlas)" fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="1.5"><circle cx="1004" cy="240" r="238"/><ellipse cx="1004" cy="240" rx="${orbit}" ry="238"/><ellipse cx="1004" cy="240" rx="62" ry="238"/><ellipse cx="1004" cy="240" rx="238" ry="76"/><ellipse cx="1004" cy="240" rx="238" ry="158"/><path d="M766 240h476M1004 2v476"/><path d="M755 ${102 + shift}C871 33 1141 416 1241 ${346 - shift}" stroke-dasharray="6 8"/></g>
<path d="M70 70h34v6H70zM70 70v34h6V70z" fill="${accent}"/>
<text x="120" y="95" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="700" letter-spacing=".4" fill="#12243a">CliniGA Education</text>
<rect x="70" y="174" rx="17" width="76" height="36" fill="${tint}"/><text x="108" y="199" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="700" fill="${accent}">${escapeXml(country.code)}</text>
<text x="70" y="${title.length > 24 ? 318 : 330}" font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="-2.5" fill="#12243a">${escapeXml(title)}</text>
<text x="74" y="397" font-family="Arial,Helvetica,sans-serif" font-size="30" fill="${accent}">${escapeXml(topicName)}</text>
<path d="M70 480h1060" stroke="#12243a" stroke-opacity=".17"/>
<text x="72" y="536" font-family="Arial,Helvetica,sans-serif" font-size="18" fill="#566778">EUROPE STUDY GUIDES</text>
<text x="72" y="565" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="#566778">Programmes · Admissions · Funding · Community</text>
<text x="1128" y="556" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="700" fill="${accent}">${number}</text>
</svg>\n`;
}

export async function buildEuropeBlog() {
  // Country labels can be generated independently while editorial batches are authored.
  await writeCountryNames();
  const batches = [];
  for (const letter of ["a", "b", "c", "d"]) {
    const module = await import(pathToFileURL(resolve(sourceDirectory, `batch-${letter}.ts`)).href);
    const batch = module[`EUROPE_BATCH_${letter.toUpperCase()}`];
    assert.ok(
      Array.isArray(batch),
      `batch-${letter}.ts must export EUROPE_BATCH_${letter.toUpperCase()}`,
    );
    batches.push(...batch);
  }
  const profiles = validateEuropeProfiles(batches);
  const compiled = compileEuropeBlog(profiles);
  const photographs = JSON.parse(
    await readFile(resolve(projectRoot, "src/data/journal/photography.json"), "utf8"),
  );
  const reviewedFacts = JSON.parse(
    await readFile(resolve(projectRoot, "src/data/journal/verified-facts.json"), "utf8"),
  );
  const updates = {
    "DE:admission": ["de-finance"],
    "DE:funding": ["de-finance"],
    "IT:admission": ["it-finance", "it-cent"],
    "IT:funding": ["it-dsu", "it-edisu"],
    "IT:arrival": ["it-health"],
    "FR:funding": ["fr-housing-aid"],
    "FR:arrival": ["fr-residence"],
    "ES:admission": ["es-residence", "es-finance"],
    "CZ:arrival": ["cz-procedure"],
    "CZ:funding": ["cz-scholarship"],
    "LT:admission": ["lt-residence"],
    "NL:funding": ["nl-scholarship"],
    "BE:funding": ["be-scholarship"],
  };
  for (const [language, guides] of Object.entries(compiled.locales)) {
    for (const guide of guides) {
      const photo = photographs[guide.slug];
      assert.ok(
        photo?.url?.startsWith("https://"),
        "Missing country-guide photograph: " + guide.slug,
      );
      guide.coverImage = photo.url;
      guide.photoCredit = photo;
      const ids = updates[guide.countryCode + ":" + guide.topic] || [];
      for (const id of ids) {
        const fact = reviewedFacts.facts.find((item) => item.id === id);
        assert.ok(
          fact?.text?.[language],
          "Missing native fact translation: " + id + "/" + language,
        );
        guide.brief += "\n\n" + fact.text[language];
        for (const url of fact.sources)
          if (!guide.sources.some((source) => source.url === url))
            guide.sources.push({
              id,
              label: new URL(url).hostname,
              url,
              checkedAt: reviewedFacts.checkedAt,
            });
        guide.checkedAt = reviewedFacts.checkedAt;
      }
    }
  }
  for (const destination of compiled.catalog) {
    destination.lastmodByTopic = Object.fromEntries(
      compiled.locales.en
        .filter((guide) => guide.countrySlug === destination.slug)
        .map((guide) => [guide.topic, guide.checkedAt]),
    );
  }
  await Promise.all([
    mkdir(outputDirectory, { recursive: true }),
    mkdir(coverDirectory, { recursive: true }),
  ]);
  await writeGenerated(
    resolve(outputDirectory, "catalog.json"),
    `${JSON.stringify(compiled.catalog, null, 2)}\n`,
  );
  for (const [language, guides] of Object.entries(compiled.locales)) {
    await writeGenerated(
      resolve(outputDirectory, `${language}.json`),
      `${JSON.stringify(guides, null, 2)}\n`,
    );
  }
  const expectedCovers = new Set();
  for (const country of profiles) {
    for (const topic of EUROPE_BLOG_TOPICS) {
      const filename = `${country.slug}-${topic}.svg`;
      expectedCovers.add(filename);
      await writeGenerated(resolve(coverDirectory, filename), buildEuropeCover(country, topic));
    }
  }
  console.log(
    `Europe blog: ${profiles.length} destinations, ${expectedCovers.size} guides, ${EUROPE_BLOG_LANGUAGES.length} complete locales, ${expectedCovers.size} editorial covers.`,
  );
  return compiled;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildEuropeBlog();
