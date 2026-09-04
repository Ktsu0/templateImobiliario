import Image from "next/image";
import { formatPrice } from "@/lib/format-price";
import type { Property } from "@/lib/content/types";

interface JourneyScreenPreviewProps {
  properties: Property[];
  brandName: string;
}

/**
 * The mini site that appears on the laptop screen at the end of the journey.
 * It is rendered at the screen's natural size and scaled up by the parent
 * transform, so text stays crisp all the way through the zoom.
 */
export function JourneyScreenPreview({ properties, brandName }: JourneyScreenPreviewProps) {
  return (
    <div className="flex h-full w-full flex-col bg-bgDark">
      <div className="flex items-center justify-between border-b border-ivory/10 px-[3%] py-[2%]">
        <span className="font-display text-[1.6cqw] text-ivory">{brandName}</span>
        <span className="rounded-full bg-brass px-[2%] py-[0.6%] font-body text-[1.1cqw] font-semibold text-bgDark">
          {properties.length} imóveis
        </span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-[2%] p-[3%]">
        {properties.map((property) => (
          <div key={property.id} className="flex flex-col overflow-hidden rounded-[0.6cqw] bg-ink">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={property.photos[0]}
                alt={property.title}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-[6%]">
              <p className="line-clamp-2 font-body text-[1.05cqw] leading-tight text-ivory">
                {property.title}
              </p>
              <p className="font-display text-[1.25cqw] text-brassLight">
                {formatPrice(property.price, property.transaction)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
