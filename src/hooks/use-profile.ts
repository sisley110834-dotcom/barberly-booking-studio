import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CURRENCY } from "@/lib/money";

export const PROFILE_COLUMNS =
  "id, email, display_name, role, bank_account_name, bank_account_number";

/** The signed-in user's own `profiles` row (RLS: profiles_select_own). Role checks read this. */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** The single-row platform config (currency + slot length). World-readable. */
export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platform_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("currency, currency_minor_units, slot_minutes")
        .maybeSingle();
      if (error) throw error;
      return data ?? { ...DEFAULT_CURRENCY, slot_minutes: 30 };
    },
    staleTime: 5 * 60_000,
  });
}

/** All barbers owned by this shop. */
export function useMyBarbers(shopId: string) {
  return useQuery({
    queryKey: ["barbers", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("id, shop_id, name, intro, address, created_at")
        .eq("shop_id", shopId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}
