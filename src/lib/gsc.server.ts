import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE_ORIGIN = "https://www.clinigaeducation.com";
const MAX_URLS = 25;

type SiteEntry = {
  siteUrl: string;
  permissionLevel?: string;
};

type SitesResponse = {
  siteEntry?: SiteEntry[];
};

type InspectionIndexStatus = {
  verdict?: string;
  coverageState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  pageFetchState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
  userCanonical?: string;
};

type InspectionResponse = {
  inspectionResult?: {
    indexStatusResult?: InspectionIndexStatus;
  };
};

type SearchAnalyticsResponse = {
  rows?: Array<{
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
};

function gatewayHeaders() {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
  if (!lovableApiKey || !connectionApiKey) {
    throw new Error("Search Console bağlantısı yapılandırılmamış");
  }
  return {
    Authorization: `Bearer ${lovableApiKey}`,
    "X-Connection-Api-Key": connectionApiKey,
    "Content-Type": "application/json",
  };
}

async function gatewayFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const response = await fetch(`${GATEWAY}${path}`, {
    method: init?.method ?? "GET",
    headers: gatewayHeaders(),
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Search Console isteği başarısız [${response.status}]: ${text}`);
  }
  return response.json() as Promise<T>;
}

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

export async function resolveSiteUrl(): Promise<string> {
  const data = await gatewayFetch<SitesResponse>("/webmasters/v3/sites");
  const entries = data.siteEntry ?? [];
  const target = new URL(`${SITE_ORIGIN}/`);
  const matches = entries.filter(
    (entry) =>
      entry.permissionLevel !== "siteUnverifiedUser" && coversTarget(entry.siteUrl, target),
  );
  if (matches.length === 0) {
    throw new Error("Bu site için doğrulanmış bir Search Console mülkü bulunamadı");
  }
  return matches[0]!.siteUrl;
}

export async function fetchSitemapUrls(): Promise<string[]> {
  const response = await fetch(`${SITE_ORIGIN}/sitemap.xml`, {
    headers: { Accept: "application/xml" },
  });
  if (!response.ok) return [`${SITE_ORIGIN}/`];
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!.trim());
  const unique = [...new Set(locs)];
  // Prioritise the homepage and the hand-written guides, then blog posts.
  const priority = unique.filter((url) => !url.includes("/blog/"));
  const posts = unique.filter((url) => url.includes("/blog/"));
  return [...priority, ...posts].slice(0, MAX_URLS);
}

export type UrlSnapshotRow = {
  url: string;
  verdict: string | null;
  coverage_state: string | null;
  robots_txt_state: string | null;
  indexing_state: string | null;
  page_fetch_state: string | null;
  last_crawl_time: string | null;
  google_canonical: string | null;
  user_canonical: string | null;
  error_message: string | null;
};

export type UrlSnapshotInsert = UrlSnapshotRow & { raw: unknown };

export async function inspectUrl(
  siteUrl: string,
  inspectionUrl: string,
): Promise<UrlSnapshotInsert> {
  try {
    const data = await gatewayFetch<InspectionResponse>("/v1/urlInspection/index:inspect", {
      method: "POST",
      body: { inspectionUrl, siteUrl },
    });
    const result = data.inspectionResult?.indexStatusResult ?? {};
    return {
      url: inspectionUrl,
      verdict: result.verdict ?? null,
      coverage_state: result.coverageState ?? null,
      robots_txt_state: result.robotsTxtState ?? null,
      indexing_state: result.indexingState ?? null,
      page_fetch_state: result.pageFetchState ?? null,
      last_crawl_time: result.lastCrawlTime ?? null,
      google_canonical: result.googleCanonical ?? null,
      user_canonical: result.userCanonical ?? null,
      error_message: null,
      raw: data.inspectionResult ?? null,
    };
  } catch (error) {
    return {
      url: inspectionUrl,
      verdict: null,
      coverage_state: null,
      robots_txt_state: null,
      indexing_state: null,
      page_fetch_state: null,
      last_crawl_time: null,
      google_canonical: null,
      user_canonical: null,
      error_message: error instanceof Error ? error.message : "bilinmeyen hata",
      raw: null,
    };
  }
}

function isoDate(offsetDays: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function fetchPerformanceTotals(siteUrl: string) {
  const startDate = isoDate(31);
  const endDate = isoDate(3);
  const data = await gatewayFetch<SearchAnalyticsResponse>(
    `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", body: { startDate, endDate, dimensions: [] } },
  );
  const row = data.rows?.[0];
  return {
    clicks: Math.round(row?.clicks ?? 0),
    impressions: Math.round(row?.impressions ?? 0),
    ctr: Number(row?.ctr ?? 0),
    average_position: Number(row?.position ?? 0),
    range_start: startDate,
    range_end: endDate,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]!);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function captureSnapshot() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const siteUrl = await resolveSiteUrl();

  const [urls, perf] = await Promise.all([
    fetchSitemapUrls(),
    fetchPerformanceTotals(siteUrl).catch((error) => {
      console.error("[gsc] performance fetch failed", error);
      return null;
    }),
  ]);

  const rows = await mapWithConcurrency(urls, 4, (url) => inspectUrl(siteUrl, url));

  const { error: urlError } = await supabaseAdmin.from("gsc_url_snapshots").insert(rows as never);
  if (urlError) {
    console.error("[gsc] url snapshot insert failed", urlError);
    throw new Error("Anlık görüntü kaydedilemedi");
  }

  if (perf) {
    const { error: perfError } = await supabaseAdmin
      .from("gsc_perf_snapshots")
      .insert(perf as never);
    if (perfError) console.error("[gsc] perf snapshot insert failed", perfError);
  }

  return { siteUrl, urlCount: rows.length, capturedAt: new Date().toISOString() };
}

export async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) console.error("[gsc] admin check failed", error);
  if (!data) throw new Error("Forbidden");
}

type SnapshotView = UrlSnapshotRow & { checked_at: string };

type PerfSnapshotRow = {
  captured_at: string;
  clicks: number | string | null;
  impressions: number | string | null;
  ctr: number | string | null;
  average_position: number | string | null;
};

export type DashboardUrl = {
  url: string;
  current: SnapshotView;
  previous: SnapshotView | null;
  changed: boolean;
};

function toView(row: SnapshotView): SnapshotView {
  return {
    url: row.url,
    verdict: row.verdict ?? null,
    coverage_state: row.coverage_state ?? null,
    robots_txt_state: row.robots_txt_state ?? null,
    indexing_state: row.indexing_state ?? null,
    page_fetch_state: row.page_fetch_state ?? null,
    last_crawl_time: row.last_crawl_time ?? null,
    google_canonical: row.google_canonical ?? null,
    user_canonical: row.user_canonical ?? null,
    error_message: row.error_message ?? null,
    checked_at: row.checked_at,
  };
}

export async function loadDashboard() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: snapshots, error } = await supabaseAdmin
    .from("gsc_url_snapshots")
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(1500);
  if (error) {
    console.error("[gsc] dashboard read failed", error);
    throw new Error("Veriler okunamadı");
  }

  const snapshotRows = (snapshots ?? []) as unknown as SnapshotView[];
  const byUrl = new Map<string, SnapshotView[]>();
  for (const row of snapshotRows) {
    const list = byUrl.get(row.url) ?? [];
    list.push(row);
    byUrl.set(row.url, list);
  }

  const urls: DashboardUrl[] = [...byUrl.entries()].map(([url, list]) => {
    const current = list[0]!;
    const previous =
      list.find(
        (row) =>
          row.coverage_state !== current.coverage_state ||
          row.verdict !== current.verdict ||
          row.google_canonical !== current.google_canonical,
      ) ?? null;
    return {
      url,
      current: toView(current),
      previous: previous ? toView(previous) : null,
      changed: Boolean(previous),
    };
  });

  urls.sort((a, b) => {
    if (a.changed !== b.changed) return a.changed ? -1 : 1;
    return a.url.localeCompare(b.url);
  });

  const { data: perfRows } = await supabaseAdmin
    .from("gsc_perf_snapshots")
    .select("captured_at, clicks, impressions, ctr, average_position")
    .order("captured_at", { ascending: true })
    .limit(120);

  const lastCheckedAt = snapshotRows[0]?.checked_at ?? null;
  const perf = ((perfRows ?? []) as unknown as PerfSnapshotRow[]).map((row) => ({
    captured_at: row.captured_at,
    clicks: Number(row.clicks),
    impressions: Number(row.impressions),
    ctr: Number(row.ctr),
    average_position: Number(row.average_position),
  }));

  return { urls, perf, lastCheckedAt };
}
