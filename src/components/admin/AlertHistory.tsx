import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Check, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AlertRow = {
  id: string;
  intent: string;
  period: string;
  scope: string;
  current_count: number;
  previous_count: number;
  change_pct: number | null;
  threshold_pct: number;
  min_lead: number;
  status: "new" | "read" | "handled";
  note: string | null;
  alert_date: string;
  created_at: string;
  updated_at: string;
};

const STATUS_LABEL: Record<AlertRow["status"], string> = {
  new: "Yeni",
  read: "Okundu",
  handled: "İşlendi",
};

const STATUS_STYLE: Record<AlertRow["status"], string> = {
  new: "bg-gold/15 text-navy border-gold/40",
  read: "bg-muted text-foreground border-border",
  handled: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
};

export function AlertHistory({
  onIntentClick,
}: {
  onIntentClick?: (intent: string) => void;
}) {
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alert_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast.error("Uyarılar yüklenemedi");
      setLoading(false);
      return;
    }
    setRows((data ?? []) as AlertRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    if (statusFilter === "open")
      return rows.filter((r) => r.status !== "handled");
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  const counts = useMemo(
    () => ({
      new: rows.filter((r) => r.status === "new").length,
      read: rows.filter((r) => r.status === "read").length,
      handled: rows.filter((r) => r.status === "handled").length,
    }),
    [rows],
  );

  const updateStatus = async (id: string, status: AlertRow["status"]) => {
    setBusyId(id);
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase
      .from("alert_history")
      .update({ status })
      .eq("id", id);
    setBusyId(null);
    if (error) {
      setRows(prev);
      toast.error("Güncellenemedi");
      return;
    }
    toast.success(`Uyarı ${STATUS_LABEL[status].toLowerCase()} olarak işaretlendi`);
  };

  const markAllRead = async () => {
    const ids = rows.filter((r) => r.status === "new").map((r) => r.id);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("alert_history")
      .update({ status: "read" })
      .in("id", ids);
    if (error) {
      toast.error("Toplu güncelleme başarısız");
      return;
    }
    toast.success(`${ids.length} uyarı okundu olarak işaretlendi`);
    void load();
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 font-display text-lg text-navy">
          <AlertTriangle className="h-5 w-5 text-gold" />
          Uyarı Geçmişi
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            · Yeni {counts.new} · Okundu {counts.read} · İşlendi {counts.handled}
          </span>
        </CardTitle>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Açık (yeni + okundu)</SelectItem>
              <SelectItem value="new">Sadece yeni</SelectItem>
              <SelectItem value="read">Sadece okundu</SelectItem>
              <SelectItem value="handled">Sadece işlendi</SelectItem>
              <SelectItem value="all">Tümü</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={markAllRead}
            disabled={counts.new === 0}
            title="Yeni uyarıların tümünü okundu yap"
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Tümünü okundu yap
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => void load()}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Bu filtrede uyarı yok. Trend eşiği aşıldığında uyarılar otomatik olarak buraya kaydedilir.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((a) => {
              const pct =
                a.change_pct === null
                  ? "Yeni"
                  : `${a.change_pct >= 0 ? "▲" : "▼"} ${Math.abs(Math.round(Number(a.change_pct)))}%`;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onIntentClick?.(a.intent)}
                        className="truncate text-sm font-semibold text-navy hover:text-teal"
                        title="Bu intent'i lead listesinde filtrele"
                      >
                        {a.intent}
                      </button>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-mono text-navy">
                        {pct}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.previous_count} → <strong className="text-foreground">{a.current_count}</strong>
                      {" · "}
                      Dönem {a.period === "all" ? "Tüm zamanlar" : `${a.period} gün`}
                      {" · "}Kaynak {a.scope === "quiz" ? "Quiz" : "Tümü"}
                      {" · "}Eşik %{Number(a.threshold_pct)}·min {a.min_lead}
                      {" · "}{format(new Date(a.created_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {a.status !== "read" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={busyId === a.id}
                        onClick={() => updateStatus(a.id, "read")}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Okundu
                      </Button>
                    )}
                    {a.status !== "handled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                        disabled={busyId === a.id}
                        onClick={() => updateStatus(a.id, "handled")}
                      >
                        <CheckCheck className="mr-1 h-3.5 w-3.5" /> İşlendi
                      </Button>
                    )}
                    {a.status === "handled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-muted-foreground"
                        disabled={busyId === a.id}
                        onClick={() => updateStatus(a.id, "new")}
                      >
                        Geri al
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
