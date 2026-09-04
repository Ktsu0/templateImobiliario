import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBottomSheet } from "@/components/filters/FilterBottomSheet";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("FilterBottomSheet", () => {
  it("is closed by default and opens when the floating button is clicked", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));
    expect(screen.getByRole("dialog", { name: /filtros/i })).toBeInTheDocument();
  });

  it("updates the shared store from within the sheet", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));
    fireEvent.change(screen.getByLabelText(/transação/i), { target: { value: "aluguel" } });
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
  });

  it("closes when 'Aplicar filtros' is clicked", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));
    fireEvent.click(screen.getByRole("button", { name: /aplicar filtros/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
