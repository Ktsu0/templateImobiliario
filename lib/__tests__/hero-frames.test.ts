import { describe, it, expect } from "vitest";
import { computeFrameIndex, computeScrollProgress } from "@/lib/hero-frames";

describe("computeFrameIndex", () => {
  it("maps progress 0 to the first frame and progress 1 to the last frame on desktop", () => {
    expect(computeFrameIndex(0, 90, false)).toBe(0);
    expect(computeFrameIndex(1, 90, false)).toBe(89);
  });

  it("clamps out-of-range progress values", () => {
    expect(computeFrameIndex(-0.5, 90, false)).toBe(0);
    expect(computeFrameIndex(1.5, 90, false)).toBe(89);
  });

  it("samples every other frame on mobile, staying within bounds", () => {
    expect(computeFrameIndex(0, 90, true)).toBe(0);
    expect(computeFrameIndex(1, 90, true)).toBe(88);
    expect(computeFrameIndex(0.5, 90, true)).toBe(44);
  });

  it("always returns frame 0 for a single-frame sequence", () => {
    expect(computeFrameIndex(1, 1, false)).toBe(0);
  });
});

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

  it("clamps to [0, 1] outside the section's range", () => {
    expect(computeScrollProgress(-100, 0, 1000)).toBe(0);
    expect(computeScrollProgress(2000, 0, 1000)).toBe(1);
  });

  it("returns 0 when the section has no scrollable height", () => {
    expect(computeScrollProgress(100, 0, 0)).toBe(0);
  });
});
