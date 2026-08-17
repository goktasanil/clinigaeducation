import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, BellOff, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
  created_at: string;
};

const SEEN_KEY = "adminLeads.alertSeenIds.v1";
const DISMISSED_KEY = "adminLeads.alertBannerDismissedIds.v1";
const POLL_MS = 60_000;

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    // keep last 500 to avoid unbounded growth
    const arr = Array.from(set).slice(-500);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

function formatChange(a: AlertRow) {
  if (a.change_pct === null) return "Yeni";
  const r = Math.round(Number(a.change_pct));
  return `${r >= 0 ? "▲" : "▼"} ${Math.abs(r)}%`;
}

export function TrendAlertWidget({
  onIntentClick,
}: {
  onIntentClick?: (intent: string) => void;
}) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    readSet(DISMISSED_KEY),
  );
  const seenRef = useRef<Set<string>>(readSet(SEEN_KEY));

  const load = async () => {
    const { data, error } = await supabase
      .from("alert_history")
      .select(
        "id, intent, period, scope, current_count, previous_count, change_pct, threshold_pct, min_lead, created_at",
      )
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return;
    const rows = (data ?? []) as AlertRow[];
    setAlerts(rows);

    // Fire browser notifications for freshly-seen alerts
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      const fresh = rows.filter((r) => !seenRef.current.has(r.id));
      if (fresh.length > 0) {
        // Batch: one notification for many, individual for a few
        if (fresh.length <= 2) {
          for (const a of fresh) {
            new Notification(`Trend uyarısı: ${a.intent}`, {
              body: `${a.previous_count} → ${a.current_count} · ${formatChange(a)} · min ${a.min_lead}, eşik %${a.threshold_pct}`,
              tag: `alert-${a.id}`,
              icon: "/favicon.ico",
            });
          }
        } else {
          new Notification(`${fresh.length} yeni trend uyarısı`, {
            body: fresh
              .slice(0, 4)
              .map((a) => `${a.intent} (${formatChange(a)})`)
              .join(" · "),
            tag: "alert-batch",
            icon: "/favicon.ico",
          });
        }
      }
    }

    // Mark all fetched as "seen" so browser notifications don't repeat
    for (const r of rows) seenRef.current.add(r.id);
    writeSet(SEEN_KEY, seenRef.current);
  };

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Bu tarayıcı bildirimleri desteklemiyor");
      return;
    }
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") {
      toast.success("Tarayıcı bildirimleri açıldı");
      new Notification("CliniGA · Uyarı bildirimleri aktif", {
        body: "Yeni trend uyarıları geldiğinde burada göreceksiniz.",
        icon: "/favicon.ico",
      });
    } else if (p === "denied") {
      toast.error("İzin reddedildi. Tarayıcı ayarlarından açabilirsiniz.");
    }
  };

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    writeSet(DISMISSED_KEY, next);
  };

  const visible = useMemo(
    () => alerts.filter((a) => !dismissed.has(a.id)),
    [alerts, dismissed],
  );

  if (visible.length === 0 && permission === "granted") return null;

  return (
    <div className="mb-6 rounded-lg border border-gold/50 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-gold" />
          <p className="font-display text-sm font-semibold text-navy">
            {visible.length > 0
              ? `${visible.length} yeni trend uyarısı`
              : "Trend uyarıları"}
          </p>
        </div>
        <div className="flex gap-2">
          {permission !== "granted" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-gold/50 bg-background"
              onClick={requestPermission}
            >
              {permission === "denied" ? (
                <><BellOff className="mr-1.5 h-3.5 w-3.5" /> Bildirim reddedildi</>
              ) : (
                <><Bell className="mr-1.5 h-3.5 w-3.5" /> Tarayıcı bildirimlerini aç</>
              )}
            </Button>
          )}
        </div>
      </div>

      {visible.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {visible.slice(0, 6).map((a) => (
            <li
              key={a.id}
              className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-background px-2.5 py-1 text-xs"
            >
              <button
                type="button"
                onClick={() => onIntentClick?.(a.intent)}
                className="max-w-[180px] truncate font-medium text-navy hover:text-teal"
                title={`${a.previous_count} → ${a.current_count} · dönem ${a.period}g · eşik %${a.threshold_pct}`}
              >
                {a.intent}
              </button>
              <span className="font-mono text-[10px] text-muted-foreground">
                {a.previous_count}→{a.current_count}
              </span>
              <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-1.5 py-0 text-[10px] font-medium text-navy">
                {formatChange(a)}
              </span>
              <button
                type="button"
                onClick={() => dismiss(a.id)}
                className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-60 hover:bg-muted hover:opacity-100"
                title="Bu bannerdan gizle (geçmişte kalır)"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
          {visible.length > 6 && (
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-muted-foreground">
              +{visible.length - 6} daha
            </span>
          )}
        </ul>
      )}

      {permission === "granted" && visible.length > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Yeni uyarılar geldiğinde tarayıcı bildirimi de alırsınız. Aşağıdaki "Uyarı Geçmişi" bölümünden okundu/işlendi işaretleyebilirsiniz.
        </p>
      )}
    </div>
  );
}
