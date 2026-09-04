"use client";
import { useState } from "react";
import { PropertyCarousel } from "./PropertyCarousel";
import { PropertyAttributes } from "./PropertyAttributes";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
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
  const [isOpen, setIsOpen] = useState(false);
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.has(property.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const isFeatured = variant === "featured";
  const aspectClass = isFeatured ? "aspect-[16/9]" : "aspect-[4/3]";
  const titleClass = isFeatured ? "text-xl md:text-2xl" : "text-base";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-ink/60 ring-1 ring-ivory/10 transition-shadow hover:shadow-xl hover:shadow-black/30">
      {/* Covers the card so anywhere that is not a control opens the details.
          Controls sit above it on z-20. */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        <span className="sr-only">Ver detalhes de {property.title}</span>
      </button>

      <div className={`relative ${aspectClass} w-full`}>
        <PropertyCarousel
          photos={property.photos}
          alt={property.title}
          sizes={
            isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"
          }
        />
        <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-bgDark/70 px-2.5 py-1 font-body text-xs font-semibold text-brassLight backdrop-blur">
          {STATUS_LABELS[property.status]}
        </span>
        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(property.id)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className={`font-display leading-snug text-ivory ${titleClass}`}>{property.title}</h3>
          <p className="mt-0.5 font-body text-sm text-sand/80">{property.location}</p>
        </div>

        <PropertyAttributes property={property} size={isFeatured ? "roomy" : "compact"} />

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-lg text-brassLight">
            {formatPrice(property.price, property.transaction)}
          </span>
          <a
            href={buildWhatsAppUrl(whatsappNumber, property)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 rounded-full bg-brass px-3.5 py-1.5 font-body text-sm font-semibold text-bgDark transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {isOpen && (
        <PropertyDetailsModal
          property={property}
          statusLabel={STATUS_LABELS[property.status]}
          whatsappNumber={whatsappNumber}
          onClose={() => setIsOpen(false)}
        />
      )}
    </article>
  );
}
