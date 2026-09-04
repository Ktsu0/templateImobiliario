import { describe, it, expect } from "vitest";
import { computeJourneyStage } from "@/lib/journey";

const config = { zoomStartProgress: 0.7, zoomScale: 3.4 };

describe("computeJourneyStage", () => {
  it("walks the frames without zooming before the threshold", () => {
    const stage = computeJourneyStage(0, config);
    expect(stage.walkProgress).toBe(0);
    expect(stage.scale).toBe(1);
    expect(stage.previewOpacity).toBe(0);
  });

  it("finishes the walk exactly when the zoom starts", () => {
    const stage = computeJourneyStage(0.7, config);
    expect(stage.walkProgress).toBe(1);
    expect(stage.zoomProgress).toBe(0);
    expect(stage.scale).toBe(1);
  });

  it("advances the walk proportionally within the walk phase", () => {
    expect(computeJourneyStage(0.35, config).walkProgress).toBeCloseTo(0.5);
  });

  it("reaches the full zoom and a fully visible preview at the end", () => {
    const stage = computeJourneyStage(1, config);
    expect(stage.walkProgress).toBe(1);
    expect(stage.zoomProgress).toBe(1);
    expect(stage.scale).toBeCloseTo(3.4);
    expect(stage.previewOpacity).toBe(1);
  });

  it("keeps the preview hidden until the zoom is underway", () => {
    expect(computeJourneyStage(0.75, config).previewOpacity).toBe(0);
    expect(computeJourneyStage(0.95, config).previewOpacity).toBeGreaterThan(0);
  });

  it("scales monotonically across the zoom phase", () => {
    const samples = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1].map(
      (p) => computeJourneyStage(p, config).scale
    );
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThan(samples[i - 1]);
    }
  });

  it("eases in and out rather than moving linearly", () => {
    const midpoint = computeJourneyStage(0.85, config).zoomProgress;
    expect(midpoint).toBeCloseTo(0.5, 1);
    const early = computeJourneyStage(0.775, config).zoomProgress;
    expect(early).toBeLessThan(0.25);
  });

  it("clamps progress outside [0, 1]", () => {
    expect(computeJourneyStage(-1, config).scale).toBe(1);
    expect(computeJourneyStage(2, config).scale).toBeCloseTo(3.4);
  });

  it("never divides by zero when the zoom phase has no room", () => {
    const stage = computeJourneyStage(1, { zoomStartProgress: 1, zoomScale: 3 });
    expect(stage.walkProgress).toBe(1);
    expect(stage.scale).toBe(1);
    expect(stage.previewOpacity).toBe(0);
  });

  it("tints the opening frames without ever blacking them out", () => {
    // A full veil would make the interior fade in from nothing; it only dips
    // the first frames toward the brand dark so the hero blends into them.
    const atStart = computeJourneyStage(0, config).entryVeil;
    expect(atStart).toBeGreaterThan(0);
    expect(atStart).toBeLessThanOrEqual(0.5);

    const early = computeJourneyStage(0.07, config).entryVeil; // walk ≈ 0.1
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(atStart);

    expect(computeJourneyStage(0.2, config).entryVeil).toBe(0); // walk ≈ 0.29
    expect(computeJourneyStage(1, config).entryVeil).toBe(0);
  });

  it("treats a zero-length walk phase as immediately finished", () => {
    const stage = computeJourneyStage(0, { zoomStartProgress: 0, zoomScale: 3 });
    expect(stage.walkProgress).toBe(1);
  });
});
