import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import type { ClientJourney } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useConnectionType", () => ({ useConnectionType: vi.fn(() => undefined) }));
vi.mock("@/hooks/useFramePreloader", () => ({ useFramePreloader: vi.fn() }));
vi.mock("@/hooks/useSectionScrollProgress", () => ({ useSectionScrollProgress: vi.fn(() => 0) }));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { useJourneyScroll } from "@/components/journey/useJourneyScroll";

const journey: ClientJourney = {
  framesPath: "/journey/",
  frameCount: 90,
  fallbackImage: "/journey-fallback.webp",
  frameAspectRatio: 1366 / 768,
  scrollHeightVh: 320,
  screenRect: { x: 34, y: 24, width: 38, height: 37 },
  zoomStartProgress: 0.7,
  zoomScale: 3.4,
  headline: "Headline",
  subheadline: "Sub",
  screenWelcome: "Bem-vindo",
};

const images = Array.from({ length: 90 }, () => new Image());
const sectionRef = createRef<HTMLElement>();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMediaQuery).mockReturnValue(false);
  vi.mocked(useSectionScrollProgress).mockReturnValue(0);
  vi.mocked(useFramePreloader).mockReturnValue({
    images,
    loadedCount: 90,
    progress: 1,
    isComplete: true,
  });
});

describe("useJourneyScroll", () => {
  it("requests the frames only after deciding to play", () => {
    renderHook(() => useJourneyScroll(sectionRef, journey));
    const counts = vi.mocked(useFramePreloader).mock.calls.map((call) => call[1]);
    expect(counts[0]).toBe(0);
    expect(counts[counts.length - 1]).toBe(90);
  });

  it("walks the frames while scrolling before the zoom threshold", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(0.35);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));
    // half of the walk phase -> frame 44 of 90
    expect(result.current.currentImage).toBe(images[44]);
    expect(result.current.scale).toBe(1);
    expect(result.current.previewOpacity).toBe(0);
  });

  it("holds the last frame and zooms once past the threshold", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(1);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));
    expect(result.current.currentImage).toBe(images[89]);
    expect(result.current.scale).toBeCloseTo(3.4);
    expect(result.current.previewOpacity).toBe(1);
  });

  it("falls back without downloading frames under reduced motion", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));
    expect(result.current.showFallback).toBe(true);
    for (const call of vi.mocked(useFramePreloader).mock.calls) {
      expect(call[1]).toBe(0);
    }
  });
});
