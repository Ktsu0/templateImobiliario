"use client";
import { useEffect, useState, type RefObject } from "react";

/**
 * Whether a section is the thing the visitor is actually looking at.
 *
 * The listings run eight viewports tall, so plain intersection is true from
 * the moment their first pixel appears and stays true long after. Collapsing
 * the observation area to a thin band across the middle of the viewport makes
 * the answer mean what it says, and gives a clean edge on the way in and out.
 */
export function useHoldsScreen(sectionRef: RefObject<HTMLElement>): boolean {
  const [holds, setHolds] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setHolds(entry.isIntersecting),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      setHolds(false);
    };
  }, [sectionRef]);

  return holds;
}
