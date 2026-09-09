import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useHoldsScreen } from "@/components/property-showcase/useHoldsScreen";

let trigger: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
let lastOptions: IntersectionObserverInit | undefined;
let disconnected = false;

class StubObserver {
  constructor(cb: (entries: { isIntersecting: boolean }[]) => void, options?: IntersectionObserverInit) {
    trigger = cb;
    lastOptions = options;
  }
  observe() {}
  disconnect() {
    disconnected = true;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const holds = useHoldsScreen(ref);
  return (
    <div ref={ref} data-testid="section">
      {holds ? "sim" : "nao"}
    </div>
  );
}

beforeEach(() => {
  trigger = null;
  lastOptions = undefined;
  disconnected = false;
  vi.stubGlobal("IntersectionObserver", StubObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useHoldsScreen", () => {
  it("watches a band across the middle of the viewport", () => {
    render(<Harness />);
    // An eight-viewport section intersects from its first pixel; the collapsed
    // margins are what make the answer mean "the visitor is looking at this".
    expect(lastOptions?.rootMargin).toBe("-45% 0px -45% 0px");
  });

  it("starts false and follows the band in and out", () => {
    render(<Harness />);
    expect(screen.getByTestId("section")).toHaveTextContent("nao");

    act(() => trigger?.([{ isIntersecting: true }]));
    expect(screen.getByTestId("section")).toHaveTextContent("sim");

    act(() => trigger?.([{ isIntersecting: false }]));
    expect(screen.getByTestId("section")).toHaveTextContent("nao");
  });

  it("stops observing when unmounted", () => {
    const { unmount } = render(<Harness />);
    unmount();
    expect(disconnected).toBe(true);
  });
});
