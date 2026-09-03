"use client";
import { useEffect, useRef } from "react";

interface HeroCanvasProps {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
  introProgress: number;
  showFallback: boolean;
  fallbackImage: string;
  brandName: string;
  onSkip: () => void;
}

const MAX_SCALE_BOOST = 0.06;

export function HeroCanvas({
  currentImage,
  nextImage,
  blend,
  introProgress,
  showFallback,
  fallbackImage,
  brandName,
  onSkip,
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showFallback || !currentImage) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const width = currentImage.naturalWidth || canvas.clientWidth;
    const height = currentImage.naturalHeight || canvas.clientHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    context.globalAlpha = 1;
    context.drawImage(currentImage, 0, 0, width, height);
    if (nextImage && nextImage !== currentImage && blend > 0) {
      context.globalAlpha = blend;
      context.drawImage(nextImage, 0, 0, width, height);
      context.globalAlpha = 1;
    }
  }, [currentImage, nextImage, blend, showFallback]);

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
          <canvas ref={canvasRef} className="h-full w-full object-cover" aria-hidden="true" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg-dark) 0%, rgb(var(--bg-dark-rgb) / 0.45) 40%, rgb(var(--bg-dark-rgb) / 0.1) 70%, transparent 100%)",
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
