import { create } from "zustand";

interface FavoritesStore {
  favoriteIds: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set(),
  toggleFavorite: (id) =>
    set((state) => {
      const next = new Set(state.favoriteIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { favoriteIds: next };
    }),
  isFavorite: (id) => get().favoriteIds.has(id),
}));
