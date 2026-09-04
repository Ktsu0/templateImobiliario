import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

describe("FavoriteButton", () => {
  it("shows an outlined heart and calls onToggle when not favorited", () => {
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorite={false} onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: /adicionar aos favoritos/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows a filled heart when favorited", () => {
    render(<FavoriteButton isFavorite={true} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: /remover dos favoritos/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
