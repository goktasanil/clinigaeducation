import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageCircle,
  Route as RouteIcon,
  Search,
  Settings2,
  UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PortalJourneyWorkspace } from "@/components/portal/PortalJourneyWorkspace";
import { PortalSelectionBridge } from "@/components/portal/PortalSelectionBridge";
import { usePortalCopy } from "@/components/portal/portal-copy";

export const Route = createFileRoute("/_authenticated/portal/workspace")({
  validateSearch: (search: Record<string, unknown>) => ({
    country: typeof search.country === "string" ? search.country.slice(0, 2).toUpperCase() : undefined,
    institution: typeof search.institution === "string" ? search.institution.slice(0, 240) : undefined,
    institutionName:
      typeof search.institutionName === "string" ? search.institutionName.slice(0, 240) : undefined,
    city: typeof search.city === "string" ? search.city.slice(0, 120) : undefined,
    program: typeof search.program === "string" ? search.program.slice(0, 240) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Student Journey Workspace | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalWorkspacePage,
});

function PortalWorkspacePage() {
  const { copy } = usePortalCopy();
  const selection = Route.useSearch();
  const navItems = [
    [LayoutDashboard, copy.nav.overview, "#journey-workspace"],
    [RouteIcon, copy.nav.journey, "#journey-workspace"],
    [GraduationCap, copy.nav.applications, "#journey-workspace"],
    [FileCheck2, copy.nav.documents, "#journey-workspace"],
    [Search, copy.nav.programs, "/portal#kesfet"],
    [CalendarDays, copy.nav.advisor, "/iletisim"],
    [MessageCircle, copy.nav.community, "/portal#community"],
    [Bell, copy.nav.notifications, "#journey-workspace"],
  ] as const;
  const mobileItems = [
    [LayoutDashboard, copy.nav.overview, "#journey-workspace"],
    [GraduationCap, copy.nav.applications, "#journey-workspace"],
    [FileCheck2, copy.nav.documents, "#journey-workspace"],
    [Search, copy.nav.programs, "/portal#kesfet"],
    [Settings2, copy.nav.account, "/portal/verify"],
  ] as const;

  return (
    <section className="min-h-screen bg-slate-50 pb-20 lg:pb-10">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="container-prose flex min-h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-gold">
              <RouteIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <strong className="block truncate font-display text-base text-navy">
                CliniGA Student Journey
              </strong>
              <span className="block truncate text-xs text-muted-foreground">{copy.tagline}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden rounded-xl md:inline-flex"
            >
              <a href="/portal#kesfet">
                <Search className="me-2 h-4 w-4" /> {copy.workspace.programDiscovery}
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-xl bg-navy text-white hover:bg-navy/90">
              <a href="/iletisim">
                <UserRoundCheck className="me-2 h-4 w-4" /> {copy.nav.advisor}
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container-prose grid gap-5 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-2xl border bg-white p-3 shadow-sm lg:block">
          <div className="px-2 pb-3 pt-1">
            <Badge variant="outline" className="border-teal/30 text-teal">
              Workspace
            </Badge>
          </div>
          <nav className="space-y-1" aria-label="Student portal navigation">
            {navItems.map(([Icon, label, href], index) => (
              <a
                key={`${label}-${href}`}
                href={href}
                className={
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                  (index === 0
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-navy")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3 border-t pt-3">
            <a
              href="/portal/verify"
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-slate-50 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <Settings2 className="h-4 w-4" /> {copy.nav.account}
            </a>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">{copy.workspace.eyebrow}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-navy md:text-4xl">
                {copy.workspace.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {copy.workspace.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-4 w-4 text-teal" /> {copy.workspace.sourceNote}
            </div>
          </div>

          <PortalSelectionBridge selection={selection} />
          <PortalJourneyWorkspace />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <WorkspaceLink
              href="/portal#kesfet"
              icon={Search}
              title={copy.workspace.programDiscovery}
              description={copy.workspace.programDiscoveryDesc}
            />
            <WorkspaceLink
              href="/iletisim"
              icon={CalendarDays}
              title={copy.workspace.advisorMeeting}
              description={copy.workspace.advisorMeetingDesc}
            />
            <WorkspaceLink
              href="/portal/verify"
              icon={Home}
              title={copy.workspace.communityAccount}
              description={copy.workspace.communityAccountDesc}
            />
          </div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur lg:hidden"
        aria-label="Mobile student portal navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileItems.map(([Icon, label, href], index) => (
            <a
              key={`${label}-${href}`}
              href={href}
              title={label}
              className={
                "flex min-h-12 min-w-0 flex-col items-center justify-center rounded-xl px-1 text-center text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                (index === 0 ? "bg-navy text-white" : "text-muted-foreground")
              }
            >
              <Icon className="mb-1 h-4 w-4 shrink-0" />
              <span className="w-full truncate">{label}</span>
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}

function WorkspaceLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
    >
      <Icon className="h-5 w-5 text-teal" />
      <strong className="mt-4 block text-navy">{title}</strong>
      <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
    </a>
  );
}
