import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Reveal } from "@/components/ui/Reveal";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("shows its content immediately when IntersectionObserver is unavailable", () => {
    // jsdom has no IntersectionObserver: content must never be left invisible.
    render(
      <Reveal>
        <p>conteúdo</p>
      </Reveal>
    );
    expect(screen.getByText("conteúdo").parentElement).toHaveAttribute("data-revealed", "true");
  });

  it("waits for the element to intersect before revealing", () => {
    let trigger: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
          trigger = callback;
        }
        observe() {}
        disconnect = disconnect;
      }
    );

    render(
      <Reveal>
        <p>conteúdo</p>
      </Reveal>
    );
    const wrapper = screen.getByText("conteúdo").parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute("data-revealed", "false");

    act(() => trigger?.([{ isIntersecting: true }]));
    expect(wrapper).toHaveAttribute("data-revealed", "true");
    expect(disconnect).toHaveBeenCalled();
  });
});
