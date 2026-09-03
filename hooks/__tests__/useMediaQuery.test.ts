import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<() => void> = [];
  let matches = initialMatches;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.push(listener),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  return {
    setMatches: (value: boolean) => {
      matches = value;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("returns the current match state and reacts to changes", () => {
    const { setMatches } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);

    act(() => setMatches(true));
    expect(result.current).toBe(true);
  });
});
