import { describe, it, expect, beforeEach } from "vitest";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("useFavoritesStore", () => {
  it("starts with no favorites", () => {
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(false);
  });

  it("toggles a property into and out of favorites", () => {
    useFavoritesStore.getState().toggleFavorite("p1");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);

    useFavoritesStore.getState().toggleFavorite("p1");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(false);
  });

  it("tracks multiple favorites independently", () => {
    useFavoritesStore.getState().toggleFavorite("p1");
    useFavoritesStore.getState().toggleFavorite("p2");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);
    expect(useFavoritesStore.getState().isFavorite("p2")).toBe(true);
    expect(useFavoritesStore.getState().isFavorite("p3")).toBe(false);
  });
});
