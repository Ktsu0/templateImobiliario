"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { shouldShowHeroFallback } from "@/lib/device";
import { computeJourneyStage } from "@/lib/journey";
import { videoTimeFor } from "@/lib/video";
import type { ClientJourney } from "@/config/types";

type JourneyDecision = "pending" | "play" | "fallback";

export interface JourneyScrollState {
  videoRef: RefObject<HTMLVideoElement>;
  scale: number;
  previewOpacity: number;
  zoomProgress: number;
  walkProgress: number;
  entryVeil: number;
  showFallback: boolean;
}

export function useJourneyScroll(
  sectionRef: RefObject<HTMLElement>,
  journey: ClientJourney
): JourneyScrollState {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();

  const shouldFallbackNow = shouldShowHeroFallback(
    prefersReducedMotion,
    effectiveType ? { effectiveType } : undefined
  );

  // Same latch as the hero: decide once after mount so a fluctuating
  // connection reading cannot swap the walkthrough for the still mid-scroll.
  const [decision, setDecision] = useState<JourneyDecision>("pending");
  useEffect(() => {
    if (!hasMounted || decision !== "pending") return;
    setDecision(shouldFallbackNow ? "fallback" : "play");
  }, [hasMounted, decision, shouldFallbackNow]);

  const showFallback = decision === "fallback";

  const scrollProgress = useSectionScrollProgress(sectionRef);
  const stage = computeJourneyStage(showFallback ? 1 : scrollProgress, {
    zoomStartProgress: journey.zoomStartProgress,
    zoomScale: journey.zoomScale,
    previewFadeStart: journey.previewFadeStart,
  });

  // The walk drives the film's playhead. Seeking is asynchronous, so the
  // target is held in a ref and applied on an animation frame: a scroll can
  // fire far more often than the decoder can land a seek, and assigning
  // `currentTime` on every event only queues work that is already stale.
  const targetTime = useRef(0);
  const pendingFrame = useRef<number | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (decision !== "play" || !video) return;

    targetTime.current = videoTimeFor(stage.walkProgress, video.duration);
    if (pendingFrame.current !== null) return;

    pendingFrame.current = window.requestAnimationFrame(() => {
      pendingFrame.current = null;
      const current = videoRef.current;
      if (!current) return;
      // Under a tenth of a frame apart there is nothing to see, and seeking
      // anyway would keep the decoder busy for no visible change.
      if (Math.abs(current.currentTime - targetTime.current) > 0.004) {
        current.currentTime = targetTime.current;
      }
    });
  }, [decision, stage.walkProgress]);

  useEffect(
    () => () => {
      if (pendingFrame.current !== null) window.cancelAnimationFrame(pendingFrame.current);
    },
    []
  );

  return {
    videoRef,
    scale: stage.scale,
    previewOpacity: stage.previewOpacity,
    zoomProgress: stage.zoomProgress,
    walkProgress: stage.walkProgress,
    entryVeil: stage.entryVeil,
    showFallback,
  };
}
