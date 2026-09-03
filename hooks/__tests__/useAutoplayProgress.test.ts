import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoplayProgress } from "@/hooks/useAutoplayProgress";

let rafCallbacks: FrameRequestCallback[] = [];

beforeEach(() => {
  rafCallbacks = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    rafCallbacks.push(callback);
    return rafCallbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function runNextFrame(timestamp: number) {
  const callback = rafCallbacks.shift();
  if (!callback) throw new Error("no animation frame scheduled");
  act(() => callback(timestamp));
}

describe("useAutoplayProgress", () => {
  it("does not schedule any frame while disabled", () => {
    const { result } = renderHook(() => useAutoplayProgress(1000, false));
    expect(result.current.progress).toBe(0);
    expect(rafCallbacks).toHaveLength(0);
  });

  it("advances from 0 to 1 over the configured duration and stops", () => {
    const { result } = renderHook(() => useAutoplayProgress(1000, true));

    runNextFrame(5000);
    expect(result.current.progress).toBe(0);

    runNextFrame(5500);
    expect(result.current.progress).toBeCloseTo(0.5);

    runNextFrame(6200);
    expect(result.current.progress).toBe(1);
    expect(rafCallbacks).toHaveLength(0);
  });

  it("jumps straight to 1 when complete() is called", () => {
    const { result } = renderHook(() => useAutoplayProgress(1000, true));
    runNextFrame(5000);

    act(() => result.current.complete());

    expect(result.current.progress).toBe(1);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
