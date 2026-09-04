import { describe, it, expect } from "vitest";
import { getProperties } from "@/lib/content/properties";

describe("getProperties", () => {
  it("returns the 8 demo properties", () => {
    expect(getProperties()).toHaveLength(8);
  });

  it("gives every property the required shape", () => {
    for (const property of getProperties()) {
      expect(typeof property.id).toBe("string");
      expect(["venda", "aluguel"]).toContain(property.transaction);
      expect(property.photos).toHaveLength(3);
    }
  });

  it("has exactly one featured property", () => {
    expect(getProperties().filter((p) => p.featured)).toHaveLength(1);
  });
});
