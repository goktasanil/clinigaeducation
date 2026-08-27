import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { CalendarIcon, Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBookedSlots } from "@/lib/leads.functions";
import { isStaticHost } from "@/lib/static-leads.client";

const ALL_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

export type AppointmentSelection = { date: Date; time: string } | null;

function slotToDate(day: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function AppointmentPicker({
  value,
  onChange,
}: {
  value: AppointmentSelection;
  onChange: (next: AppointmentSelection) => void;
}) {
  const { t, i18n } = useTranslation();
  const fetchSlots = useServerFn(getBookedSlots);

  // A static GitHub Pages deployment has no server endpoint. In that mode the
  // selected time is a preferred consultation time and is confirmed manually.
  const { data, isLoading } = useQuery({
    queryKey: ["booked-slots"],
    queryFn: () => fetchSlots(),
    enabled: !isStaticHost,
    refetchInterval: isStaticHost ? false : 30_000,
    staleTime: 15_000,
  });

  const bookedSet = useMemo(() => {
    const s = new Set<number>();
    (data?.slots ?? []).forEach((iso) => s.add(new Date(iso).getTime()));
    return s;
  }, [data]);

  const days = useMemo(() => {
    const base = startOfDay(new Date());
    const out: Date[] = [];
    let offset = 1;
    while (out.length < 12) {
      const d = addDays(base, offset++);
      if (d.getDay() !== 0) out.push(d);
    }
    return out;
  }, []);

  const [activeDay, setActiveDay] = useState<Date>(value?.date ?? days[0]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const locale = i18n.language;

  const isBooked = (day: Date, slot: string) =>
    !isStaticHost && bookedSet.has(slotToDate(day, slot).getTime());

  const isPast = (day: Date, slot: string) => isSameDay(day, now) && slotToDate(day, slot) <= now;

  const availableCount = ALL_SLOTS.filter(
    (s) => !isBooked(activeDay, s) && !isPast(activeDay, s),
  ).length;

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
              <CalendarIcon className="h-4 w-4 text-teal" />
              {t("contact.appointment.title")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("contact.appointment.desc")}</p>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        {isStaticHost && (
          <p className="rounded-lg border border-teal/20 bg-teal/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {t("contact.requestCard.step3", {
              defaultValue:
                "Uygun görüşme saatini e-posta veya telefonla birlikte netleştirelim.",
            })}
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const isActive = d.toDateString() === activeDay.toDateString();
            const dayBookedCount = ALL_SLOTS.filter((s) => isBooked(d, s)).length;
            const remaining = ALL_SLOTS.length - dayBookedCount;
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setActiveDay(d)}
                className={cn(
                  "flex min-w-[72px] flex-col items-center rounded-lg border px-3 py-2.5 text-center transition-all",
                  isActive
                    ? "border-navy bg-navy text-navy-foreground shadow-card"
                    : "border-border bg-background text-foreground hover:border-teal hover:bg-muted",
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                  {d.toLocaleDateString(locale, { weekday: "short" })}
                </span>
                <span className="font-display text-lg font-semibold leading-tight">
                  {format(d, "d")}
                </span>
                <span className="text-[10px] opacity-70">
                  {d.toLocaleDateString(locale, { month: "short" })}
                </span>
                {!isStaticHost && (
                  <span
                    className={cn(
                      "mt-1 text-[9px] font-semibold uppercase tracking-wide",
                      isActive ? "text-gold" : "text-teal",
                    )}
                  >
                    {remaining} {t("contact.appointment.available")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium uppercase tracking-wider text-muted-foreground">
              {t("contact.appointment.slotsFor")}{" "}
              <span className="text-navy">
                {activeDay.toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </span>
            {!isStaticHost && (
              <span className="text-teal">
                {availableCount} {t("contact.appointment.available")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ALL_SLOTS.map((slot) => {
              const isSelected =
                value?.time === slot && value?.date.toDateString() === activeDay.toDateString();
              const booked = isBooked(activeDay, slot);
              const past = isPast(activeDay, slot);
              const disabled = booked || past;
              return (
                <Button
                  key={slot}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={disabled}
                  onClick={() => onChange({ date: activeDay, time: slot })}
                  className={cn(
                    "relative h-10 text-sm",
                    isSelected && "bg-teal text-teal-foreground hover:bg-teal/90",
                    disabled &&
                      "cursor-not-allowed border-dashed text-muted-foreground/60 line-through opacity-60",
                  )}
                  title={
                    booked
                      ? (t("contact.appointment.booked") as string)
                      : past
                        ? (t("contact.appointment.past") as string)
                        : undefined
                  }
                >
                  {isSelected && <Check className="mr-1 h-3.5 w-3.5" />}
                  {booked && !isSelected && <X className="mr-1 h-3.5 w-3.5" />}
                  {slot}
                </Button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-border bg-background" />
              {t("contact.appointment.available")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal" />
              {t("contact.appointment.selectedShort")}
            </span>
            {!isStaticHost && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-border bg-muted" />
                {t("contact.appointment.booked")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm">
          <span className="font-medium text-navy">{t("contact.appointment.selected")}: </span>
          {value ? (
            <span className="text-foreground">
              {value.date.toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {value.time}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("contact.appointment.noSlot")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
