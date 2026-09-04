import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ClientBrand, ClientHero } from "@/config/types";

vi.mock("@/components/hero-frame-sequence/useHeroIntro", () => ({
  useHeroIntro: vi.fn(),
}));

import { useHeroIntro } from "@/components/hero-frame-sequence/useHeroIntro";
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

const skipIntro = vi.fn();

function mockIntro(overrides: Partial<ReturnType<typeof useHeroIntro>> = {}) {
  vi.mocked(useHeroIntro).mockReturnValue({
    currentImage: undefined,
    nextImage: undefined,
    blend: 0,
    preloadProgress: 1,
    showFallback: false,
    introProgress: 0,
    isTitleVisible: false,
    skipIntro,
    ...overrides,
  });
}

beforeEach(() => {
  skipIntro.mockClear();
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '<div id="imoveis"></div>';
  mockIntro();
});

describe("HeroFrameSequence — CTA target", () => {
  /** Per-element spies: a shared Element.prototype spy cannot tell the two apart. */
  function setUpAnchors(ids: string[]) {
    document.body.innerHTML = ids.map((id) => `<div id="${id}"></div>`).join("");
    const spies: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const id of ids) {
      const spy = vi.fn();
      spies[id] = spy;
      (document.getElementById(id) as HTMLElement).scrollIntoView = spy;
    }
    return spies;
  }

  it("sends the CTA into the walkthrough when the page has one", () => {
    const spies = setUpAnchors(["jornada", "imoveis"]);
    mockIntro({ isTitleVisible: true });
    render(<HeroFrameSequence brand={brand} hero={hero} />);

    fireEvent.click(screen.getByRole("button", { name: /ver imóveis/i }));
    expect(spies.jornada).toHaveBeenCalledOnce();
    expect(spies.imoveis).not.toHaveBeenCalled();
  });

  it("falls back to the listings when there is no walkthrough", () => {
    const spies = setUpAnchors(["imoveis"]);
    mockIntro({ isTitleVisible: true });
    render(<HeroFrameSequence brand={brand} hero={hero} />);

    fireEvent.click(screen.getByRole("button", { name: /ver imóveis/i }));
    expect(spies.imoveis).toHaveBeenCalledOnce();
  });

  it("skip jumps past the walkthrough straight to the listings", () => {
    const spies = setUpAnchors(["jornada", "imoveis"]);
    render(<HeroFrameSequence brand={brand} hero={hero} />);

    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(spies.imoveis).toHaveBeenCalledOnce();
    expect(spies.jornada).not.toHaveBeenCalled();
  });
});

describe("HeroFrameSequence", () => {
  it("keeps the title hidden until the intro reveals it", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    expect(screen.getByTestId("hero-title")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("hero-title")).toHaveClass("opacity-0");
  });

  it("shows the brand name, slogan, and CTA once revealed", () => {
    mockIntro({ isTitleVisible: true, introProgress: 0.9 });
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    const title = screen.getByTestId("hero-title");
    expect(title).toHaveAttribute("aria-hidden", "false");
    expect(title).toHaveClass("opacity-100");
    expect(screen.getByText(brand.name)).toBeInTheDocument();
    expect(screen.getByText(brand.slogan)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ver imóveis/i }));
    expect(document.getElementById("imoveis")?.scrollIntoView).toHaveBeenCalledOnce();
  });

  it("skip completes the intro and scrolls to the properties section", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(skipIntro).toHaveBeenCalledOnce();
    expect(document.getElementById("imoveis")?.scrollIntoView).toHaveBeenCalledOnce();
  });
});
