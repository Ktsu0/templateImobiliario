import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ClientHero } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useConnectionType", () => ({ useConnectionType: vi.fn(() => undefined) }));
vi.mock("@/hooks/useFramePreloader", () => ({ useFramePreloader: vi.fn() }));
vi.mock("@/hooks/useAutoplayProgress", () => ({ useAutoplayProgress: vi.fn() }));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useAutoplayProgress } from "@/hooks/useAutoplayProgress";
import { useHeroIntro } from "@/components/hero-frame-sequence/useHeroIntro";

const hero: ClientHero = {
  mode: "frame-sequence",
  framesPath: "/frames/",
  frameCount: 90,
  fallbackImage: "/fallback.webp",
  phases: [],
  autoplayDurationMs: 6000,
};

const images = Array.from({ length: 90 }, () => new Image());
const complete = vi.fn();

beforeEach(() => {
  vi.mocked(useMediaQuery).mockReturnValue(false);
  vi.mocked(useFramePreloader).mockReturnValue({ images, loadedCount: 90, progress: 1, isComplete: true });
  vi.mocked(useAutoplayProgress).mockReturnValue({ progress: 0, complete });
});

describe("useHeroIntro", () => {
  it("shows the fallback with the title visible immediately under reduced motion", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { result } = renderHook(() => useHeroIntro(hero));
    expect(result.current.showFallback).toBe(true);
    expect(result.current.isTitleVisible).toBe(true);
    expect(result.current.introProgress).toBe(1);
  });

  it("skips preloading frames when falling back", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    renderHook(() => useHeroIntro(hero));
    expect(useFramePreloader).toHaveBeenCalledWith("/frames/", 0);
  });

  it("only starts the autoplay once every frame is preloaded", () => {
    vi.mocked(useFramePreloader).mockReturnValue({ images: [], loadedCount: 10, progress: 0.1, isComplete: false });
    renderHook(() => useHeroIntro(hero));
    expect(useAutoplayProgress).toHaveBeenCalledWith(6000, false);

    vi.mocked(useFramePreloader).mockReturnValue({ images, loadedCount: 90, progress: 1, isComplete: true });
    renderHook(() => useHeroIntro(hero));
    expect(useAutoplayProgress).toHaveBeenLastCalledWith(6000, true);
  });

  it("blends between adjacent frames mid-intro and keeps the title hidden", () => {
    vi.mocked(useAutoplayProgress).mockReturnValue({ progress: 0.5, complete });
    const { result } = renderHook(() => useHeroIntro(hero));
    expect(result.current.currentImage).toBe(images[44]);
    expect(result.current.nextImage).toBe(images[45]);
    expect(result.current.blend).toBeCloseTo(0.5);
    expect(result.current.isTitleVisible).toBe(false);
  });

  it("reveals the title once the intro passes 75%", () => {
    vi.mocked(useAutoplayProgress).mockReturnValue({ progress: 0.8, complete });
    const { result } = renderHook(() => useHeroIntro(hero));
    expect(result.current.isTitleVisible).toBe(true);
  });

  it("exposes the autoplay's complete() as skipIntro", () => {
    const { result } = renderHook(() => useHeroIntro(hero));
    result.current.skipIntro();
    expect(complete).toHaveBeenCalledOnce();
  });
});
