import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Calendar,
  CheckCircle2,
  Globe2,
  Compass,
  GraduationCap,
  BookOpenCheck,
  BarChart3,
  ScrollText,
  Briefcase,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Akademik & Kariyer Danışmanlığı Testi | CliniGA Education" },
      {
        name: "description",
        content:
          "1 dakikada sana en uygun hizmeti keşfet: yurt dışı eğitim, tez, istatistik, KPSS, kariyer ve mentörlük. Ücretsiz kişisel rapor + strateji görüşmesi.",
      },
      {
        name: "keywords",
        content:
          "akademik danışmanlık testi, kariyer planlama testi, yurt dışı eğitim testi, tez danışmanlığı, istatistik analizi, KPSS danışmanlığı, mentörlük",
      },
      { property: "og:title", content: "Sana Hangi Danışmanlık Uygun? Ücretsiz Test | CliniGA Education" },
      {
        property: "og:description",
        content:
          "Akademik ve kariyer hedeflerine göre kişiye özel hizmet önerisi + 15 dakikalık ücretsiz strateji görüşmesi.",
      },
      { property: "og:url", content: "https://www.clinigaeducation.com/quiz" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.clinigaeducation.com/og-cover.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CliniGA Education — Akademik & Kariyer Danışmanlığı Testi" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sana Hangi Danışmanlık Uygun? Ücretsiz Test | CliniGA Education" },
      { name: "twitter:description", content: "Akademik ve kariyer hedeflerine göre kişiye özel hizmet önerisi + 15 dakikalık ücretsiz strateji görüşmesi." },
      { name: "twitter:image", content: "https://www.clinigaeducation.com/og-cover.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.clinigaeducation.com/quiz" }],
  }),
  component: QuizPage,
});

// -------------------- Intent tracks --------------------
type IntentId =
  | "abroad"
  | "career"
  | "university"
  | "thesis"
  | "stats"
  | "publication"
  | "kpss"
  | "mentorship";

type IntentDef = {
  id: IntentId;
  icon: React.ComponentType<{ className?: string }>;
};

// Order MUST match `quiz.intents.list` in locale files.
const INTENT_DEFS: IntentDef[] = [
  { id: "abroad", icon: Globe2 },
  { id: "career", icon: Briefcase },
  { id: "university", icon: GraduationCap },
  { id: "thesis", icon: BookOpenCheck },
  { id: "stats", icon: BarChart3 },
  { id: "publication", icon: ScrollText },
  { id: "kpss", icon: Compass },
  { id: "mentorship", icon: Sparkles },
];

type IntentContent = {
  title: string;
  desc: string;
  services: string[];
  cta: string;
};

// -------------------- Study-abroad country flow --------------------
const COUNTRIES = [
  "İtalya","Almanya","Hollanda","Kanada","İngiltere","ABD","İspanya","Fransa",
] as const;
type Country = (typeof COUNTRIES)[number];

const SCORING: Record<number, Record<number, Partial<Record<Country, number>>>> = {
  0: {
    0: { İtalya: 3, Almanya: 3, İspanya: 2, Fransa: 2 },
    1: { İtalya: 2, Almanya: 3, Hollanda: 2, İspanya: 2, Fransa: 2 },
    2: { Hollanda: 3, Kanada: 3, İngiltere: 2, Fransa: 2 },
    3: { ABD: 3, İngiltere: 3, Kanada: 2 },
  },
  1: {
    0: { İtalya: 2, İspanya: 2, Almanya: 1 },
    1: { İtalya: 2, İspanya: 2, Almanya: 2, Fransa: 2 },
    2: { Almanya: 2, Hollanda: 2, Kanada: 2, Fransa: 2 },
    3: { İngiltere: 3, ABD: 3, Hollanda: 2, Kanada: 2 },
  },
  2: {
    0: { İngiltere: 2, ABD: 2, Kanada: 2, Hollanda: 2 },
    1: { Almanya: 2, Fransa: 2, İtalya: 2, İspanya: 2 },
    2: { İtalya: 2, İspanya: 2, Almanya: 1 },
    3: { İtalya: 2, Almanya: 1, İspanya: 2 },
  },
  3: {
    0: { Almanya: 3, Kanada: 3, Hollanda: 2, ABD: 2 },
    1: { İtalya: 2, İngiltere: 2, İspanya: 2, Fransa: 2 },
    2: { Almanya: 3, ABD: 3, İngiltere: 2, Hollanda: 2 },
    3: { İtalya: 1, Almanya: 1, Hollanda: 1 },
  },
  4: {
    0: { İtalya: 2, Almanya: 2, İspanya: 2 },
    1: { Hollanda: 2, Almanya: 2, İtalya: 2, Kanada: 2 },
    2: { Almanya: 3, ABD: 3, İngiltere: 2, Hollanda: 2 },
    3: { İtalya: 1, İspanya: 1, Fransa: 1 },
  },
  5: {
    0: { İtalya: 1, İspanya: 1 },
    1: { Almanya: 1, Hollanda: 1, Fransa: 1 },
    2: { Kanada: 1, İngiltere: 1, ABD: 1 },
    3: {},
  },
};

function computeTop3(answers: number[]): Country[] {
  const scores: Record<string, number> = {};
  answers.forEach((a, qi) => {
    const map = SCORING[qi]?.[a] ?? {};
    for (const [c, p] of Object.entries(map)) {
      scores[c] = (scores[c] ?? 0) + (p as number);
    }
  });
  return (Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c) as Country[]);
}

type QuizQ = { q: string; options: string[] };

function QuizPage() {
  const { t } = useTranslation();
  const questions = t("quiz.questions", { returnObjects: true }) as QuizQ[];
  const intentList = t("quiz.intents.list", { returnObjects: true }) as IntentContent[];

  const [intentId, setIntentId] = useState<IntentId | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!done || !autoRedirect) return;
    if (countdown <= 0) {
      navigate({ to: "/iletisim", search: { intent: intentId ?? undefined } as never });
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [done, autoRedirect, countdown, navigate, intentId]);

  const intentIndex = intentId
    ? INTENT_DEFS.findIndex((d) => d.id === intentId)
    : -1;
  const intent = intentIndex >= 0 ? intentList[intentIndex] : null;

  const isAbroadFlow = intentId === "abroad";
  const total = questions.length;
  const isResultStep = isAbroadFlow ? step === total : intentId !== null;
  const top3 = useMemo(
    () => (isAbroadFlow && isResultStep ? computeTop3(answers) : []),
    [isAbroadFlow, isResultStep, answers],
  );

  const gateSchema = z.object({
    name: z.string().trim().min(2, t("contact.form.validation.required")),
    email: z.string().trim().email(t("contact.form.validation.email")),
  });
  type GateValues = z.infer<typeof gateSchema>;
  const form = useForm<GateValues>({
    resolver: zodResolver(gateSchema),
    defaultValues: { name: "", email: "" },
  });

  const pickAnswer = (idx: number) => {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  const goBack = () => {
    if (isAbroadFlow && step > 0) setStep((s) => s - 1);
    else {
      setIntentId(null);
      setStep(0);
      setAnswers([]);
    }
  };

  const submit = useServerFn(submitLead);

  const onSubmitGate = async (data: GateValues) => {
    setSubmitting(true);
    try {
      const label = intent?.title ?? "General";
      const summary = isAbroadFlow
        ? `Countries: ${top3.join(", ")}`
        : `Services: ${(intent?.services ?? []).join(", ")}`;
      const answersBlock = isAbroadFlow
        ? [
            ``,
            `Answers:`,
            ...answers.map(
              (a, i) => `${i + 1}. ${questions[i].q} → ${questions[i].options[a]}`,
            ),
          ].join("\n")
        : "";
      const message = [
        `Interest: ${label}`,
        summary,
        answersBlock,
      ]
        .filter(Boolean)
        .join("\n");

      const nowIso = new Date().toISOString();
      const structuredAnswers = [
        {
          step: 0,
          key: "intent",
          question: "İhtiyaç / Intent",
          answer: label,
          at: nowIso,
        },
        ...(isAbroadFlow
          ? answers.map((a, i) => ({
              step: i + 1,
              key: `q${i + 1}`,
              question: questions[i]?.q ?? `Q${i + 1}`,
              answer: questions[i]?.options?.[a] ?? String(a),
              answerIndex: a,
              at: nowIso,
            }))
          : []),
        ...(isAbroadFlow && top3.length
          ? [
              {
                step: answers.length + 1,
                key: "top3",
                question: "Önerilen ülkeler",
                answer: top3.join(", "),
                at: nowIso,
              },
            ]
          : []),
      ];

      const result = await submit({
        data: {
          name: data.name,
          email: data.email,
          phone: "+10000000000",
          message: message.length >= 10 ? message : `${message} — quiz lead`,
          intent: intentId ?? null,
          service: label,
          country: isAbroadFlow ? top3[0] ?? null : null,
          language: undefined,
          source: "quiz",
          quizAnswers: structuredAnswers,
        },
      });

      if (!result.ok) {
        toast.error(t("contact.errorGeneric"));
        return;
      }

      toast.success(t("quiz.result.success"));
      setDone(true);
    } catch (err) {
      console.error("[quiz] submit failed", err);
      toast.error(t("contact.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = isAbroadFlow ? total + 1 : 2;
  const currentStep = intentId === null ? 0 : isAbroadFlow ? step + 1 : 1;
  const progress = done
    ? 100
    : isResultStep
    ? 100
    : Math.round((currentStep / totalSteps) * 100);

  return (
    <>
      <section className="gradient-navy py-14 text-navy-foreground">
        <div className="container-prose">
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <ClipboardCheck className="h-3.5 w-3.5" /> {t("quiz.hero.eyebrow")}
            </span>
            <div className="shrink-0 rounded-full bg-white/10 px-1 backdrop-blur">
              <LanguageSwitcher />
            </div>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-tight md:text-5xl">
            {t("quiz.hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">
            {t("quiz.hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="container-prose py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>
              {intentId === null
                ? t("quiz.intents.stepLabel")
                : done
                ? t("quiz.result.success")
                : isResultStep
                ? t("quiz.result.title")
                : t("quiz.progress", { current: step + 1, total })}
            </span>
            <span className="text-teal">{progress}%</span>
          </div>
          <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-teal"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 0: Intent selection */}
            {intentId === null && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-xl font-semibold text-navy md:text-2xl">
                  {t("quiz.intents.title")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("quiz.intents.subtitle")}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {INTENT_DEFS.map((def, i) => {
                    const Icon = def.icon;
                    const it = intentList[i];
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => {
                          setIntentId(def.id);
                          setStep(0);
                          setAnswers([]);
                        }}
                        className="group flex items-start gap-4 rounded-xl border-2 border-border/60 bg-card p-4 text-left transition-all hover:border-teal hover:bg-teal/5"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-teal-foreground">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-base font-semibold text-navy">
                            {it?.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {it?.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 1..N: abroad-only question flow */}
            {intentId && isAbroadFlow && !isResultStep && (
              <motion.div
                key={`q-${step}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border/70 bg-card p-8 shadow-card"
              >
                <h2 className="font-display text-xl font-semibold text-navy md:text-2xl">
                  {questions[step]?.q}
                </h2>
                <div className="mt-6 grid gap-3">
                  {questions[step]?.options.map((opt, i) => {
                    const selected = answers[step] === i;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pickAnswer(i)}
                        className={`group flex items-center justify-between rounded-lg border-2 px-4 py-3.5 text-left text-sm font-medium transition-all ${
                          selected
                            ? "border-teal bg-teal/5 text-navy"
                            : "border-border/60 bg-background text-foreground hover:border-teal hover:bg-teal/5"
                        }`}
                      >
                        <span>{opt}</span>
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                            selected
                              ? "border-teal bg-teal text-teal-foreground"
                              : "border-border group-hover:border-teal"
                          }`}
                        >
                          {selected && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    {t("quiz.back")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {step + 1} / {total}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Result: abroad top-3 or service recommendation */}
            {intentId && intent && isResultStep && !done && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-teal/40 bg-gradient-to-br from-teal/10 via-card to-gold/5 p-8 shadow-premium"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("quiz.result.ready")}
                </span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-navy md:text-3xl">
                  {isAbroadFlow
                    ? t("quiz.result.title")
                    : t("quiz.result.forIntent", { intent: intent.title })}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {isAbroadFlow
                    ? t("quiz.result.desc")
                    : t("quiz.result.descIntent", { desc: intent.desc })}
                </p>

                {isAbroadFlow ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {top3.map((c, i) => (
                      <div
                        key={c}
                        className="rounded-xl border border-border/70 bg-background p-5 text-center"
                      >
                        <p className="font-display text-4xl font-bold text-gold">
                          #{i + 1}
                        </p>
                        <p className="mt-2 font-display text-base font-semibold text-navy">
                          {c}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                    {intent.services.map((s: string) => (
                      <li
                        key={s}
                        className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-3 text-sm font-medium text-navy"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitGate)} className="mt-8 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={t("quiz.result.namePlaceholder")}
                              autoComplete="name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              inputMode="email"
                              placeholder={t("quiz.result.emailPlaceholder")}
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="h-12 flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
                      >
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="mr-2 h-4 w-4" />
                        )}
                        {t("quiz.result.submit")}
                      </Button>
                      <Button type="button" variant="outline" size="lg" onClick={goBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {t("quiz.result.pickAnother")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal/10 text-teal">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-semibold text-navy">
                  {t("quiz.result.success")}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {t("quiz.done.desc")}
                </p>
                {autoRedirect && (
                  <p className="mt-4 text-sm font-medium text-teal">
                    {countdown}s — {t("quiz.done.redirecting", { defaultValue: "Ücretli danışmanlık sayfasına yönlendiriliyorsun…" })}
                    {" "}
                    <button
                      type="button"
                      onClick={() => setAutoRedirect(false)}
                      className="underline underline-offset-2 hover:text-navy"
                    >
                      {t("quiz.done.cancelRedirect", { defaultValue: "İptal" })}
                    </button>
                  </p>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="h-12 bg-gold text-gold-foreground hover:bg-gold/90">
                    <Link to="/iletisim" search={{ intent: intentId ?? undefined } as never}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("cta.primary")}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12">
                    <Link to="/hizmetler">
                      {t("quiz.done.viewServices", { defaultValue: "İlgili Hizmetleri İncele" })}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="h-12">
                    <Link to="/">{t("quiz.done.home")}</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
