/** Roles a user can pick at sign-up or upgrade to. `admin` exists in the DB but is never self-served. */
export type Role = "customer" | "shop";

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: "Customer", value: "customer" },
  { label: "Barber", value: "shop" },
];

export const DEFAULT_ROLE: Role = "customer";

export const CUSTOMER_HOME = "/barbers";
export const SHOP_HOME = "/shop";

/** True when a `profiles.role` value is a shop. Always pass the profiles row, never auth metadata. */
export function isShop(role: string | null | undefined): boolean {
  return role === "shop";
}

/** Where to send a user after sign-in, based on `profiles.role`. */
export function homePathFor(role: string | null | undefined): string {
  return isShop(role) ? SHOP_HOME : CUSTOMER_HOME;
}
