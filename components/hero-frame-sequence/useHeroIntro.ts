"use client";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useAutoplayProgress } from "@/hooks/useAutoplayProgress";
import { useHasMounted } from "@/hooks/useHasMounted";
import { shouldShowHeroFallback } from "@/lib/device";
import { computeFrameBlend } from "@/lib/hero-frames";
import type { ClientHero } from "@/config/types";

export const TITLE_REVEAL_PROGRESS = 0.75;
export const DEFAULT_AUTOPLAY_DURATION_MS = 6000;

type IntroDecision = "pending" | "play" | "fallback";

export interface HeroIntroState {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
  preloadProgress: number;
  showFallback: boolean;
  introProgress: number;
  isTitleVisible: boolean;
  skipIntro: () => void;
}

export function useHeroIntro(hero: ClientHero): HeroIntroState {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();

  const shouldFallbackNow =
    hero.mode === "static-image" ||
    shouldShowHeroFallback(prefersReducedMotion, effectiveType ? { effectiveType } : undefined);

  // Decide once, after mount (when reduced-motion and connection have been
  // read), and never flip: a mid-intro network change must not restart the
  // preload or swap the sequence for the static image.
  const [decision, setDecision] = useState<IntroDecision>("pending");
  useEffect(() => {
    if (!hasMounted || decision !== "pending") return;
    setDecision(shouldFallbackNow ? "fallback" : "play");
  }, [hasMounted, decision, shouldFallbackNow]);

  const showFallback = decision === "fallback";

  const { images, progress: preloadProgress, isComplete } = useFramePreloader(
    hero.framesPath,
    decision === "play" ? hero.frameCount : 0
  );

  const { progress: autoplayProgress, complete } = useAutoplayProgress(
    hero.autoplayDurationMs ?? DEFAULT_AUTOPLAY_DURATION_MS,
    decision === "play" && isComplete
  );

  const introProgress = showFallback ? 1 : autoplayProgress;
  const { index, nextIndex, blend } = computeFrameBlend(introProgress, hero.frameCount, isMobile);

  return {
    currentImage: images[index],
    nextImage: images[nextIndex],
    blend,
    preloadProgress: decision === "play" ? preloadProgress : 1,
    showFallback,
    introProgress,
    isTitleVisible: introProgress >= TITLE_REVEAL_PROGRESS,
    skipIntro: complete,
  };
}
