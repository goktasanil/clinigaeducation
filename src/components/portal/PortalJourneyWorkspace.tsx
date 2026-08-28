/* eslint-disable @typescript-eslint/no-explicit-any -- Portal journey tables are deployed ahead of generated Supabase types. */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
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
import { usePortalCopy } from "@/components/portal/portal-copy";

const APPLICATION_STATUS_VALUES = [
  "draft",
  "documents",
  "ready",
  "submitted",
  "under_review",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

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
  review_status: "private" | "submitted" | "reviewed" | "action_needed";
  application_id: string | null;
  expires_at: string | null;
  created_at: string;
};

type JourneyData = {
  applications: PortalApplication[];
  tasks: PortalTask[];
  documents: PortalDocument[];
};

const EMPTY_DATA: JourneyData = { applications: [], tasks: [], documents: [] };
const JOURNEY_STAGE_IDS = [
  "discover",
  "shortlist",
  "documents",
  "apply",
  "offer",
  "visa",
  "housing",
  "arrival",
] as const;
const DOCUMENT_CATEGORY_IDS = [
  "passport",
  "transcript",
  "diploma",
  "language_certificate",
  "cv",
  "motivation_letter",
  "recommendation",
  "financial_proof",
  "visa_document",
  "other",
] as const;
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

function dateLabel(value: string | null, locale: string, noDate: string) {
  if (!value) return noDate;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return noDate;
  return new Intl.DateTimeFormat(locale, {
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
  if (hasApplications || hasDocuments || data.tasks.length) completed.add("discover");
  if (hasApplications) completed.add("shortlist");
  if (hasDocuments) completed.add("documents");
  if (hasSubmitted) completed.add("apply");
  if (hasOffer) completed.add("offer");
  if (visaDone) completed.add("visa");
  if (housingDone) completed.add("housing");
  if (arrivalDone) completed.add("arrival");

  return {
    completed,
    progress: Math.round((completed.size / JOURNEY_STAGE_IDS.length) * 100),
  };
}

async function fetchJourneyData(): Promise<JourneyData> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("AUTH_SESSION_MISSING");

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
  const { copy, locale } = usePortalCopy();
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
  const [documentApplicationId, setDocumentApplicationId] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const data = journey.data ?? EMPTY_DATA;
  const journeyState = useMemo(() => deriveJourney(data), [data]);
  const openTasks = useMemo(
    () => data.tasks.filter((task) => task.status !== "done"),
    [data.tasks],
  );
  const nextTask = openTasks.find((task) => task.due_at) ?? openTasks[0] ?? null;
  const nextApplicationDeadline = useMemo(
    () =>
      data.applications
        .filter(
          (item) =>
            item.deadline && !["rejected", "withdrawn", "accepted"].includes(item.status),
        )
        .sort(
          (left, right) =>
            new Date(left.deadline as string).getTime() - new Date(right.deadline as string).getTime(),
        )[0] ?? null,
    [data.applications],
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["portal-journey-workspace"] });

  const createApplication = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(copy.errors.session);
      if (applicationForm.institutionName.trim().length < 2) {
        throw new Error(copy.applications.institutionRequired);
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
      toast.success(copy.applications.createSuccess);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : copy.applications.createError),
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
    onError: () => toast.error(copy.applications.updateError),
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(copy.errors.session);
      if (!taskTitle.trim()) throw new Error(copy.tasks.titleRequired);
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
      toast.success(copy.tasks.createSuccess);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : copy.tasks.createError),
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
    onError: () => toast.error(copy.tasks.updateError),
  });

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!documentFile) throw new Error(copy.documents.selectFile);
      if (!ALLOWED_DOCUMENT_TYPES.includes(documentFile.type)) {
        throw new Error(copy.documents.invalidType);
      }
      if (documentFile.size > MAX_DOCUMENT_BYTES) throw new Error(copy.documents.tooLarge);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(copy.errors.session);
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
        review_status: "private",
        application_id: documentApplicationId || null,
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
      setDocumentApplicationId("");
      void refresh();
      toast.success(copy.documents.uploaded);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : copy.documents.uploadError),
  });

  if (journey.isLoading) {
    return (
      <div
        className="mt-6 grid min-h-48 place-items-center rounded-2xl border bg-white"
        aria-live="polite"
      >
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-teal" /> {copy.common.loading}
        </span>
      </div>
    );
  }

  if (journey.isError) {
    return (
      <Card className="mt-6 border-red-200 bg-red-50/70">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <strong className="text-sm text-navy">{copy.errors.load}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {journey.error instanceof Error && journey.error.message === "AUTH_SESSION_MISSING"
                  ? copy.errors.session
                  : copy.errors.load}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => void journey.refetch()}>
            {copy.common.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const deadlineDays = deadlineDistance(nextApplicationDeadline?.deadline ?? null);

  return (
    <section id="journey-workspace" className="mt-6 scroll-mt-24" aria-label={copy.journey.title}>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden border-teal/25 bg-gradient-to-br from-white via-white to-teal/5 shadow-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-teal">
                  <Route className="h-4 w-4" /> {copy.journey.title}
                </div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
                  {journeyState.progress}% {copy.journey.progress}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{copy.journey.subtitle}</p>
              </div>
              <Badge variant="outline" className="border-teal/30 bg-white text-teal">
                {data.applications.length} {copy.tabs.applications.toLocaleLowerCase(locale)}
              </Badge>
            </div>
            <Progress value={journeyState.progress} className="mt-5 h-2" />
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {JOURNEY_STAGE_IDS.map((stage, index) => {
                const done = journeyState.completed.has(stage);
                return (
                  <div key={stage} className="min-w-0 text-center">
                    <span
                      className={
                        "mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs " +
                        (done
                          ? "border-teal bg-teal text-white"
                          : "border-slate-200 bg-white text-muted-foreground")
                      }
                      aria-label={`${copy.journey.stages[stage]} ${done ? copy.common.complete : ""}`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className="mt-1.5 block truncate text-[10px] text-muted-foreground">
                      {copy.journey.stages[stage]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/30 bg-navy text-white shadow-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
              <Clock3 className="h-4 w-4" /> {copy.journey.nextAction}
            </div>
            {nextTask ? (
              <>
                <h2 className="mt-4 font-display text-xl font-semibold">{nextTask.title}</h2>
                <p className="mt-2 text-sm text-white/65">
                  {dateLabel(nextTask.due_at, locale, copy.common.noDate)}
                </p>
                <Button
                  size="sm"
                  onClick={() => completeTask.mutate(nextTask.id)}
                  disabled={completeTask.isPending}
                  className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  {completeTask.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  <CheckCircle2 className="me-2 h-4 w-4" /> {copy.common.complete}
                </Button>
              </>
            ) : nextApplicationDeadline ? (
              <>
                <h2 className="mt-4 font-display text-xl font-semibold">
                  {nextApplicationDeadline.institution_name}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  {dateLabel(nextApplicationDeadline.deadline, locale, copy.common.noDate)}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-display text-xl font-semibold">
                  {copy.journey.noNextAction}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {copy.journey.noNextActionDesc}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={GraduationCap}
          label={copy.tabs.applications}
          value={data.applications.length}
        />
        <MetricCard icon={ListChecks} label={copy.tabs.tasks} value={openTasks.length} />
        <MetricCard icon={FileText} label={copy.tabs.documents} value={data.documents.length} />
      </div>

      <Card className="mt-4 border-border/70 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-teal" />
              <strong className="text-sm text-navy">{copy.journey.deadlineRadar}</strong>
            </div>
            {nextApplicationDeadline ? (
              <span className="text-xs font-semibold text-teal">
                {deadlineDays === null
                  ? copy.common.noDate
                  : deadlineDays < 0
                    ? `${Math.abs(deadlineDays)} ${copy.common.days} · ${copy.common.overdue}`
                    : deadlineDays === 0
                      ? copy.common.today
                      : `${deadlineDays} ${copy.common.days}`}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{copy.journey.noDeadline}</span>
            )}
          </div>
          {nextApplicationDeadline && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
              <div>
                <span className="block text-sm font-medium text-navy">
                  {nextApplicationDeadline.institution_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {nextApplicationDeadline.program_name || nextApplicationDeadline.intake || "—"}
                </span>
              </div>
              <span className="text-sm text-navy">
                {dateLabel(nextApplicationDeadline.deadline, locale, copy.common.noDate)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="applications" className="mt-6">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1 md:w-fit md:min-w-[420px]">
          <TabsTrigger value="applications" className="min-h-10 rounded-lg">
            {copy.tabs.applications}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="min-h-10 rounded-lg">
            {copy.tabs.tasks}
          </TabsTrigger>
          <TabsTrigger value="documents" className="min-h-10 rounded-lg">
            {copy.tabs.documents}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-navy">
                    {copy.applications.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {copy.applications.emptyDesc}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowApplicationForm((value) => !value)}
                  className="bg-navy text-white hover:bg-navy/90"
                >
                  <Plus className="me-2 h-4 w-4" /> {copy.applications.add}
                </Button>
              </div>

              {showApplicationForm && (
                <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-2">
                  <Field label={copy.applications.institution} required>
                    <input
                      value={applicationForm.institutionName}
                      onChange={(event) =>
                        setApplicationForm({ ...applicationForm, institutionName: event.target.value })
                      }
                      maxLength={160}
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                    />
                  </Field>
                  <Field label={copy.applications.program}>
                    <input
                      value={applicationForm.programName}
                      onChange={(event) =>
                        setApplicationForm({ ...applicationForm, programName: event.target.value })
                      }
                      maxLength={160}
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                    />
                  </Field>
                  <Field label={copy.applications.country}>
                    <input
                      value={applicationForm.countryCode}
                      onChange={(event) =>
                        setApplicationForm({
                          ...applicationForm,
                          countryCode: event.target.value.toUpperCase().slice(0, 2),
                        })
                      }
                      maxLength={2}
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm uppercase"
                    />
                  </Field>
                  <Field label={copy.applications.intake}>
                    <input
                      value={applicationForm.intake}
                      onChange={(event) =>
                        setApplicationForm({ ...applicationForm, intake: event.target.value })
                      }
                      maxLength={80}
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                    />
                  </Field>
                  <Field label={copy.applications.deadline}>
                    <input
                      type="date"
                      value={applicationForm.deadline}
                      onChange={(event) =>
                        setApplicationForm({ ...applicationForm, deadline: event.target.value })
                      }
                      className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                    />
                  </Field>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => createApplication.mutate()}
                      disabled={createApplication.isPending}
                      className="h-11 bg-gold text-gold-foreground hover:bg-gold/90"
                    >
                      {createApplication.isPending && (
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      )}
                      {copy.common.save}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowApplicationForm(false)}>
                      {copy.common.cancel}
                    </Button>
                  </div>
                </div>
              )}

              {data.applications.length ? (
                <div className="mt-5 space-y-3" aria-live="polite">
                  {data.applications.map((application) => (
                    <article
                      key={application.id}
                      className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto] md:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="truncate text-sm text-navy">
                            {application.institution_name}
                          </strong>
                          {application.country_code && (
                            <Badge variant="outline">{application.country_code}</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[application.program_name, application.intake]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          <CalendarDays className="me-1 inline h-3.5 w-3.5 text-teal" />
                          {dateLabel(application.deadline, locale, copy.common.noDate)}
                        </p>
                      </div>
                      <label className="text-xs font-medium text-muted-foreground">
                        <span className="sr-only">{copy.applications.status}</span>
                        <select
                          value={application.status}
                          onChange={(event) =>
                            updateApplication.mutate({
                              id: application.id,
                              status: event.target.value as ApplicationStatus,
                            })
                          }
                          disabled={updateApplication.isPending}
                          className="h-10 rounded-lg border bg-white px-3 text-sm text-navy"
                        >
                          {APPLICATION_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                              {copy.applications.statuses[status]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title={copy.applications.empty}
                  description={copy.applications.emptyDesc}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="font-display text-xl font-semibold text-navy">{copy.tasks.title}</h2>
              <div className="mt-4 grid gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-[1fr_180px_auto]">
                <Field label={copy.tasks.task} required>
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    maxLength={180}
                    className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  />
                </Field>
                <Field label={copy.tasks.due}>
                  <input
                    type="date"
                    value={taskDueAt}
                    onChange={(event) => setTaskDueAt(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    onClick={() => createTask.mutate()}
                    disabled={createTask.isPending}
                    className="h-11 w-full bg-navy text-white hover:bg-navy/90"
                  >
                    {createTask.isPending ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="me-2 h-4 w-4" />
                    )}
                    {copy.tasks.add}
                  </Button>
                </div>
              </div>

              {openTasks.length ? (
                <div className="mt-5 space-y-2" aria-live="polite">
                  {openTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-navy">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {dateLabel(task.due_at, locale, copy.common.noDate)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeTask.mutate(task.id)}
                        disabled={completeTask.isPending}
                      >
                        <Check className="me-2 h-4 w-4" /> {copy.common.complete}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ListChecks}
                  title={copy.tasks.empty}
                  description={copy.tasks.emptyDesc}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-navy">
                    {copy.documents.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {copy.documents.privacy}
                  </p>
                </div>
                <Badge className="bg-teal/10 text-teal hover:bg-teal/10">
                  <ShieldCheck className="me-1 h-3.5 w-3.5" /> {copy.documents.privateBadge}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label={copy.documents.category}>
                  <select
                    value={documentCategory}
                    onChange={(event) => setDocumentCategory(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  >
                    {DOCUMENT_CATEGORY_IDS.map((category) => (
                      <option key={category} value={category}>
                        {copy.documents.categories[category]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.applications.title}>
                  <select
                    value={documentApplicationId}
                    onChange={(event) => setDocumentApplicationId(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  >
                    <option value="">{copy.common.optional}</option>
                    {data.applications.map((application) => (
                      <option key={application.id} value={application.id}>
                        {application.institution_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.documents.expiry}>
                  <input
                    type="date"
                    value={documentExpiry}
                    onChange={(event) => setDocumentExpiry(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  />
                </Field>
                <Field label={copy.documents.file} required>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-xs text-muted-foreground file:me-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy"
                  />
                </Field>
                <div className="md:col-span-2 xl:col-span-4">
                  <Button
                    onClick={() => uploadDocument.mutate()}
                    disabled={uploadDocument.isPending || !documentFile}
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    {uploadDocument.isPending ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="me-2 h-4 w-4" />
                    )}
                    {copy.documents.upload}
                  </Button>
                </div>
              </div>

              {data.documents.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-live="polite">
                  {data.documents.map((document) => (
                    <article key={document.id} className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-navy">
                            {document.file_name}
                          </strong>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {copy.documents.categories[document.category] || document.category}
                          </span>
                          {document.expires_at && (
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {copy.documents.expiry}: {dateLabel(document.expires_at, locale, copy.common.noDate)}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {copy.documents.privateBadge}
                        </Badge>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ShieldCheck}
                  title={copy.documents.empty}
                  description={copy.documents.emptyDesc}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <strong className="block text-2xl leading-none text-navy">{value}</strong>
          <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed bg-slate-50 p-7 text-center">
      <Icon className="mx-auto h-7 w-7 text-teal" />
      <strong className="mt-3 block text-sm text-navy">{title}</strong>
      <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-navy">
      {label}
      {required ? " *" : ""}
      {children}
    </label>
  );
}
