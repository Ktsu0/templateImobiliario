import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ClientJourney } from "@/config/types";
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

const journey: ClientJourney = {
  framesPath: "/journey/",
  frameCount: 90,
  fallbackImage: "/journey-fallback.webp",
  frameAspectRatio: 1366 / 768,
  scrollHeightVh: 320,
  screenRect: { x: 34, y: 24, width: 38, height: 37 },
  zoomStartProgress: 0.7,
  zoomScale: 3.4,
  headline: "Da sala ao seu endereço",
  subheadline: "Percorra o imóvel sem sair daqui.",
};

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
    currentImage: undefined,
    nextImage: undefined,
    blend: 0,
    scale: 1,
    previewOpacity: 0,
    zoomProgress: 0,
    preloadProgress: 1,
    showFallback: false,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockScroll();
});

describe("JourneySection", () => {
  it("reserves scroll height and starts unzoomed with the screen preview hidden", () => {
    const { container } = render(
      <JourneySection journey={journey} properties={properties} brandName="Pioneira Imóveis" />
    );

    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.height).toBe("320vh");
    expect(screen.getByTestId("journey-zoom").style.transform).toBe("scale(1)");
    expect(screen.getByTestId("journey-screen").style.opacity).toBe("0");
  });

  it("anchors the zoom on the centre of the laptop screen", () => {
    render(
      <JourneySection journey={journey} properties={properties} brandName="Pioneira Imóveis" />
    );
    // screenRect x 34 + 38/2 = 53, y 24 + 37/2 = 42.5
    expect(screen.getByTestId("journey-zoom").style.transformOrigin).toBe("53% 42.5%");
  });

  it("scales up and reveals the preview at the end of the scroll", () => {
    mockScroll({ scale: 3.4, previewOpacity: 1, zoomProgress: 1 });
    render(
      <JourneySection journey={journey} properties={properties} brandName="Pioneira Imóveis" />
    );

    expect(screen.getByTestId("journey-zoom").style.transform).toBe("scale(3.4)");
    expect(screen.getByTestId("journey-screen").style.opacity).toBe("1");
    expect(screen.getByTestId("journey-headline").style.opacity).toBe("0");
  });

  it("shows only the first three properties on the laptop screen", () => {
    mockScroll({ previewOpacity: 1 });
    render(
      <JourneySection journey={journey} properties={properties} brandName="Pioneira Imóveis" />
    );

    expect(screen.getByText("Casa Um")).toBeInTheDocument();
    expect(screen.getByText("Casa Três")).toBeInTheDocument();
    expect(screen.queryByText("Casa Quatro")).not.toBeInTheDocument();
  });

  it("drops the scroll-jacking entirely when falling back", () => {
    mockScroll({ showFallback: true });
    const { container } = render(
      <JourneySection journey={journey} properties={properties} brandName="Pioneira Imóveis" />
    );

    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.height).toBe("");
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getByRole("link", { name: /ver imóveis/i })).toHaveAttribute("href", "#imoveis");
    expect(screen.getByText(journey.headline)).toBeInTheDocument();
  });
});
