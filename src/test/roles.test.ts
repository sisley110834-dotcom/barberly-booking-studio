import { describe, expect, it } from "vitest";
import { DEFAULT_ROLE, ROLE_OPTIONS, isBarber } from "@/lib/roles";

describe("roles", () => {
  it("defaults sign-up role to customer", () => {
    expect(DEFAULT_ROLE).toBe("customer");
  });
  it("Barber tab maps to role value shop", () => {
    expect(ROLE_OPTIONS.find((o) => o.label === "Barber")?.value).toBe("shop");
    expect(ROLE_OPTIONS.find((o) => o.label === "Customer")?.value).toBe("customer");
  });
  it("only shop accounts are barbers", () => {
    expect(isBarber({ role: "shop" })).toBe(true);
    expect(isBarber({ role: "customer" })).toBe(false);
    expect(isBarber({})).toBe(false);
  });
});
