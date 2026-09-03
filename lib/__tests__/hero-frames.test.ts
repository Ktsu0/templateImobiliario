import { describe, it, expect } from "vitest";
import { computeFrameBlend } from "@/lib/hero-frames";

describe("computeFrameBlend", () => {
  it("maps progress 0 to the first frame and progress 1 to the last frame on desktop", () => {
    expect(computeFrameBlend(0, 90, false)).toEqual({ index: 0, nextIndex: 1, blend: 0 });
    expect(computeFrameBlend(1, 90, false)).toEqual({ index: 89, nextIndex: 89, blend: 0 });
  });

  it("returns a fractional blend toward the next frame in between", () => {
    const result = computeFrameBlend(0.5, 90, false);
    expect(result.index).toBe(44);
    expect(result.nextIndex).toBe(45);
    expect(result.blend).toBeCloseTo(0.5);
  });

  it("clamps out-of-range progress values", () => {
    expect(computeFrameBlend(-0.5, 90, false).index).toBe(0);
    expect(computeFrameBlend(1.5, 90, false).index).toBe(89);
  });

  it("samples every other frame on mobile, staying within bounds", () => {
    expect(computeFrameBlend(0, 90, true)).toEqual({ index: 0, nextIndex: 2, blend: 0 });
    expect(computeFrameBlend(1, 90, true).index).toBe(88);
    expect(computeFrameBlend(0.5, 90, true).index).toBe(44);
  });

  it("never blends past the last frame", () => {
    const last = computeFrameBlend(1, 90, true);
    expect(last.nextIndex).toBe(89);
    expect(last.blend).toBe(0);
  });

  it("always returns frame 0 for a single-frame sequence", () => {
    expect(computeFrameBlend(1, 1, false)).toEqual({ index: 0, nextIndex: 0, blend: 0 });
  });
});
