import { describe, it, expect } from "vitest";
import { computeScrollProgress } from "@/lib/scroll-progress";

describe("computeScrollProgress", () => {
  it("is 0 before the section starts scrolling", () => {
    expect(computeScrollProgress(0, 0, 1000)).toBe(0);
  });

  it("is 1 once the scrollable height has been fully consumed", () => {
    expect(computeScrollProgress(1000, 0, 1000)).toBe(1);
  });

  it("is proportional in between", () => {
    expect(computeScrollProgress(500, 0, 1000)).toBe(0.5);
  });

  it("measures from the section's own offset, not the page top", () => {
    expect(computeScrollProgress(1500, 1000, 1000)).toBe(0.5);
  });

  it("clamps to [0, 1] outside the section's range", () => {
    expect(computeScrollProgress(-100, 0, 1000)).toBe(0);
    expect(computeScrollProgress(2000, 0, 1000)).toBe(1);
  });

  it("returns 0 when the section has no scrollable height", () => {
    expect(computeScrollProgress(100, 0, 0)).toBe(0);
  });
});
