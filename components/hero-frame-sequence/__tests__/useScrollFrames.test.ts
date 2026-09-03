import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import type { ClientHero } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(),
}));
vi.mock("@/hooks/useConnectionType", () => ({
  useConnectionType: vi.fn(() => undefined),
}));
vi.mock("@/hooks/useSectionScrollProgress", () => ({
  useSectionScrollProgress: vi.fn(() => 0.5),
}));
vi.mock("@/hooks/useFramePreloader", () => ({
  useFramePreloader: vi.fn(() => ({ images: [], loadedCount: 0, progress: 1, isComplete: true })),
}));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollFrames } from "@/components/hero-frame-sequence/useScrollFrames";

const hero: ClientHero = {
  mode: "frame-sequence",
  framesPath: "/frames/",
  frameCount: 10,
  fallbackImage: "/fallback.webp",
  phases: [],
};

describe("useScrollFrames", () => {
  it("shows the fallback when the user prefers reduced motion", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { result } = renderHook(() => useScrollFrames(useRef(null), hero));
    expect(result.current.showFallback).toBe(true);
  });

  it("computes a frame index from scroll progress when not falling back", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { result } = renderHook(() => useScrollFrames(useRef(null), hero));
    expect(result.current.showFallback).toBe(false);
    expect(result.current.frameIndex).toBe(4);
  });

  it("always shows the fallback for a static-image hero", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { result } = renderHook(() =>
      useScrollFrames(useRef(null), { ...hero, mode: "static-image" })
    );
    expect(result.current.showFallback).toBe(true);
  });
});
