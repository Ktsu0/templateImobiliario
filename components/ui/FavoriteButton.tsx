interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-lg leading-none text-ivory backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
    </button>
  );
}
