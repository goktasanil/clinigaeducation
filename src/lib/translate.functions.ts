import { createServerFn } from "@tanstack/react-start";

import { prepareTranslatedHtml } from "./sanitize-audit";


const LANG_NAMES: Record<string, string> = {
  tr: "Turkish",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  zh: "Simplified Chinese",
};

// Module-level in-memory cache. Survives across requests while the worker is warm.
const summaryCache = new Map<string, { title: string; excerpt: string }>();
const htmlCache = new Map<string, string>();
const categoryCache = new Map<string, string>();

const sumKey = (id: string, lang: string) => `${id}::${lang}`;

type CallAIOpts = {
  system: string;
  user: string;
  json?: boolean;
};

async function callGateway({ system, user, json }: CallAIOpts): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway error [${res.status}]: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export type TranslatedSummary = {
  id: string;
  title: string;
  excerpt: string;
};

export const translatePostSummaries = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      lang: string;
      items: { id: string; title: string; excerpt: string }[];
    }) => ({
      lang: input.lang,
      items: input.items.slice(0, 200),
    }),
  )
  .handler(async ({ data }): Promise<TranslatedSummary[]> => {
    const { lang, items } = data;

    // No-op for source language.
    if (lang === "tr" || !LANG_NAMES[lang]) {
      return items.map((i) => ({ id: i.id, title: i.title, excerpt: i.excerpt }));
    }

    const result: TranslatedSummary[] = [];
    const todo: typeof items = [];

    for (const item of items) {
      const cached = summaryCache.get(sumKey(item.id, lang));
      if (cached) {
        result.push({ id: item.id, ...cached });
      } else {
        todo.push(item);
      }
    }

    if (todo.length === 0) return result;

    // Batch in chunks of ~15 to keep the prompt small.
    const CHUNK = 15;
    for (let i = 0; i < todo.length; i += CHUNK) {
      const chunk = todo.slice(i, i + CHUNK);
      try {
        const payload = chunk.map((c) => ({
          id: c.id,
          title: c.title,
          excerpt: c.excerpt,
        }));
        const targetLabel = LANG_NAMES[lang];
        const content = await callGateway({
          system: `You are a professional academic translator. Translate JSON blog entries from Turkish to ${targetLabel}. Preserve proper nouns, university names, and technical terms. Return ONLY valid JSON in the exact same shape: { "items": [{ "id": "...", "title": "...", "excerpt": "..." }] }.`,
          user: JSON.stringify({ items: payload }),
          json: true,
        });
        const parsed = JSON.parse(content) as { items?: TranslatedSummary[] };
        const translated = parsed.items ?? [];
        const byId = new Map(translated.map((t) => [t.id, t]));
        for (const c of chunk) {
          const t = byId.get(c.id);
          const out = t
            ? { title: t.title || c.title, excerpt: t.excerpt || c.excerpt }
            : { title: c.title, excerpt: c.excerpt };
          summaryCache.set(sumKey(c.id, lang), out);
          result.push({ id: c.id, ...out });
        }
      } catch {
        // Fallback: original text, don't cache the failure.
        for (const c of chunk) {
          result.push({ id: c.id, title: c.title, excerpt: c.excerpt });
        }
      }
    }

    return result;
  });

export const translatePostHtml = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string;
      lang: string;
      title: string;
      excerpt: string;
      html: string;
      /** Correlation id from the blog page, echoed into audit logs. */
      auditId?: string;
    }) => input,
  )
  .handler(
    async ({
      data,
    }): Promise<{ title: string; excerpt: string; html: string; auditId?: string }> => {
      const { id, lang, title, excerpt, html, auditId } = data;

      if (lang === "tr" || !LANG_NAMES[lang]) {
        return { title, excerpt, html, auditId };
      }


      const cached = htmlCache.get(sumKey(id, lang));
      const cachedSum = summaryCache.get(sumKey(id, lang));
      if (cached && cachedSum) {
        return {
          title: cachedSum.title,
          excerpt: cachedSum.excerpt,
          html: cached,
          auditId,
        };
      }


      // Translate summary (will use cache if present).
      let trTitle = title;
      let trExcerpt = excerpt;
      if (cachedSum) {
        trTitle = cachedSum.title;
        trExcerpt = cachedSum.excerpt;
      } else {
        try {
          const sumContent = await callGateway({
            system: `Translate the JSON from Turkish to ${LANG_NAMES[lang]}. Return ONLY valid JSON: { "title": "...", "excerpt": "..." }.`,
            user: JSON.stringify({ title, excerpt }),
            json: true,
          });
          const parsed = JSON.parse(sumContent) as { title?: string; excerpt?: string };
          trTitle = parsed.title || title;
          trExcerpt = parsed.excerpt || excerpt;
          summaryCache.set(sumKey(id, lang), { title: trTitle, excerpt: trExcerpt });
        } catch {
          /* keep originals */
        }
      }

      // Persist audit events to the database so the admin panel can list them.
      const { installSanitizeAuditStore } = await import("./sanitize-audit-store.server");
      installSanitizeAuditStore();
      const { installSanitizeAlertStore } = await import("./sanitize-alert-store.server");
      installSanitizeAlertStore();

      let trHtml = html;
      try {

        const htmlContent = await callGateway({
          system: `You are a professional academic translator. Translate the user's HTML from Turkish to ${LANG_NAMES[lang]}. CRITICAL: Preserve ALL HTML tags, attributes (href, src, class, id, alt, title), and the exact structure. Translate ONLY the human-readable text inside tags and translate alt/title attribute values. Do not add or remove tags. Do not wrap output in markdown code fences. Return raw HTML only.`,
          user: html,
        });
        // Strip accidental code fences, then sanitize the model output
        // against an allow-list before it is ever rendered as HTML.
        trHtml = prepareTranslatedHtml(htmlContent, html, {
          source: "ai-translation",
          postId: id,
          lang,
          auditId,
        });
        htmlCache.set(sumKey(id, lang), trHtml);


      } catch {
        /* keep original html */
      }

      return { title: trTitle, excerpt: trExcerpt, html: trHtml, auditId };

    },
  );

export type TranslatedCategory = { id: string; label: string };

export const translateCategories = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { lang: string; items: { id: string; label: string }[] }) => ({
      lang: input.lang,
      items: input.items.slice(0, 200),
    }),
  )
  .handler(async ({ data }): Promise<TranslatedCategory[]> => {
    const { lang, items } = data;
    if (lang === "tr" || !LANG_NAMES[lang]) {
      return items.map((i) => ({ id: i.id, label: i.label }));
    }

    const result: TranslatedCategory[] = [];
    const todo: typeof items = [];
    for (const item of items) {
      const cached = categoryCache.get(sumKey(item.id, lang));
      if (cached !== undefined) {
        result.push({ id: item.id, label: cached });
      } else {
        todo.push(item);
      }
    }
    if (todo.length === 0) return result;

    try {
      const content = await callGateway({
        system: `You are a professional translator. Translate the JSON blog category labels from Turkish to ${LANG_NAMES[lang]}. Keep labels short (1-3 words). Return ONLY valid JSON: { "items": [{ "id": "...", "label": "..." }] }.`,
        user: JSON.stringify({
          items: todo.map((c) => ({ id: c.id, label: c.label })),
        }),
        json: true,
      });
      const parsed = JSON.parse(content) as { items?: TranslatedCategory[] };
      const byId = new Map((parsed.items ?? []).map((t) => [t.id, t.label]));
      for (const c of todo) {
        const label = byId.get(c.id) || c.label;
        categoryCache.set(sumKey(c.id, lang), label);
        result.push({ id: c.id, label });
      }
    } catch {
      for (const c of todo) {
        result.push({ id: c.id, label: c.label });
      }
    }
    return result;
  });
