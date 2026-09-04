import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Testimonial } from "@/lib/content/types";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn(() => false) }));

import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";

const testimonials: Testimonial[] = [
  { id: "t1", name: "Marina", role: "Comprou no Bigorrilho", rating: 5, quote: "Primeiro relato." },
  { id: "t2", name: "Rodrigo", role: "Alugou no Batel", rating: 4, quote: "Segundo relato." },
  { id: "t3", name: "Tereza", role: "Investidora", rating: 5, quote: "Terceiro relato." },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TestimonialsSection", () => {
  it("shows the first testimonial with its rating", () => {
    render(<TestimonialsSection testimonials={testimonials} title="O que dizem" />);

    expect(screen.getByText(/primeiro relato/i)).toBeInTheDocument();
    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 de 5 estrelas" })).toBeInTheDocument();
  });

  it("moves through testimonials with the arrows", () => {
    render(<TestimonialsSection testimonials={testimonials} title="O que dizem" />);

    fireEvent.click(screen.getByRole("button", { name: /próximo depoimento/i }));
    expect(screen.getByText(/segundo relato/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4 de 5 estrelas" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /depoimento anterior/i }));
    expect(screen.getByText(/primeiro relato/i)).toBeInTheDocument();
  });

  it("jumps straight to a testimonial from its dot", () => {
    render(<TestimonialsSection testimonials={testimonials} title="O que dizem" />);

    fireEvent.click(screen.getByRole("button", { name: /ver depoimento de tereza/i }));
    expect(screen.getByText(/terceiro relato/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver depoimento de tereza/i })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  it("renders nothing when the client has no testimonials yet", () => {
    const { container } = render(<TestimonialsSection testimonials={[]} title="O que dizem" />);
    expect(container).toBeEmptyDOMElement();
  });
});
