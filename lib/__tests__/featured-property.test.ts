import { describe, it, expect } from "vitest";
import { resolveFeaturedProperty } from "@/lib/featured-property";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
    ...overrides,
  };
}

describe("resolveFeaturedProperty", () => {
  it("returns the property flagged as featured", () => {
    const properties = [
      makeProperty({ id: "p1", featured: false }),
      makeProperty({ id: "p2", featured: true }),
    ];
    expect(resolveFeaturedProperty(properties)?.id).toBe("p2");
  });

  it("falls back to the first item when nothing is flagged featured", () => {
    const properties = [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })];
    expect(resolveFeaturedProperty(properties)?.id).toBe("p1");
  });

  it("returns undefined for an empty list", () => {
    expect(resolveFeaturedProperty([])).toBeUndefined();
  });
});
