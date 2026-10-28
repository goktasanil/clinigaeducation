import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { EUROPE_BLOG_COPY } from "../../europe-blog/copy.ts";

const LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "hi", "ar", "ru", "zh"];
const HEADINGS = {
  tr: [
    "Yerel kuralları kendi dosyana uygula",
    "Bu sorun için işlem sırası",
    "Birlikte kontrol edilecek diğer işlem",
    "Sık sorulan karar noktası",
  ],
  en: [
    "Apply the local route to your case",
    "Steps for this specific problem",
    "The linked procedure to check",
    "A common decision point",
  ],
  de: [
    "Den örtlichen Ablauf auf den eigenen Fall anwenden",
    "Schritte für dieses konkrete Problem",
    "Das verbundene Verfahren prüfen",
    "Eine häufige Entscheidungsfrage",
  ],
  fr: [
    "Appliquer le parcours local à votre dossier",
    "Les étapes pour ce problème précis",
    "La procédure liée à vérifier",
    "Une question fréquente pour décider",
  ],
  es: [
    "Aplica el procedimiento local a tu caso",
    "Pasos para este problema concreto",
    "El trámite relacionado que debes comprobar",
    "Una decisión frecuente",
  ],
  it: [
    "Applicare il percorso locale al proprio caso",
    "Passaggi per questo problema specifico",
    "La procedura collegata da verificare",
    "Una domanda frequente per decidere",
  ],
  hi: [
    "स्थानीय प्रक्रिया को अपने मामले पर लागू करें",
    "इस विशेष समस्या के लिए कदम",
    "संबंधित प्रक्रिया भी जाँचें",
    "निर्णय से जुड़ा सामान्य प्रश्न",
  ],
  ar: [
    "تطبيق المسار المحلي على ملفك",
    "خطوات هذه المشكلة تحديداً",
    "الإجراء المرتبط الذي يجب التحقق منه",
    "سؤال شائع لاتخاذ القرار",
  ],
  ru: [
    "Применить местную процедуру к своему случаю",
    "Шаги для этой конкретной проблемы",
    "Какую связанную процедуру проверить",
    "Частый вопрос перед решением",
  ],
  zh: [
    "把当地办理路径用于自己的情况",
    "针对这一具体问题的处理步骤",
    "还需核对的关联手续",
    "作决定前常见的问题",
  ],
};
const escape = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const clean = (text) => String(text).replace(/\s+/g, " ").trim();
const list = (items, tag = "ul") =>
  `<${tag}>${items.map((text) => `<li>${escape(clean(text))}</li>`).join("")}</${tag}>`;
const TOPICS = {
  admission: "admission",
  immigration: "arrival",
  funding: "funding",
  housing: "arrival",
  insurance: "arrival",
  work: "arrival",
};
const TITLE_PREFIXES = {
  tr: /^Uluslararası öğrenciler için\s*:\s*/iu,
  en: /^International student guide\s*:\s*/iu,
  de: /^Für internationale Studierende\s*:\s*/iu,
  fr: /^Étudiants internationaux\s*:\s*/iu,
  es: /^Guía para estudiantes internacionales\s*:\s*/iu,
  it: /^Guida per studenti internazionali\s*:\s*/iu,
  hi: /^अंतरराष्ट्रीय विद्यार्थियों के लिए\s*:\s*/u,
  ar: /^دليل الطالب الدولي\s*:\s*/u,
  ru: /^Руководство иностранному студенту\s*:\s*/iu,
  zh: /^国际学生指南[：:]\s*/u,
};

/** Build full native articles from reviewed issue modules and substantive local workflows.
 * Compact authoring inputs stay in git; fully composed reader bodies are generated.
 * Partial mode is for private content QA only and is never used by publication.
 */
export async function composeExpansionArticles(root, { allowPartial = false } = {}) {
  const directory = resolve(root, "src/data/journal/expansion");
  const read = async (name) => JSON.parse(await readFile(resolve(directory, name), "utf8"));
  const allocations = await read("allocation.json");
  const actions = await read("actions.json");
  const release = await read("release.json");
  const issueFiles = (await readdir(directory))
    .filter((name) => /^issues(?:-[a-z0-9-]+)?\.json$/.test(name))
    .sort();
  const issues = new Map();
  for (const file of issueFiles)
    for (const issue of await read(file)) {
      const previous = issues.get(issue.key);
      const complete = LANGUAGES.every((language) => issue.locales?.[language]?.intro?.trim());
      if (
        previous &&
        complete &&
        LANGUAGES.every((language) => previous.locales?.[language]?.intro?.trim())
      )
        throw new Error("Duplicate authored issue module: " + issue.key);
      if (!previous || complete) issues.set(issue.key, issue);
    }
  const countries = new Map();
  for (const file of (await readdir(resolve(directory, "countries")))
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    const records = JSON.parse(await readFile(resolve(directory, "countries", file), "utf8"));
    for (const profile of records) {
      assert.ok(
        !countries.has(profile.code),
        "Duplicate country authoring profile: " + profile.code,
      );
      countries.set(profile.code, profile);
    }
  }
  assert.equal(
    new Set(allocations.map((row) => row.topicKey)).size,
    allocations.length,
    "Unique expansion allocation required",
  );
  if (!allowPartial)
    assert.equal(
      allocations.length,
      release.expectedExpansionTopics,
      "Allocation must fulfil the unique-topic release target",
    );
  const records = [];
  for (const allocation of allocations) {
    const issue = issues.get(allocation.issueKey);
    const profile = countries.get(allocation.countryCode);
    const authored =
      issue && LANGUAGES.every((language) => issue.locales?.[language]?.intro?.trim());
    if (allowPartial && (!profile || !authored)) continue;
    assert.ok(profile, "Missing researched country: " + allocation.countryCode);
    assert.ok(authored, "Missing complete native issue module: " + allocation.issueKey);
    assert.equal(
      issue.domain,
      allocation.domain,
      "Issue/domain allocation changed: " + allocation.topicKey,
    );
    assert.ok(
      Array.isArray(issue.actions) && new Set(issue.actions).size === 6,
      "Each issue requires six distinct focused actions: " + issue.key,
    );
    const primary = profile.domains[allocation.domain];
    const secondary = profile.domains[allocation.secondaryDomain];
    assert.ok(primary && secondary, "Missing local procedure domain: " + allocation.topicKey);
    const sources = new Map();
    for (const id of new Set([...primary.sourceIds, ...secondary.sourceIds])) {
      const source = profile.sources.find((item) => item.id === id);
      assert.ok(source, "Unresolved official source " + profile.code + "/" + id);
      sources.set(source.url, {
        label: source.label,
        url: source.url,
        checkedAt: source.checkedAt || profile.checkedAt,
      });
    }
    if (allowPartial && sources.size < 2) continue;
    assert.ok(
      sources.size >= 2,
      "Each problem needs distinct relevant official references: " + allocation.topicKey,
    );
    const locales = {};
    const localWorkflow = {};
    for (const language of LANGUAGES) {
      const native = issue.locales[language];
      const country =
        new Intl.DisplayNames([language], { type: "region" }).of(profile.code) || profile.name;
      const local = primary.locales[language];
      const linked = secondary.locales[language];
      assert.ok(
        local?.context?.trim() && linked?.context?.trim(),
        "Missing native local context: " + allocation.topicKey + "/" + language,
      );
      assert.ok(
        local.steps?.length === 3 && local.steps.every((text) => text?.trim()),
        "Three local action steps required: " + allocation.topicKey + "/" + language,
      );
      const steps = issue.actions.map((key) => {
        const value = actions[key]?.[language];
        assert.ok(value?.trim(), "Missing native action " + key + "/" + language);
        return value;
      });
      const [route, plan, related, faq] = HEADINGS[language];
      const workflow = clean(native.question + " " + local.context);
      localWorkflow[language] = workflow;
      const html = [
        `<p>${escape(clean(native.intro))}</p>`,
        `<h2>${escape(route)}</h2><p>${escape(workflow)}</p>`,
        list(local.steps),
        `<h2>${escape(plan)}</h2>`,
        list(steps, "ol"),
        `<h2>${escape(related)}</h2><p>${escape(clean(linked.context))}</p>`,
        `<h2>${escape(faq)}</h2><h3>${escape(clean(native.faqQuestion))}</h3><p>${escape(clean(native.faqAnswer))}</p>`,
        `<p>${escape(EUROPE_BLOG_COPY[language].sourcesNote)}</p>`,
      ].join("\n");
      const title = `${country}${language === "zh" ? "：" : ": "}${clean(native.title).replace(TITLE_PREFIXES[language], "")}`;
      const excerpt = Array.from(`${country}: ${clean(native.intro)}`)
        .slice(0, 190)
        .join("");
      locales[language] = { title, excerpt, html };
    }
    records.push({
      topicKey: allocation.topicKey,
      slug: allocation.slug,
      countryCodes: [profile.code],
      topic: ["credit-recognition-return", "learning-agreement-changes"].includes(
        allocation.issueKey,
      )
        ? "study"
        : [
              "sponsor-relationship-evidence",
              "bank-statement-timing",
              "blocked-account-arrival-access",
            ].includes(allocation.issueKey)
          ? "funding"
          : TOPICS[allocation.domain],
      issueKey: issue.key,
      evidence: allocation.evidence,
      checkedAt: profile.checkedAt,
      photoKey: allocation.topicKey,
      sources: [...sources.values()],
      localWorkflow,
      locales,
    });
  }
  if (!allowPartial)
    assert.equal(
      records.length,
      release.expectedExpansionTopics,
      "All country/problem articles require complete native content",
    );
  return records;
}
