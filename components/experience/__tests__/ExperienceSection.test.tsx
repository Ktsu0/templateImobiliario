import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ClientBrand, ClientHero, ClientJourney } from "@/config/types";

vi.mock("@/hooks/useSectionScrollProgress", () => ({ useSectionScrollProgress: vi.fn() }));
vi.mock("@/hooks/useMediaFallback", () => ({ useMediaFallback: vi.fn() }));
vi.mock("@/components/motion/useScrollTo", () => ({ useScrollTo: vi.fn() }));
vi.mock("@/components/journey/ScrollyVideoLayer", () => ({
  ScrollyVideoLayer: ({ src, percentage }: { src: string; percentage: number }) => (
    <div data-testid="journey-video" data-src={src} data-percentage={percentage} />
  ),
}));
vi.mock("@/components/hero/useHeroIntro", () => ({
  useHeroIntro: () => ({
    videoRef: { current: null },
    showFallback: false,
    introProgress: 1,
    isTitleVisible: true,
    skipIntro: vi.fn(),
  }),
}));

import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { useMediaFallback } from "@/hooks/useMediaFallback";
import { useScrollTo } from "@/components/motion/useScrollTo";
import { ExperienceSection } from "@/components/experience/ExperienceSection";

const brand: ClientBrand = {
  name: "Meridiano Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/clients/meridiano/logo.svg",
  creci: "CRECI 12345-J",
};

const hero: ClientHero = {
  mode: "video",
  videoSrc: "/hero.mp4",
  posterImage: "/hero-poster.webp",
  fallbackImage: "/hero-fallback.webp",
  titleRevealAt: 0.8,
};

const journey: ClientJourney = {
  videoSrc: "/journey.mp4",
  posterImage: "/journey-poster.webp",
  fallbackImage: "/journey-fallback.webp",
  scrollHeightVh: 320,
  headline: "Da sala ao seu endereço",
  subheadline: "Percorra o imóvel sem sair daqui.",
};

let scrollTo: ReturnType<typeof vi.fn>;

function renderSection() {
  return render(<ExperienceSection brand={brand} hero={hero} journey={journey} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  scrollTo = vi.fn();
  vi.mocked(useScrollTo).mockReturnValue(scrollTo);
  vi.mocked(useMediaFallback).mockReturnValue(false);
  vi.mocked(useSectionScrollProgress).mockReturnValue(0);
});

describe("ExperienceSection", () => {
  it("pins one stage for the whole scroll range, with the walkthrough already underneath", () => {
    const { container } = renderSection();

    const section = container.querySelector("section") as HTMLElement;
    expect(section.id).toBe("jornada");
    expect(section.style.height).toBe("320vh");
    expect(screen.getByTestId("journey-video")).toHaveAttribute("data-src", "/journey.mp4");
    expect(screen.getByTestId("journey-video")).toHaveAttribute("data-percentage", "0");
  });

  it("shows the intro card and hides the caption before any scroll", () => {
    renderSection();

    expect(screen.getByTestId("experience-intro")).toHaveClass("opacity-100");
    expect(screen.getByTestId("experience-intro")).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByTestId("experience-caption").style.opacity).toBe("0");
  });

  it("lifts the card and hands the scroll to the walkthrough on the first scroll", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(0.01);
    renderSection();

    expect(screen.getByTestId("experience-intro")).toHaveClass("opacity-0");
    expect(screen.getByTestId("experience-intro")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("journey-video")).toHaveAttribute("data-percentage", "0.01");
    expect(screen.getByTestId("experience-caption").style.opacity).toBe("1");
    expect(screen.getByText(journey.headline)).toBeInTheDocument();
  });

  it("fades the caption out before releasing into the listings", () => {
    vi.mocked(useSectionScrollProgress).mockReturnValue(1);
    renderSection();

    expect(screen.getByTestId("journey-video")).toHaveAttribute("data-percentage", "1");
    expect(screen.getByTestId("experience-caption").style.opacity).toBe("0");
  });

  it("sends 'Ver imóveis' one viewport in, to start the walk, not back to the top", () => {
    const { container } = renderSection();

    fireEvent.click(screen.getByRole("button", { name: /ver imóveis/i }));

    const [target] = scrollTo.mock.calls[0];
    expect(target).toBeInstanceOf(HTMLElement);
    expect(container.contains(target)).toBe(true);
    expect((target as HTMLElement).className).toContain("top-[100vh]");
  });

  it("drops the pin and the scroll range entirely when falling back", () => {
    vi.mocked(useMediaFallback).mockReturnValue(true);
    const { container } = renderSection();

    const section = container.querySelector("section") as HTMLElement;
    expect(section.id).toBe("jornada");
    expect(section.style.height).toBe("");
    expect(screen.queryByTestId("journey-video")).toBeNull();
    expect(screen.queryByText(journey.headline)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /ver imóveis/i }));
    expect(scrollTo).toHaveBeenCalledWith("imoveis");
  });
});
