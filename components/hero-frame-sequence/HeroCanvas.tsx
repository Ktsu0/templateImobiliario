"use client";
import { useEffect, useRef } from "react";

interface HeroCanvasProps {
  currentImage: HTMLImageElement | undefined;
  showFallback: boolean;
  fallbackImage: string;
  brandName: string;
  onSkip: () => void;
}

export function HeroCanvas({
  currentImage,
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
    canvas.width = currentImage.naturalWidth || canvas.clientWidth;
    canvas.height = currentImage.naturalHeight || canvas.clientHeight;
    context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
  }, [currentImage, showFallback]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bgDark">
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
      <button
        type="button"
        onClick={onSkip}
        className="absolute right-6 top-6 z-10 rounded-full bg-black/40 px-4 py-2 text-sm text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        Pular introdução
      </button>
    </div>
  );
}
