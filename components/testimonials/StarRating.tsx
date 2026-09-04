interface StarRatingProps {
  rating: number;
  className?: string;
}

const MAX_STARS = 5;

export function StarRating({ rating, className = "" }: StarRatingProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating} de ${MAX_STARS} estrelas`}
    >
      {Array.from({ length: MAX_STARS }, (_, position) => (
        <svg
          key={position}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${position < rating ? "text-brass" : "text-ivory/20"}`}
          fill="currentColor"
        >
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95z" />
        </svg>
      ))}
    </div>
  );
}
