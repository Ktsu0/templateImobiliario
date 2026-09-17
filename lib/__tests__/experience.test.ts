import { describe, it, expect } from "vitest";
import { captionOpacityAt, CAPTION_FADE_SPAN } from "@/lib/experience";

describe("captionOpacityAt", () => {
  it("holds the caption fully up through the walk", () => {
    expect(captionOpacityAt(0)).toBe(1);
    expect(captionOpacityAt(0.5)).toBe(1);
    expect(captionOpacityAt(1 - CAPTION_FADE_SPAN)).toBe(1);
  });

  it("fades it out across the closing span, landing at zero on hand-off", () => {
    const mid = 1 - CAPTION_FADE_SPAN / 2;
    expect(captionOpacityAt(mid)).toBeCloseTo(0.5);
    expect(captionOpacityAt(1)).toBe(0);
  });

  it("clamps past the end", () => {
    expect(captionOpacityAt(1.5)).toBe(0);
  });
});
