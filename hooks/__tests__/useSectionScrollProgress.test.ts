import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";

describe("useSectionScrollProgress", () => {
  it("returns 0 for the initial measurement before any real scrolling happens", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useSectionScrollProgress(ref);
    });
    expect(result.current).toBe(0);
  });
});
