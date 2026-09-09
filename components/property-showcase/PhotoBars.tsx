"use client";

interface PhotoBarsProps {
  total: number;
  active: number;
  onSelect: (index: number) => void;
  label: string;
}

/**
 * How many photos this listing has, and which one is up — as bars rather than
 * dots or a "2 / 3", so the count reads at a glance without competing with the
 * price for attention. Each bar is its own jump target.
 */
export function PhotoBars({ total, active, onSelect, label }: PhotoBarsProps) {
  return (
    <div role="tablist" aria-label={label} className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === active;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Foto ${index + 1} de ${total}`}
            onClick={() => onSelect(index)}
            // The bar is 3px tall; the button is not, so it stays grabbable.
            className="group py-3 focus-visible:outline-none"
          >
            <span
              className={`block h-[3px] rounded-full transition-all duration-500 ease-out ${
                isActive
                  ? "w-12 bg-ivory"
                  : "w-6 bg-ivory/30 group-hover:bg-ivory/60 group-focus-visible:bg-ivory/60"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
