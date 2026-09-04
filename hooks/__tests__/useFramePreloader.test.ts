import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFramePreloader } from "@/hooks/useFramePreloader";

const requested: string[] = [];

class MockImage {
  onload: (() => void) | null = null;
  private _src = "";
  set src(value: string) {
    this._src = value;
    requested.push(value);
    queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}

beforeEach(() => {
  requested.length = 0;
  vi.stubGlobal("Image", MockImage as unknown as typeof Image);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFramePreloader", () => {
  it("reports progress as frames finish loading and completes at 100%", async () => {
    const { result } = renderHook(() => useFramePreloader("/frames/", 3));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.loadedCount).toBe(3);
    expect(result.current.progress).toBe(1);
    expect(requested).toEqual([
      "/frames/frame-001.webp",
      "/frames/frame-002.webp",
      "/frames/frame-003.webp",
    ]);
  });

  it("downloads only the frames a stepped player will show", async () => {
    const { result } = renderHook(() => useFramePreloader("/frames/", 6, 2));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    // Half the sequence, and each image still sits at its real frame index.
    expect(requested).toEqual([
      "/frames/frame-001.webp",
      "/frames/frame-003.webp",
      "/frames/frame-005.webp",
    ]);
    expect(result.current.loadedCount).toBe(3);
    expect(result.current.progress).toBe(1);
    expect(result.current.images[0]).toBeDefined();
    expect(result.current.images[2]).toBeDefined();
    expect(result.current.images[4]).toBeDefined();
  });

  it("requests nothing and reports done when there are no frames", () => {
    const { result } = renderHook(() => useFramePreloader("/frames/", 0));
    expect(requested).toEqual([]);
    expect(result.current.progress).toBe(1);
    expect(result.current.isComplete).toBe(false);
  });
});
