import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroCanvas } from "@/components/hero-frame-sequence/HeroCanvas";

const baseProps = {
  currentImage: undefined,
  nextImage: undefined,
  blend: 0,
  introProgress: 0,
  showFallback: false,
  fallbackImage: "/fallback.webp",
  brandName: "Meridiano Imóveis",
  onSkip: () => {},
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HeroCanvas", () => {
  it("renders the fallback image and an always-visible skip button", () => {
    const onSkip = vi.fn();
    render(<HeroCanvas {...baseProps} showFallback={true} onSkip={onSkip} />);

    expect(screen.getByRole("img", { name: /meridiano imóveis/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("renders a canvas element when not showing the fallback", () => {
    const { container } = render(<HeroCanvas {...baseProps} />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("crossfades by drawing the current frame and the next frame at the blend alpha", () => {
    const context = { drawImage: vi.fn(), globalAlpha: 1 };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D
    );
    const currentImage = new Image();
    const nextImage = new Image();

    render(<HeroCanvas {...baseProps} currentImage={currentImage} nextImage={nextImage} blend={0.4} />);

    expect(context.drawImage).toHaveBeenCalledTimes(2);
    expect(context.drawImage.mock.calls[0][0]).toBe(currentImage);
    expect(context.drawImage.mock.calls[1][0]).toBe(nextImage);
  });

  it("scales the frame up as the intro progresses", () => {
    const { container } = render(<HeroCanvas {...baseProps} introProgress={1} />);
    const scaled = container.querySelector("[data-testid='hero-zoom']") as HTMLElement;
    expect(scaled.style.transform).toBe("scale(1.06)");
  });
});
