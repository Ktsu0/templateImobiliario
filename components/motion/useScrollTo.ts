"use client";
import { useCallback } from "react";
import { useLenis } from "lenis/react";

interface ScrollToOptions {
  /** Jump with no animation — for repositioning, not for navigating. */
  immediate?: boolean;
}

/**
 * Moves the page to an element, through Lenis when it is driving.
 *
 * `scrollIntoView` sets the scroll position behind Lenis's back: Lenis is still
 * animating toward its own target and simply pulls the page back. Anything
 * that moves the page has to go through it while it is running.
 */
export function useScrollTo(): (target: string | HTMLElement, options?: ScrollToOptions) => void {
  const lenis = useLenis();

  return useCallback(
    (target, options) => {
      const element = typeof target === "string" ? document.getElementById(target) : target;
      if (!element) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const immediate = Boolean(options?.immediate) || prefersReducedMotion;

      if (lenis) {
        lenis.scrollTo(element, { immediate, duration: immediate ? 0 : 1.1 });
        return;
      }
      element.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
    },
    [lenis]
  );
}
