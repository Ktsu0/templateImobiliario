"use client";
import { useRef, useState } from "react";
import Image from "next/image";

interface PropertyCarouselProps {
  photos: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 40;

export function PropertyCarousel({ photos, alt }: PropertyCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (nextIndex: number) => {
    setIndex(((nextIndex % photos.length) + photos.length) % photos.length);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta <= -SWIPE_THRESHOLD_PX) goTo(index + 1);
    else if (delta >= SWIPE_THRESHOLD_PX) goTo(index - 1);
    touchStartX.current = null;
  };

  return (
    <div
      data-testid="carousel-surface"
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={photos[index]}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Foto anterior"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 px-2 py-0.5 text-lg leading-none text-ivory opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass group-hover:opacity-100"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Próxima foto"
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 px-2 py-0.5 text-lg leading-none text-ivory opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass group-hover:opacity-100"
      >
        ›
      </button>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {photos.map((_, photoIndex) => (
          <span
            key={photoIndex}
            className={`h-1.5 w-1.5 rounded-full ${photoIndex === index ? "bg-brassLight" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
