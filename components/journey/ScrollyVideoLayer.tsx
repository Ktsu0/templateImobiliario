"use client";
import { useEffect, useRef } from "react";

interface ScrollyVideoLayerProps {
  src: string;
  /** 0-1. Driven by the caller's own scroll math, not the library's listener —
   *  the section around this owns the pin and the scroll range. */
  percentage: number;
}

interface ScrollyVideoInstance {
  setVideoPercentage: (percentage: number) => void;
  destroy: () => void;
}

/**
 * The walkthrough, played back at the source's own quality.
 *
 * Wraps the `scrolly-video` engine directly rather than its React binding
 * (which ships without type declarations). Where WebCodecs is available it
 * decodes the original stream frame-accurately onto a canvas; elsewhere it
 * modulates a native <video>'s playbackRate toward the target. Neither path
 * needs the all-intra re-encode that a hand-rolled `currentTime` scrub did,
 * and neither lands on a frozen frame between scroll events the way one does.
 *
 * Loaded on demand: the engine touches `window` on import, which the server
 * render of this client component would trip over.
 */
export function ScrollyVideoLayer({ src, percentage }: ScrollyVideoLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ScrollyVideoInstance | null>(null);
  const percentageRef = useRef(percentage);
  percentageRef.current = percentage;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let cancelled = false;

    void import("scrolly-video/dist/ScrollyVideo.js").then(({ default: ScrollyVideo }) => {
      if (cancelled) return;
      const instance = new ScrollyVideo({
        scrollyVideoContainer: container,
        src,
        cover: true,
        sticky: false,
        full: false,
        trackScroll: false,
        useWebCodecs: true,
      });
      instanceRef.current = instance;
      instance.setVideoPercentage(percentageRef.current);
    });

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    instanceRef.current?.setVideoPercentage(percentage);
  }, [percentage]);

  return <div ref={containerRef} data-testid="journey-video" className="absolute inset-0" />;
}
