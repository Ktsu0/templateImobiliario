import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createRef } from "react";
import type { ClientJourney } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useConnectionType", () => ({ useConnectionType: vi.fn(() => undefined) }));
vi.mock("@/hooks/useSectionScrollProgress", () => ({ useSectionScrollProgress: vi.fn(() => 0) }));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { useJourneyScroll } from "@/components/journey/useJourneyScroll";

const journey: ClientJourney = {
  videoSrc: "/journey.mp4",
  posterImage: "/journey-poster.webp",
  fallbackImage: "/journey-fallback.webp",
  frameAspectRatio: 1366 / 768,
  scrollHeightVh: 320,
  screenRect: { x: 34, y: 24, width: 38, height: 37 },
  zoomStartProgress: 0.7,
  zoomScale: 3.4,
  headline: "Headline",
  subheadline: "Sub",
};

const DURATION = 5.88;
const sectionRef = createRef<HTMLElement>();

/** jsdom has no media pipeline, so the element is a plain stand-in with a
 *  writable currentTime and a duration the hook can map progress onto. */
function attachVideo(ref: { current: HTMLVideoElement | null }) {
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: DURATION, configurable: true });
  ref.current = video;
  return video;
}

let rafQueue: FrameRequestCallback[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  rafQueue = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.mocked(useMediaQuery).mockReturnValue(false);
  vi.mocked(useSectionScrollProgress).mockReturnValue(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function flushFrames() {
  act(() => {
    const queued = rafQueue;
    rafQueue = [];
    for (const cb of queued) cb(0);
  });
}

describe("useJourneyScroll", () => {
  it("walks without zooming before the threshold", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(0.35);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));

    // Half of the walk phase (0.35 of a 0.7 threshold).
    expect(result.current.walkProgress).toBeCloseTo(0.5);
    expect(result.current.scale).toBe(1);
    expect(result.current.previewOpacity).toBe(0);
  });

  it("seeks the video to the walk position on an animation frame", () => {
    const { result, rerender } = renderHook(() => useJourneyScroll(sectionRef, journey));
    const video = attachVideo(result.current.videoRef);

    vi.mocked(useSectionScrollProgress).mockReturnValue(0.35);
    rerender();
    flushFrames();

    // Half the walk, held just inside the end of the timeline.
    expect(video.currentTime).toBeCloseTo(0.5 * (DURATION - 0.04), 2);
  });

  it("coalesces a burst of scroll updates into a single seek", () => {
    const { result, rerender } = renderHook(() => useJourneyScroll(sectionRef, journey));
    const video = attachVideo(result.current.videoRef);

    for (const progress of [0.1, 0.2, 0.3, 0.4, 0.5]) {
      vi.mocked(useSectionScrollProgress).mockReturnValue(progress);
      rerender();
    }
    expect(rafQueue).toHaveLength(1);
    flushFrames();

    // Only the newest position is applied; the stale ones never reach the decoder.
    expect(video.currentTime).toBeCloseTo(((0.5 / 0.7) * (DURATION - 0.04)), 2);
  });

  it("holds the closing frame and zooms once past the threshold", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(1);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));

    expect(result.current.walkProgress).toBe(1);
    expect(result.current.scale).toBeCloseTo(3.4);
    expect(result.current.previewOpacity).toBe(1);
  });

  it("falls back to the still under reduced motion", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { result } = renderHook(() => useJourneyScroll(sectionRef, journey));
    expect(result.current.showFallback).toBe(true);
  });
});
