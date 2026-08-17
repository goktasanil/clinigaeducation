import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";



type Lead = {
  intent: string | null;
  created_at: string;
  source?: string | null;
};

const PERIODS = [
  { value: "7", label: "Son 7 gün" },
  { value: "30", label: "Son 30 gün" },
  { value: "90", label: "Son 90 gün" },
  { value: "365", label: "Son 1 yıl" },
  { value: "all", label: "Tüm zamanlar" },
] as const;

const COLORS = [
  "#0E7C86",
  "#C9A227",
  "#0B1F3A",
  "#4C9AFF",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#6366F1",
];

export type IntentDrilldownContext = {
  period: string; // "7" | "30" | "90" | "all"
  scope: string; // "all" | "quiz"
};

export function IntentAnalytics({
  leads,
  onIntentClick,
}: {
  leads: Lead[];
  onIntentClick?: (intent: string, ctx?: IntentDrilldownContext) => void;
}) {

  const [period, setPeriod] = useState<string>("30");
  const [scope, setScope] = useState<string>("all"); // all | quiz
  const [bucketMode, setBucketMode] = useState<string>("auto"); // auto | 1 | 7 | 30



  // ---- Spike alert settings (persisted per browser) ----
  const SETTINGS_KEY = "adminLeads.alertSettings.v1";
  const [spikePct, setSpikePct] = useState<number>(50);
  const [minLead, setMinLead] = useState<number>(3);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.spikePct === "number") setSpikePct(p.spikePct);
        if (typeof p.minLead === "number") setMinLead(p.minLead);
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spikePct, minLead }));
    } catch { /* ignore */ }
  }, [spikePct, minLead]);

  const data = useMemo(() => {
    const now = Date.now();
    const cutoff =

      period === "all" ? 0 : now - Number(period) * 24 * 60 * 60 * 1000;

    const filtered = leads.filter((l) => {
      if (new Date(l.created_at).getTime() < cutoff) return false;
      if (scope === "quiz" && l.source !== "quiz") return false;
      return true;
    });

    const counts = new Map<string, number>();
    for (const l of filtered) {
      const key = l.intent?.trim() || "Belirtilmemiş";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads, period, scope]);

  const total = data.reduce((s, d) => s + d.value, 0);

  // ---- Trend (line chart) ----
  const trend = useMemo(() => {
    const now = new Date();
    const days =
      period === "all"
        ? Math.max(
            30,
            Math.ceil(
              (now.getTime() -
                Math.min(
                  ...leads.map((l) => new Date(l.created_at).getTime()),
                  now.getTime(),
                )) /
                (24 * 60 * 60 * 1000),
            ),
          )
        : Number(period);
    const autoBucket = days <= 14 ? 1 : days <= 60 ? 1 : days <= 120 ? 7 : 30;
    const bucketDays = bucketMode === "auto" ? autoBucket : Number(bucketMode);

    const buckets = Math.ceil(days / bucketDays);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (buckets - 1) * bucketDays);

    const topIntents = data.slice(0, 6).map((d) => d.name);

    const rows: Array<Record<string, number | string>> = [];
    for (let i = 0; i < buckets; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i * bucketDays);
      const label =
        bucketDays === 1
          ? `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`
          : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      const row: Record<string, number | string> = { date: label };
      for (const name of topIntents) row[name] = 0;
      rows.push(row);
    }

    for (const l of leads) {
      if (scope === "quiz" && l.source !== "quiz") continue;
      const t = new Date(l.created_at).getTime();
      if (t < start.getTime()) continue;
      const idx = Math.floor(
        (t - start.getTime()) / (bucketDays * 24 * 60 * 60 * 1000),
      );
      if (idx < 0 || idx >= buckets) continue;
      const key = l.intent?.trim() || "Belirtilmemiş";
      if (!topIntents.includes(key)) continue;
      rows[idx][key] = (rows[idx][key] as number) + 1;
    }
    return { rows, series: topIntents, bucketDays };
  }, [leads, period, scope, data, bucketMode]);


  // ---- Previous period comparison ----
  const comparison = useMemo(() => {
    if (period === "all") return null;
    const now = Date.now();
    const windowMs = Number(period) * 24 * 60 * 60 * 1000;
    const currentStart = now - windowMs;
    const previousStart = currentStart - windowMs;

    const counts = (from: number, to: number) => {
      const m = new Map<string, number>();
      for (const l of leads) {
        if (scope === "quiz" && l.source !== "quiz") continue;
        const t = new Date(l.created_at).getTime();
        if (t < from || t >= to) continue;
        const key = l.intent?.trim() || "Belirtilmemiş";
        m.set(key, (m.get(key) ?? 0) + 1);
      }
      return m;
    };

    const cur = counts(currentStart, now);
    const prev = counts(previousStart, currentStart);
    const curTotal = Array.from(cur.values()).reduce((a, b) => a + b, 0);
    const prevTotal = Array.from(prev.values()).reduce((a, b) => a + b, 0);

    const pctChange = (c: number, p: number): number | null => {
      if (p === 0) return c === 0 ? 0 : null; // null = new
      return ((c - p) / p) * 100;
    };

    const perIntent = data.slice(0, 6).map((d) => {
      const c = cur.get(d.name) ?? 0;
      const p = prev.get(d.name) ?? 0;
      return { name: d.name, current: c, previous: p, change: pctChange(c, p) };
    });

    return {
      total: { current: curTotal, previous: prevTotal, change: pctChange(curTotal, prevTotal) },
      perIntent,
      periodLabel: PERIODS.find((p) => p.value === period)?.label ?? "",
    };
  }, [leads, period, scope, data]);

  // Auto-log qualifying spikes to alert_history (dedup per user/intent/period/scope/day)
  useEffect(() => {
    if (!comparison) return;
    const spikes = comparison.perIntent.filter(
      (p) =>
        p.current >= minLead &&
        (p.change === null || p.change >= spikePct),
    );
    if (spikes.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid || cancelled) return;
      const today = new Date().toISOString().slice(0, 10);
      const rows = spikes.map((s) => ({
        user_id: uid,
        intent: s.name,
        period,
        scope,
        current_count: s.current,
        previous_count: s.previous,
        change_pct: s.change,
        threshold_pct: spikePct,
        min_lead: minLead,
        alert_date: today,
      }));
      await supabase
        .from("alert_history")
        .upsert(rows, {
          onConflict: "user_id,intent,period,scope,alert_date",
          ignoreDuplicates: true,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [comparison, minLead, spikePct, period, scope]);



  const formatChange = (change: number | null) => {
    if (change === null) return { text: "Yeni", cls: "bg-teal/15 text-teal border-teal/30" };
    const rounded = Math.round(change);
    if (rounded === 0) return { text: "0%", cls: "bg-muted text-muted-foreground border-border" };
    if (rounded > 0)
      return {
        text: `▲ ${rounded > 999 ? ">999" : rounded}%`,
        cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
      };
    return {
      text: `▼ ${Math.abs(rounded)}%`,
      cls: "bg-red-500/15 text-red-700 border-red-500/30",
    };
  };



  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="font-display text-lg text-navy">
          İhtiyaç (Intent) Dağılımı
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            · {total} lead
          </span>
        </CardTitle>
        <div className="flex gap-2">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kaynaklar</SelectItem>
              <SelectItem value="quiz">Sadece Quiz</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" title="Uyarı ayarları">
                <Settings2 className="h-4 w-4" />
                Uyarı ayarları
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-3">
              <div>
                <p className="text-sm font-semibold text-navy">Artış uyarı eşiği</p>
                <p className="text-xs text-muted-foreground">
                  Bir intent önceki döneme göre ↑%X ve en az N lead ise vurgulanır.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spike-pct" className="text-xs">Eşik yüzdesi (%)</Label>
                <Input
                  id="spike-pct"
                  type="number"
                  min={0}
                  max={1000}
                  step={5}
                  value={spikePct}
                  onChange={(e) => setSpikePct(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min-lead" className="text-xs">Minimum lead sayısı</Label>
                <Input
                  id="min-lead"
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  value={minLead}
                  onChange={(e) => setMinLead(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => { setSpikePct(50); setMinLead(3); }}
              >
                Varsayılana döndür (50% · 3)
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Seçilen dönemde kayıt yok.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={2}
                    onClick={(p: { name?: string }) =>
                      p?.name && onIntentClick?.(p.name, { period, scope })
                    }
                    style={onIntentClick ? { cursor: "pointer" } : undefined}

                  >
                    {data.map((d, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(v: number, n) => [
                      `${v} (${((v / total) * 100).toFixed(1)}%)`,
                      n,
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {data.map((d, i) => {
                const pct = ((d.value / total) * 100).toFixed(1);
                return (
                  <div
                    key={d.name}
                    className={`space-y-1 rounded-md p-1 -mx-1 ${
                      onIntentClick
                        ? "cursor-pointer hover:bg-muted transition-colors"
                        : ""
                    }`}
                    onClick={() => onIntentClick?.(d.name, { period, scope })}
                    role={onIntentClick ? "button" : undefined}
                    tabIndex={onIntentClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onIntentClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onIntentClick(d.name, { period, scope });
                      }

                    }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="truncate text-foreground">{d.name}</span>
                      </div>

                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {d.value} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {trend.rows.length > 0 && trend.series.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-navy">
                İhtiyaç Trendi
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  · İlk {trend.series.length} ihtiyaç
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Aralık:</span>
                <Select value={bucketMode} onValueChange={setBucketMode}>
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Otomatik ({trend.bucketDays === 1 ? "Günlük" : trend.bucketDays === 7 ? "Haftalık" : "Aylık"})
                    </SelectItem>
                    <SelectItem value="1">Günlük</SelectItem>
                    <SelectItem value="7">Haftalık</SelectItem>
                    <SelectItem value="30">Aylık</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    const esc = (v: string | number) => {
                      const s = String(v);
                      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                    };
                    const header = ["date", ...trend.series, "total"];
                    const lines = [header.map(esc).join(",")];
                    for (const row of trend.rows) {
                      const values = trend.series.map((s) => Number(row[s] ?? 0));
                      const total = values.reduce((a, b) => a + b, 0);
                      lines.push(
                        [esc(row.date as string), ...values.map(esc), esc(total)].join(","),
                      );
                    }
                    const bucketLabel =
                      trend.bucketDays === 1 ? "daily" : trend.bucketDays === 7 ? "weekly" : "monthly";
                    const periodLabel = period === "all" ? "all" : `${period}d`;
                    const scopeLabel = scope === "quiz" ? "quiz" : "all";
                    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
                      type: "text/csv;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `intent-trend-${periodLabel}-${bucketLabel}-${scopeLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex h-8 items-center rounded-md border border-border/60 bg-background px-2.5 text-xs text-foreground hover:bg-muted"
                  title="Trend verisini CSV olarak indir"
                >
                  CSV
                </button>
              </div>

            </div>


            {comparison && (
              <div className="mb-4 rounded-md border border-border/60 bg-muted/40 p-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Önceki dönemle karşılaştırma
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Bu dönem: <strong className="text-foreground">{comparison.total.current}</strong>
                      {" · "}Önceki: <strong className="text-foreground">{comparison.total.previous}</strong>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        formatChange(comparison.total.change).cls
                      }`}
                    >
                      {formatChange(comparison.total.change).text}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comparison.perIntent.map((p, i) => {
                    const f = formatChange(p.change);
                    const isSpike =
                      p.current >= minLead &&
                      (p.change === null || (p.change !== null && p.change >= spikePct));
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => onIntentClick?.(p.name, { period, scope })}
                        className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          isSpike
                            ? "border-gold/60 bg-gold/10 ring-1 ring-gold/40"
                            : "border-border/60 bg-background"
                        } ${onIntentClick ? "hover:border-teal/40 hover:bg-teal/5" : ""}`}
                        title={
                          isSpike
                            ? `Uyarı eşiği aşıldı (≥%${spikePct} · min ${minLead}) · Bu dönem: ${p.current} · Önceki: ${p.previous}`
                            : `Bu dönem: ${p.current} · Önceki: ${p.previous}`
                        }
                      >
                        {isSpike && <AlertTriangle className="h-3 w-3 shrink-0 text-gold" />}
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="max-w-[140px] truncate text-foreground">{p.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.previous}→{p.current}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium ${f.cls}`}
                        >
                          {f.text}
                        </span>
                      </button>
                    );
                  })}

                </div>
              </div>
            )}


            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.rows} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 12, cursor: onIntentClick ? "pointer" : undefined }}
                    onClick={(e: { value?: unknown; dataKey?: unknown }) => {
                      const raw = e?.value ?? e?.dataKey;
                      const name = typeof raw === "string" ? raw : undefined;
                      if (name) onIntentClick?.(name, { period, scope });
                    }}

                  />
                  {trend.series.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{
                        r: 5,
                        style: { cursor: onIntentClick ? "pointer" : undefined },
                        onClick: () => onIntentClick?.(name, { period, scope }),
                      }}
                      style={onIntentClick ? { cursor: "pointer" } : undefined}
                      onClick={() => onIntentClick?.(name, { period, scope })}
                    />
                  ))}

                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>

    </Card>
  );
}
