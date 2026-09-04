import type { ClientBrand } from "@/config/types";

interface JourneyScreenPreviewProps {
  brand: ClientBrand;
  welcome: string;
}

/**
 * What the laptop screen shows once the zoom lands on it: the agency's mark on
 * a dark screen and a cue that the listings are below. Deliberately typographic
 * — photos here would be the footage's own pixels blown up several times, which
 * is exactly what looked cheap.
 */
export function JourneyScreenPreview({ brand, welcome }: JourneyScreenPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[3cqw] bg-bgDark px-[8%] text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brand.logoUrl} alt="" aria-hidden="true" className="h-[9cqw] w-auto" />

      <div>
        <p className="font-display text-[4.2cqw] leading-tight text-ivory">{brand.name}</p>
        <p className="mt-[1.5cqw] font-body text-[1.7cqw] leading-snug text-sand/80">{welcome}</p>
      </div>

      <div className="flex flex-col items-center gap-[1cqw] text-brassLight">
        <span className="font-body text-[1.2cqw] uppercase tracking-[0.35em]">
          Role para ver os imóveis
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-[3.4cqw] w-[3.4cqw] motion-safe:animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
