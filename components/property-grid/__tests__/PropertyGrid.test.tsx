import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyGrid } from "@/components/property-grid/PropertyGrid";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
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

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyGrid", () => {
  it("renders the flagged property first as featured, sized larger", () => {
    const properties = [
      makeProperty({ id: "p1", title: "Casa Um", featured: false }),
      makeProperty({ id: "p2", title: "Casa Destaque", featured: true }),
    ];
    render(<PropertyGrid properties={properties} whatsappNumber="5541999999999" />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("Casa Destaque");
    expect(headings[0]).toHaveClass("text-xl");
    expect(headings[1]).toHaveTextContent("Casa Um");
    expect(headings[1]).toHaveClass("text-base");
  });

  it("falls back to the first property when none is flagged featured", () => {
    const properties = [
      makeProperty({ id: "p1", title: "Primeira Casa" }),
      makeProperty({ id: "p2", title: "Segunda Casa" }),
    ];
    render(<PropertyGrid properties={properties} whatsappNumber="5541999999999" />);
    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent("Primeira Casa");
  });

  it("shows an empty-state message when the filtered list is empty", () => {
    render(<PropertyGrid properties={[]} whatsappNumber="5541999999999" />);
    expect(screen.getByText(/nenhum imóvel para esses filtros/i)).toBeInTheDocument();
    expect(screen.getByText(/ampliar a faixa de preço/i)).toBeInTheDocument();
  });
});
