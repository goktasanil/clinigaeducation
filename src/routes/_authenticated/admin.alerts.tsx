import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, BellRing, Mail, MessageSquare, RefreshCw, ShieldAlert } from "lucide-react";

import {
  listSanitizeAlerts,
  type DeliveryStatus,
  type SanitizeAlertRow,
} from "@/lib/sanitize-alerts.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/alerts")({
  head: () => ({
    meta: [
      { title: "Uyarı Geçmişi | CliniGA Education" },
      {
        name: "description",
        content:
          "Tehlike eşiği aşıldığında oluşan içerik güvenlik uyarılarının zaman damgası, olay sayısı ve bildirim gönderim durumu.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAlertsPage,
});

const DAY_OPTIONS = [
  { value: 1, label: "24 saat" },
  { value: 7, label: "7 gün" },
  { value: 30, label: "30 gün" },
  { value: 90, label: "90 gün" },
];

const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  sent: "Gönderildi",
  not_configured: "Yapılandırılmadı",
  error: "Hata",
};

function DeliveryBadge({
  status,
  error,
  icon,
  label,
}: {
  status: DeliveryStatus;
  error: string | null;
  icon: React.ReactNode;
  label: string;
}) {
  const variant =
    status === "sent" ? "default" : status === "error" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="gap-1" title={error ?? undefined}>
      {icon}
      <span>
        {label}: {DELIVERY_LABEL[status]}
      </span>
    </Badge>
  );
}

function AlertRow({ row }: { row: SanitizeAlertRow }) {
  const ids = row.counts_by_audit_id ?? [];
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap font-medium">
        {format(new Date(row.fired_at), "dd.MM.yyyy HH:mm:ss")}
      </TableCell>
      <TableCell>
        <Badge variant="destructive" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          {row.dangerous_count} olay
        </Badge>
        <span className="ml-2 text-xs text-muted-foreground">
          eşik {row.threshold} / {row.window_minutes} dk
        </span>
      </TableCell>
      <TableCell className="space-y-1">
        {ids.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          ids.slice(0, 4).map((c) => (
            <div key={c.auditId} className="font-mono text-xs">
              {c.auditId} <span className="text-muted-foreground">× {c.count}</span>
            </div>
          ))
        )}
        {ids.length > 4 ? (
          <div className="text-xs text-muted-foreground">+{ids.length - 4} ID daha</div>
        ) : null}
      </TableCell>
      <TableCell className="text-xs">
        {(row.counts_by_source ?? []).map((c) => (
          <div key={c.source}>
            {c.source} <span className="text-muted-foreground">× {c.count}</span>
          </div>
        ))}
      </TableCell>
      <TableCell className="space-y-1">
        <DeliveryBadge
          status={row.slack_status}
          error={row.slack_error}
          label="Slack"
          icon={<MessageSquare className="h-3 w-3" />}
        />
        <DeliveryBadge
          status={row.email_status}
          error={row.email_error}
          label="E-posta"
          icon={<Mail className="h-3 w-3" />}
        />
      </TableCell>
    </TableRow>
  );
}

function AdminAlertsPage() {
  const [days, setDays] = useState(30);
  const fetchAlerts = useServerFn(listSanitizeAlerts);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["sanitize-alerts", days],
    queryFn: () => fetchAlerts({ data: { days, limit: 100 } }),
    placeholderData: keepPreviousData,
  });

  const stats = data?.stats;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/audit"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> İçerik Güvenlik Denetimi
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <BellRing className="h-6 w-6 text-primary" /> Uyarı Geçmişi
          </h1>
          <p className="text-sm text-muted-foreground">
            Tehlike eşiği aşıldığında oluşan uyarılar, tetikleyen olay sayısı ve
            Slack/e-posta gönderim durumu.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DAY_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={days === opt.value ? "default" : "outline"}
            onClick={() => setDays(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Uyarı", value: stats?.alerts ?? 0 },
          { label: "Tehlikeli olay", value: stats?.dangerousEvents ?? 0 },
          { label: "Bildirim gönderildi", value: stats?.delivered ?? 0 },
          { label: "Gönderim hatası", value: stats?.failed ?? 0 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaman</TableHead>
                <TableHead>Tehlikeli içerik</TableHead>
                <TableHead>Audit korelasyon ID</TableHead>
                <TableHead>Kaynak</TableHead>
                <TableHead>Gönderim durumu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Bu dönemde uyarı oluşmadı.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.rows ?? []).map((row) => <AlertRow key={row.id} row={row} />)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
