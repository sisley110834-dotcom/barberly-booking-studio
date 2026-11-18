import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, type CurrencySettings } from "@/lib/money";
import { field, label, panel } from "./styles";

export const CATEGORIES = ["cut", "color", "perm", "beard"] as const;
type Category = (typeof CATEGORIES)[number];

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  required_slots: number;
};
type Draft = { name: string; category: Category; price: string; required_slots: string };

const emptyDraft: Draft = { name: "", category: "cut", price: "", required_slots: "1" };

function parseDraft(d: Draft): { error: string } | { row: Omit<Service, "id"> } {
  const price = Number(d.price);
  const slots = Number(d.required_slots);
  if (!d.name.trim()) return { error: "Name is required." };
  if (!Number.isInteger(price) || price < 0) return { error: "Price must be a whole number ≥ 0." };
  if (!Number.isInteger(slots) || slots < 1)
    return { error: "Required slots must be a whole number ≥ 1." };
  // Price is stored as-is in whole currency units (e.g. 300 = NT$300). Never ×100 here.
  return { row: { name: d.name.trim(), category: d.category, price, required_slots: slots } };
}

function ServiceRow({
  initial,
  submitLabel,
  slotMinutes,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  slotMinutes: number;
  onSubmit: (row: Omit<Service, "id">) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slots = Number(d.required_slots);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseDraft(d);
    if ("error" in parsed) return setError(parsed.error);
    setBusy(true);
    const err = await onSubmit(parsed.row);
    setBusy(false);
    setError(err);
    if (!err && !onCancel) setD(emptyDraft);
  }

  return (
    <form
      onSubmit={submit}
      className="grid items-end gap-3 rounded-2xl bg-white/60 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"
    >
      <label className={label}>
        名稱 / Name
        <input
          className={`${field} mt-1.5`}
          required
          value={d.name}
          placeholder="e.g. Classic cut"
          onChange={(e) => setD({ ...d, name: e.target.value })}
        />
      </label>
      <label className={label}>
        分類 / Category
        <select
          className={`${field} mt-1.5`}
          value={d.category}
          onChange={(e) => setD({ ...d, category: e.target.value as Category })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        價格 / Price
        <input
          className={`${field} mt-1.5`}
          required
          type="number"
          min={0}
          step={1}
          value={d.price}
          placeholder="300"
          onChange={(e) => setD({ ...d, price: e.target.value })}
        />
      </label>
      <label className={label}>
        所需時段數 / Slots
        <input
          className={`${field} mt-1.5`}
          required
          type="number"
          min={1}
          step={1}
          value={d.required_slots}
          onChange={(e) => setD({ ...d, required_slots: e.target.value })}
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="pill" className="h-11 px-5" disabled={busy}>
          {busy ? "…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="pillOutline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-5">
        {Number.isInteger(slots) && slots >= 1
          ? `Takes ${slots} consecutive slot${slots > 1 ? "s" : ""} (${slots * slotMinutes} min).`
          : ""}
        {error && <span className="ml-2 text-destructive">{error}</span>}
      </p>
    </form>
  );
}

/** Services & price editor for one barber. */
export function ServicesEditor({
  barberId,
  currency,
  slotMinutes,
}: {
  barberId: string;
  currency: CurrencySettings;
  slotMinutes: number;
}) {
  const queryClient = useQueryClient();
  const key = ["services", barberId];
  const [editing, setEditing] = useState<string | null>(null);
  const { data: services = [] } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, category, price, required_slots")
        .eq("barber_id", barberId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  async function create(row: Omit<Service, "id">) {
    const { error } = await supabase.from("services").insert({ barber_id: barberId, ...row });
    await refresh();
    return error?.message ?? null;
  }
  async function save(id: string, row: Omit<Service, "id">) {
    const { error } = await supabase.from("services").update(row).eq("id", id);
    if (!error) setEditing(null);
    await refresh();
    return error?.message ?? null;
  }
  async function remove(s: Service) {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    const { error } = await supabase.from("services").delete().eq("id", s.id);
    if (error) window.alert(error.message);
    await refresh();
  }

  return (
    <section className={panel} aria-labelledby="services-heading">
      <h2 id="services-heading" className="text-2xl font-medium">
        服務與價格 / Services &amp; prices
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Prices are whole amounts in {currency.currency.toUpperCase()} (e.g. 300 ={" "}
        {formatMoney(300, currency)}).
      </p>
      <ul className="mt-6 space-y-3">
        {services.map((s) =>
          editing === s.id ? (
            <li key={s.id}>
              <ServiceRow
                initial={{
                  name: s.name,
                  category: (CATEGORIES as readonly string[]).includes(s.category)
                    ? (s.category as Category)
                    : "cut",
                  price: String(s.price),
                  required_slots: String(s.required_slots),
                }}
                submitLabel="Save"
                slotMinutes={slotMinutes}
                onSubmit={(row) => save(s.id, row)}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3"
            >
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 rounded-full bg-balloon-blue px-2 py-0.5 text-xs">
                  {s.category}
                </span>
                <span className="ml-3 text-sm text-muted-foreground">
                  {formatMoney(s.price, currency)} · {s.required_slots} slot
                  {s.required_slots > 1 ? "s" : ""} ({s.required_slots * slotMinutes} min)
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="pillOutline" onClick={() => setEditing(s.id)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="pillOutline"
                  className="text-destructive"
                  onClick={() => void remove(s)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">新增服務 / Add a service</p>
        <ServiceRow
          initial={emptyDraft}
          submitLabel="Add"
          slotMinutes={slotMinutes}
          onSubmit={create}
        />
      </div>
    </section>
  );
}
