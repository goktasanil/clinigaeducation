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
import { PortalJourneyWorkspace } from "@/components/portal/PortalJourneyWorkspace";

export const Route = createFileRoute("/_authenticated/portal/workspace")({
  head: () => ({
    meta: [
      { title: "Student Journey Workspace | CliniGA Education" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalWorkspacePage,
});

const NAV_ITEMS = [
  [LayoutDashboard, "Overview", "#journey-workspace"],
  [RouteIcon, "My Journey", "#journey-workspace"],
  [GraduationCap, "Applications", "#journey-workspace"],
  [FileCheck2, "Documents", "#journey-workspace"],
  [Search, "Programs", "/portal#kesfet"],
  [CalendarDays, "Advisor", "/iletisim"],
  [MessageCircle, "Community", "/portal#community"],
  [Bell, "Notifications", "#journey-workspace"],
] as const;

function PortalWorkspacePage() {
  return (
    <section className="min-h-screen bg-slate-50 pb-20 lg:pb-10">
      <div className="border-b bg-white/95 backdrop-blur">
        <div className="container-prose flex min-h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-gold">
              <RouteIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <strong className="block truncate font-display text-base text-navy">CliniGA Student Journey</strong>
              <span className="block truncate text-xs text-muted-foreground">Study abroad, organized.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden rounded-xl sm:inline-flex">
              <a href="/portal#kesfet"><Search className="mr-2 h-4 w-4" /> Program keşfi</a>
            </Button>
            <Button asChild size="sm" className="rounded-xl bg-navy text-white hover:bg-navy/90">
              <a href="/iletisim"><UserRoundCheck className="mr-2 h-4 w-4" /> Danışman</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-prose grid gap-5 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-2xl border bg-white p-3 shadow-sm lg:block">
          <div className="px-2 pb-3 pt-1">
            <Badge variant="outline" className="border-teal/30 text-teal">Workspace</Badge>
          </div>
          <nav className="space-y-1" aria-label="Student portal navigation">
            {NAV_ITEMS.map(([Icon, label, href], index) => (
              <a
                key={label}
                href={href}
                className={
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition " +
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
            <a href="/portal/panel" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-slate-50 hover:text-navy">
              <Settings2 className="h-4 w-4" /> Hesap & marketplace
            </a>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal">Student Journey OS</p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-navy md:text-4xl">Yolculuğunu tek bakışta yönet</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Başvuru durumları, deadline’lar, görevler ve private belgeler birbirine bağlı tek çalışma alanında.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpenCheck className="h-4 w-4 text-teal" /> Official source ayrımı korunur
            </div>
          </div>

          <PortalJourneyWorkspace />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <a href="/portal#kesfet" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md">
              <Search className="h-5 w-5 text-teal" />
              <strong className="mt-4 block text-navy">Program keşfi</strong>
              <span className="mt-1 block text-sm text-muted-foreground">Ülke, şehir, kurum ve akademik alan ara.</span>
            </a>
            <a href="/iletisim" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md">
              <CalendarDays className="h-5 w-5 text-teal" />
              <strong className="mt-4 block text-navy">Danışman görüşmesi</strong>
              <span className="mt-1 block text-sm text-muted-foreground">Mevcut randevu akışıyla görüşme planla.</span>
            </a>
            <a href="/portal/panel" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md">
              <Home className="h-5 w-5 text-teal" />
              <strong className="mt-4 block text-navy">Community & account</strong>
              <span className="mt-1 block text-sm text-muted-foreground">Marketplace, doğrulama ve hesap ayarlarına geç.</span>
            </a>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur lg:hidden" aria-label="Mobile student portal navigation">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {[
            [LayoutDashboard, "Overview", "#journey-workspace"],
            [GraduationCap, "Apply", "#journey-workspace"],
            [FileCheck2, "Docs", "#journey-workspace"],
            [Search, "Search", "/portal#kesfet"],
            [Settings2, "Account", "/portal/panel"],
          ].map(([Icon, label, href], index) => (
            <a key={label as string} href={href as string} className={"flex min-h-12 flex-col items-center justify-center rounded-xl text-[10px] font-medium " + (index === 0 ? "bg-navy text-white" : "text-muted-foreground")}>
              <Icon className="mb-1 h-4 w-4" /> {label as string}
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
