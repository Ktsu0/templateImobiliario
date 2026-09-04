import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format-price";

describe("formatPrice", () => {
  it("formats a sale price in BRL", () => {
    expect(formatPrice(450000, "venda")).toBe("R$ 450.000,00");
  });

  it("appends /mês for rentals", () => {
    expect(formatPrice(2500, "aluguel")).toBe("R$ 2.500,00/mês");
  });

  it("keeps two decimal places for non-round values", () => {
    expect(formatPrice(1999.9, "venda")).toBe("R$ 1.999,90");
  });
});
