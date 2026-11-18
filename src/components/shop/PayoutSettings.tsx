import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { field, hint, label, panel } from "./styles";

import type { PayoutProfile as Profile } from "@/lib/onboarding";

/** Shop-level payout settings on `profiles`: shop name + bank account. All three required. */
export function PayoutSettings({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [shopName, setShopName] = useState(profile.display_name ?? "");
  const [accountName, setAccountName] = useState(profile.bank_account_name ?? "");
  const [accountNumber, setAccountNumber] = useState(profile.bank_account_number ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setShopName(profile.display_name ?? "");
    setAccountName(profile.bank_account_name ?? "");
    setAccountNumber(profile.bank_account_number ?? "");
  }, [profile.display_name, profile.bank_account_name, profile.bank_account_number]);

  const complete = Boolean(shopName.trim() && accountName.trim() && accountNumber.trim());

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!complete)
      return setMsg({ ok: false, text: "Shop name and both bank fields are required." });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: shopName.trim(),
        bank_account_name: accountName.trim(),
        bank_account_number: accountNumber.trim(),
      })
      .eq("id", profile.id);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved." });
    await queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
  }

  return (
    <section className={panel} aria-labelledby="payout-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="payout-heading" className="text-2xl font-medium">
          撥款設定 / Payout settings
        </h2>
        <span className="rounded-full bg-balloon-yellow px-3 py-1 text-xs font-medium">
          先用測試資料即可 / use test data first
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        你的理髮店收款的銀行帳戶 / the bank account where your shop gets paid. Shared by all your
        barbers, and only visible to you and the platform admin.
      </p>
      <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label} htmlFor="shop-name">
            店名 / Shop name <span className="text-destructive">*</span>
          </label>
          <input
            id="shop-name"
            className={`${field} mt-1.5`}
            required
            value={shopName}
            placeholder="e.g. Downtown Cuts"
            onChange={(e) => setShopName(e.target.value)}
          />
          <p className={hint}>
            你的理髮店名稱，會顯示在撥款紀錄上 / your shop's name, shown on payout records
          </p>
        </div>
        <div>
          <label className={label} htmlFor="bank-name">
            匯款戶名 / Account name <span className="text-destructive">*</span>
          </label>
          <input
            id="bank-name"
            className={`${field} mt-1.5`}
            required
            value={accountName}
            autoComplete="off"
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>
        <div>
          <label className={label} htmlFor="bank-number">
            匯款帳號 / Account number <span className="text-destructive">*</span>
          </label>
          <input
            id="bank-number"
            className={`${field} mt-1.5`}
            required
            value={accountNumber}
            autoComplete="off"
            inputMode="numeric"
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Button type="submit" variant="pill" className="px-6" disabled={busy || !complete}>
            {busy ? "Saving…" : "Save payout settings"}
          </Button>
          {msg && (
            <p className={`text-sm ${msg.ok ? "text-muted-foreground" : "text-destructive"}`}>
              {msg.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
