"use client";
import { useEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { shouldShowHeroFallback } from "@/lib/device";
import { computeFrameBlend, frameStep } from "@/lib/hero-frames";
import { computeJourneyStage } from "@/lib/journey";
import type { ClientJourney } from "@/config/types";

type JourneyDecision = "pending" | "play" | "fallback";

export interface JourneyScrollState {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
  scale: number;
  previewOpacity: number;
  zoomProgress: number;
  walkProgress: number;
  entryVeil: number;
  preloadProgress: number;
  showFallback: boolean;
}

export function useJourneyScroll(
  sectionRef: RefObject<HTMLElement>,
  journey: ClientJourney
): JourneyScrollState {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();

  const shouldFallbackNow = shouldShowHeroFallback(
    prefersReducedMotion,
    effectiveType ? { effectiveType } : undefined
  );

  // Same latch as the hero: decide once after mount so a fluctuating
  // connection reading cannot restart the preload mid-scroll.
  const [decision, setDecision] = useState<JourneyDecision>("pending");
  useEffect(() => {
    if (!hasMounted || decision !== "pending") return;
    setDecision(shouldFallbackNow ? "fallback" : "play");
  }, [hasMounted, decision, shouldFallbackNow]);

  const showFallback = decision === "fallback";

  const scrollProgress = useSectionScrollProgress(sectionRef);
  const { images, progress: preloadProgress } = useFramePreloader(
    journey.framesPath,
    decision === "play" ? journey.frameCount : 0,
    frameStep(isMobile)
  );

  const stage = computeJourneyStage(showFallback ? 1 : scrollProgress, {
    zoomStartProgress: journey.zoomStartProgress,
    zoomScale: journey.zoomScale,
    previewFadeStart: journey.previewFadeStart,
  });

  const { index, nextIndex, blend } = computeFrameBlend(
    stage.walkProgress,
    journey.frameCount,
    isMobile
  );

  return {
    currentImage: images[index],
    nextImage: images[nextIndex],
    blend,
    scale: stage.scale,
    previewOpacity: stage.previewOpacity,
    zoomProgress: stage.zoomProgress,
    walkProgress: stage.walkProgress,
    entryVeil: stage.entryVeil,
    preloadProgress: decision === "play" ? preloadProgress : 1,
    showFallback,
  };
}
