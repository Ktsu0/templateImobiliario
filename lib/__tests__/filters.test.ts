import { describe, it, expect } from "vitest";
import { filterProperties, DEFAULT_FILTERS } from "@/lib/filters";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho, Curitiba",
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

const properties: Property[] = [
  makeProperty({ id: "p1", transaction: "venda", type: "Casa", price: 500000, location: "Bigorrilho", bedrooms: 3 }),
  makeProperty({ id: "p2", transaction: "aluguel", type: "Apartamento", price: 3000, location: "Batel", bedrooms: 2 }),
  makeProperty({ id: "p3", transaction: "venda", type: "Cobertura", price: 1200000, location: "Água Verde", bedrooms: 4 }),
];

describe("filterProperties", () => {
  it("returns every property when filters are at their defaults", () => {
    expect(filterProperties(properties, DEFAULT_FILTERS)).toEqual(properties);
  });

  it("filters by transaction", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, transaction: "aluguel" });
    expect(result.map((p) => p.id)).toEqual(["p2"]);
  });

  it("filters by property type", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, propertyType: "Cobertura" });
    expect(result.map((p) => p.id)).toEqual(["p3"]);
  });

  it("filters by location as a case-insensitive substring", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, location: "batel" });
    expect(result.map((p) => p.id)).toEqual(["p2"]);
  });

  it("filters by price range (inclusive)", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, priceRange: [400000, 600000] });
    expect(result.map((p) => p.id)).toEqual(["p1"]);
  });

  it("filters by minimum bedrooms", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, bedrooms: 4 });
    expect(result.map((p) => p.id)).toEqual(["p3"]);
  });

  it("combines multiple filters", () => {
    const result = filterProperties(properties, {
      ...DEFAULT_FILTERS,
      transaction: "venda",
      bedrooms: 3,
    });
    expect(result.map((p) => p.id)).toEqual(["p1", "p3"]);
  });
});
