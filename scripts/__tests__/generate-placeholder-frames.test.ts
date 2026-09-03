import { describe, it, expect } from "vitest";
import { lerpColor } from "@/scripts/generate-placeholder-frames";

describe("lerpColor", () => {
  it("returns the start color at t=0", () => {
    expect(lerpColor("#000000", "#ffffff", 0)).toBe("rgb(0, 0, 0)");
  });

  it("returns the end color at t=1", () => {
    expect(lerpColor("#000000", "#ffffff", 1)).toBe("rgb(255, 255, 255)");
  });

  it("interpolates at the midpoint", () => {
    expect(lerpColor("#000000", "#ffffff", 0.5)).toBe("rgb(128, 128, 128)");
  });
});
