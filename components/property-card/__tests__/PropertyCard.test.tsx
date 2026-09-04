import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyCard } from "@/components/property-card/PropertyCard";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Property } from "@/lib/content/types";

const property: Property = {
  id: "p1",
  title: "Casa Contemporânea Bigorrilho",
  transaction: "venda",
  type: "Casa",
  price: 1450000,
  location: "Bigorrilho, Curitiba",
  bedrooms: 4,
  suites: 2,
  area: 320,
  parkingSpots: 3,
  status: "exclusivo",
  featured: true,
  photos: ["/a.webp", "/b.webp", "/c.webp"],
};

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyCard", () => {
  it("renders title, status badge, price, and attribute counts", () => {
    render(<PropertyCard property={property} variant="featured" whatsappNumber="5541999999999" />);
    expect(screen.getByRole("heading", { level: 3, name: "Casa Contemporânea Bigorrilho" })).toBeInTheDocument();
    expect(screen.getByText("Exclusivo")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.450.000,00")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("320 m²")).toBeInTheDocument();
  });

  it("links the WhatsApp CTA to the correct wa.me URL", () => {
    render(<PropertyCard property={property} variant="default" whatsappNumber="5541999999999" />);
    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("https://wa.me/5541999999999?text="));
  });

  it("toggles the favorite state in the shared store", () => {
    render(<PropertyCard property={property} variant="default" whatsappNumber="5541999999999" />);
    fireEvent.click(screen.getByRole("button", { name: /adicionar aos favoritos/i }));

    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);
    expect(screen.getByRole("button", { name: /remover dos favoritos/i })).toBeInTheDocument();
  });
});
