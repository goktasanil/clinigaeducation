/* eslint-disable @typescript-eslint/no-explicit-any -- New portal journey tables are deployed ahead of generated Supabase types. */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  GraduationCap,
  ListChecks,
  Loader2,
  Plus,
  Route,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const APPLICATION_STATUSES = [
  ["draft", "Taslak"],
  ["documents", "Belgeler"],
  ["ready", "Hazır"],
  ["submitted", "Gönderildi"],
  ["under_review", "İncelemede"],
  ["offer", "Teklif"],
  ["accepted", "Kabul"],
  ["rejected", "Reddedildi"],
  ["withdrawn", "Geri çekildi"],
] as const;

type ApplicationStatus = (typeof APPLICATION_STATUSES)[number][0];

type PortalApplication = {
  id: string;
  institution_id: string | null;
  institution_name: string;
  program_name: string | null;
  country_code: string | null;
  intake: string | null;
  status: ApplicationStatus;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  notes: string | null;
  created_at: string;
};

type PortalTask = {
  id: string;
  title: string;
  category: "application" | "document" | "visa" | "housing" | "arrival" | "general";
  due_at: string | null;
  status: "todo" | "in_progress" | "done" | "snoozed";
  priority: "low" | "medium" | "high";
  related_application_id: string | null;
};

type PortalDocument = {
  id: string;
  category: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  review_status: string;
  application_id: string | null;
  expires_at: string | null;
  created_at: string;
};

type JourneyData = {
  applications: PortalApplication[];
  tasks: PortalTask[];
  documents: PortalDocument[];
};

const JOURNEY_STAGES = [
  { id: "discover", label: "Keşif" },
  { id: "shortlist", label: "Kısa liste" },
  { id: "documents", label: "Belgeler" },
  { id: "apply", label: "Başvuru" },
  { id: "offer", label: "Teklif" },
  { id: "visa", label: "Vize" },
  { id: "housing", label: "Konaklama" },
  { id: "arrival", label: "Varış" },
] as const;

const DOCUMENT_CATEGORIES = [
  ["passport", "Pasaport"],
  ["transcript", "Transkript"],
  ["diploma", "Diploma"],
  ["language_certificate", "Dil belgesi"],
  ["cv", "CV"],
  ["motivation_letter", "Niyet mektubu"],
  ["recommendation", "Referans mektubu"],
  ["financial_proof", "Finansal belge"],
  ["visa_document", "Vize belgesi"],
  ["other", "Diğer"],
] as const;

const allowedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxDocumentBytes = 8 * 1024 * 1024;

function dateLabel(value: string | null) {
  if (!value) return "Tarih yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function deadlineDistance(value: string | null) {
  if (!value) return null;
  const deadline = new Date(value).getTime();
  if (Number.isNaN(deadline)) return null;
  return Math.ceil((deadline - Date.now()) / 86_400_000);
}

function statusLabel(status: ApplicationStatus) {
  return APPLICATION_STATUSES.find(([value]) => value === status)?.[1] ?? status;
}

function deriveJourney(data: JourneyData) {
  const activeApplications = data.applications.filter(
    (item) => !["rejected", "withdrawn"].includes(item.status),
  );
  const hasApplications = activeApplications.length > 0;
  const hasDocuments = data.documents.length > 0;
  const hasSubmitted = activeApplications.some((item) =>
    ["submitted", "under_review", "offer", "accepted"].includes(item.status),
  );
  const hasOffer = activeApplications.some((item) => ["offer", "accepted"].includes(item.status));
  const visaDone = data.tasks.some((item) => item.category === "visa" && item.status === "done");
  const housingDone = data.tasks.some(
    (item) => item.category === "housing" && item.status === "done",
  );
  const arrivalDone = data.tasks.some(
    (item) => item.category === "arrival" && item.status === "done",
  );

  const completed = new Set<string>();
  if (hasApplications || data.documents.length || data.tasks.length) completed.add("discover");
  if (hasApplications) completed.add("shortlist");
  if (hasDocuments) completed.add("documents");
  if (hasSubmitted) completed.add("apply");
  if (hasOffer) completed.add("offer");
  if (visaDone) completed.add("visa");
  if (housingDone) completed.add("housing");
  if (arrivalDone) completed.add("arrival");

  const doneCount = JOURNEY_STAGES.filter((stage) => completed.has(stage.id)).length;
  return { completed, progress: Math.round((doneCount / JOURNEY_STAGES.length) * 100) };
}

async function fetchJourneyData(): Promise<JourneyData> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Oturum bulunamadı.");
  const db = supabase as any;
  const [applications, tasks, documents] = await Promise.all([
    db
      .from("portal_applications")
      .select(
        "id, institution_id, institution_name, program_name, country_code, intake, status, deadline, priority, notes, created_at",
      )
      .order("created_at", { ascending: false }),
    db
      .from("portal_tasks")
      .select("id, title, category, due_at, status, priority, related_application_id")
      .order("due_at", { ascending: true, nullsFirst: false }),
    db
      .from("portal_documents")
      .select(
        "id, category, file_name, storage_path, mime_type, size_bytes, review_status, application_id, expires_at, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);
  if (applications.error) throw applications.error;
  if (tasks.error) throw tasks.error;
  if (documents.error) throw documents.error;
  return {
    applications: (applications.data ?? []) as PortalApplication[],
    tasks: (tasks.data ?? []) as PortalTask[],
    documents: (documents.data ?? []) as PortalDocument[],
  };
}

export function PortalJourneyWorkspace() {
  const queryClient = useQueryClient();
  const journey = useQuery({
    queryKey: ["portal-journey-workspace"],
    queryFn: fetchJourneyData,
    staleTime: 20_000,
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    institutionName: "",
    programName: "",
    countryCode: "",
    intake: "",
    deadline: "",
  });
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [documentCategory, setDocumentCategory] = useState("passport");
  const [documentExpiry, setDocumentExpiry] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const data = journey.data ?? { applications: [], tasks: [], documents: [] };
  const journeyState = useMemo(() => deriveJourney(data), [data]);
  const openTasks = useMemo(
    () => data.tasks.filter((task) => task.status !== "done"),
    [data.tasks],
  );
  const nextTask = openTasks.find((task) => task.due_at) ?? openTasks[0] ?? null;
  const nextApplicationDeadline = useMemo(
    () =>
      data.applications
        .filter((item) => item.deadline && !["rejected", "withdrawn", "accepted"].includes(item.status))
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0] ?? null,
    [data.applications],
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["portal-journey-workspace"] });

  const createApplication = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Oturum bulunamadı.");
      if (applicationForm.institutionName.trim().length < 2) {
        throw new Error("Kurum adını yazın.");
      }
      const db = supabase as any;
      const { error } = await db.from("portal_applications").insert({
        user_id: auth.user.id,
        institution_name: applicationForm.institutionName.trim(),
        program_name: applicationForm.programName.trim() || null,
        country_code: applicationForm.countryCode.trim().toUpperCase() || null,
        intake: applicationForm.intake.trim() || null,
        deadline: applicationForm.deadline
          ? new Date(`${applicationForm.deadline}T12:00:00`).toISOString()
          : null,
        status: "draft",
        priority: "medium",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setApplicationForm({
        institutionName: "",
        programName: "",
        countryCode: "",
        intake: "",
        deadline: "",
      });
      setShowApplicationForm(false);
      void refresh();
      toast.success("Başvuru çalışma alanına eklendi.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Başvuru eklenemedi."),
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const db = supabase as any;
      const { error } = await db
        .from("portal_applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void refresh(),
    onError: () => toast.error("Başvuru durumu güncellenemedi."),
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Oturum bulunamadı.");
      if (!taskTitle.trim()) throw new Error("Görev başlığı yazın.");
      const db = supabase as any;
      const { error } = await db.from("portal_tasks").insert({
        user_id: auth.user.id,
        title: taskTitle.trim(),
        category: "general",
        due_at: taskDueAt ? new Date(`${taskDueAt}T12:00:00`).toISOString() : null,
        status: "todo",
        priority: "medium",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTaskTitle("");
      setTaskDueAt("");
      void refresh();
      toast.success("Görev eklendi.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Görev eklenemedi."),
  });

  const completeTask = useMutation({
    mutationFn: async (id: string) => {
      const db = supabase as any;
      const { error } = await db
        .from("portal_tasks")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void refresh(),
    onError: () => toast.error("Görev güncellenemedi."),
  });

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!documentFile) throw new Error("Belge seçin.");
      if (!allowedDocumentTypes.includes(documentFile.type)) {
        throw new Error("Yalnız PDF, JPG veya PNG yükleyebilirsiniz.");
      }
      if (documentFile.size > maxDocumentBytes) throw new Error("Belge en fazla 8 MB olabilir.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Oturum bulunamadı.");
      const extension =
        documentFile.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("portal-documents").upload(path, documentFile, {
        contentType: documentFile.type,
        upsert: false,
      });
      if (upload.error) throw upload.error;
      const db = supabase as any;
      const insert = await db.from("portal_documents").insert({
        user_id: auth.user.id,
        category: documentCategory,
        file_name: documentFile.name.slice(0, 240),
        storage_path: path,
        mime_type: documentFile.type,
        size_bytes: documentFile.size,
        review_status: "uploaded",
        expires_at: documentExpiry || null,
      });
      if (insert.error) {
        await supabase.storage.from("portal-documents").remove([path]);
        throw insert.error;
      }
    },
    onSuccess: () => {
      setDocumentFile(null);
      setDocumentExpiry("");
      void refresh();
      toast.success("Belge private dosya merkezine yüklendi.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Belge yüklenemedi."),
  });

  if (journey.isLoading) {
    return (
      <div className="mt-6 grid min-h-48 place-items-center rounded-3xl border bg-white" aria-live="polite">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-teal" />
          <p className="mt-3 text-sm text-muted-foreground">Yolculuğun hazırlanıyor…</p>
        </div>
      </div>
    );
  }

  if (journey.isError) {
    return (
      <Card className="mt-6 border-gold/30 bg-gold/5">
        <CardContent className="flex items-start gap-3 p-5 text-sm text-navy">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <strong>Yolculuk verileri şu anda alınamadı.</strong>
            <p className="mt-1 text-muted-foreground">
              Profil ve topluluk modüllerini kullanmaya devam edebilirsin. Biraz sonra tekrar dene.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextActionTitle = nextTask
    ? nextTask.title
    : data.applications.length === 0
      ? "İlk başvurunu çalışma alanına ekle"
      : data.documents.length === 0
        ? "Başvuru belgelerini güvenli dosya merkezine yükle"
        : "Başvuru durumlarını ve yaklaşan tarihleri kontrol et";

  return (
    <section id="journey-workspace" className="mt-6 scroll-mt-24" aria-labelledby="journey-title">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden border-0 bg-navy text-white shadow-xl shadow-navy/10">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  Next best action
                </p>
                <h2 id="journey-title" className="mt-2 max-w-2xl font-display text-2xl font-semibold md:text-3xl">
                  {nextActionTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                  Portal sana tüm menüyü değil, şu anda yolculuğunu en çok ilerletecek adımı öne çıkarır.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-right">
                <strong className="block text-2xl text-gold">%{journeyState.progress}</strong>
                <span className="text-xs text-white/55">genel ilerleme</span>
              </div>
            </div>
            <Progress value={journeyState.progress} className="mt-6 h-2 bg-white/10" />
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Öğrenci yolculuğu aşamaları">
              {JOURNEY_STAGES.map((stage) => {
                const done = journeyState.completed.has(stage.id);
                return (
                  <div key={stage.id} className="min-w-0 text-center">
                    <span
                      className={
                        "mx-auto grid h-8 w-8 place-items-center rounded-full border " +
                        (done
                          ? "border-teal bg-teal text-white"
                          : "border-white/20 bg-white/[0.05] text-white/45")
                      }
                    >
                      {done ? <Check className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                    </span>
                    <span className="mt-2 block truncate text-[10px] text-white/60">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal">Yaklaşan</p>
                <h3 className="mt-1 font-display text-xl font-semibold text-navy">Deadline radarın</h3>
              </div>
              <CalendarDays className="h-5 w-5 text-gold" />
            </div>
            {nextApplicationDeadline ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm text-navy">{nextApplicationDeadline.institution_name}</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {nextApplicationDeadline.program_name || "Program belirtilmedi"}
                    </span>
                  </div>
                  <Badge variant="outline">{dateLabel(nextApplicationDeadline.deadline)}</Badge>
                </div>
                {deadlineDistance(nextApplicationDeadline.deadline) !== null && (
                  <p className="mt-3 text-xs font-medium text-teal">
                    {deadlineDistance(nextApplicationDeadline.deadline)! >= 0
                      ? `${deadlineDistance(nextApplicationDeadline.deadline)} gün kaldı`
                      : "Tarih geçmiş görünüyor"}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed bg-slate-50 p-4 text-sm text-muted-foreground">
                Deadline eklediğinde en yakın tarih burada öne çıkacak.
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border p-3">
                <strong className="block text-xl text-navy">{data.applications.length}</strong>
                <span className="text-[11px] text-muted-foreground">başvuru</span>
              </div>
              <div className="rounded-xl border p-3">
                <strong className="block text-xl text-navy">{openTasks.length}</strong>
                <span className="text-[11px] text-muted-foreground">açık görev</span>
              </div>
              <div className="rounded-xl border p-3">
                <strong className="block text-xl text-navy">{data.documents.length}</strong>
                <span className="text-[11px] text-muted-foreground">belge</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="mt-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-white p-1.5">
          <TabsTrigger value="applications" className="min-h-11 gap-2 rounded-xl px-4">
            <GraduationCap className="h-4 w-4" /> Başvurular
          </TabsTrigger>
          <TabsTrigger value="tasks" className="min-h-11 gap-2 rounded-xl px-4">
            <ListChecks className="h-4 w-4" /> Görevler
          </TabsTrigger>
          <TabsTrigger value="documents" className="min-h-11 gap-2 rounded-xl px-4">
            <FileText className="h-4 w-4" /> Belgeler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold text-navy">Application tracker</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kurumlarını, başvuru aşamalarını ve deadline’larını tek yerde yönet.
                  </p>
                </div>
                <Button onClick={() => setShowApplicationForm((value) => !value)} className="bg-navy text-white hover:bg-navy/90">
                  <Plus className="mr-2 h-4 w-4" /> Başvuru ekle
                </Button>
              </div>

              {showApplicationForm && (
                <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-navy">
                    Üniversite / kurum
                    <input
                      value={applicationForm.institutionName}
                      onChange={(event) => setApplicationForm({ ...applicationForm, institutionName: event.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3"
                      maxLength={180}
                    />
                  </label>
                  <label className="text-sm font-medium text-navy">
                    Program
                    <input
                      value={applicationForm.programName}
                      onChange={(event) => setApplicationForm({ ...applicationForm, programName: event.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3"
                      maxLength={180}
                    />
                  </label>
                  <label className="text-sm font-medium text-navy">
                    Ülke kodu
                    <input
                      value={applicationForm.countryCode}
                      onChange={(event) => setApplicationForm({ ...applicationForm, countryCode: event.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 uppercase"
                      maxLength={2}
                      placeholder="DE"
                    />
                  </label>
                  <label className="text-sm font-medium text-navy">
                    Intake
                    <input
                      value={applicationForm.intake}
                      onChange={(event) => setApplicationForm({ ...applicationForm, intake: event.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3"
                      maxLength={80}
                      placeholder="Winter 2027"
                    />
                  </label>
                  <label className="text-sm font-medium text-navy">
                    Deadline
                    <input
                      type="date"
                      value={applicationForm.deadline}
                      onChange={(event) => setApplicationForm({ ...applicationForm, deadline: event.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3"
                    />
                  </label>
                  <div className="flex items-end">
                    <Button
                      onClick={() => createApplication.mutate()}
                      disabled={createApplication.isPending}
                      className="h-11 w-full bg-gold text-gold-foreground hover:bg-gold/90"
                    >
                      {createApplication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Çalışma alanına ekle
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {data.applications.length === 0 ? (
                  <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed bg-slate-50 p-6 text-center">
                    <div>
                      <GraduationCap className="mx-auto h-8 w-8 text-teal" />
                      <strong className="mt-3 block text-navy">Henüz takip edilen başvuru yok</strong>
                      <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        Bir kurum eklediğinde status, deadline ve belge hazırlığını burada takip edebilirsin.
                      </p>
                    </div>
                  </div>
                ) : (
                  data.applications.map((application) => (
                    <article key={application.id} className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-navy">{application.institution_name}</h4>
                          {application.country_code && <Badge variant="outline">{application.country_code}</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {application.program_name || "Program belirtilmedi"}
                          {application.intake ? ` · ${application.intake}` : ""}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-teal" /> {dateLabel(application.deadline)}</span>
                          <span>{statusLabel(application.status)}</span>
                        </div>
                      </div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Durum
                        <select
                          value={application.status}
                          onChange={(event) => updateApplication.mutate({ id: application.id, status: event.target.value as ApplicationStatus })}
                          className="mt-1 block h-10 min-w-40 rounded-xl border bg-white px-3 text-sm text-navy"
                        >
                          {APPLICATION_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </label>
                    </article>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div>
                <h3 className="font-display text-xl font-semibold text-navy">Bu hafta ne önemli?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Kısa, uygulanabilir görevler; gereksiz yapılacaklar listesi değil.</p>
              </div>
              <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]">
                <label className="text-sm font-medium text-navy">
                  Yeni görev
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3"
                    maxLength={180}
                    placeholder="Örn. Transkripti tercümeye gönder"
                  />
                </label>
                <label className="text-sm font-medium text-navy">
                  Tarih
                  <input type="date" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3" />
                </label>
                <div className="flex items-end">
                  <Button onClick={() => createTask.mutate()} disabled={createTask.isPending} className="h-11 w-full bg-navy text-white hover:bg-navy/90">
                    {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ekle
                  </Button>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {openTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Açık görevin yok. Bir sonraki deadline için görev ekleyebilirsin.
                  </div>
                ) : openTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                    <button
                      type="button"
                      onClick={() => completeTask.mutate(task.id)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-muted-foreground hover:border-teal hover:text-teal"
                      aria-label={`${task.title} görevini tamamla`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-navy">{task.title}</strong>
                      <span className="text-xs text-muted-foreground">{dateLabel(task.due_at)} · {task.category}</span>
                    </div>
                    {task.priority === "high" && <Badge className="bg-gold/15 text-navy hover:bg-gold/15">Öncelikli</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold"><ShieldCheck className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-navy">Private document center</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Başvuru belgeleri doğrulama belgelerinden ayrı, private storage alanında tutulur.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_1.2fr_auto]">
                <label className="text-sm font-medium text-navy">
                  Belge türü
                  <select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3">
                    {DOCUMENT_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-navy">
                  Geçerlilik sonu
                  <input type="date" value={documentExpiry} onChange={(event) => setDocumentExpiry(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3" />
                </label>
                <label className="text-sm font-medium text-navy">
                  Dosya
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                    className="mt-1.5 block min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex items-end">
                  <Button onClick={() => uploadDocument.mutate()} disabled={!documentFile || uploadDocument.isPending} className="h-11 w-full bg-gold text-gold-foreground hover:bg-gold/90">
                    {uploadDocument.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Yükle
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">PDF/JPG/PNG · en fazla 8 MB. Kart veya kimlik verisini açık linkle paylaşma; dosyalar public değildir.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.documents.length === 0 ? (
                  <div className="md:col-span-2 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Henüz başvuru belgesi yüklemedin.</div>
                ) : data.documents.map((document) => (
                  <article key={document.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block truncate text-sm text-navy">{document.file_name}</strong>
                        <span className="mt-1 block text-xs text-muted-foreground">{document.category} · {document.size_bytes ? `${Math.max(1, Math.round(document.size_bytes / 1024))} KB` : "boyut bilinmiyor"}</span>
                      </div>
                      <Badge variant="outline">{document.review_status}</Badge>
                    </div>
                    {document.expires_at && <p className="mt-3 text-xs text-muted-foreground">Geçerlilik: {dateLabel(document.expires_at)}</p>}
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal/20 bg-teal/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-navy"><Route className="h-4 w-4 text-teal" /> Yolculuk verilerin yalnız kendi hesabınla görünür; RLS ile kullanıcı sahipliği zorunludur.</span>
        <a href="/portal#kesfet" className="inline-flex items-center font-semibold text-teal hover:underline">Program keşfine dön <ArrowRight className="ml-1 h-4 w-4" /></a>
      </div>
    </section>
  );
}
