"use client";
import { useEffect, type RefObject } from "react";

interface CrossfadeInput {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
  enabled?: boolean;
}

/**
 * Draws a frame onto the canvas, cross-fading into the following frame by
 * `blend`. Sequences shot at ~15fps read as a smooth move this way instead of
 * stepping frame to frame.
 */
export function useCrossfadeCanvas(
  canvasRef: RefObject<HTMLCanvasElement>,
  { currentImage, nextImage, blend, enabled = true }: CrossfadeInput
): void {
  useEffect(() => {
    if (!enabled || !currentImage) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const width = currentImage.naturalWidth || canvas.clientWidth;
    const height = currentImage.naturalHeight || canvas.clientHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    // The bitmap is smaller than the viewport it fills; ask for the browser's
    // best resampling filter instead of the default bilinear blur.
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.globalAlpha = 1;
    context.drawImage(currentImage, 0, 0, width, height);

    if (nextImage && nextImage !== currentImage && blend > 0) {
      context.globalAlpha = blend;
      context.drawImage(nextImage, 0, 0, width, height);
      context.globalAlpha = 1;
    }
  }, [canvasRef, currentImage, nextImage, blend, enabled]);
}
