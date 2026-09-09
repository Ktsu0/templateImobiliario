import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { ClientHero } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useConnectionType", () => ({ useConnectionType: vi.fn(() => undefined) }));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useHeroIntro, type HeroIntroState } from "@/components/hero/useHeroIntro";

const DURATION = 5.88;

const hero: ClientHero = {
  mode: "video",
  videoSrc: "/hero.mp4",
  posterImage: "/hero-poster.webp",
  fallbackImage: "/hero-fallback.webp",
  titleRevealAt: 0.75,
};

let latest: HeroIntroState;
let play: ReturnType<typeof vi.fn>;

/** Mirrors how the real component wires the element, so React attaches the ref
 *  before the hook's effects run — which is what makes the film start at all. */
function Harness() {
  const intro = useHeroIntro(hero);
  latest = intro;
  if (intro.showFallback) return <img alt="fallback" />;
  return <video ref={intro.videoRef} data-testid="hero-video" />;
}

function seekTo(seconds: number) {
  const video = screen.getByTestId("hero-video");
  Object.defineProperty(video, "currentTime", { value: seconds, configurable: true });
  act(() => {
    video.dispatchEvent(new Event("timeupdate"));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMediaQuery).mockReturnValue(false);
  // jsdom ships no media pipeline: duration is 0 and play() is not implemented.
  play = vi.fn(() => Promise.resolve());
  Object.defineProperty(HTMLMediaElement.prototype, "duration", {
    value: DURATION,
    configurable: true,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "play", { value: play, configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useHeroIntro", () => {
  it("starts the film once it has decided to play", () => {
    render(<Harness />);
    expect(play).toHaveBeenCalled();
  });

  it("holds the title back while the camera is still moving", () => {
    render(<Harness />);

    seekTo(1);
    expect(latest.isTitleVisible).toBe(false);
    seekTo(DURATION * 0.6);
    expect(latest.isTitleVisible).toBe(false);
  });

  it("reveals the title in the closing seconds of the film", () => {
    render(<Harness />);

    seekTo(DURATION * 0.75);
    expect(latest.introProgress).toBeCloseTo(0.75);
    expect(latest.isTitleVisible).toBe(true);
  });

  it("lands the title on `ended`, which timeupdate can skip past", () => {
    render(<Harness />);

    act(() => {
      screen.getByTestId("hero-video").dispatchEvent(new Event("ended"));
    });
    expect(latest.introProgress).toBe(1);
    expect(latest.isTitleVisible).toBe(true);
  });

  it("skipping jumps to the end so the title is already there", () => {
    render(<Harness />);
    const video = screen.getByTestId("hero-video") as HTMLVideoElement;

    act(() => latest.skipIntro());
    expect(video.currentTime).toBe(DURATION);
    expect(latest.isTitleVisible).toBe(true);
  });

  it("shows the still under reduced motion, with the title already up", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    render(<Harness />);

    expect(latest.showFallback).toBe(true);
    expect(latest.isTitleVisible).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it("falls back to the still when the browser refuses to autoplay", async () => {
    play.mockReturnValue(Promise.reject(new Error("blocked")));
    render(<Harness />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(latest.showFallback).toBe(true);
  });
});
