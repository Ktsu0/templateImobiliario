"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useHasMounted } from "@/hooks/useHasMounted";
import { shouldShowHeroFallback } from "@/lib/device";
import { videoProgressAt } from "@/lib/video";
import type { ClientHero } from "@/config/types";

type IntroDecision = "pending" | "play" | "fallback";

export interface HeroIntroState {
  videoRef: React.RefObject<HTMLVideoElement>;
  showFallback: boolean;
  /** How far through the film, 0-1. */
  introProgress: number;
  isTitleVisible: boolean;
  skipIntro: () => void;
}

export function useHeroIntro(hero: ClientHero): HeroIntroState {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();
  const [progress, setProgress] = useState(0);

  const shouldFallbackNow =
    hero.mode === "static-image" ||
    // The film is ~2 MB with its index up front, so it starts on the first
    // bytes; only a crawling connection is better off with the still.
    shouldShowHeroFallback(
      prefersReducedMotion,
      effectiveType ? { effectiveType } : undefined,
      "streaming"
    );

  // Decide once, after mount (when reduced-motion and connection have been
  // read), and never flip: a mid-intro network change must not swap the film
  // for the still halfway through it.
  const [decision, setDecision] = useState<IntroDecision>("pending");
  useEffect(() => {
    if (!hasMounted || decision !== "pending") return;
    setDecision(shouldFallbackNow ? "fallback" : "play");
  }, [hasMounted, decision, shouldFallbackNow]);

  const showFallback = decision === "fallback";

  useEffect(() => {
    const video = videoRef.current;
    if (decision !== "play" || !video) return;

    const onTime = () => setProgress(videoProgressAt(video.currentTime, video.duration));
    // `ended` is what guarantees the title lands: timeupdate fires a handful of
    // times a second and can miss the final stretch on a short film.
    const onEnded = () => setProgress(1);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onTime);

    // Autoplay can still be refused (a data-saver mode, a strict setting).
    // Rather than sit on the poster forever, treat a refusal as the fallback.
    void video.play().catch(() => setDecision("fallback"));

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onTime);
    };
  }, [decision]);

  const skipIntro = useCallback(() => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) video.currentTime = video.duration;
    setProgress(1);
  }, []);

  const introProgress = showFallback ? 1 : progress;

  return {
    videoRef,
    showFallback,
    introProgress,
    isTitleVisible: introProgress >= hero.titleRevealAt,
    skipIntro,
  };
}
