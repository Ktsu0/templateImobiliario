import { describe, it, expect } from "vitest";
import { hasUsableDuration, videoTimeFor, videoProgressAt } from "@/lib/video";

describe("hasUsableDuration", () => {
  it("rejects the values a video reports before metadata arrives", () => {
    expect(hasUsableDuration(NaN)).toBe(false);
    expect(hasUsableDuration(Infinity)).toBe(false);
    expect(hasUsableDuration(0)).toBe(false);
    expect(hasUsableDuration(5.88)).toBe(true);
  });
});

describe("videoTimeFor", () => {
  it("stays at zero while the duration is still unknown", () => {
    expect(videoTimeFor(0.5, NaN)).toBe(0);
  });

  it("maps progress across the timeline", () => {
    expect(videoTimeFor(0, 10)).toBe(0);
    expect(videoTimeFor(0.5, 10)).toBeCloseTo(4.98);
  });

  it("holds the end just inside the duration so the closing frame still shows", () => {
    const end = videoTimeFor(1, 10);
    expect(end).toBeLessThan(10);
    expect(end).toBeCloseTo(9.96);
  });

  it("clamps progress that overshoots either end", () => {
    expect(videoTimeFor(-2, 10)).toBe(0);
    expect(videoTimeFor(4, 10)).toBeCloseTo(9.96);
  });
});

describe("videoProgressAt", () => {
  it("reports how far through the film a time is", () => {
    expect(videoProgressAt(0, 8)).toBe(0);
    expect(videoProgressAt(6, 8)).toBeCloseTo(0.75);
    expect(videoProgressAt(8, 8)).toBe(1);
  });

  it("is zero before metadata and never leaves 0-1", () => {
    expect(videoProgressAt(3, NaN)).toBe(0);
    expect(videoProgressAt(99, 8)).toBe(1);
  });
});
