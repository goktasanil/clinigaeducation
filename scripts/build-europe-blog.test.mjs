import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  buildEuropeCover,
  buildCountryNames,
  compileEuropeBlog,
  EUROPE_BLOG_LANGUAGES,
  EUROPE_BLOG_TOPICS,
  validateEuropeProfiles,
  extractIsoCountryCodes,
} from "./build-europe-blog.mjs";

const brief = (language, topic) => {
  const scripts = {
    hi: "शिक्षा और छात्रवृत्ति की जानकारी ",
    ar: "معلومات الدراسة والمنح الجامعية ",
    ru: "Информация об обучении и стипендиях ",
    zh: "留学申请与大学奖学金信息",
  };
  return `${language} ${topic}: ${(scripts[language] ?? `${language} independently authored country-specific academic guidance `).repeat(10)}`;
};

const profile = () => ({
  code: "IT",
  slug: "italy",
  name: "Italy",
  sources: [
    {
      id: "university",
      label: "Official university source",
      url: "https://www.unibo.it/en",
      checkedAt: "2026-10-27",
    },
  ],
  topics: Object.fromEntries(
    EUROPE_BLOG_TOPICS.map((topic) => [
      topic,
      {
        sourceIds: ["university"],
        copy: Object.fromEntries(
          EUROPE_BLOG_LANGUAGES.map((language) => [language, brief(language, topic)]),
        ),
      },
    ]),
  ),
});

test("compiler emits the exact language-isolated guide contract and bound source", () => {
  const value = profile();
  validateEuropeProfiles([value], { expectedCountries: 1 });
  const { catalog, locales } = compileEuropeBlog([value]);
  assert.deepEqual(catalog, [{ code: "IT", slug: "italy", name: "Italy", kind: "country" }]);
  assert.deepEqual(Object.keys(locales), EUROPE_BLOG_LANGUAGES);
  for (const language of EUROPE_BLOG_LANGUAGES) {
    assert.equal(locales[language].length, 4);
    assert.equal(locales[language][0].brief, value.topics.study.copy[language].trim());
    assert.deepEqual(locales[language][0].sources, value.sources);
    assert.equal(locales[language][0].coverImage, "/blog-covers/italy-study.svg");
    assert.equal(locales[language][0].checkedAt, "2026-10-27");
    assert.ok(typeof locales[language][0].countryLabel === "string");
  }
  assert.equal(locales.tr[0].countryLabel, "İtalya");
  assert.equal(locales.en[0].countryName, "Italy");
});

test("country labels serialize all 249 ISO territories in every supported language", async () => {
  const source = await readFile(new URL("../src/data/portal.ts", import.meta.url), "utf8");
  const codes = extractIsoCountryCodes(source);
  assert.equal(codes.length, 249);
  assert.ok(codes.includes("HK") && codes.includes("VA") && codes.includes("PS"));
  const names = buildCountryNames(codes);
  assert.deepEqual(Object.keys(names), EUROPE_BLOG_LANGUAGES);
  for (const language of EUROPE_BLOG_LANGUAGES) {
    assert.equal(names[language].length, 249);
    assert.equal(new Set(names[language].map((country) => country.code)).size, 249);
    assert.ok(names[language].every((country) => country.name.length > 0));
  }
  assert.equal(names.tr.find((country) => country.code === "DE").name, "Almanya");
  assert.equal(names.en.find((country) => country.code === "DE").name, "Germany");
});

test("publication fails closed on incomplete or repeated language content", () => {
  const missing = profile();
  delete missing.topics.funding.copy.hi;
  assert.throws(
    () => validateEuropeProfiles([missing], { expectedCountries: 1 }),
    /all ten native locales/,
  );
  const fallback = profile();
  fallback.topics.study.copy.de = fallback.topics.study.copy.en;
  assert.throws(
    () => validateEuropeProfiles([fallback], { expectedCountries: 1 }),
    /duplicated language fallback/,
  );
  const wrongScript = profile();
  wrongScript.topics.admission.copy.hi =
    "This is English content where a complete Hindi editorial guide should be published. ".repeat(
      3,
    );
  assert.throws(
    () => validateEuropeProfiles([wrongScript], { expectedCountries: 1 }),
    /native script is missing/,
  );
});

test("publication rejects orphan citations, credential URLs and duplicate destinations", () => {
  const orphan = profile();
  orphan.topics.arrival.sourceIds = ["missing"];
  assert.throws(() => validateEuropeProfiles([orphan], { expectedCountries: 1 }), /unknown source/);
  const unsafe = profile();
  unsafe.sources[0].url = "https://user:password@example.org/";
  assert.throws(
    () => validateEuropeProfiles([unsafe], { expectedCountries: 1 }),
    /must not contain credentials/,
  );
  assert.throws(
    () => validateEuropeProfiles([profile(), profile()], { expectedCountries: 2 }),
    /Duplicate destination code/,
  );
});

test("editorial covers are distinct, escaped SVG assets with fixed export dimensions", () => {
  const covers = EUROPE_BLOG_TOPICS.map((topic) =>
    buildEuropeCover({ code: "IT", slug: "italy", name: "Italy" }, topic),
  );
  assert.equal(new Set(covers).size, 4);
  for (const cover of covers) {
    assert.match(cover, /width="1200" height="630"/);
    assert.match(cover, /<title id="title">Italy/);
    assert.doesNotMatch(cover, /<script|href=|<image/);
  }
  const escaped = buildEuropeCover(
    { code: "ZZ", slug: "test", name: 'Test <script> & "place"' },
    "study",
  );
  assert.match(escaped, /Test &lt;script&gt; &amp; &quot;place&quot;/);
  assert.doesNotMatch(escaped, /<script>/);
});
