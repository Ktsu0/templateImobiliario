import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFramePreloader } from "@/hooks/useFramePreloader";

class MockImage {
  onload: (() => void) | null = null;
  private _src = "";
  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}

beforeEach(() => {
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
    expect(result.current.images).toHaveLength(3);
  });
});
