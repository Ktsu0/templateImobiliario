import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ClientBrand, ClientJourney } from "@/config/types";
import type { Property } from "@/lib/content/types";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

vi.mock("@/components/journey/useJourneyScroll", () => ({
  useJourneyScroll: vi.fn(),
}));

import { useJourneyScroll } from "@/components/journey/useJourneyScroll";
import { JourneySection } from "@/components/journey/JourneySection";

const brand: ClientBrand = {
  name: "Meridiano Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/clients/meridiano/logo.svg",
  creci: "CRECI 12345-J",
};

const journey: ClientJourney = {
  videoSrc: "/journey.mp4",
  posterImage: "/journey-poster.webp",
  fallbackImage: "/journey-fallback.webp",
  frameAspectRatio: 1366 / 768,
  scrollHeightVh: 320,
  screenRect: { x: 34, y: 24, width: 38, height: 37 },
  zoomStartProgress: 0.7,
  zoomScale: 3.4,
  headline: "Da sala ao seu endereço",
  subheadline: "Percorra o imóvel sem sair daqui.",
};

const LOGO_MARKUP = '<svg viewBox="0 0 452 96"><title>marca</title></svg>';

function makeProperty(id: string, title: string): Property {
  return {
    id,
    title,
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
  };
}

const properties = [
  makeProperty("p1", "Casa Um"),
  makeProperty("p2", "Casa Dois"),
  makeProperty("p3", "Casa Três"),
  makeProperty("p4", "Casa Quatro"),
];

function mockScroll(overrides: Partial<ReturnType<typeof useJourneyScroll>> = {}) {
  vi.mocked(useJourneyScroll).mockReturnValue({
    videoRef: { current: null },
    scale: 1,
    previewOpacity: 0,
    zoomProgress: 0,
    walkProgress: 0,
    entryVeil: 1,
    showFallback: false,
    ...overrides,
  });
}

function renderSection(logoMarkup: string | null = LOGO_MARKUP) {
  return render(<JourneySection journey={journey} brand={brand} logoMarkup={logoMarkup} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockScroll();
});

describe("JourneySection", () => {
  it("reserves scroll height and starts unzoomed with the screen preview hidden", () => {
    const { container } = renderSection();

    const section = container.querySelector("section") as HTMLElement;
    expect(section.id).toBe("jornada");
    expect(section.style.height).toBe("320vh");
    expect(screen.getByTestId("journey-zoom").style.transform).toBe("scale(1)");
    expect(screen.getByTestId("journey-screen").style.opacity).toBe("0");
  });

  it("opens under a full dark veil that lifts as the walk begins", () => {
    renderSection();
    expect(screen.getByTestId("journey-veil").style.opacity).toBe("1");

    mockScroll({ walkProgress: 0.5, entryVeil: 0 });
    renderSection();
    expect(screen.getAllByTestId("journey-veil")[1].style.opacity).toBe("0");
  });

  it("anchors the zoom on the centre of the laptop screen", () => {
    renderSection();
    // screenRect x 34 + 38/2 = 53, y 24 + 37/2 = 42.5
    expect(screen.getByTestId("journey-zoom").style.transformOrigin).toBe("53% 42.5%");
  });

  it("scales up and reveals the preview at the end of the scroll", () => {
    mockScroll({ scale: 3.4, previewOpacity: 1, zoomProgress: 1, walkProgress: 1, entryVeil: 0 });
    renderSection();

    expect(screen.getByTestId("journey-zoom").style.transform).toBe("scale(3.4)");
    expect(screen.getByTestId("journey-screen").style.opacity).toBe("1");
    expect(screen.getByTestId("journey-headline").style.opacity).toBe("0");
  });

  it("shows the mark alone on the screen — no second brand line, no photos", () => {
    mockScroll({ previewOpacity: 1 });
    const { container } = renderSection();
    const laptopScreen = screen.getByTestId("journey-screen");

    expect(laptopScreen.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: brand.name })).toBeInTheDocument();
    // The logo already carries the wordmark; repeating it below was the bug.
    expect(screen.queryByText(brand.name)).not.toBeInTheDocument();
    // Property photos here would be upscaled frames of the footage itself.
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("keeps the screen out of the zoomed layer so it never rasterises blurred", () => {
    mockScroll({ scale: 3.4, previewOpacity: 1 });
    renderSection();

    const zoom = screen.getByTestId("journey-zoom");
    const laptopScreen = screen.getByTestId("journey-screen");
    expect(zoom.contains(laptopScreen)).toBe(false);
  });

  it("grows the screen box by the zoom while holding its centre", () => {
    mockScroll({ scale: 3, previewOpacity: 1 });
    renderSection();

    // screenRect 34/24/38x37 at scale 3 -> 114x111 centred on 53%/42.5%
    const box = screen.getByTestId("journey-screen").style;
    expect(box.width).toBe("114%");
    expect(box.height).toBe("111%");
    expect(box.left).toBe("-4%");
    expect(box.top).toBe("-13%");
  });

  it("falls back to the logo file when the client has no inline markup", () => {
    mockScroll({ previewOpacity: 1 });
    renderSection(null);

    expect(screen.getByRole("img", { name: brand.name })).toHaveAttribute("src", brand.logoUrl);
  });

  it("drops the scroll-jacking entirely when falling back", () => {
    mockScroll({ showFallback: true });
    const { container } = renderSection();

    const section = container.querySelector("section") as HTMLElement;
    expect(section.id).toBe("jornada");
    expect(section.style.height).toBe("");
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getByRole("link", { name: /ver imóveis/i })).toHaveAttribute("href", "#imoveis");
    expect(screen.getByText(journey.headline)).toBeInTheDocument();
  });
});
