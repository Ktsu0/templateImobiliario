import { describe, it, expect } from "vitest";
import { shouldShowHeroFallback } from "@/lib/device";

describe("shouldShowHeroFallback", () => {
  it("is true whenever the user prefers reduced motion, regardless of connection", () => {
    expect(shouldShowHeroFallback(true, { effectiveType: "4g" })).toBe(true);
    expect(shouldShowHeroFallback(true, undefined)).toBe(true);
  });

  it("is true on slow connections even without reduced motion", () => {
    expect(shouldShowHeroFallback(false, { effectiveType: "slow-2g" })).toBe(true);
    expect(shouldShowHeroFallback(false, { effectiveType: "2g" })).toBe(true);
    expect(shouldShowHeroFallback(false, { effectiveType: "3g" })).toBe(true);
  });

  it("lets a streaming film through on 3g, where a buffered scrub is refused", () => {
    // The hero plays start to finish behind its poster; the walkthrough has to
    // seek, which needs the file in memory first.
    expect(shouldShowHeroFallback(false, { effectiveType: "3g" }, "streaming")).toBe(false);
    expect(shouldShowHeroFallback(false, { effectiveType: "3g" }, "buffered")).toBe(true);
  });

  it("still refuses a film on 2g and slower", () => {
    expect(shouldShowHeroFallback(false, { effectiveType: "2g" }, "streaming")).toBe(true);
    expect(shouldShowHeroFallback(false, { effectiveType: "slow-2g" }, "streaming")).toBe(true);
  });

  it("keeps reduced motion winning over any demand level", () => {
    expect(shouldShowHeroFallback(true, { effectiveType: "4g" }, "streaming")).toBe(true);
  });

  it("is false on a fast connection with no reduced-motion preference", () => {
    expect(shouldShowHeroFallback(false, { effectiveType: "4g" })).toBe(false);
  });

  it("is false when connection info is unavailable and motion is not reduced", () => {
    expect(shouldShowHeroFallback(false, undefined)).toBe(false);
  });
});
