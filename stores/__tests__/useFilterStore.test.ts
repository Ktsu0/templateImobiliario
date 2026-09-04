import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("useFilterStore", () => {
  it("starts with the default filters", () => {
    expect(useFilterStore.getState().filters).toEqual(DEFAULT_FILTERS);
  });

  it("updates a single field via setFilter", () => {
    useFilterStore.getState().setFilter("transaction", "aluguel");
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
    expect(useFilterStore.getState().filters.propertyType).toBe(DEFAULT_FILTERS.propertyType);
  });

  it("resets to the defaults", () => {
    useFilterStore.getState().setFilter("bedrooms", 3);
    useFilterStore.getState().resetFilters();
    expect(useFilterStore.getState().filters).toEqual(DEFAULT_FILTERS);
  });
});
