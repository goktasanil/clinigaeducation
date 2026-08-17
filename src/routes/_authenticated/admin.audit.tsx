import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, BellRing, FileDown, RefreshCw, Search, ShieldAlert, ShieldCheck } from "lucide-react";

import {
  exportSanitizeAuditEvents,
  listSanitizeAuditEvents,
  type SanitizeAuditRow,
} from "@/lib/sanitize-audit.functions";
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

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [
      { title: "İçerik Güvenlik Denetimi | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAuditPage,
});

const DAY_OPTIONS = [
  { value: 1, label: "24 saat" },
  { value: 7, label: "7 gün" },
  { value: 30, label: "30 gün" },
  { value: 90, label: "90 gün" },
] as const;

const KIND_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "dangerous", label: "Tehlikeli" },
  { value: "cosmetic", label: "Kozmetik" },
] as const;

const PAGE_SIZE = 50;

function bag(map: Record<string, number> | null | undefined): string {
  const entries = Object.entries(map ?? {});
  if (!entries.length) return "—";
  return entries.map(([k, v]) => `${k}×${v}`).join(", ");
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-semibold text-navy">{value}</p>
      </CardContent>
    </Card>
  );
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function AdminAuditPage() {
  const [days, setDays] = useState<number>(30);
  const [kind, setKind] = useState<"all" | "dangerous" | "cosmetic">("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  const listEvents = useServerFn(listSanitizeAuditEvents);
  const exportEvents = useServerFn(exportSanitizeAuditEvents);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["sanitize-audit", days, kind, query, page],
    queryFn: () =>
      listEvents({ data: { days, kind, search: query, page, pageSize: PAGE_SIZE } }),
    placeholderData: keepPreviousData,
  });

  const rows: SanitizeAuditRow[] = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleExport() {
    setExporting(true);
    try {
      const { csv, count } = await exportEvents({ data: { days, kind, search: query } });
      const date = format(new Date(), "yyyy-MM-dd");
      const kindLabel = kind === "all" ? "tum" : kind;
      triggerDownload(csv, `guvenlik-denetimi-${kindLabel}-${days}gun-${date}-${count}.csv`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/leads"
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <h1 className="font-display text-2xl font-semibold text-navy">
            İçerik Güvenlik Denetimi
          </h1>
          <p className="text-sm text-muted-foreground">
            Blog HTML temizleme (sanitization) olayları veritabanında saklanır.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/alerts">
              <BellRing className="mr-2 h-4 w-4" />
              Uyarı Geçmişi
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>

            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => void handleExport()} disabled={exporting}>
            <FileDown className="mr-2 h-4 w-4" />
            {exporting ? "İndiriliyor..." : "CSV İndir"}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={`Toplam olay (${days} gün)`} value={data?.stats.total ?? 0} />
        <StatCard label="Tehlikeli" value={data?.stats.dangerous ?? 0} />
        <StatCard label="Kozmetik" value={data?.stats.cosmetic ?? 0} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {DAY_OPTIONS.map((o) => (
          <Button
            key={o.value}
            size="sm"
            variant={days === o.value ? "default" : "outline"}
            onClick={() => {
              setDays(o.value);
              setPage(0);
            }}
          >
            {o.label}
          </Button>
        ))}
        <span className="mx-2 h-5 w-px bg-border" />
        {KIND_OPTIONS.map((o) => (
          <Button
            key={o.value}
            size="sm"
            variant={kind === o.value ? "default" : "outline"}
            onClick={() => {
              setKind(o.value);
              setPage(0);
            }}
          >
            {o.label}
          </Button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
            setPage(0);
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kaynak, post, dil veya audit ID"
            className="w-64"
          />
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaman</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Kaynak</TableHead>
                <TableHead>Post / Dil</TableHead>
                <TableHead>Kaldırılan</TableHead>
                <TableHead className="text-right">Bayt</TableHead>
                <TableHead>Audit ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Bu aralıkta denetim olayı yok.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(r.created_at), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {r.dangerous ? (
                      <Badge variant="destructive" className="gap-1">
                        <ShieldAlert className="h-3 w-3" /> Tehlikeli
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Kozmetik
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{r.source}</TableCell>
                  <TableCell className="text-xs">
                    {r.post_id ?? "—"}
                    {r.lang ? ` · ${r.lang}` : ""}
                  </TableCell>
                  <TableCell className="max-w-[320px] text-xs">
                    <div className="truncate" title={bag(r.removed_dangerous_elements)}>
                      Etiket: {bag(r.removed_dangerous_elements)}
                    </div>
                    <div className="truncate" title={bag(r.removed_attributes)}>
                      Özellik: {bag(r.removed_attributes)}
                    </div>
                    {r.blocked_urls > 0 && (
                      <div className="text-destructive">URL: {r.blocked_urls}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.input_length - r.output_length}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {r.audit_id ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} kayıt · sayfa {page + 1}/{pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Önceki
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </main>
  );
}
