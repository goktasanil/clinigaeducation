import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { format } from "date-fns";

type Lead = {
  intent?: string | null;
  source?: string | null;
  created_at: string;
  status?: string | null;
};

function aggregate(leads: Lead[]) {
  const byIntent = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byStatus = new Map<string, number>();
  const bySourceIntent = new Map<string, Map<string, number>>();

  for (const l of leads) {
    const intent = (l.intent || "unspecified").toString();
    const source = (l.source || "unknown").toString();
    const status = (l.status || "new").toString();
    byIntent.set(intent, (byIntent.get(intent) ?? 0) + 1);
    bySource.set(source, (bySource.get(source) ?? 0) + 1);
    byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
    if (!bySourceIntent.has(source)) bySourceIntent.set(source, new Map());
    const m = bySourceIntent.get(source)!;
    m.set(intent, (m.get(intent) ?? 0) + 1);
  }
  return { byIntent, bySource, byStatus, bySourceIntent, total: leads.length };
}

function toCSV(rows: (string | number)[][]) {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AnalyticsExport({ leads }: { leads: Lead[] }) {
  const stamp = format(new Date(), "yyyyMMdd-HHmm");

  const exportCSV = () => {
    const a = aggregate(leads);
    const rows: (string | number)[][] = [];
    rows.push(["CliniGA Education - Analiz Raporu"]);
    rows.push(["Oluşturulma", format(new Date(), "yyyy-MM-dd HH:mm")]);
    rows.push(["Toplam Lead", a.total]);
    rows.push([]);
    rows.push(["İhtiyaç (Intent)", "Adet", "Oran %"]);
    [...a.byIntent.entries()]
      .sort((x, y) => y[1] - x[1])
      .forEach(([k, v]) =>
        rows.push([k, v, a.total ? ((v / a.total) * 100).toFixed(1) : "0"])
      );
    rows.push([]);
    rows.push(["Kaynak (Source)", "Adet", "Oran %"]);
    [...a.bySource.entries()]
      .sort((x, y) => y[1] - x[1])
      .forEach(([k, v]) =>
        rows.push([k, v, a.total ? ((v / a.total) * 100).toFixed(1) : "0"])
      );
    rows.push([]);
    rows.push(["Durum", "Adet"]);
    [...a.byStatus.entries()]
      .sort((x, y) => y[1] - x[1])
      .forEach(([k, v]) => rows.push([k, v]));
    rows.push([]);
    rows.push(["Kaynak x İhtiyaç Kırılımı"]);
    rows.push(["Kaynak", "İhtiyaç", "Adet"]);
    [...a.bySourceIntent.entries()].forEach(([src, m]) => {
      [...m.entries()]
        .sort((x, y) => y[1] - x[1])
        .forEach(([intent, v]) => rows.push([src, intent, v]));
    });

    const csv = "\uFEFF" + toCSV(rows);
    download(`analiz-${stamp}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const a = aggregate(leads);
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("CliniGA Education - Analiz Raporu", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `Oluşturulma: ${format(new Date(), "yyyy-MM-dd HH:mm")}  |  Toplam Lead: ${a.total}`,
      14,
      25
    );
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 32,
      head: [["İhtiyaç (Intent)", "Adet", "Oran %"]],
      body: [...a.byIntent.entries()]
        .sort((x, y) => y[1] - x[1])
        .map(([k, v]) => [k, v, a.total ? ((v / a.total) * 100).toFixed(1) + "%" : "0%"]),
      headStyles: { fillColor: [11, 31, 58] },
    });

    autoTable(doc, {
      head: [["Kaynak (Source)", "Adet", "Oran %"]],
      body: [...a.bySource.entries()]
        .sort((x, y) => y[1] - x[1])
        .map(([k, v]) => [k, v, a.total ? ((v / a.total) * 100).toFixed(1) + "%" : "0%"]),
      headStyles: { fillColor: [14, 124, 134] },
    });

    autoTable(doc, {
      head: [["Durum", "Adet"]],
      body: [...a.byStatus.entries()].sort((x, y) => y[1] - x[1]).map(([k, v]) => [k, v]),
      headStyles: { fillColor: [201, 162, 39] },
    });

    const cross: (string | number)[][] = [];
    [...a.bySourceIntent.entries()].forEach(([src, m]) => {
      [...m.entries()]
        .sort((x, y) => y[1] - x[1])
        .forEach(([intent, v]) => cross.push([src, intent, v]));
    });
    autoTable(doc, {
      head: [["Kaynak", "İhtiyaç", "Adet"]],
      body: cross,
      headStyles: { fillColor: [60, 60, 60] },
    });

    doc.save(`analiz-${stamp}.pdf`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} disabled={!leads.length}>
        <FileDown className="mr-1.5 h-4 w-4" />
        Analizi CSV indir
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} disabled={!leads.length}>
        <FileText className="mr-1.5 h-4 w-4" />
        Analizi PDF indir
      </Button>
    </div>
  );
}
