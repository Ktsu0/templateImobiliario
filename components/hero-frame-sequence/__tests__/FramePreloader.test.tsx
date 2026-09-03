import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FramePreloader } from "@/components/hero-frame-sequence/FramePreloader";

describe("FramePreloader", () => {
  it("shows a progress bar with the current percentage while loading", () => {
    render(<FramePreloader progress={0.4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
  });

  it("renders nothing once loading is complete", () => {
    const { container } = render(<FramePreloader progress={1} />);
    expect(container).toBeEmptyDOMElement();
  });
});
