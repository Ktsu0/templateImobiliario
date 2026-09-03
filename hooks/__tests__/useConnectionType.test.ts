import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConnectionType } from "@/hooks/useConnectionType";

afterEach(() => {
  // @ts-expect-error -- test-only cleanup of a non-standard Navigator field
  delete navigator.connection;
});

describe("useConnectionType", () => {
  it("reads the effective type from navigator.connection when present", () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "3g" },
    });

    const { result } = renderHook(() => useConnectionType());
    expect(result.current).toBe("3g");
  });

  it("returns undefined when navigator.connection is not available", () => {
    const { result } = renderHook(() => useConnectionType());
    expect(result.current).toBeUndefined();
  });
});
