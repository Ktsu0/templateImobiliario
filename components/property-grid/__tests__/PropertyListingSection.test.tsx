import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyListingSection } from "@/components/property-grid/PropertyListingSection";
import { useFilterStore } from "@/stores/useFilterStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { DEFAULT_FILTERS } from "@/lib/filters";
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

const properties: Property[] = [
  makeProperty({ id: "p1", title: "Casa à Venda", transaction: "venda", featured: true }),
  makeProperty({ id: "p2", title: "Apto Aluguel", transaction: "aluguel", type: "Apartamento" }),
];

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyListingSection", () => {
  it("renders every property when no filter is active", () => {
    render(<PropertyListingSection properties={properties} whatsappNumber="5541999999999" />);
    expect(screen.getByRole("heading", { level: 3, name: "Casa à Venda" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Apto Aluguel" })).toBeInTheDocument();
  });

  it("offers the distinct property types as filter options", () => {
    render(<PropertyListingSection properties={properties} whatsappNumber="5541999999999" />);
    const typeSelect = screen.getAllByLabelText(/tipo de imóvel/i)[0];
    const options = Array.from(typeSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["todos", "Casa", "Apartamento"]);
  });

  it("re-renders with only the matching properties when the shared filter changes", () => {
    render(<PropertyListingSection properties={properties} whatsappNumber="5541999999999" />);

    act(() => {
      useFilterStore.getState().setFilter("transaction", "aluguel");
    });

    expect(screen.queryByRole("heading", { level: 3, name: "Casa à Venda" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Apto Aluguel" })).toBeInTheDocument();
  });
});
