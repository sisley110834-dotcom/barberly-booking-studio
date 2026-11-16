export type Role = "customer" | "shop";

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: "Customer", value: "customer" },
  { label: "Barber", value: "shop" },
];

export const DEFAULT_ROLE: Role = "customer";

export function isBarber(metadata: Record<string, unknown> | null | undefined): boolean {
  return metadata?.["role"] === "shop";
}
