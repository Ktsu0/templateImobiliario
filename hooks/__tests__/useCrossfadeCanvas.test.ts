import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useCrossfadeCanvas } from "@/hooks/useCrossfadeCanvas";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderWithCanvas(input: {
  currentImage: HTMLImageElement | undefined;
  nextImage: HTMLImageElement | undefined;
  blend: number;
  enabled?: boolean;
}) {
  const context = { drawImage: vi.fn(), globalAlpha: 1 };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );

  renderHook(() => {
    const ref = useRef<HTMLCanvasElement>(document.createElement("canvas"));
    useCrossfadeCanvas(ref, input);
  });

  return context;
}

describe("useCrossfadeCanvas", () => {
  it("draws only the current frame when there is nothing to blend into", () => {
    const currentImage = new Image();
    const context = renderWithCanvas({ currentImage, nextImage: undefined, blend: 0 });
    expect(context.drawImage).toHaveBeenCalledTimes(1);
    expect(context.drawImage.mock.calls[0][0]).toBe(currentImage);
  });

  it("draws the next frame on top at the blend alpha", () => {
    const currentImage = new Image();
    const nextImage = new Image();
    const context = renderWithCanvas({ currentImage, nextImage, blend: 0.4 });
    expect(context.drawImage).toHaveBeenCalledTimes(2);
    expect(context.drawImage.mock.calls[1][0]).toBe(nextImage);
  });

  it("does not draw the next frame when it is the same image", () => {
    const currentImage = new Image();
    const context = renderWithCanvas({ currentImage, nextImage: currentImage, blend: 0.8 });
    expect(context.drawImage).toHaveBeenCalledTimes(1);
  });

  it("draws nothing while disabled", () => {
    const context = renderWithCanvas({
      currentImage: new Image(),
      nextImage: undefined,
      blend: 0,
      enabled: false,
    });
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
