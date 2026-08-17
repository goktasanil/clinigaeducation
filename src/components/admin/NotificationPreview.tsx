import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export type PreviewLead = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  service?: string | null;
  level?: string | null;
  country?: string | null;
  intent?: string | null;
  source?: string | null;
  deadline?: string | null;
  language?: string | null;
  status?: string | null;
  confirmation_code?: string | null;
  appointment_at?: string | null;
  created_at?: string | null;
};

const SAMPLE_LEAD: PreviewLead = {
  name: "Örnek Kullanıcı",
  email: "ornek@example.com",
  phone: "+90 555 000 00 00",
  message: "Master başvurusu için danışmanlık almak istiyorum.",
  service: "Yurt Dışı Eğitim Danışmanlığı",
  level: "Master",
  country: "Almanya",
  intent: "study_abroad",
  source: "quiz",
  deadline: "2026-09-01",
  language: "tr",
  status: "new",
  confirmation_code: "CG-TEST",
  appointment_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
};

const RECIPIENT = "clinigaeducation@gmail.com";
const FROM = "CliniGA Education <notify@clinigaeducation.com>";

function safe(v?: string | null) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSubject(lead: PreviewLead) {
  const label = lead.source === "quiz" ? "Quiz" : "Form";
  const intent = lead.intent ? ` · ${lead.intent}` : "";
  return `[CliniGA] Yeni ${label} lead${intent} — ${safe(lead.name)}`;
}

function buildHtml(lead: PreviewLead) {
  const rows: Array<[string, string]> = [
    ["Ad Soyad", safe(lead.name)],
    ["E-posta", safe(lead.email)],
    ["Telefon", safe(lead.phone)],
    ["Hizmet", safe(lead.service)],
    ["Seviye", safe(lead.level)],
    ["Hedef Ülke", safe(lead.country)],
    ["İhtiyaç (intent)", safe(lead.intent)],
    ["Kaynak", safe(lead.source)],
    ["Deadline", safe(lead.deadline)],
    ["Dil", safe(lead.language)],
    [
      "Randevu",
      lead.appointment_at
        ? format(new Date(lead.appointment_at), "d MMM yyyy · HH:mm")
        : "—",
    ],
    ["Onay Kodu", safe(lead.confirmation_code)],
    [
      "Oluşturulma",
      lead.created_at
        ? format(new Date(lead.created_at), "d MMM yyyy · HH:mm")
        : "—",
    ],
  ];

  const rowsHtml = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:13px;width:170px;">${esc(k)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;">${esc(v)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#f5f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#0B1F3A;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C9A227;">CliniGA Education · Admin Bildirim</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px;">Yeni ${esc(safe(lead.source === "quiz" ? "Quiz" : "İletişim Formu"))} Lead'i</div>
    </div>
    <div style="background:#fff;padding:20px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:0;">
      <p style="margin:0 0 12px;color:#0f172a;font-size:14px;">
        <b>${esc(safe(lead.name))}</b> yeni bir talep gönderdi.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:8px 0 16px;">
        ${rowsHtml}
      </table>
      <div style="margin-top:8px;">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Mesaj</div>
        <div style="background:#f5f7fa;border-radius:8px;padding:12px 14px;color:#0f172a;font-size:14px;white-space:pre-wrap;">${esc(safe(lead.message))}</div>
      </div>
      <div style="margin-top:20px;text-align:center;">
        <a href="https://www.clinigaeducation.com/admin/leads" style="display:inline-block;background:#0E7C86;color:#fff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px;font-size:14px;">Admin panelinde aç</a>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:11px;margin-top:12px;">
      Bu bir <b>ÖNİZLEMEDİR</b> — gerçek e-posta gönderilmedi.
    </div>
  </div>
</body></html>`;
}

function buildText(lead: PreviewLead) {
  return [
    `Yeni ${lead.source === "quiz" ? "Quiz" : "Form"} lead'i`,
    ``,
    `Ad: ${safe(lead.name)}`,
    `E-posta: ${safe(lead.email)}`,
    `Telefon: ${safe(lead.phone)}`,
    `Hizmet: ${safe(lead.service)}`,
    `Seviye: ${safe(lead.level)}`,
    `Ülke: ${safe(lead.country)}`,
    `İhtiyaç: ${safe(lead.intent)}`,
    `Kaynak: ${safe(lead.source)}`,
    `Deadline: ${safe(lead.deadline)}`,
    `Dil: ${safe(lead.language)}`,
    `Randevu: ${lead.appointment_at ? format(new Date(lead.appointment_at), "d MMM yyyy · HH:mm") : "—"}`,
    `Onay: ${safe(lead.confirmation_code)}`,
    ``,
    `Mesaj:`,
    `${safe(lead.message)}`,
    ``,
    `Panel: https://www.clinigaeducation.com/admin/leads`,
  ].join("\n");
}

export function NotificationPreview({
  lead,
  label = "Bildirim önizle",
  variant = "outline",
  size = "sm",
  sample = false,
}: {
  lead?: PreviewLead;
  label?: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
  sample?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active: PreviewLead = useMemo(
    () => (sample ? SAMPLE_LEAD : (lead ?? SAMPLE_LEAD)),
    [lead, sample],
  );
  const subject = useMemo(() => buildSubject(active), [active]);
  const html = useMemo(() => buildHtml(active), [active]);
  const text = useMemo(() => buildText(active), [active]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className="h-8 gap-1.5">
          {sample ? <Send className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Admin bildirim önizlemesi</DialogTitle>
          <DialogDescription>
            Gerçek e-posta gönderilmez. Bu, yeni lead geldiğinde adminlere gidecek bildirimin görsel önizlemesidir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="grid gap-1 sm:grid-cols-[70px_1fr]">
            <span className="text-muted-foreground">Kimden:</span>
            <span className="font-mono">{FROM}</span>
            <span className="text-muted-foreground">Kime:</span>
            <span className="font-mono">{RECIPIENT}</span>
            <span className="text-muted-foreground">Konu:</span>
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
        </div>

        <Tabs defaultValue="visual" className="mt-2">
          <TabsList>
            <TabsTrigger value="visual">Görsel</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="text">Düz metin</TabsTrigger>
          </TabsList>
          <TabsContent value="visual">
            <div className="h-[520px] overflow-hidden rounded-md border border-border/60">
              <iframe
                title="notification-preview"
                srcDoc={html}
                sandbox=""
                className="h-full w-full bg-white"
              />
            </div>
          </TabsContent>
          <TabsContent value="html">
            <pre className="max-h-[520px] overflow-auto rounded-md border border-border/60 bg-background p-3 text-xs">
              <code>{html}</code>
            </pre>
          </TabsContent>
          <TabsContent value="text">
            <pre className="max-h-[520px] overflow-auto rounded-md border border-border/60 bg-background p-3 text-xs whitespace-pre-wrap">
              {text}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(html);
            }}
          >
            HTML kopyala
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(text);
            }}
          >
            Metni kopyala
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
