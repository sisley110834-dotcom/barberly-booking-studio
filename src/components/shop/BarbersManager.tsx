import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useMyBarbers } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { PHOTO_BUCKET, PhotoManager } from "./PhotoManager";
import { area, field, label, panel } from "./styles";

type Barber = { id: string; name: string; intro: string | null; address: string | null };
type Draft = { name: string; intro: string; address: string };

const emptyDraft: Draft = { name: "", intro: "", address: "" };

function BarberForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!d.name.trim()) return setError("Name is required.");
    setBusy(true);
    setError(await onSubmit(d));
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <div>
        <label className={label}>
          名稱 / Name <span className="text-destructive">*</span>
          <input
            className={`${field} mt-1.5`}
            required
            value={d.name}
            onChange={(e) => setD({ ...d, name: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label className={label}>
          地址 / Address
          <input
            className={`${field} mt-1.5`}
            value={d.address}
            onChange={(e) => setD({ ...d, address: e.target.value })}
          />
        </label>
      </div>
      <div className="md:col-span-2">
        <label className={label}>
          簡介 / Intro
          <textarea
            className={`${area} mt-1.5`}
            value={d.intro}
            placeholder="簡短介紹一下這位理髮師 / a short bio"
            onChange={(e) => setD({ ...d, intro: e.target.value })}
          />
        </label>
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <Button type="submit" variant="pill" className="px-6" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="pillOutline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </form>
  );
}

const toRow = (d: Draft) => ({
  name: d.name.trim(),
  intro: d.intro.trim() || null,
  address: d.address.trim() || null,
});

/** CRUD for the shop's barbers (one shop → many barbers), each with its own photo set. */
export function BarbersManager({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient();
  const { data: barbers = [], isLoading } = useMyBarbers(shopId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["barbers", shopId] });

  async function create(d: Draft) {
    const { error } = await supabase.from("barbers").insert({ shop_id: shopId, ...toRow(d) });
    if (error) return error.message;
    setAdding(false);
    await refresh();
    return null;
  }

  async function save(id: string, d: Draft) {
    const { error } = await supabase.from("barbers").update(toRow(d)).eq("id", id);
    if (error) return error.message;
    setEditing(null);
    await refresh();
    return null;
  }

  async function remove(b: Barber) {
    if (!window.confirm(`Delete ${b.name}? Their services, slots and photos are removed too.`))
      return;
    // Storage objects aren't cascaded by the FK, so clear this barber's folder first.
    const { data: files } = await supabase.storage.from(PHOTO_BUCKET).list(b.id, { limit: 1000 });
    if (files?.length)
      await supabase.storage.from(PHOTO_BUCKET).remove(files.map((f) => `${b.id}/${f.name}`));
    const { error } = await supabase.from("barbers").delete().eq("id", b.id);
    if (error) window.alert(error.message);
    await refresh();
  }

  return (
    <section className={panel} aria-labelledby="barbers-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="barbers-heading" className="text-2xl font-medium">
          我的理髮師 / My barbers
        </h2>
        {!adding && (
          <Button variant="pill" size="sm" className="px-4" onClick={() => setAdding(true)}>
            {barbers.length ? "新增一位理髮師 / Add another barber" : "新增理髮師 / Add a barber"}
          </Button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        A shop can list as many barbers as it runs. Each one has its own profile, photos, services
        and schedule.
      </p>

      {adding && (
        <div className="mt-6 rounded-2xl bg-white/60 p-4">
          <BarberForm
            initial={emptyDraft}
            submitLabel="Add barber"
            onSubmit={create}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : barbers.length === 0 && !adding ? (
        <p className="mt-6 text-sm text-muted-foreground">No barbers yet. Add your first one.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {barbers.map((b) => (
            <li key={b.id} className="rounded-2xl bg-white/60 p-4 md:p-5">
              {editing === b.id ? (
                <BarberForm
                  initial={{ name: b.name, intro: b.intro ?? "", address: b.address ?? "" }}
                  submitLabel="Save"
                  onSubmit={(d) => save(b.id, d)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium">{b.name}</h3>
                    {b.address && <p className="text-sm text-muted-foreground">{b.address}</p>}
                    {b.intro && <p className="mt-2 whitespace-pre-line text-sm">{b.intro}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="pillOutline" onClick={() => setEditing(b.id)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="pillOutline"
                      className="text-destructive"
                      onClick={() => void remove(b)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              <PhotoManager barberId={b.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
