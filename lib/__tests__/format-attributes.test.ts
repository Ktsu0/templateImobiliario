import { describe, it, expect } from "vitest";
import { formatCount } from "@/lib/format-attributes";

describe("formatCount", () => {
  it("uses the singular for exactly one", () => {
    expect(formatCount(1, "quarto", "quartos")).toBe("1 quarto");
    expect(formatCount(1, "suíte", "suítes")).toBe("1 suíte");
  });

  it("uses the plural for anything else, zero included", () => {
    expect(formatCount(0, "vaga", "vagas")).toBe("0 vagas");
    expect(formatCount(4, "quarto", "quartos")).toBe("4 quartos");
  });
});
