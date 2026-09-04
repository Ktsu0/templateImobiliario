import type { Property } from "@/lib/content/types";

export interface FilterState {
  transaction: "todos" | "venda" | "aluguel";
  propertyType: string;
  location: string;
  priceRange: [number, number];
  bedrooms: number;
}

export const DEFAULT_FILTERS: FilterState = {
  transaction: "todos",
  propertyType: "todos",
  location: "",
  priceRange: [0, Infinity],
  bedrooms: 0,
};

export function filterProperties(properties: Property[], filters: FilterState): Property[] {
  return properties.filter((property) => {
    if (filters.transaction !== "todos" && property.transaction !== filters.transaction) {
      return false;
    }
    if (filters.propertyType !== "todos" && property.type !== filters.propertyType) {
      return false;
    }
    if (filters.location.trim() !== "") {
      const needle = filters.location.trim().toLowerCase();
      if (!property.location.toLowerCase().includes(needle)) return false;
    }
    if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
      return false;
    }
    if (property.bedrooms < filters.bedrooms) return false;
    return true;
  });
}
