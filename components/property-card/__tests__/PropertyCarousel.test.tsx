import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyCarousel } from "@/components/property-card/PropertyCarousel";

const photos = ["/photo-1.webp", "/photo-2.webp", "/photo-3.webp"];

describe("PropertyCarousel", () => {
  it("shows the first photo initially", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });

  it("advances on next-arrow click, and wraps around", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    const next = screen.getByRole("button", { name: /próxima foto/i });

    fireEvent.click(next);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[1]);

    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });

  it("advances on a left swipe and goes back on a right swipe", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    const surface = screen.getByTestId("carousel-surface");

    fireEvent.touchStart(surface, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[1]);

    fireEvent.touchStart(surface, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 200 }] });
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });
});
