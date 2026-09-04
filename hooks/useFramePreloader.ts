"use client";
import { useEffect, useState } from "react";

interface FramePreloaderState {
  images: HTMLImageElement[];
  loadedCount: number;
  progress: number;
  isComplete: boolean;
}

/**
 * Fetches the frame sequence. `step` skips the frames the player will never
 * show — mobile samples every other frame, so it should download half the
 * bytes rather than the whole sequence. Images are stored at their real index
 * so callers can keep indexing by frame number.
 */
export function useFramePreloader(
  framesPath: string,
  frameCount: number,
  step = 1
): FramePreloaderState {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const safeStep = Math.max(1, Math.floor(step));
  const expected = frameCount <= 0 ? 0 : Math.ceil(frameCount / safeStep);

  useEffect(() => {
    let cancelled = false;
    const nextImages: HTMLImageElement[] = new Array(frameCount);
    setImages([]);
    setLoadedCount(0);

    for (let i = 0; i < frameCount; i += safeStep) {
      const img = new Image();
      const frameNumber = String(i + 1).padStart(3, "0");
      img.src = `${framesPath}frame-${frameNumber}.webp`;
      img.onload = () => {
        if (cancelled) return;
        nextImages[i] = img;
        setImages([...nextImages]);
        setLoadedCount((count) => count + 1);
      };
      nextImages[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, [framesPath, frameCount, safeStep]);

  const progress = expected === 0 ? 1 : loadedCount / expected;

  return {
    images,
    loadedCount,
    progress,
    isComplete: expected > 0 && loadedCount >= expected,
  };
}
