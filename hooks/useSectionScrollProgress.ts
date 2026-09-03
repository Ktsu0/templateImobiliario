"use client";
import { useEffect, useState, type RefObject } from "react";
import { computeScrollProgress } from "@/lib/hero-frames";

export function useSectionScrollProgress(sectionRef: RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId: number | null = null;

    const measure = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      setProgress(computeScrollProgress(window.scrollY, sectionTop, scrollableHeight));
    };

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [sectionRef]);

  return progress;
}
