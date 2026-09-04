import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingFilterBar } from "@/components/filters/FloatingFilterBar";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("FloatingFilterBar", () => {
  it("updates the shared store from the transaction segments", () => {
    render(<FloatingFilterBar propertyTypes={["Casa", "Apartamento"]} />);
    const segments = screen.getByRole("group", { name: /transação/i });

    fireEvent.click(screen.getByRole("button", { name: "Alugar" }));
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
    expect(screen.getByRole("button", { name: "Alugar" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Comprar" })).toHaveAttribute("aria-pressed", "false");
    expect(segments).toBeInTheDocument();
  });

  it("updates the store when the location input changes", () => {
    render(<FloatingFilterBar propertyTypes={["Casa"]} />);
    fireEvent.change(screen.getByLabelText(/localização/i), { target: { value: "Batel" } });
    expect(useFilterStore.getState().filters.location).toBe("Batel");
  });

  it("updates the store when bedrooms changes", () => {
    render(<FloatingFilterBar propertyTypes={["Casa"]} />);
    fireEvent.change(screen.getByLabelText(/quartos/i), { target: { value: "3" } });
    expect(useFilterStore.getState().filters.bedrooms).toBe(3);
  });

  it("updates the price range from the min/max inputs", () => {
    render(<FloatingFilterBar propertyTypes={["Casa"]} />);
    fireEvent.change(screen.getByLabelText(/preço mínimo/i), { target: { value: "500000" } });
    fireEvent.change(screen.getByLabelText(/preço máximo/i), { target: { value: "900000" } });
    expect(useFilterStore.getState().filters.priceRange).toEqual([500000, 900000]);
  });
});
