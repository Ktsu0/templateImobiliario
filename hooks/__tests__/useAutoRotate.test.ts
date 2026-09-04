import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoRotate } from "@/hooks/useAutoRotate";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutoRotate", () => {
  it("advances on its own and wraps around the end", () => {
    const { result } = renderHook(() => useAutoRotate(3, 1000));
    expect(result.current.index).toBe(0);

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.index).toBe(1);

    act(() => void vi.advanceTimersByTime(2000));
    expect(result.current.index).toBe(0);
  });

  it("stays put when rotation is disabled", () => {
    const { result } = renderHook(() => useAutoRotate(3, 1000, false));
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.index).toBe(0);
  });

  it("wraps backwards from the first item", () => {
    const { result } = renderHook(() => useAutoRotate(3, 1000));
    act(() => result.current.previous());
    expect(result.current.index).toBe(2);
  });

  it("restarts the interval after manual navigation", () => {
    const { result } = renderHook(() => useAutoRotate(3, 1000));

    act(() => void vi.advanceTimersByTime(900));
    act(() => result.current.goTo(2));
    expect(result.current.index).toBe(2);

    // The old timer would have fired 100ms later; the restarted one must not.
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current.index).toBe(2);

    act(() => void vi.advanceTimersByTime(800));
    expect(result.current.index).toBe(0);
  });

  it("never divides by an empty collection", () => {
    const { result } = renderHook(() => useAutoRotate(0, 1000));
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current.index).toBe(0);
  });
});
