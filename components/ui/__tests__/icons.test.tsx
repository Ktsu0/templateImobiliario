import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BedIcon, SuiteIcon, AreaIcon, ParkingIcon } from "@/components/ui/icons";

describe("attribute icons", () => {
  it("each renders a single inline SVG carrying the given class", () => {
    for (const Icon of [BedIcon, SuiteIcon, AreaIcon, ParkingIcon]) {
      const { container } = render(<Icon className="h-4 w-4" />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("h-4", "w-4");
    }
  });
});
