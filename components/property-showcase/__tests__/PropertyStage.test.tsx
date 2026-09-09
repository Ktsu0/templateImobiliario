import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type { Property } from "@/lib/content/types";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, quality: _quality, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyStage } from "@/components/property-showcase/PropertyStage";
import { PropertyShowcase } from "@/components/property-showcase/PropertyShowcase";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

const property: Property = {
  id: "p1",
  title: "Casa Contemporânea Bigorrilho",
  transaction: "venda",
  type: "Casa",
  price: 1450000,
  location: "Bigorrilho, Curitiba",
  bedrooms: 4,
  suites: 2,
  area: 320,
  parkingSpots: 3,
  status: "exclusivo",
  featured: true,
  photos: ["/p1-a.webp", "/p1-b.webp", "/p1-c.webp"],
};

const second: Property = { ...property, id: "p2", title: "Apartamento Batel", photos: ["/p2-a.webp"] };

function renderStage(overrides: Partial<Property> = {}) {
  return render(
    <PropertyStage
      property={{ ...property, ...overrides }}
      position={1}
      total={8}
      whatsappNumber="5541999999999"
      eager
    />
  );
}

function visiblePhoto(): string {
  const shown = screen
    .getAllByRole("img")
    .find((img) => img.className.includes("opacity-100"));
  return shown?.getAttribute("src") ?? "none";
}

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyStage", () => {
  it("gives the listing a whole viewport", () => {
    renderStage();
    expect(screen.getByTestId("property-stage").className).toContain("h-screen");
  });

  it("shows where this listing sits in the set", () => {
    renderStage();
    expect(screen.getByText(/01\s*\/\s*08/)).toBeInTheDocument();
  });

  it("renders one bar per photo, the current one selected", () => {
    renderStage();
    const bars = within(screen.getByRole("tablist")).getAllByRole("tab");
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveAttribute("aria-selected", "true");
    expect(bars[1]).toHaveAttribute("aria-selected", "false");
  });

  it("advances the photo with the arrows and wraps at the end", () => {
    renderStage();
    expect(visiblePhoto()).toBe("/p1-a.webp");

    fireEvent.click(screen.getByLabelText("Próxima foto"));
    expect(visiblePhoto()).toBe("/p1-b.webp");

    fireEvent.click(screen.getByLabelText("Próxima foto"));
    fireEvent.click(screen.getByLabelText("Próxima foto"));
    expect(visiblePhoto()).toBe("/p1-a.webp");
  });

  it("goes back past the first photo to the last", () => {
    renderStage();
    fireEvent.click(screen.getByLabelText("Foto anterior"));
    expect(visiblePhoto()).toBe("/p1-c.webp");
  });

  it("jumps straight to a photo from its bar", () => {
    renderStage();
    const bars = within(screen.getByRole("tablist")).getAllByRole("tab");
    fireEvent.click(bars[2]);
    expect(visiblePhoto()).toBe("/p1-c.webp");
  });

  it("moves between photos with the arrow keys", () => {
    renderStage();
    const stage = screen.getByTestId("property-stage");

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(visiblePhoto()).toBe("/p1-b.webp");
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(visiblePhoto()).toBe("/p1-a.webp");
  });

  it("carries the price, location and a WhatsApp link for this listing", () => {
    renderStage();
    expect(screen.getByText("Bigorrilho, Curitiba")).toBeInTheDocument();
    expect(screen.getByText(/1\.450\.000/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /falar sobre este imóvel/i })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/5541999999999")
    );
  });

  it("keeps the favourite toggle on the stage", () => {
    renderStage();
    fireEvent.click(screen.getByRole("button", { name: /favorit/i }));
    expect(useFavoritesStore.getState().favoriteIds.has("p1")).toBe(true);
  });
});

describe("PropertyShowcase", () => {
  function renderShowcase(list: Property[]) {
    const stagesRef = createRef<HTMLElement[]>() as { current: HTMLElement[] };
    stagesRef.current = [];
    const exitRef = createRef<HTMLDivElement>();
    const result = render(
      <PropertyShowcase
        properties={list}
        whatsappNumber="55"
        stagesRef={stagesRef}
        exitRef={exitRef}
      />
    );
    return { ...result, stagesRef, exitRef };
  }

  it("gives every result its own stage", () => {
    renderShowcase([property, second]);
    expect(screen.getAllByTestId("property-stage")).toHaveLength(2);
  });

  it("hands the snap a reference to each stage", () => {
    const { stagesRef } = renderShowcase([property, second]);
    expect(stagesRef.current.filter(Boolean)).toHaveLength(2);
  });

  it("marks the way out past the last listing", () => {
    // Without a point ahead of the final listing, a mandatory snap pulls the
    // visitor back onto it every time they try to leave.
    renderShowcase([property, second]);
    const stages = screen.getAllByTestId("property-stage");
    const exit = screen.getByTestId("showcase-exit");
    expect(stages[1].compareDocumentPosition(exit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("holds the screen with an empty state when the filters match nothing", () => {
    renderShowcase([]);
    const empty = screen.getByTestId("showcase-empty");
    expect(empty.className).toContain("h-screen");
    expect(screen.getByText(/nenhum imóvel para esses filtros/i)).toBeInTheDocument();
  });
});
