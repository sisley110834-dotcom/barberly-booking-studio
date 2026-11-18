export type PayoutProfile = {
  id: string;
  display_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
};

/** Shop onboarding is complete only when the shop name and both bank fields are filled. */
export function isOnboarded(p: PayoutProfile | undefined): boolean {
  return Boolean(
    p?.display_name?.trim() && p.bank_account_name?.trim() && p.bank_account_number?.trim(),
  );
}
