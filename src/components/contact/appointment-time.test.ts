import { describe, expect, it } from "vitest";

import { appointmentCalendarToday, appointmentDateTime } from "./appointment-time";

describe("Rome appointment time", () => {
  it.each([
    [2026, 0, 15, "08:00", "2026-01-15T07:00:00.000Z"],
    [2026, 6, 15, "08:00", "2026-07-15T06:00:00.000Z"],
    [2026, 2, 28, "18:00", "2026-03-28T17:00:00.000Z"],
    [2026, 2, 30, "08:00", "2026-03-30T06:00:00.000Z"],
    [2026, 9, 24, "18:00", "2026-10-24T16:00:00.000Z"],
    [2026, 9, 26, "08:00", "2026-10-26T07:00:00.000Z"],
  ])("uses the correct summer/winter offset for %s/%s/%s", (year, month, day, time, iso) => {
    expect(appointmentDateTime(new Date(year, month, day), time).toISOString()).toBe(iso);
  });

  it("keeps the same business appointment across visitor time zones", () => {
    const previous = process.env.TZ;
    try {
      for (const zone of ["UTC", "America/New_York", "Asia/Tokyo"]) {
        process.env.TZ = zone;
        expect(appointmentDateTime(new Date(2026, 6, 15), "08:00").toISOString()).toBe(
          "2026-07-15T06:00:00.000Z",
        );
        const today = appointmentCalendarToday(new Date("2026-10-28T23:30:00Z"));
        expect([today.getFullYear(), today.getMonth(), today.getDate()]).toEqual([2026, 9, 29]);
      }
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
});
