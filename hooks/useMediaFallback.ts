"use client";
import { useEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useConnectionType } from "./useConnectionType";
import { useHasMounted } from "./useHasMounted";
import { shouldShowHeroFallback, type PlaybackDemand } from "@/lib/device";

type Decision = "pending" | "play" | "fallback";

/**
 * Decides once, after mount, whether motion preference or connection speed
 * call for a still instead of video — and never flips, so a connection
 * reading that changes mid-scroll can't swap one for the other partway.
 */
export function useMediaFallback(demand: PlaybackDemand): boolean {
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();

  const shouldFallbackNow = shouldShowHeroFallback(
    prefersReducedMotion,
    effectiveType ? { effectiveType } : undefined,
    demand
  );

  const [decision, setDecision] = useState<Decision>("pending");
  useEffect(() => {
    if (!hasMounted || decision !== "pending") return;
    setDecision(shouldFallbackNow ? "fallback" : "play");
  }, [hasMounted, decision, shouldFallbackNow]);

  return decision === "fallback";
}
