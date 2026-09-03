import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroCanvas } from "@/components/hero-frame-sequence/HeroCanvas";

describe("HeroCanvas", () => {
  it("renders the fallback image and an always-visible skip button", () => {
    const onSkip = vi.fn();
    render(
      <HeroCanvas
        currentImage={undefined}
        showFallback={true}
        fallbackImage="/fallback.webp"
        brandName="Pioneira Imóveis"
        onSkip={onSkip}
      />
    );

    expect(screen.getByRole("img", { name: /pioneira imóveis/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("renders a canvas element when not showing the fallback", () => {
    const { container } = render(
      <HeroCanvas
        currentImage={undefined}
        showFallback={false}
        fallbackImage="/fallback.webp"
        brandName="Pioneira Imóveis"
        onSkip={() => {}}
      />
    );
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
