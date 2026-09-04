import Image from "next/image";
import { formatPrice } from "@/lib/format-price";
import type { ClientBrand } from "@/config/types";
import type { Property } from "@/lib/content/types";

interface JourneyScreenPreviewProps {
  properties: Property[];
  brand: ClientBrand;
  welcome: string;
}

/**
 * The mini site that appears on the laptop screen at the end of the journey:
 * the agency's logo, a welcome line, a first row of offers, and a chevron
 * telling the visitor the real listings are just below. It is laid out at the
 * screen's natural size (container units) and scaled up by the parent
 * transform, so text stays crisp all the way through the zoom.
 */
export function JourneyScreenPreview({ properties, brand, welcome }: JourneyScreenPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col bg-bgDark text-ivory">
      <header className="flex items-center justify-between border-b border-ivory/10 px-[4%] py-[2.5%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logoUrl} alt={brand.name} className="h-[7cqw] w-auto" />
        <span className="rounded-full bg-brass px-[2.4%] py-[0.7%] font-body text-[1.1cqw] font-semibold text-bgDark">
          {properties.length} imóveis em destaque
        </span>
      </header>

      <div className="px-[4%] pt-[3%]">
        <p className="font-display text-[2.4cqw] leading-tight text-ivory">{welcome}</p>
        <p className="mt-[1%] font-body text-[1.15cqw] text-sand/75">{brand.slogan}</p>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-[2.5%] px-[4%] py-[3%]">
        {properties.map((property) => (
          <div key={property.id} className="flex flex-col overflow-hidden rounded-[0.7cqw] bg-ink">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={property.photos[0]}
                alt={property.title}
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-[6%]">
              <p className="line-clamp-2 font-body text-[1.05cqw] leading-tight text-ivory">
                {property.title}
              </p>
              <p className="font-display text-[1.3cqw] text-brassLight">
                {formatPrice(property.price, property.transaction)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-[0.6%] pb-[2.5%] text-brassLight">
        <span className="font-body text-[1cqw] uppercase tracking-[0.3em]">Role para ver todos</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-[3cqw] w-[3cqw] motion-safe:animate-bounce"
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
