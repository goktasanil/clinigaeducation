import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const SOURCE_LABELS: Record<string, string> = {
  quiz: "Quiz",
  contact_form: "İletişim Formu",
  whatsapp: "WhatsApp",
  ads: "Reklam",
  referral: "Referans",
  organic: "Organik",
  other: "Diğer",
};

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

function labelOf(src: string | null | undefined) {
  const k = (src || "other").trim();
  return SOURCE_LABELS[k] ?? k;
}

export function SourceBreakdown({
  leads,
  onSourceClick,
}: {
  leads: Lead[];
  onSourceClick?: (source: string) => void;
}) {
  const [period, setPeriod] = useState<string>("30");

  const { bars, matrix, sources, topIntents, total } = useMemo(() => {
    const now = Date.now();
    const cutoff =
      period === "all" ? 0 : now - Number(period) * 24 * 60 * 60 * 1000;
    const filtered = leads.filter(
      (l) => new Date(l.created_at).getTime() >= cutoff,
    );

    const srcCounts = new Map<string, number>();
    const cell = new Map<string, Map<string, number>>();
    const intentCounts = new Map<string, number>();
    for (const l of filtered) {
      const src = (l.source || "other").trim();
      srcCounts.set(src, (srcCounts.get(src) ?? 0) + 1);
      const intent = l.intent?.trim() || "Belirtilmemiş";
      intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
      if (!cell.has(src)) cell.set(src, new Map());
      const m = cell.get(src)!;
      m.set(intent, (m.get(intent) ?? 0) + 1);
    }

    const bars = Array.from(srcCounts.entries())
      .map(([key, value]) => ({ key, name: labelOf(key), value }))
      .sort((a, b) => b.value - a.value);

    const topIntents = Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([n]) => n);

    const sources = bars.map((b) => b.key);
    const matrix = sources.map((src) => {
      const m = cell.get(src) ?? new Map();
      const row: Record<string, number | string> = {
        __total: srcCounts.get(src) ?? 0,
      };
      for (const it of topIntents) row[it] = m.get(it) ?? 0;
      const otherSum = Array.from(m.entries())
        .filter(([k]) => !topIntents.includes(k))
        .reduce((s, [, v]) => s + v, 0);
      row.__other = otherSum;
      row.src = src;
      row.label = labelOf(src);
      return row as {
        src: string;
        label: string;
        __total: number;
        __other: number;
        [intent: string]: number | string;
      };
    });

    return {
      bars,
      matrix,
      sources,
      topIntents,
      total: filtered.length,
    };
  }, [leads, period]);

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="font-display text-lg text-navy">
          Kaynak / Kanal Kırılımı
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            · {total} lead
          </span>
        </CardTitle>
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
      </CardHeader>
      <CardContent>
        {bars.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Seçilen dönemde kayıt yok.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bars}
                  margin={{ top: 5, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [
                      `${v} (${((v / total) * 100).toFixed(1)}%)`,
                      "Lead",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="value"
                    name="Lead sayısı"
                    radius={[6, 6, 0, 0]}
                    onClick={(p: { key?: string }) =>
                      p?.key && onSourceClick?.(p.key)
                    }
                    style={onSourceClick ? { cursor: "pointer" } : undefined}
                  >
                    {bars.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Kaynak</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                    {topIntents.map((it) => (
                      <TableHead key={it} className="text-right text-xs">
                        {it}
                      </TableHead>
                    ))}
                    {matrix.some((r) => (r.__other as number) > 0) && (
                      <TableHead className="text-right text-xs">Diğer</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.map((row, i) => (
                    <TableRow
                      key={row.src}
                      className={
                        onSourceClick
                          ? "cursor-pointer hover:bg-muted/50"
                          : undefined
                      }
                      onClick={() => onSourceClick?.(row.src)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="font-medium">{row.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {row.__total as number}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ·{" "}
                          {(
                            ((row.__total as number) / total) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </TableCell>
                      {topIntents.map((it) => (
                        <TableCell
                          key={it}
                          className="text-right font-mono text-xs text-muted-foreground"
                        >
                          {(row[it] as number) || 0}
                        </TableCell>
                      ))}
                      {matrix.some((r) => (r.__other as number) > 0) && (
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {(row.__other as number) || 0}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sources.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Satıra tıklayarak lead listesini o kaynağa filtreleyebilirsiniz.
                İhtiyaç sütunları en çok gelen ilk 5 intent'i gösterir.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
