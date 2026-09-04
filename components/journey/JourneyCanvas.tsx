"use client";
import { useRef } from "react";
import { useCrossfadeCanvas } from "@/hooks/useCrossfadeCanvas";

interface JourneyCanvasProps {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
}

export function JourneyCanvas({ currentImage, nextImage, blend }: JourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCrossfadeCanvas(canvasRef, { currentImage, nextImage, blend });

  return <canvas ref={canvasRef} className="h-full w-full object-cover" aria-hidden="true" />;
}
