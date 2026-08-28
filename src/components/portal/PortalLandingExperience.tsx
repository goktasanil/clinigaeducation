import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  MapPinned,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePortalCopy } from "@/components/portal/portal-copy";
import { usePortalPublicCopy } from "@/components/portal/portal-public-copy";

const JOURNEY = [
  ["discover", Search],
  ["shortlist", GraduationCap],
  ["documents", FileCheck2],
  ["apply", Route],
  ["offer", CheckCircle2],
  ["visa", ShieldCheck],
  ["housing", Home],
  ["arrival", MapPinned],
] as const;

const LIFE_ICONS = [Home, WalletCards, Users, HeartHandshake] as const;

export function PortalHero() {
  const publicCopy = usePortalPublicCopy();

  return (
    <section className="relative overflow-hidden border-b bg-white py-10 md:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--teal)/.12),transparent_35%),radial-gradient(circle_at_80%_0%,hsl(var(--gold)/.14),transparent_32%)]" />
      <div className="container-prose relative grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge variant="outline" className="border-teal/30 bg-teal/5 text-teal">
            <Sparkles className="me-1.5 h-3.5 w-3.5" /> CliniGA Student Journey OS
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-navy md:text-6xl">
            {publicCopy.hero.title}
            <span className="block text-teal">{publicCopy.hero.accent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {publicCopy.hero.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-navy text-white hover:bg-navy/90">
              <a href="#kesfet">
                {publicCopy.hero.discover} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-teal/30">
              <a href="/portal/workspace">{publicCopy.hero.continue}</a>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal" /> {publicCopy.hero.privateDocs}
            </span>
            <span className="flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-teal" /> {publicCopy.hero.officialSources}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarCheck2 className="h-4 w-4 text-teal" /> {publicCopy.hero.deadlines}
            </span>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 shadow-xl shadow-navy/10">
          <CardContent className="p-0">
            <div className="border-b bg-navy px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                    {publicCopy.hero.overview}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold">
                    {publicCopy.hero.overviewTitle}
                  </h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Route className="h-5 w-5 text-gold" />
                </span>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                  {publicCopy.hero.nextAction}
                </p>
                <strong className="mt-1 block text-base text-navy">
                  {publicCopy.hero.nextActionTitle}
                </strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {publicCopy.hero.nextActionDesc}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  [publicCopy.hero.applications, GraduationCap],
                  [publicCopy.hero.documents, FileCheck2],
                  [publicCopy.hero.life, Home],
                ].map(([title, Icon]) => {
                  const Component = Icon as typeof GraduationCap;
                  return (
                    <div key={title as string} className="rounded-xl border bg-slate-50 p-3">
                      <Component className="h-4 w-4 text-teal" />
                      <strong className="mt-2 block text-xs text-navy">{title as string}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center rounded-xl border px-3 py-3 text-sm">
                <CheckCircle2 className="me-2 h-4 w-4 shrink-0 text-teal" />
                <span className="text-navy">{publicCopy.hero.provenance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function PortalJourneyMap() {
  const publicCopy = usePortalPublicCopy();
  const { copy } = usePortalCopy();

  return (
    <section className="py-16" aria-labelledby="portal-journey-map-title">
      <div className="max-w-3xl">
        <Badge variant="outline" className="border-gold/40 text-navy">
          {publicCopy.journey.badge}
        </Badge>
        <h2
          id="portal-journey-map-title"
          className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl"
        >
          {publicCopy.journey.title}
        </h2>
        <p className="mt-3 text-muted-foreground">{publicCopy.journey.subtitle}</p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {JOURNEY.map(([id, Icon], index) => (
          <article
            key={id}
            className="group rounded-2xl border border-border/70 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-navy">
              {copy.journey.stages[id]}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {publicCopy.journey.descriptions[id]}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal/20 bg-teal/5 px-5 py-4">
        <div>
          <strong className="text-navy">{publicCopy.journey.workspaceTitle}</strong>
          <p className="mt-1 text-sm text-muted-foreground">{publicCopy.journey.workspaceDesc}</p>
        </div>
        <Button asChild className="rounded-xl bg-navy text-white hover:bg-navy/90">
          <a href="/portal/workspace">
            {publicCopy.journey.openWorkspace}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </section>
  );
}

export function PortalLifeAbroadGroups() {
  const publicCopy = usePortalPublicCopy();

  return (
    <section className="pb-16" aria-labelledby="life-abroad-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-teal/30 text-teal">
            {publicCopy.life.badge}
          </Badge>
          <h2
            id="life-abroad-title"
            className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl"
          >
            {publicCopy.life.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{publicCopy.life.subtitle}</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <a href="/portal/workspace">{publicCopy.life.workspace}</a>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {publicCopy.life.groups.map((group, index) => {
          const Icon = LIFE_ICONS[index] ?? HeartHandshake;
          return (
            <Card key={group.title} className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-navy">{group.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {group.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Badge key={item} variant="secondary" className="font-normal">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={Building2}
          title={publicCopy.life.institution}
          description={publicCopy.life.institutionDesc}
        />
        <InfoCard
          icon={BriefcaseBusiness}
          title={publicCopy.life.moderation}
          description={publicCopy.life.moderationDesc}
        />
        <InfoCard
          icon={ShieldCheck}
          title={publicCopy.life.privateFiles}
          description={publicCopy.life.privateFilesDesc}
        />
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <Icon className="h-5 w-5 text-teal" />
      <strong className="mt-3 block text-sm text-navy">{title}</strong>
      <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
