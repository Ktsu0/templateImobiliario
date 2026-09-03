import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ClientBrand, ClientHero } from "@/config/types";

vi.mock("@/components/hero-frame-sequence/useScrollFrames", () => ({
  useScrollFrames: vi.fn(() => ({
    frameIndex: 0,
    currentImage: undefined,
    preloadProgress: 1,
    showFallback: false,
  })),
}));

import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";

const brand: ClientBrand = {
  name: "Pioneira Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/logo.svg",
  creci: "CRECI 12345-J",
};

const hero: ClientHero = {
  mode: "frame-sequence",
  framesPath: "/frames/",
  frameCount: 90,
  fallbackImage: "/fallback.webp",
  phases: [],
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '<div id="imoveis"></div>';
});

describe("HeroFrameSequence", () => {
  it("renders the brand name and slogan", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    expect(screen.getByText(brand.name)).toBeInTheDocument();
    expect(screen.getByText(brand.slogan)).toBeInTheDocument();
  });

  it("scrolls the properties section into view when skip is clicked", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(document.getElementById("imoveis")?.scrollIntoView).toHaveBeenCalledOnce();
  });
});
