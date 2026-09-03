import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHasMounted } from "@/hooks/useHasMounted";

describe("useHasMounted", () => {
  it("is false on the first render and true after mount", () => {
    const renders: boolean[] = [];
    const { result } = renderHook(() => {
      const mounted = useHasMounted();
      renders.push(mounted);
      return mounted;
    });
    expect(renders[0]).toBe(false);
    expect(result.current).toBe(true);
  });
});
