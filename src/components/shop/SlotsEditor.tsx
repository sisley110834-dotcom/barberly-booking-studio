import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildSlots, localDateTime } from "@/lib/slots";
import { field, label, panel } from "./styles";

type Slot = { id: string; starts_at: string; ends_at: string };

/** Publish bookable time windows for one barber. Each slot is `slotMinutes` long; no status column. */
export function SlotsEditor({ barberId, slotMinutes }: { barberId: string; slotMinutes: number }) {
  const queryClient = useQueryClient();
  const key = ["bookable_slots", barberId];
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("18:00");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string; time: string } | null>(null);

  const { data: slots = [] } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Slot[]> => {
      const { data, error } = await supabase
        .from("bookable_slots")
        .select("id, starts_at, ends_at")
        .eq("barber_id", barberId)
        .gte("ends_at", new Date().toISOString())
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const preview = useMemo(
    () => buildSlots(localDateTime(date, from), localDateTime(date, to), slotMinutes),
    [date, from, to, slotMinutes],
  );

  const byDay = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const s of slots) {
      const day = format(new Date(s.starts_at), "yyyy-MM-dd (EEE)");
      groups.set(day, [...(groups.get(day) ?? []), s]);
    }
    return [...groups.entries()];
  }, [slots]);

  async function publish(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const taken = new Set(slots.map((s) => s.starts_at && new Date(s.starts_at).getTime()));
    const fresh = preview.filter((p) => !taken.has(new Date(p.starts_at).getTime()));
    if (!preview.length)
      return setMsg({ ok: false, text: `Pick a range of at least ${slotMinutes} minutes.` });
    if (!fresh.length) return setMsg({ ok: false, text: "Those slots are already published." });
    setBusy(true);
    const { error } = await supabase
      .from("bookable_slots")
      .insert(fresh.map((s) => ({ barber_id: barberId, ...s })));
    setBusy(false);
    await refresh();
    if (error) return setMsg({ ok: false, text: error.message });
    const skipped = preview.length - fresh.length;
    setMsg({
      ok: true,
      text: `Published ${fresh.length} slot${fresh.length > 1 ? "s" : ""}${skipped ? ` (${skipped} already existed)` : ""}.`,
    });
  }

  async function saveEdit(slot: Slot, time: string) {
    const start = localDateTime(format(new Date(slot.starts_at), "yyyy-MM-dd"), time);
    const end = new Date(start.getTime() + slotMinutes * 60_000);
    const { error } = await supabase
      .from("bookable_slots")
      .update({ starts_at: start.toISOString(), ends_at: end.toISOString() })
      .eq("id", slot.id);
    if (error) window.alert(error.message);
    setEditing(null);
    await refresh();
  }

  async function remove(ids: string[]) {
    if (!ids.length) return;
    const { error } = await supabase.from("bookable_slots").delete().in("id", ids);
    if (error) window.alert(error.message);
    await refresh();
  }

  return (
    <section className={panel} aria-labelledby="slots-heading">
      <h2 id="slots-heading" className="text-2xl font-medium">
        可預約時段 / Bookable slots
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Each slot is a {slotMinutes}-minute window. Pick a day and a time range and we'll publish
        consecutive {slotMinutes}-minute slots across it.
      </p>

      <form
        onSubmit={publish}
        className="mt-6 grid items-end gap-3 rounded-2xl bg-white/60 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <label className={label}>
          日期 / Date
          <input
            type="date"
            className={`${field} mt-1.5`}
            required
            value={date}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className={label}>
          開始 / From
          <input
            type="time"
            className={`${field} mt-1.5`}
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className={label}>
          結束 / To
          <input
            type="time"
            className={`${field} mt-1.5`}
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <Button
          type="submit"
          variant="pill"
          className="h-11 px-5"
          disabled={busy || !preview.length}
        >
          {busy
            ? "Publishing…"
            : `Publish ${preview.length} slot${preview.length === 1 ? "" : "s"}`}
        </Button>
        {msg && (
          <p
            className={`text-sm sm:col-span-4 ${msg.ok ? "text-muted-foreground" : "text-destructive"}`}
          >
            {msg.text}
          </p>
        )}
      </form>

      <div className="mt-6 space-y-4">
        {byDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming slots published yet.</p>
        ) : (
          byDay.map(([day, list]) => (
            <div key={day}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {day} · {list.length} slot{list.length > 1 ? "s" : ""}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    window.confirm(`Delete all ${list.length} slots on ${day}?`) &&
                    void remove(list.map((s) => s.id))
                  }
                >
                  Clear day
                </Button>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {list.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-1 rounded-full bg-white/80 py-1 pl-3 pr-1 text-sm"
                  >
                    {editing?.id === s.id ? (
                      <>
                        <input
                          type="time"
                          className="h-7 rounded-md border border-input bg-white px-1 text-xs"
                          value={editing.time}
                          onChange={(e) => setEditing({ id: s.id, time: e.target.value })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => void saveEdit(s, editing.time)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => setEditing(null)}
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="hover:underline"
                          title="Change start time"
                          onClick={() =>
                            setEditing({ id: s.id, time: format(new Date(s.starts_at), "HH:mm") })
                          }
                        >
                          {format(new Date(s.starts_at), "HH:mm")}–
                          {format(new Date(s.ends_at), "HH:mm")}
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive"
                          aria-label="Delete slot"
                          onClick={() => void remove([s.id])}
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
