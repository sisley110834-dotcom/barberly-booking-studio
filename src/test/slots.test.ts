import { describe, expect, it } from "vitest";
import { buildSlots } from "@/lib/slots";
import { formatMoney } from "@/lib/money";

describe("buildSlots", () => {
  const start = new Date("2026-12-01T10:00:00Z");
  it("splits a range into slot-length windows", () => {
    const slots = buildSlots(start, new Date("2026-12-01T11:30:00Z"), 30);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({
      starts_at: "2026-12-01T10:00:00.000Z",
      ends_at: "2026-12-01T10:30:00.000Z",
    });
    expect(slots[2]?.ends_at).toBe("2026-12-01T11:30:00.000Z");
  });
  it("drops a trailing remainder shorter than one slot", () => {
    expect(buildSlots(start, new Date("2026-12-01T10:45:00Z"), 30)).toHaveLength(1);
  });
  it("returns nothing for an empty or inverted range", () => {
    expect(buildSlots(start, start, 30)).toEqual([]);
    expect(buildSlots(start, new Date("2026-12-01T09:00:00Z"), 30)).toEqual([]);
  });
});

describe("formatMoney", () => {
  it("shows whole TWD without multiplying", () => {
    expect(formatMoney(300)).toMatch(/300/);
    expect(formatMoney(300)).not.toMatch(/30,?000/);
  });
});
