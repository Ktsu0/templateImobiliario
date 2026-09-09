"use client";
import type { RefObject } from "react";

interface HeroVideoProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoSrc: string;
  posterImage: string;
  introProgress: number;
  showFallback: boolean;
  fallbackImage: string;
  brandName: string;
  onSkip: () => void;
}

const MAX_SCALE_BOOST = 0.06;

export function HeroVideo({
  videoRef,
  videoSrc,
  posterImage,
  introProgress,
  showFallback,
  fallbackImage,
  brandName,
  onSkip,
}: HeroVideoProps) {
  const scale = showFallback ? 1 : 1 + MAX_SCALE_BOOST * introProgress;

  return (
    <div className="relative h-full w-full overflow-hidden bg-bgDark">
      <div
        data-testid="hero-zoom"
        className="h-full w-full will-change-transform"
        style={{ transform: `scale(${scale})` }}
      >
        {showFallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fallbackImage}
            alt={`${brandName} — fachada`}
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            data-testid="hero-video"
            src={videoSrc}
            poster={posterImage}
            // Muted and inline are what make autoplay permissible at all; the
            // film carries no audio, so nothing is lost. It plays once and
            // holds its closing frame under the title.
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          // Falls off fast: it only has to seam the frame into the section
          // below, without pouring the brand green over the whole image.
          background:
            "linear-gradient(to top, rgb(var(--bg-dark-rgb) / 0.92) 0%, rgb(var(--bg-dark-rgb) / 0.5) 18%, rgb(var(--bg-dark-rgb) / 0.12) 38%, transparent 60%)",
        }}
      />

      <button
        type="button"
        onClick={onSkip}
        className="absolute right-6 top-6 z-10 rounded-full border border-ivory/30 bg-bgDark/50 px-4 py-2 font-body text-sm text-ivory backdrop-blur transition-colors hover:bg-bgDark/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        Pular introdução
      </button>
    </div>
  );
}
