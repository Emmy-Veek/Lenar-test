import { addDays, format, setHours, setMinutes, startOfDay } from "date-fns";

import type { Availability } from "@/types";

const dayMap: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function parseTime(time: string): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return { hours: 9, minutes: 0 };
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/** Returns next few suggested study slots for display (MVP heuristic). */
export function upcomingSlots(availability: Availability | null, count = 5): { label: string; at: Date }[] {
  if (!availability?.days?.length) {
    const start = startOfDay(new Date());
    return Array.from({ length: count }).map((_, i) => ({
      label: format(addDays(start, i), "EEE MMM d") + " · 9:00 AM (default)",
      at: setMinutes(setHours(addDays(start, i), 9), 0),
    }));
  }

  const keys = availability.days.map((d) => d.toLowerCase().slice(0, 3));
  const targetDow = keys.map((k) => dayMap[k]).filter((n) => n === 0 || n > 0);
  const { hours, minutes } = parseTime(availability.time || "09:00");

  const out: { label: string; at: Date }[] = [];
  let cursor = startOfDay(new Date());
  for (let i = 0; i < 21 && out.length < count; i++) {
    const candidate = setMinutes(setHours(addDays(cursor, i), hours), minutes);
    const dow = candidate.getDay();
    if (targetDow.includes(dow)) {
      out.push({
        label: format(candidate, "EEE MMM d") + ` · ${format(candidate, "h:mm a")}`,
        at: candidate,
      });
    }
  }
  return out;
}

export function formatSlotDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}
