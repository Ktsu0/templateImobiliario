import { describe, it, expect } from "vitest";
import { computeFrameBlend, frameStep } from "@/lib/hero-frames";

describe("frameStep", () => {
  it("plays every frame on desktop and every other one on mobile", () => {
    expect(frameStep(false)).toBe(1);
    expect(frameStep(true)).toBe(2);
  });
});

describe("computeFrameBlend", () => {
  it("maps progress 0 to the first frame and progress 1 to the last frame on desktop", () => {
    expect(computeFrameBlend(0, 141, false)).toEqual({ index: 0, nextIndex: 1, blend: 0 });
    expect(computeFrameBlend(1, 141, false)).toEqual({ index: 140, nextIndex: 140, blend: 0 });
  });

  it("snaps between frames on desktop instead of cross-fading", () => {
    // Blending two moments of a moving camera softens the image; at the
    // source's own frame rate the sequence does not need it.
    for (const progress of [0.1, 0.25, 0.5, 0.73, 0.9]) {
      expect(computeFrameBlend(progress, 141, false).blend).toBe(0);
    }
  });

  it("advances one frame at a time across the desktop sequence", () => {
    expect(computeFrameBlend(0.5, 141, false).index).toBe(70);
    expect(computeFrameBlend(0.5, 141, false).nextIndex).toBe(71);
  });

  it("clamps out-of-range progress values", () => {
    expect(computeFrameBlend(-0.5, 141, false).index).toBe(0);
    expect(computeFrameBlend(1.5, 141, false).index).toBe(140);
  });

  it("samples every other frame on mobile, staying within bounds", () => {
    expect(computeFrameBlend(0, 141, true).index).toBe(0);
    expect(computeFrameBlend(1, 141, true).index).toBe(140);
    expect(computeFrameBlend(0.5, 141, true).index % 2).toBe(0);
  });

  it("keeps the cross-fade on mobile, where the frame gap is twice as wide", () => {
    const midway = computeFrameBlend(0.505, 141, true);
    expect(midway.nextIndex - midway.index).toBe(2);
    expect(midway.blend).toBeGreaterThan(0);
    expect(midway.blend).toBeLessThan(1);
  });

  it("never blends past the last frame", () => {
    const last = computeFrameBlend(1, 141, true);
    expect(last.nextIndex).toBe(140);
    expect(last.blend).toBe(0);
  });

  it("always returns frame 0 for a single-frame sequence", () => {
    expect(computeFrameBlend(1, 1, false)).toEqual({ index: 0, nextIndex: 0, blend: 0 });
  });
});
