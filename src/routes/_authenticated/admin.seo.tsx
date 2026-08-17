import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getGscDashboard, refreshGscSnapshot } from "@/lib/gsc.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  head: () => ({
    meta: [
      { title: "Indeksleme İzleme | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSeoPage,
});

const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

function verdictBadge(verdict: string | null, error: string | null) {
  if (error) return <Badge variant="destructive">Hata</Badge>;
  if (verdict === "PASS")
    return <Badge className="bg-teal text-white hover:bg-teal">İndeksli</Badge>;
  if (verdict === "NEUTRAL") return <Badge variant="secondary">Beklemede</Badge>;
  if (verdict === "FAIL") return <Badge variant="destructive">İndekslenmedi</Badge>;
  return <Badge variant="outline">Bilinmiyor</Badge>;
}

function shortPath(url: string) {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path) || "/";
  } catch {
    return url;
  }
}

function AdminSeoPage() {
  const queryClient = useQueryClient();
  const fetchDashboard = useServerFn(getGscDashboard);
  const runRefresh = useServerFn(refreshGscSnapshot);
  const [query, setQuery] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const autoRan = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["gsc-dashboard"],
    queryFn: () => fetchDashboard({}),
  });

  const refresh = useMutation({
    mutationFn: () => runRefresh({}),
    onSuccess: (result) => {
      toast.success(`${result.urlCount} adres tarandı`);
      queryClient.invalidateQueries({ queryKey: ["gsc-dashboard"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Tarama tamamlanamadı",
      );
    },
  });

  // Düzenli izleme: son tarama 12 saatten eskiyse otomatik yenile.
  useEffect(() => {
    if (!data || autoRan.current || refresh.isPending) return;
    const last = data.lastCheckedAt ? new Date(data.lastCheckedAt).getTime() : 0;
    if (Date.now() - last > STALE_AFTER_MS) {
      autoRan.current = true;
      refresh.mutate();
    }
  }, [data, refresh]);

  const urls = data?.urls ?? [];

  const stats = useMemo(() => {
    const indexed = urls.filter((u) => u.current.verdict === "PASS").length;
    const failing = urls.filter(
      (u) => u.current.verdict === "FAIL" || u.current.verdict === "NEUTRAL",
    ).length;
    const errors = urls.filter((u) => u.current.error_message).length;
    const changed = urls.filter((u) => u.changed).length;
    return { total: urls.length, indexed, failing, errors, changed };
  }, [urls]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return urls.filter((u) => {
      if (onlyChanged && !u.changed) return false;
      if (!q) return true;
      return (
        u.url.toLowerCase().includes(q) ||
        (u.current.coverage_state ?? "").toLowerCase().includes(q)
      );
    });
  }, [urls, query, onlyChanged]);

  const perfSeries = useMemo(
    () =>
      (data?.perf ?? []).map((p) => ({
        label: format(new Date(p.captured_at), "dd MMM"),
        clicks: p.clicks,
        impressions: p.impressions,
        position: Number(p.average_position.toFixed(1)),
      })),
    [data?.perf],
  );

  return (
    <section className="container-prose py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Indeksleme İzleme
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.lastCheckedAt
              ? `Son tarama: ${format(new Date(data.lastCheckedAt), "dd.MM.yyyy HH:mm")}`
              : "Henüz tarama yapılmadı"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/leads">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Leadler
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${refresh.isPending ? "animate-spin" : ""}`}
            />
            {refresh.isPending ? "Taranıyor…" : "Şimdi tara"}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="İzlenen adres"
          value={stats.total}
          icon={<Search className="h-4 w-4 text-teal" />}
        />
        <StatCard
          label="İndeksli"
          value={stats.indexed}
          icon={<CheckCircle2 className="h-4 w-4 text-teal" />}
        />
        <StatCard
          label="İndeks dışı / beklemede"
          value={stats.failing}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label="Son taramada değişen"
          value={stats.changed}
          icon={<TrendingUp className="h-4 w-4 text-gold" />}
        />
      </div>

      {stats.errors > 0 && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <span>
              {stats.errors} adres için Search Console verisi alınamadı. Bağlantıyı
              ve mülk erişimini kontrol edin.
            </span>
          </CardContent>
        </Card>
      )}

      {perfSeries.length > 1 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-navy">
              Arama performansı geçmişi (28 günlük toplamlar)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    name="Gösterim"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Tıklama"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Adres veya durum ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Adres ara"
          />
        </div>
        <Button
          variant={onlyChanged ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyChanged((v) => !v)}
        >
          Sadece değişenler
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adres</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Kapsam</TableHead>
                <TableHead>Son tarama (Google)</TableHead>
                <TableHead>Değişim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Yükleniyor…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Kayıt yok. "Şimdi tara" ile ilk anlık görüntüyü alın.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((row) => (
                <TableRow key={row.url}>
                  <TableCell className="max-w-[320px]">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 truncate text-sm text-navy underline-offset-2 hover:underline"
                    >
                      {shortPath(row.url)}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {verdictBadge(row.current.verdict, row.current.error_message)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.current.error_message ?? row.current.coverage_state ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.current.last_crawl_time
                      ? format(new Date(row.current.last_crawl_time), "dd.MM.yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.previous ? (
                      <span className="text-gold">
                        {row.previous.coverage_state ?? row.previous.verdict ?? "—"} →{" "}
                        {row.current.coverage_state ?? row.current.verdict ?? "—"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Değişim yok</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {icon}
        </div>
        <p className="mt-2 font-display text-2xl font-semibold text-navy">{value}</p>
      </CardContent>
    </Card>
  );
}
