import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  LogOut,
  Mail,
  Phone,
  Calendar,
  Search,
  RefreshCw,
  ClipboardList,
  Download,
  Upload,
  CheckSquare,
  X,
  Bell,
  BellRing,
  Save,
  ArrowRight,
  Pencil,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { listLeads, updateLeadStatus, updateLeadFollowUp } from "@/lib/leads.functions";
import { IntentAnalytics } from "@/components/admin/IntentAnalytics";
import { SourceBreakdown } from "@/components/admin/SourceBreakdown";
import { AnalyticsExport } from "@/components/admin/AnalyticsExport";
import { NotificationPreview } from "@/components/admin/NotificationPreview";
import { AlertHistory } from "@/components/admin/AlertHistory";
import { TrendAlertWidget } from "@/components/admin/TrendAlertWidget";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [
      { title: "Lead Yönetimi | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLeadsPage,
});

const STATUSES = ["new", "contacted", "won", "lost", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const CSV_ALL_COLS = [
  "created_at",
  "confirmation_code",
  "status",
  "source",
  "intent",
  "name",
  "email",
  "phone",
  "language",
  "service",
  "level",
  "country",
  "deadline",
  "appointment_at",
  "message",
  "quiz_answers_count",
  "quiz_started_at",
  "quiz_completed_at",
  "quiz_duration",
  "quiz_timeline",
  "quiz_answers_json",
] as const;

const statusColor: Record<Status, string> = {
  new: "bg-teal/15 text-teal border-teal/30",
  contacted: "bg-gold/15 text-gold-foreground border-gold/40",
  won: "bg-green-500/15 text-green-700 border-green-500/30",
  lost: "bg-red-500/15 text-red-700 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function AdminLeadsPage() {
  const fetchLeads = useServerFn(listLeads);
  const updateStatus = useServerFn(updateLeadStatus);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [quizOnly, setQuizOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"quiz_desc" | "quiz_asc">("quiz_desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status>("contacted");
  const [remindersOnly, setRemindersOnly] = useState(false);
  const [intentDrillDown, setIntentDrillDown] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [savedFilterSearch, setSavedFilterSearch] = useState("");

  // Restore persisted filters on mount (client only, after hydration).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminLeads.filters.v1");
      if (raw) {
        const s = JSON.parse(raw) as Partial<{
          search: string;
          statusFilter: string;
          intentFilter: string;
          sourceFilter: string;
          countryFilter: string;
          dateFrom: string;
          dateTo: string;
          quizOnly: boolean;
          sortBy: "quiz_desc" | "quiz_asc";
          remindersOnly: boolean;
        }>;
        if (typeof s.search === "string") setSearch(s.search);
        if (typeof s.statusFilter === "string") setStatusFilter(s.statusFilter);
        if (typeof s.intentFilter === "string") setIntentFilter(s.intentFilter);
        if (typeof s.sourceFilter === "string") setSourceFilter(s.sourceFilter);
        if (typeof s.countryFilter === "string") setCountryFilter(s.countryFilter);
        if (typeof s.dateFrom === "string") setDateFrom(s.dateFrom);
        if (typeof s.dateTo === "string") setDateTo(s.dateTo);
        if (typeof s.quizOnly === "boolean") setQuizOnly(s.quizOnly);
        if (s.sortBy === "quiz_asc" || s.sortBy === "quiz_desc") setSortBy(s.sortBy);
        if (typeof s.remindersOnly === "boolean") setRemindersOnly(s.remindersOnly);
      }
    } catch {
      // ignore corrupt storage
    }
    setFiltersHydrated(true);
  }, []);

  // Persist filters whenever they change (after initial hydration).
  useEffect(() => {
    if (!filtersHydrated) return;
    try {
      localStorage.setItem(
        "adminLeads.filters.v1",
        JSON.stringify({
          search,
          statusFilter,
          intentFilter,
          sourceFilter,
          countryFilter,
          dateFrom,
          dateTo,
          quizOnly,
          sortBy,
          remindersOnly,
        }),
      );
    } catch {
      // storage quota / private mode — ignore
    }
  }, [
    filtersHydrated,
    search,
    statusFilter,
    intentFilter,
    sourceFilter,
    countryFilter,
    dateFrom,
    dateTo,
    quizOnly,
    sortBy,
    remindersOnly,
  ]);

  const openIntentDrillDown = (intent: string, ctx?: { period: string; scope: string }) => {
    if (ctx) {
      // Apply period → dateFrom/dateTo
      if (ctx.period === "all") {
        setDateFrom("");
        setDateTo("");
      } else {
        const days = Number(ctx.period);
        if (Number.isFinite(days) && days > 0) {
          const now = new Date();
          const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          const toISO = now.toISOString().slice(0, 10);
          const fromISO = from.toISOString().slice(0, 10);
          setDateFrom(fromISO);
          setDateTo(toISO);
        }
      }
      // Apply scope → source filter
      setSourceFilter(ctx.scope === "quiz" ? "quiz" : "all");
      // Apply intent
      setIntentFilter(intent);
      setStatusFilter("all");
      setSearch("");
      setCountryFilter("all");
      setQuizOnly(false);
      setRemindersOnly(false);
      // Close drill-down modal if any and scroll to list
      setIntentDrillDown(null);
      setTimeout(() => {
        const el = document.getElementById("leads-list");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }
    setIntentDrillDown(intent);
  };

  const goToLead = (id: string, intent: string | null) => {
    setIntentDrillDown(null);
    setSourceFilter("quiz");
    setIntentFilter(intent || "all");
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setRemindersOnly(false);
    setHighlightId(id);
    setTimeout(() => {
      const el = document.getElementById(`lead-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightId(null), 2500);
    }, 60);
  };

  const query = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => fetchLeads(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: Status }) => updateStatus({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Durum güncellendi");
    },
    onError: () => toast.error("Güncellenemedi"),
  });

  const bulkMutation = useMutation({
    mutationFn: async (vars: { ids: string[]; status: Status }) => {
      const results = await Promise.allSettled(
        vars.ids.map((id) => updateStatus({ data: { id, status: vars.status } })),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      return { total: vars.ids.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelectedIds(new Set());
      if (failed === 0) toast.success(`${total} kayıt güncellendi`);
      else toast.warning(`${total - failed}/${total} güncellendi, ${failed} başarısız`);
    },
    onError: () => toast.error("Toplu güncelleme başarısız"),
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { next: undefined }, replace: true });
  };

  const leads = query.data?.leads ?? [];
  const intents = Array.from(
    new Set(leads.map((l) => l.intent).filter((v): v is string => !!v)),
  ).sort();
  const sources = Array.from(
    new Set(leads.map((l) => l.source).filter((v): v is string => !!v)),
  ).sort();
  const countries = Array.from(
    new Set(
      leads
        .map((l) => (l as { country?: string | null }).country?.trim())
        .filter((v): v is string => !!v),
    ),
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const fromTs = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : null;
  const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

  const isQuizLead = (l: (typeof leads)[number]) => {
    const src = (l.source ?? "").toLowerCase();
    const qa = (l as { quiz_answers?: unknown }).quiz_answers;
    return (
      src.includes("quiz") ||
      (qa != null && (Array.isArray(qa) ? qa.length > 0 : Object.keys(qa as object).length > 0))
    );
  };

  const filtered = leads
    .filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (intentFilter !== "all" && (l.intent ?? "") !== intentFilter) return false;
      if (sourceFilter !== "all" && (l.source ?? "") !== sourceFilter) return false;
      if (
        countryFilter !== "all" &&
        ((l as { country?: string | null }).country ?? "") !== countryFilter
      )
        return false;
      if (remindersOnly && !(l as { follow_up_at?: string | null }).follow_up_at) return false;
      if (quizOnly && !isQuizLead(l)) return false;
      const ts = new Date(l.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.confirmation_code?.toLowerCase().includes(q) ||
        l.intent?.toLowerCase().includes(q) ||
        l.service?.toLowerCase().includes(q) ||
        (l as { country?: string | null }).country?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aq = isQuizLead(a);
      const bq = isQuizLead(b);
      const at = aq ? new Date(a.created_at).getTime() : -Infinity;
      const bt = bq ? new Date(b.created_at).getTime() : -Infinity;
      return sortBy === "quiz_desc" ? bt - at : at - bt;
    });

  const filtersActive =
    search !== "" ||
    statusFilter !== "all" ||
    intentFilter !== "all" ||
    sourceFilter !== "all" ||
    countryFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    remindersOnly ||
    quizOnly;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setIntentFilter("all");
    setSourceFilter("all");
    setCountryFilter("all");
    setDateFrom("");
    setDateTo("");
    setRemindersOnly(false);
    setQuizOnly(false);
  };

  // ---- Saved filters (cloud-synced across devices, per user) ----
  type SavedFilter = {
    id: string;
    name: string;
    search: string;
    statusFilter: string;
    intentFilter: string;
    sourceFilter: string;
    countryFilter?: string;
    dateFrom: string;
    dateTo: string;
    remindersOnly: boolean;
  };
  const SAVED_KEY = "cliniga.admin.savedFilters.v1";
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savedFiltersSyncing, setSavedFiltersSyncing] = useState(false);

  // Load from cloud (with one-time migration of any legacy localStorage entries)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSavedFiltersSyncing(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) return;

        const { data, error } = await supabase
          .from("saved_filters")
          .select("id, name, filters, updated_at")
          .order("updated_at", { ascending: false });
        if (error) throw error;

        const remote: SavedFilter[] = (data ?? []).map((row: any) => ({
          id: row.id as string,
          name: row.name as string,
          ...(row.filters as Omit<SavedFilter, "id" | "name">),
        }));

        // One-time migration: push any legacy local filters up, then clear local
        try {
          const raw = localStorage.getItem(SAVED_KEY);
          if (raw) {
            const legacy = JSON.parse(raw) as SavedFilter[];
            const existingNames = new Set(remote.map((r) => r.name));
            const toMigrate = legacy.filter((l) => !existingNames.has(l.name));
            if (toMigrate.length > 0) {
              const rows = toMigrate.map(({ id: _id, name, ...rest }) => ({
                user_id: uid,
                name,
                filters: rest,
              }));
              const { data: inserted } = await supabase
                .from("saved_filters")
                .insert(rows)
                .select("id, name, filters");
              if (inserted) {
                for (const row of inserted as any[]) {
                  remote.unshift({
                    id: row.id,
                    name: row.name,
                    ...(row.filters as Omit<SavedFilter, "id" | "name">),
                  });
                }
              }
            }
            localStorage.removeItem(SAVED_KEY);
          }
        } catch {
          /* ignore migration errors */
        }

        if (!cancelled) setSavedFilters(remote);
      } catch (e) {
        console.error("Kaydedilmiş filtreler yüklenemedi", e);
      } finally {
        if (!cancelled) setSavedFiltersSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveCurrentFilter = async () => {
    if (!filtersActive) {
      toast.error("Kaydedilecek aktif filtre yok");
      return;
    }
    const name = window.prompt("Filtre adı", "Yeni filtre")?.trim();
    if (!name) return;
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast.error("Oturum bulunamadı");
      return;
    }
    const payload = {
      search,
      statusFilter,
      intentFilter,
      sourceFilter,
      countryFilter,
      dateFrom,
      dateTo,
      remindersOnly,
    };
    const { data, error } = await supabase
      .from("saved_filters")
      .insert({ user_id: uid, name, filters: payload })
      .select("id, name, filters")
      .single();
    if (error || !data) {
      toast.error("Filtre kaydedilemedi");
      return;
    }
    const item: SavedFilter = {
      id: data.id as string,
      name: data.name as string,
      ...(data.filters as Omit<SavedFilter, "id" | "name">),
    };
    setSavedFilters((prev) => [item, ...prev].slice(0, 50));
    toast.success(`"${name}" kaydedildi ve senkronlandı`);
  };
  const applySavedFilter = (f: SavedFilter) => {
    setSearch(f.search);
    setStatusFilter(f.statusFilter);
    setIntentFilter(f.intentFilter);
    setSourceFilter(f.sourceFilter);
    setCountryFilter(f.countryFilter ?? "all");
    setDateFrom(f.dateFrom);
    setDateTo(f.dateTo);
    setRemindersOnly(f.remindersOnly);
  };
  const deleteSavedFilter = async (id: string) => {
    const prev = savedFilters;
    setSavedFilters(prev.filter((f) => f.id !== id));
    const { error } = await supabase.from("saved_filters").delete().eq("id", id);
    if (error) {
      setSavedFilters(prev);
      toast.error("Filtre silinemedi");
    }
  };

  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingFilterName, setEditingFilterName] = useState("");

  const startRenameFilter = (f: SavedFilter) => {
    setEditingFilterId(f.id);
    setEditingFilterName(f.name);
  };
  const cancelRenameFilter = () => {
    setEditingFilterId(null);
    setEditingFilterName("");
  };
  const commitRenameFilter = async (id: string) => {
    const name = editingFilterName.trim();
    if (!name) {
      toast.error("Ad boş olamaz");
      return;
    }
    const prev = savedFilters;
    if (prev.some((f) => f.id !== id && f.name === name)) {
      toast.error("Bu ad zaten kullanılıyor");
      return;
    }
    setSavedFilters(prev.map((f) => (f.id === id ? { ...f, name } : f)));
    setEditingFilterId(null);
    setEditingFilterName("");
    const { error } = await supabase.from("saved_filters").update({ name }).eq("id", id);
    if (error) {
      setSavedFilters(prev);
      toast.error("Yeniden adlandırılamadı");
    } else {
      toast.success("Filtre güncellendi");
    }
  };

  const updateSavedFilterToCurrent = async (id: string) => {
    const prev = savedFilters;
    const target = prev.find((f) => f.id === id);
    if (!target) return;
    const filters = {
      search,
      statusFilter,
      intentFilter,
      sourceFilter,
      countryFilter,
      dateFrom,
      dateTo,
      remindersOnly,
    };
    setSavedFilters(prev.map((f) => (f.id === id ? { ...f, ...filters } : f)));
    const { error } = await supabase.from("saved_filters").update({ filters }).eq("id", id);
    if (error) {
      setSavedFilters(prev);
      toast.error("Güncellenemedi");
    } else {
      toast.success("Filtre mevcut ayarlarla güncellendi");
    }
  };

  const exportSavedFilters = () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        filters: savedFilters.map(({ id: _id, ...rest }) => rest),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saved-filters-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${savedFilters.length} filtre dışa aktarıldı`);
    } catch {
      toast.error("Dışa aktarma başarısız");
    }
  };

  const importSavedFilters = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.filters)
          ? parsed.filters
          : [];
      if (list.length === 0) {
        toast.error("Geçerli filtre bulunamadı");
        return;
      }
      const existingNames = new Set(savedFilters.map((f) => f.name));
      const rows = list
        .filter((f) => f && typeof f.name === "string")
        .map((f) => {
          let name = f.name as string;
          while (existingNames.has(name)) name = `${name} (içe aktarıldı)`;
          existingNames.add(name);
          const { id: _id, name: _n, ...filters } = f;
          return { name, filters };
        });
      if (rows.length === 0) {
        toast.error("Geçerli filtre bulunamadı");
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        toast.error("Oturum bulunamadı");
        return;
      }
      const { data, error } = await supabase
        .from("saved_filters")
        .insert(rows.map((r) => ({ user_id: uid, name: r.name, filters: r.filters })))
        .select("id, name, filters");
      if (error) {
        toast.error("İçe aktarma başarısız");
        return;
      }
      const added: SavedFilter[] = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        ...(row.filters as Omit<SavedFilter, "id" | "name">),
      }));
      setSavedFilters((prev) => [...added, ...prev].slice(0, 50));
      toast.success(`${added.length} filtre içe aktarıldı`);
    } catch {
      toast.error("Dosya okunamadı");
    }
  };

  const [csvPreview, setCsvPreview] = useState<{
    cols: string[];
    rows: string[][];
    text: string;
    count: number;
  } | null>(null);

  const [selectedCsvCols, setSelectedCsvCols] = useState<string[]>(() => [...CSV_ALL_COLS]);

  // Restore column selection from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminLeads.csvCols.v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (c): c is string =>
              typeof c === "string" && (CSV_ALL_COLS as readonly string[]).includes(c),
          );
          if (valid.length > 0) setSelectedCsvCols(valid);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistCsvCols = (next: string[]) => {
    setSelectedCsvCols(next);
    try {
      localStorage.setItem("adminLeads.csvCols.v1", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggleCsvCol = (col: string) => {
    const has = selectedCsvCols.includes(col);
    const next = has
      ? selectedCsvCols.filter((c) => c !== col)
      : [...CSV_ALL_COLS].filter((c) => selectedCsvCols.includes(c) || c === col);
    persistCsvCols(next);
  };

  const buildCsv = (cols: readonly string[]) => {
    const escCsv = (v: unknown): string => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " | ")}"`;
    };
    const fmtTs = (iso?: string | null) => {
      if (!iso) return "";
      try {
        return format(new Date(iso), "yyyy-MM-dd HH:mm:ss");
      } catch {
        return iso;
      }
    };
    const fmtDuration = (ms: number) => {
      if (!isFinite(ms) || ms <= 0) return "";
      const s = Math.round(ms / 1000);
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m > 0 ? `${m}dk ${r}sn` : `${r}sn`;
    };
    const buildQuizFields = (raw: unknown) => {
      if (!Array.isArray(raw) || raw.length === 0) {
        return { count: "", startedAt: "", completedAt: "", duration: "", timeline: "", json: "" };
      }
      const items = [...(raw as QuizAnswer[])].sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
      const times = items
        .map((a) => (a.at ? new Date(a.at).getTime() : NaN))
        .filter((n) => !isNaN(n));
      const startedAt = times.length ? new Date(Math.min(...times)).toISOString() : null;
      const completedAt = times.length ? new Date(Math.max(...times)).toISOString() : null;
      const duration = times.length >= 2 ? Math.max(...times) - Math.min(...times) : 0;
      const timeline = items
        .map((a, i) => {
          const t = a.at ? fmtTs(a.at) : "--";
          const step = a.step ?? i;
          const key = a.key ?? "step";
          return `[${t}] #${step} · ${key}\n  S: ${a.question}\n  C: ${a.answer}`;
        })
        .join("\n---\n");
      return {
        count: String(items.length),
        startedAt: fmtTs(startedAt),
        completedAt: fmtTs(completedAt),
        duration: fmtDuration(duration),
        timeline,
        json: JSON.stringify(items),
      };
    };
    const rows: string[][] = filtered.map((l) => {
      const rec = l as Record<string, unknown>;
      const q = buildQuizFields(rec.quiz_answers);
      const derived: Record<string, unknown> = {
        quiz_answers_count: q.count,
        quiz_started_at: q.startedAt,
        quiz_completed_at: q.completedAt,
        quiz_duration: q.duration,
        quiz_timeline: q.timeline,
        quiz_answers_json: q.json,
      };
      return cols.map((c) => {
        const raw = c in derived ? derived[c] : rec[c];
        if (raw === null || raw === undefined) return "";
        return typeof raw === "string" ? raw : JSON.stringify(raw);
      });
    });
    const text =
      "\ufeff" + [cols.join(","), ...rows.map((r) => r.map(escCsv).join(","))].join("\n");
    return { cols: [...cols], rows, text, count: rows.length };
  };

  const openCsvPreview = () => {
    if (filtered.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok");
      return;
    }
    setCsvPreview(buildCsv(selectedCsvCols));
  };

  // Recompute preview whenever the column selection changes while modal is open.
  useEffect(() => {
    if (!csvPreview) return;
    setCsvPreview(buildCsv(selectedCsvCols));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCsvCols]);

  const downloadCsvFromPreview = () => {
    if (!csvPreview) return;
    if (csvPreview.cols.length === 0) {
      toast.error("En az bir kolon seçmelisiniz");
      return;
    }
    const blob = new Blob([csvPreview.text], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = format(new Date(), "yyyyMMdd-HHmm");
    a.href = url;
    a.download = `leads-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${csvPreview.count} kayıt dışa aktarıldı`);
    setCsvPreview(null);
  };

  if (query.isError) {
    return (
      <div className="container-prose py-20 text-center">
        <p className="text-destructive">Erişim reddedildi. Bu hesabın admin rolü yok.</p>
        <Button onClick={handleSignOut} className="mt-4">
          Çıkış yap
        </Button>
      </div>
    );
  }

  return (
    <section className="container-prose py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Lead Yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toplam {leads.length} kayıt · Gösterilen {filtered.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/seo">
              <Search className="mr-1.5 h-4 w-4" />
              Indeksleme İzleme
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/audit">Güvenlik Denetimi</Link>
          </Button>

          <NotificationPreview sample label="Test bildirimi önizle" variant="outline" size="sm" />

          <Button variant="outline" size="sm" onClick={() => router.invalidate()}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Çıkış
          </Button>
        </div>
      </div>

      <TrendAlertWidget onIntentClick={openIntentDrillDown} />

      <div className="mb-4 flex justify-end">
        <AnalyticsExport leads={leads} />
      </div>

      <div className="mb-6">
        <IntentAnalytics leads={leads} onIntentClick={openIntentDrillDown} />
      </div>

      <div className="mb-6">
        <AlertHistory onIntentClick={(intent: string) => openIntentDrillDown(intent)} />
      </div>

      <div className="mb-6">
        <SourceBreakdown
          leads={leads}
          onSourceClick={(src) => {
            setSourceFilter(src);
            setIntentFilter("all");
            setStatusFilter("all");
            setSearch("");
            setDateFrom("");
            setDateTo("");
            setRemindersOnly(false);
            setTimeout(() => {
              const el = document.getElementById("leads-list");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
          }}
        />
      </div>

      <RemindersPanel leads={leads} />

      <div className="mb-4 rounded-lg border border-border/60 bg-muted/40 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Kayıtlı filtreler</span>
            <span className="text-xs text-muted-foreground">
              ({savedFilters.length})
              {savedFiltersSyncing ? " · senkronlanıyor…" : " · hesabınıza bağlı"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={savedFilterSearch}
                onChange={(e) => setSavedFilterSearch(e.target.value)}
                placeholder="Filtre adı ara..."
                className="h-8 w-44 pl-8 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentFilter}
              disabled={!filtersActive}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Mevcut filtreyi kaydet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportSavedFilters}
              disabled={savedFilters.length === 0}
              title="JSON olarak indir"
            >
              <Download className="mr-1.5 h-4 w-4" />
              JSON dışa aktar
            </Button>
            <label className="inline-flex">
              <Button variant="outline" size="sm" asChild title="JSON dosyasından içe aktar">
                <span className="cursor-pointer">
                  <Upload className="mr-1.5 h-4 w-4" />
                  JSON içe aktar
                </span>
              </Button>
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) importSavedFilters(file);
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedFilters.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              henüz kaydedilmiş filtre yok
            </span>
          )}
          {savedFilters
            .filter((f) => f.name.toLowerCase().includes(savedFilterSearch.toLowerCase()))
            .map((f) => (
              <span
                key={f.id}
                className="group inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 text-xs text-teal"
              >
                {editingFilterId === f.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editingFilterName}
                      onChange={(e) => setEditingFilterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRenameFilter(f.id);
                        else if (e.key === "Escape") cancelRenameFilter();
                      }}
                      className="h-6 w-32 px-1.5 py-0 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => commitRenameFilter(f.id)}
                      className="rounded-full p-0.5 opacity-70 hover:bg-teal/20 hover:opacity-100"
                      aria-label="Kaydet"
                      title="Kaydet"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRenameFilter}
                      className="rounded-full p-0.5 opacity-70 hover:bg-teal/20 hover:opacity-100"
                      aria-label="İptal"
                      title="İptal"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="font-medium hover:underline"
                      onClick={() => applySavedFilter(f)}
                      title="Uygula"
                    >
                      {f.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => startRenameFilter(f)}
                      className="rounded-full p-0.5 opacity-60 hover:bg-teal/20 hover:opacity-100"
                      aria-label="Yeniden adlandır"
                      title="Yeniden adlandır"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSavedFilterToCurrent(f.id)}
                      disabled={!filtersActive}
                      className="rounded-full p-0.5 opacity-60 hover:bg-teal/20 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Mevcut ayarlarla güncelle"
                      title="Mevcut ayarlarla güncelle"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedFilter(f.id)}
                      className="rounded-full p-0.5 opacity-60 hover:bg-teal/20 hover:opacity-100"
                      aria-label="Sil"
                      title="Sil"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
              </span>
            ))}

          {savedFilterSearch &&
            savedFilters.filter((f) =>
              f.name.toLowerCase().includes(savedFilterSearch.toLowerCase()),
            ).length === 0 && (
              <span className="text-xs text-muted-foreground italic">
                eşleşen filtre bulunamadı
              </span>
            )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta, telefon, kod..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={intentFilter} onValueChange={setIntentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="İhtiyaç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm ihtiyaçlar</SelectItem>
            {intents.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kaynak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kaynaklar</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ülke" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm ülkeler</SelectItem>
            {countries.length === 0 ? (
              <SelectItem value="__none" disabled>
                Ülke bilgisi yok
              </SelectItem>
            ) : (
              countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Baş.</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Bit.</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>
        <Button
          variant={remindersOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setRemindersOnly((v) => !v)}
        >
          <Bell className="mr-1.5 h-4 w-4" />
          Hatırlatmalı
        </Button>
        <Button
          variant={quizOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setQuizOnly((v) => !v)}
          title="Sadece quiz'i tamamlayan lead'ler"
        >
          <ClipboardList className="mr-1.5 h-4 w-4" />
          Quiz tamamlayanlar
        </Button>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[210px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quiz_desc">Quiz tarihi ↓ (yeni)</SelectItem>
            <SelectItem value="quiz_asc">Quiz tarihi ↑ (eski)</SelectItem>
          </SelectContent>
        </Select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Temizle
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={openCsvPreview} className="ml-auto">
          <Download className="mr-1.5 h-4 w-4" />
          CSV indir ({filtered.length})
        </Button>
      </div>

      {(() => {
        const filteredIds = filtered.map((l) => l.id);
        const allSelected =
          filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
        const someSelected = filteredIds.some((id) => selectedIds.has(id));
        const toggleAll = () => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) filteredIds.forEach((id) => next.delete(id));
            else filteredIds.forEach((id) => next.add(id));
            return next;
          });
        };
        return (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-2.5">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={toggleAll}
              aria-label="Tümünü seç"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} seçili`
                : `Görünen ${filteredIds.length} kaydı seç`}
            </span>
            {selectedIds.size > 0 && (
              <>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as Status)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => {
                      const ids = Array.from(selectedIds);
                      if (
                        !window.confirm(
                          `${ids.length} kaydın durumunu "${bulkStatus}" olarak güncellemek istiyor musunuz?`,
                        )
                      )
                        return;
                      bulkMutation.mutate({ ids, status: bulkStatus });
                    }}
                    disabled={bulkMutation.isPending}
                  >
                    <CheckSquare className="mr-1.5 h-4 w-4" />
                    {bulkMutation.isPending ? "Uygulanıyor…" : "Toplu uygula"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                    <X className="mr-1.5 h-4 w-4" />
                    Seçimi temizle
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {query.isLoading && <p className="text-sm text-muted-foreground">Yükleniyor…</p>}

      <div id="leads-list" className="space-y-3">
        {filtered.map((lead) => (
          <Card
            key={lead.id}
            id={`lead-${lead.id}`}
            className={`border-border/70 transition-shadow ${selectedIds.has(lead.id) ? "ring-2 ring-teal/50" : ""} ${highlightId === lead.id ? "ring-2 ring-gold shadow-lg" : ""}`}
          >
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <Checkbox
                  className="mt-1.5"
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={(v) => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (v) next.add(lead.id);
                      else next.delete(lead.id);
                      return next;
                    });
                  }}
                  aria-label={`${lead.name} seç`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-navy">{lead.name}</h3>
                    <Badge variant="outline" className={statusColor[lead.status as Status] ?? ""}>
                      {lead.status}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {lead.confirmation_code}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 hover:text-teal"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {lead.email}
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 hover:text-teal"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {lead.phone}
                    </a>
                    {lead.appointment_at && (
                      <span className="flex items-center gap-1 text-gold">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(lead.appointment_at), "d MMM yyyy · HH:mm")}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {lead.service && (
                      <span>
                        Hizmet: <b>{lead.service}</b>
                      </span>
                    )}
                    {lead.level && (
                      <span>
                        Seviye: <b>{lead.level}</b>
                      </span>
                    )}
                    {lead.country && (
                      <span>
                        Ülke: <b>{lead.country}</b>
                      </span>
                    )}
                    {lead.intent && (
                      <span>
                        İhtiyaç: <b>{lead.intent}</b>
                      </span>
                    )}
                    {lead.source && (
                      <span>
                        Kaynak: <b>{lead.source}</b>
                      </span>
                    )}
                    {lead.deadline && (
                      <span>
                        Deadline: <b>{lead.deadline}</b>
                      </span>
                    )}
                    {lead.language && (
                      <span>
                        Dil: <b>{lead.language}</b>
                      </span>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm text-foreground">
                    {lead.message}
                  </p>
                  <QuizAnswersBlock answers={lead.quiz_answers} />
                  <FollowUpEditor lead={lead} />
                  <div className="mt-2">
                    <NotificationPreview
                      lead={
                        lead as unknown as import("@/components/admin/NotificationPreview").PreviewLead
                      }
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {format(new Date(lead.created_at), "d MMM yyyy · HH:mm")}
                  </p>
                </div>
                <Select
                  value={lead.status}
                  onValueChange={(v) => mutation.mutate({ id: lead.id, status: v as Status })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
        {!query.isLoading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Kayıt bulunamadı.</p>
        )}
      </div>

      <Dialog open={intentDrillDown !== null} onOpenChange={(o) => !o && setIntentDrillDown(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-navy">
              Quiz Lead'leri · {intentDrillDown}
            </DialogTitle>
            <DialogDescription>
              Bu ihtiyaç için quiz kaynağından gelen tüm kayıtlar.
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const rows = leads
              .filter(
                (l) =>
                  l.source === "quiz" && (l.intent?.trim() || "Belirtilmemiş") === intentDrillDown,
              )
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (rows.length === 0) {
              return (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Bu ihtiyaç için quiz kaydı yok.
                </p>
              );
            }
            return (
              <div className="max-h-[60vh] overflow-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Ad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(l.created_at), "dd.MM.yy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-xs">{l.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColor[l.status as Status] ?? ""}
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{l.confirmation_code}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => goToLead(l.id, l.intent)}
                          >
                            Detay
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!csvPreview} onOpenChange={(o) => !o && setCsvPreview(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>CSV önizleme</DialogTitle>
            <DialogDescription>
              {csvPreview
                ? `${csvPreview.count} kayıt · ${csvPreview.cols.length} kolon · ilk ${Math.min(5, csvPreview.rows.length)} satır gösteriliyor`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {csvPreview && (
            <>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kolonlar ({selectedCsvCols.length}/{CSV_ALL_COLS.length})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => persistCsvCols([...CSV_ALL_COLS])}
                    >
                      Tümünü seç
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => persistCsvCols([])}
                    >
                      Temizle
                    </Button>
                  </div>
                </div>
                <div className="grid max-h-40 grid-cols-2 gap-x-4 gap-y-1.5 overflow-auto sm:grid-cols-3 md:grid-cols-4">
                  {CSV_ALL_COLS.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 text-xs">
                      <Checkbox
                        checked={selectedCsvCols.includes(c)}
                        onCheckedChange={() => toggleCsvCol(c)}
                      />
                      <span className="truncate" title={c}>
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {csvPreview.cols.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  En az bir kolon seçin.
                </div>
              ) : (
                <div className="max-h-[45vh] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {csvPreview.cols.map((c) => (
                          <TableHead key={c} className="whitespace-nowrap text-xs">
                            {c}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreview.rows.slice(0, 5).map((r, i) => (
                        <TableRow key={i}>
                          {r.map((cell, j) => (
                            <TableCell
                              key={j}
                              className="max-w-[240px] truncate whitespace-nowrap text-xs"
                              title={cell}
                            >
                              {cell || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {csvPreview.rows.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  … ve {csvPreview.rows.length - 5} kayıt daha CSV içinde yer alacak.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setCsvPreview(null)}>
                  Vazgeç
                </Button>
                <Button onClick={downloadCsvFromPreview} disabled={csvPreview.cols.length === 0}>
                  <Download className="mr-1.5 h-4 w-4" />
                  İndir ({csvPreview.count})
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

type QuizAnswer = {
  step: number;
  question: string;
  answer: string;
  answerIndex?: number | null;
  key?: string | null;
  at?: string | null;
};

function QuizAnswersBlock({ answers }: { answers: unknown }) {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(answers) ? (answers as QuizAnswer[]) : [];
  const isEmpty = list.length === 0;
  const items = [...list].sort((a, b) => (a.step ?? 0) - (b.step ?? 0));

  return (
    <div className="mt-3 rounded-md border border-teal/30 bg-teal/5 text-sm">
      <button
        type="button"
        onClick={() => !isEmpty && setOpen((v) => !v)}
        disabled={isEmpty}
        className="flex w-full items-center gap-2 rounded-md p-3 text-left font-medium text-teal disabled:cursor-default disabled:opacity-70"
        aria-expanded={open && !isEmpty}
      >
        <ClipboardList className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">
          {isEmpty ? "Quiz cevapları" : `Quiz cevapları (${items.length})`}
        </span>
        {!isEmpty && (
          <span className={`transition-transform text-xs ${open ? "rotate-180" : ""}`} aria-hidden>
            ▼
          </span>
        )}
      </button>

      {isEmpty ? (
        <div className="px-3 pb-3 -mt-1 text-xs text-muted-foreground italic">
          Bu lead quiz’i tamamlamamış — cevap kaydı bulunmuyor.
        </div>
      ) : (
        open && (
          <ol className="space-y-2 border-l-2 border-teal/30 px-3 pb-3 pl-6 ml-3">
            {items.map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-teal" />
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  #{a.step ?? i} · {a.key ?? "step"}
                  {a.at && (
                    <span className="ml-2 font-normal normal-case tracking-normal">
                      {format(new Date(a.at), "HH:mm:ss")}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-foreground">{a.question}</div>
                <div className="mt-0.5 font-medium text-navy">→ {a.answer}</div>
              </li>
            ))}
          </ol>
        )
      )}
    </div>
  );
}

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  confirmation_code: string;
  follow_up_at?: string | null;
  follow_up_note?: string | null;
};

function RemindersPanel({ leads }: { leads: unknown[] }) {
  const now = Date.now();
  const upcoming = (leads as LeadRow[])
    .filter((l) => !!l.follow_up_at)
    .map((l) => ({ ...l, ts: new Date(l.follow_up_at as string).getTime() }))
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 20);

  if (upcoming.length === 0) return null;

  const overdueCount = upcoming.filter((l) => l.ts < now).length;

  return (
    <details open className="mb-6 rounded-lg border border-gold/40 bg-gold/5 p-4">
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-navy">
        <BellRing className="h-4 w-4 text-gold" />
        Hatırlatmalar ({upcoming.length})
        {overdueCount > 0 && (
          <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-700">
            {overdueCount} gecikmiş
          </Badge>
        )}
      </summary>
      <ul className="mt-3 space-y-2">
        {upcoming.map((l) => {
          const overdue = l.ts < now;
          return (
            <li
              key={l.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${
                overdue ? "border-red-500/40 bg-red-500/5" : "border-border/60 bg-background"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className={`h-3.5 w-3.5 ${overdue ? "text-red-600" : "text-gold"}`} />
                <span className="font-medium text-navy">
                  {format(new Date(l.follow_up_at as string), "d MMM yyyy · HH:mm")}
                </span>
                <span className="text-muted-foreground">·</span>
                <span>{l.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {l.confirmation_code}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {l.follow_up_note && (
                  <span className="max-w-[280px] truncate italic">"{l.follow_up_note}"</span>
                )}
                <a href={`mailto:${l.email}`} className="hover:text-teal">
                  <Mail className="h-3.5 w-3.5" />
                </a>
                <a href={`tel:${l.phone}`} className="hover:text-teal">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function FollowUpEditor({ lead }: { lead: unknown }) {
  const l = lead as LeadRow;
  const saveFn = useServerFn(updateLeadFollowUp);
  const queryClient = useQueryClient();
  const [when, setWhen] = useState<string>(toLocalInput(l.follow_up_at));
  const [note, setNote] = useState<string>(l.follow_up_note ?? "");

  const mutation = useMutation({
    mutationFn: (vars: { followUpAt: string | null; followUpNote: string | null }) =>
      saveFn({ data: { id: l.id, ...vars } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Hatırlatma kaydedildi");
    },
    onError: () => toast.error("Kaydedilemedi"),
  });

  const save = () => {
    const iso = when ? new Date(when).toISOString() : null;
    mutation.mutate({
      followUpAt: iso,
      followUpNote: note.trim() ? note.trim() : null,
    });
  };

  const clear = () => {
    setWhen("");
    setNote("");
    mutation.mutate({ followUpAt: null, followUpNote: null });
  };

  const hasReminder = !!l.follow_up_at;

  return (
    <div
      className={`mt-3 rounded-md border p-3 ${
        hasReminder ? "border-gold/40 bg-gold/5" : "border-border/60 bg-muted/20"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Bell className="h-3.5 w-3.5" />
        Takip / Hatırlatma
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Tarih & saat</label>
          <Input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-[220px]"
          />
        </div>
        <div className="flex flex-1 flex-col min-w-[220px]">
          <label className="text-xs text-muted-foreground">Not</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Aramadan önce vize dosyasını gözden geçir"
            maxLength={1000}
          />
        </div>
        <Button size="sm" onClick={save} disabled={mutation.isPending}>
          <Save className="mr-1.5 h-4 w-4" />
          {mutation.isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {hasReminder && (
          <Button size="sm" variant="ghost" onClick={clear} disabled={mutation.isPending}>
            <X className="mr-1.5 h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
