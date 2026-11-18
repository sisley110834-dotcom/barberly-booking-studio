import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const PHOTO_BUCKET = "barber-photos";

type Photo = {
  id: string;
  storage_path: string;
  caption: string | null;
  is_featured: boolean;
  sort_order: number;
};

function publicUrl(path: string): string {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Sample hairstyle photos for one barber. Files go to `barber-photos/<barber_id>/<uuid>.<ext>`. */
export function PhotoManager({ barberId }: { barberId: string }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = ["barber_photos", barberId];

  const { data: photos = [] } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Photo[]> => {
      const { data, error } = await supabase
        .from("barber_photos")
        .select("id, storage_path, caption, is_featured, sort_order")
        .eq("barber_id", barberId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  async function run(task: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  function upload(files: FileList | null) {
    if (!files?.length) return;
    void run(async () => {
      let next = photos.reduce((m, p) => Math.max(m, p.sort_order), -1) + 1;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${barberId}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (up.error) throw up.error;
        const { error } = await supabase
          .from("barber_photos")
          .insert({ barber_id: barberId, storage_path: path, sort_order: next++ });
        if (error) {
          await supabase.storage.from(PHOTO_BUCKET).remove([path]);
          throw error;
        }
      }
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  const update = (
    id: string,
    patch: { caption?: string | null; is_featured?: boolean; sort_order?: number },
  ) =>
    run(async () => {
      const { error } = await supabase.from("barber_photos").update(patch).eq("id", id);
      if (error) throw error;
    });

  const remove = (photo: Photo) =>
    run(async () => {
      const st = await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
      if (st.error) throw st.error;
      const { error } = await supabase.from("barber_photos").delete().eq("id", photo.id);
      if (error) throw error;
    });

  /** Swap positions with the neighbour, then renumber so sort_order stays 0..n-1. */
  const move = (index: number, dir: -1 | 1) =>
    run(async () => {
      const order = [...photos];
      const target = index + dir;
      const a = order[index];
      const b = order[target];
      if (!a || !b) return;
      order[index] = b;
      order[target] = a;
      const results = await Promise.all(
        order.map((p, i) =>
          p.sort_order === i
            ? Promise.resolve({ error: null })
            : supabase.from("barber_photos").update({ sort_order: i }).eq("id", p.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    });

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium">作品照 / Sample hairstyle photos</h4>
        <Button
          size="sm"
          variant="pillOutline"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? "Working…" : "Upload photos"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {photos.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No photos yet. Upload a few haircuts this barber is proud of.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-2xl bg-white/80 shadow-sm">
              <div className="relative">
                <img
                  src={publicUrl(p.storage_path)}
                  alt={p.caption ?? "Hairstyle sample"}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                {p.is_featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-balloon-yellow px-2 py-0.5 text-xs font-medium">
                    精選 Featured
                  </span>
                )}
              </div>
              <div className="space-y-2 p-2">
                <input
                  className="h-8 w-full rounded-lg border border-input bg-white px-2 text-xs"
                  placeholder="Caption (optional)"
                  defaultValue={p.caption ?? ""}
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== p.caption) void update(p.id, { caption: v });
                  }}
                />
                <div className="flex items-center justify-between gap-1">
                  <label className="flex cursor-pointer items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={p.is_featured}
                      disabled={busy}
                      onChange={(e) => void update(p.id, { is_featured: e.target.checked })}
                    />
                    <Star className="size-3" /> 精選 / Featured
                  </label>
                  <div className="flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label="Move earlier"
                      disabled={busy || i === 0}
                      onClick={() => void move(i, -1)}
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label="Move later"
                      disabled={busy || i === photos.length - 1}
                      onClick={() => void move(i, 1)}
                    >
                      <ArrowRight />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      aria-label="Delete photo"
                      disabled={busy}
                      onClick={() => void remove(p)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
