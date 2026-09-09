"use client";
import type { RefObject } from "react";

interface JourneyVideoProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoSrc: string;
  posterImage: string;
}

/**
 * The walkthrough, never played — its playhead is dragged by the scroll (see
 * `useJourneyScroll`). It is encoded all-intra so each of those seeks lands
 * without decoding a chain of frames first.
 */
export function JourneyVideo({ videoRef, videoSrc, posterImage }: JourneyVideoProps) {
  return (
    <video
      ref={videoRef}
      data-testid="journey-video"
      src={videoSrc}
      poster={posterImage}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className="h-full w-full object-cover"
    />
  );
}
