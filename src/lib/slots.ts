export type SlotWindow = { starts_at: string; ends_at: string };

/**
 * Splits [start, end) into consecutive `slotMinutes`-long windows.
 * A trailing remainder shorter than one slot is dropped.
 */
export function buildSlots(start: Date, end: Date, slotMinutes: number): SlotWindow[] {
  if (slotMinutes <= 0 || !(end > start)) return [];
  const step = slotMinutes * 60_000;
  const out: SlotWindow[] = [];
  for (let t = start.getTime(); t + step <= end.getTime(); t += step) {
    out.push({ starts_at: new Date(t).toISOString(), ends_at: new Date(t + step).toISOString() });
  }
  return out;
}

/** Combines a `yyyy-MM-dd` date and an `HH:mm` time into a local Date. */
export function localDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}
