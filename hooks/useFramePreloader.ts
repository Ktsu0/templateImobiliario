"use client";
import { useEffect, useState } from "react";

interface FramePreloaderState {
  images: HTMLImageElement[];
  loadedCount: number;
  progress: number;
  isComplete: boolean;
}

export function useFramePreloader(framesPath: string, frameCount: number): FramePreloaderState {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const nextImages: HTMLImageElement[] = new Array(frameCount);
    setImages([]);
    setLoadedCount(0);

    for (let i = 0; i < frameCount; i++) {
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
  }, [framesPath, frameCount]);

  const progress = frameCount === 0 ? 1 : loadedCount / frameCount;

  return {
    images,
    loadedCount,
    progress,
    isComplete: frameCount > 0 && loadedCount >= frameCount,
  };
}
