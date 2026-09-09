"use client";
import { ReactLenis } from "lenis/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ReactNode } from "react";

/**
 * Replaces the browser's scroll physics with an interpolated one.
 *
 * The page is built out of full-viewport moments — the film, the walkthrough,
 * a listing per screen — and the native wheel step lands on them in one abrupt
 * jump. Lenis eases the scroll position toward its target every frame instead,
 * which is what lets a listing settle rather than snap into place.
 *
 * `root` drives the document itself, so the sticky walkthrough and the sticky
 * filter bar keep working: unlike transform-based smooth scrolling, the real
 * scroll position is still what moves.
 *
 * `syncTouch` stays off. A finger already carries the platform's own inertia,
 * and smoothing on top of it is what makes these libraries feel laggy on a
 * phone; only the wheel is interpolated.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  // Interpolated scrolling is motion the visitor did not ask for. Switched off
  // rather than unmounted, so the tree below — and the film playing in it —
  // is not torn down when the preference resolves after hydration.
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <ReactLenis
      root
      options={{
        // Low lerp is the whole point: the scroll trails the input long enough
        // to read as weight instead of as lag.
        lerp: 0.085,
        wheelMultiplier: 0.85,
        smoothWheel: !prefersReducedMotion,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
