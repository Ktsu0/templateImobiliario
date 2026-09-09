"use client";
import { useEffect, useRef, type RefObject } from "react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useHoldsScreen } from "./useHoldsScreen";

/**
 * Settles the scroll onto one listing at a time.
 *
 * CSS scroll-snap was doing this before and cannot do it gently: the browser
 * exposes no duration and no curve, so every listing arrived as a hard stop.
 * Lenis animates the settle instead, with both under our control.
 *
 * It is deliberately not left running for the whole page. The walkthrough
 * above is 320vh of free scrolling with no snap point in it, and a mandatory
 * snap would keep hauling that scroll to one of its ends and break the scrub —
 * so the snap only runs while the listings hold the middle of the screen.
 *
 * The last snap point is not a listing but the empty marker just past the
 * final one. Without something ahead to move to, a mandatory snap pulls the
 * visitor back onto listing eight every time they try to leave it.
 */
export function useShowcaseSnap(
  sectionRef: RefObject<HTMLElement>,
  stagesRef: RefObject<HTMLElement[]>,
  exitRef: RefObject<HTMLElement>,
  stageCount: number
): void {
  const lenis = useLenis();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const holdsScreen = useHoldsScreen(sectionRef);
  const snapRef = useRef<Snap | null>(null);

  useEffect(() => {
    if (!lenis || prefersReducedMotion) return;

    const snap = new Snap(lenis, {
      type: "mandatory",
      // Long enough to read as a settle rather than a jump, short enough that
      // it never feels like the page is deciding things for you.
      duration: 0.9,
      // Slow out of the gate, no bounce at the end.
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    snapRef.current = snap;

    const targets = [...(stagesRef.current ?? [])];
    if (exitRef.current) targets.push(exitRef.current);
    for (const target of targets) {
      if (target) snap.addElement(target, { align: ["start"] });
    }

    snap.stop();
    return () => {
      snap.destroy();
      snapRef.current = null;
    };
  }, [lenis, prefersReducedMotion, stagesRef, exitRef, stageCount]);

  useEffect(() => {
    const snap = snapRef.current;
    if (!snap) return;
    if (holdsScreen) snap.start();
    else snap.stop();
  }, [holdsScreen]);
}
