import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const countrySchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase());
const institutionSchema = z
  .string()
  .trim()
  .max(200)
  .transform((value) => value.split("/").pop() || value)
  .refine((value) => /^I\d+$/.test(value), "Invalid OpenAlex institution id");
const cache = new Map<string, { until: number; value: unknown }>();
const TEN_MINUTES = 10 * 60 * 1000;

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

async function openAlex(path: string) {
  const key = "openalex:" + path;
  const cached = cache.get(key);
  if (cached && cached.until > Date.now()) return cached.value;

  const url = new URL("https://api.openalex.org/" + path);
  if (process.env.OPENALEX_API_KEY) {
    url.searchParams.set("api_key", process.env.OPENALEX_API_KEY);
  }
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "CliniGAEducationPortal/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Global catalog temporarily unavailable");
  const value = await response.json();
  cache.set(key, { until: Date.now() + TEN_MINUTES, value });
  return value;
}

export const searchGlobalCities = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        countryCode: countrySchema,
        query: z.string().trim().max(80).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (process.env.GEONAMES_USERNAME && data.query.length >= 2) {
      const params = new URLSearchParams({
        username: process.env.GEONAMES_USERNAME,
        country: data.countryCode,
        name_startsWith: data.query,
        featureClass: "P",
        maxRows: "50",
        type: "json",
        style: "SHORT",
      });
      const response = await fetch("https://secure.geonames.org/searchJSON?" + params.toString(), {
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          geonames?: Array<{ geonameId?: number; name?: string; population?: number }>;
        };
        return {
          cities: (payload.geonames || [])
            .map((item) => ({
              name: item.name || "",
              institutionCount: 0,
              geonameId: item.geonameId || null,
              population: item.population || 0,
            }))
            .filter((item) => item.name),
        };
      }
    }
    const params = new URLSearchParams({
      filter: "country_code:" + data.countryCode.toLowerCase() + ",type:education|facility",
      group_by: "geo.city",
      per_page: "100",
    });
    const payload = (await openAlex("institutions?" + params.toString())) as {
      group_by?: Array<{ key?: string; key_display_name?: string; count?: number }>;
    };
    const cities = (payload.group_by || [])
      .map((item) => ({
        name: item.key_display_name || item.key || "",
        institutionCount: item.count || 0,
      }))
      .filter((item) => item.name)
      .slice(0, 100);
    return { cities };
  });

export const searchGlobalInstitutions = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        countryCode: countrySchema,
        query: z.string().trim().max(100).optional().default(""),
        city: z.string().trim().max(100).optional().default(""),
        page: z.number().int().min(1).max(100).optional().default(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      filter: "country_code:" + data.countryCode.toLowerCase() + ",type:education|facility",
      per_page: "30",
      page: String(data.page),
      sort: "works_count:desc",
    });
    const search = [data.query, data.city].filter(Boolean).join(" ");
    if (search) params.set("search", search);
    const payload = (await openAlex("institutions?" + params.toString())) as {
      meta?: { count?: number; page?: number; per_page?: number };
      results?: Array<{
        id?: string;
        display_name?: string;
        type?: string;
        homepage_url?: string;
        image_thumbnail_url?: string;
        works_count?: number;
        geo?: { city?: string; region?: string; country?: string };
      }>;
    };
    const institutions = (payload.results || []).map((item) => ({
      id: item.id || "",
      name: item.display_name || "Unnamed institution",
      type: item.type || "education",
      city: item.geo?.city || "",
      region: item.geo?.region || "",
      country: item.geo?.country || "",
      homepageUrl: safeUrl(item.homepage_url),
      logoUrl: safeUrl(item.image_thumbnail_url),
      worksCount: item.works_count || 0,
    }));
    return { institutions, total: payload.meta?.count || institutions.length, page: data.page };
  });

export const getInstitutionAcademicFields = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        institutionId: institutionSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      filter: `institutions.id:${data.institutionId}`,
      group_by: "primary_topic.subfield.id",
      per_page: "100",
    });
    const payload = (await openAlex("works?" + params.toString())) as {
      group_by?: Array<{
        key?: string;
        key_display_name?: string;
        count?: number;
      }>;
    };
    const fields = (payload.group_by || [])
      .map((item) => ({
        id: item.key || "",
        name: item.key_display_name || "",
        worksCount: item.count || 0,
      }))
      .filter((item) => item.id && item.name)
      .sort((a, b) => b.worksCount - a.worksCount || a.name.localeCompare(b.name))
      .slice(0, 100);
    return { fields };
  });
