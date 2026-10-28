import { SITE } from "@/data/site";

export const APPOINTMENT_TIME_ZONE = SITE.contactTimeZone;

const zonedParts = (date: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: APPOINTMENT_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

/** A calendar-date carrier: local Date fields hold the business's calendar day. */
export function appointmentCalendarToday(now = new Date()): Date {
  const parts = zonedParts(now);
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

/** Interpret the selected calendar fields in Rome, regardless of the visitor's zone. */
export function appointmentDateTime(day: Date, time: string): Date {
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = zonedParts(new Date(candidate));
    const shown = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    const correction = target - shown;
    candidate += correction;
    if (correction === 0) break;
  }
  return new Date(candidate);
}
