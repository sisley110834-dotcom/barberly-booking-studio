import { describe, expect, it } from "vitest";
import {
  CUSTOMER_HOME,
  DEFAULT_ROLE,
  ROLE_OPTIONS,
  SHOP_HOME,
  homePathFor,
  isShop,
} from "@/lib/roles";

describe("roles", () => {
  it("defaults sign-up role to customer", () => {
    expect(DEFAULT_ROLE).toBe("customer");
  });
  it("Barber tab maps to role value shop", () => {
    expect(ROLE_OPTIONS.find((o) => o.label === "Barber")?.value).toBe("shop");
    expect(ROLE_OPTIONS.find((o) => o.label === "Customer")?.value).toBe("customer");
  });
  it("only shop profiles are shops", () => {
    expect(isShop("shop")).toBe(true);
    expect(isShop("customer")).toBe(false);
    expect(isShop(undefined)).toBe(false);
  });
  it("routes shops to the dashboard and everyone else to the customer landing", () => {
    expect(homePathFor("shop")).toBe(SHOP_HOME);
    expect(homePathFor("customer")).toBe(CUSTOMER_HOME);
    expect(homePathFor(null)).toBe(CUSTOMER_HOME);
  });
  it("sign-up options never include admin", () => {
    expect(ROLE_OPTIONS.map((o) => o.value)).not.toContain("admin");
  });
});
