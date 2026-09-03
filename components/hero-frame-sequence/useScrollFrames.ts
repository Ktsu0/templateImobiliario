"use client";
import type { RefObject } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { shouldShowHeroFallback } from "@/lib/device";
import { computeFrameIndex } from "@/lib/hero-frames";
import type { ClientHero } from "@/config/types";

interface UseScrollFramesResult {
  frameIndex: number;
  currentImage: HTMLImageElement | undefined;
  preloadProgress: number;
  showFallback: boolean;
}

export function useScrollFrames(
  sectionRef: RefObject<HTMLElement>,
  hero: ClientHero
): UseScrollFramesResult {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();
  const scrollProgress = useSectionScrollProgress(sectionRef);
  const { images, progress: preloadProgress } = useFramePreloader(
    hero.framesPath,
    hero.frameCount
  );

  const showFallback =
    hero.mode === "static-image" ||
    shouldShowHeroFallback(prefersReducedMotion, effectiveType ? { effectiveType } : undefined);

  const frameIndex = computeFrameIndex(scrollProgress, hero.frameCount, isMobile);

  return {
    frameIndex,
    currentImage: images[frameIndex],
    preloadProgress,
    showFallback,
  };
}
