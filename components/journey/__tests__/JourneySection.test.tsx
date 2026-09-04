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
  name: "Pioneira Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/clients/pioneira/logo.svg",
  creci: "CRECI 12345-J",
};

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
  screenWelcome: "Bem-vindo. Seu próximo endereço começa aqui.",
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
    walkProgress: 0,
    entryVeil: 1,
    preloadProgress: 1,
    showFallback: false,
    ...overrides,
  });
}

function renderSection() {
  return render(<JourneySection journey={journey} properties={properties} brand={brand} />);
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

  it("puts the brand and a scroll cue on the screen, and no photos", () => {
    mockScroll({ previewOpacity: 1 });
    const { container } = renderSection();
    const laptopScreen = screen.getByTestId("journey-screen");

    expect(laptopScreen.querySelector("img")).toHaveAttribute("src", brand.logoUrl);
    expect(screen.getByText(brand.name)).toBeInTheDocument();
    expect(screen.getByText(journey.screenWelcome)).toBeInTheDocument();
    expect(screen.getByText(/role para ver os imóveis/i)).toBeInTheDocument();
    // Property photos here would be upscaled frames of the footage itself.
    expect(container.querySelectorAll("img")).toHaveLength(1);
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
