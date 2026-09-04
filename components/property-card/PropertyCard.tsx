"use client";
import { PropertyCarousel } from "./PropertyCarousel";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { BedIcon, SuiteIcon, AreaIcon, ParkingIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format-price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Property } from "@/lib/content/types";

const STATUS_LABELS: Record<Property["status"], string> = {
  venda: "Venda",
  aluguel: "Aluguel",
  lancamento: "Lançamento",
  exclusivo: "Exclusivo",
};

interface PropertyCardProps {
  property: Property;
  variant: "featured" | "default";
  whatsappNumber: string;
}

export function PropertyCard({ property, variant, whatsappNumber }: PropertyCardProps) {
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.has(property.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const aspectClass = variant === "featured" ? "aspect-[4/3]" : "aspect-[16/10]";
  const titleClass = variant === "featured" ? "text-xl md:text-2xl" : "text-base";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-ink/60 ring-1 ring-ivory/10 transition-shadow hover:shadow-xl hover:shadow-black/30">
      <div className={`relative ${aspectClass} w-full`}>
        <PropertyCarousel photos={property.photos} alt={property.title} />
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-bgDark/70 px-2.5 py-1 font-body text-xs font-semibold text-brassLight backdrop-blur">
          {STATUS_LABELS[property.status]}
        </span>
        <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(property.id)} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className={`font-display leading-snug text-ivory ${titleClass}`}>{property.title}</h3>
        <p className="font-body text-sm text-sand/80">{property.location}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-sand/80">
          <span className="flex items-center gap-1.5">
            <BedIcon className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <SuiteIcon className="h-4 w-4" />
            {property.suites}
          </span>
          <span className="flex items-center gap-1.5">
            <AreaIcon className="h-4 w-4" />
            {property.area} m²
          </span>
          <span className="flex items-center gap-1.5">
            <ParkingIcon className="h-4 w-4" />
            {property.parkingSpots}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-lg text-brassLight">
            {formatPrice(property.price, property.transaction)}
          </span>
          <a
            href={buildWhatsAppUrl(whatsappNumber, property)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brass px-3.5 py-1.5 font-body text-sm font-semibold text-bgDark transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
