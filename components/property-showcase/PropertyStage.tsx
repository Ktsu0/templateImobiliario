"use client";
import { forwardRef, useState } from "react";
import Image from "next/image";
import { PhotoBars } from "./PhotoBars";
import { PropertyAttributes } from "@/components/property-card/PropertyAttributes";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { formatPrice } from "@/lib/format-price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { wrapPhotoIndex } from "@/lib/showcase";
import type { Property } from "@/lib/content/types";

const STATUS_LABELS: Record<Property["status"], string> = {
  venda: "Venda",
  aluguel: "Aluguel",
  lancamento: "Lançamento",
  exclusivo: "Exclusivo",
};

interface PropertyStageProps {
  property: Property;
  position: number;
  total: number;
  whatsappNumber: string;
  /** The first listing is what the scroll arrives on; the rest wait. */
  eager: boolean;
}

/**
 * One listing, one viewport. The photograph is the surface and everything else
 * is set onto it — no card, no panel edge — so the reading stays on the
 * property rather than on a container drawn around it.
 */
export const PropertyStage = forwardRef<HTMLElement, PropertyStageProps>(function PropertyStage(
  { property, position, total, whatsappNumber, eager },
  ref
) {
  const [photo, setPhoto] = useState(0);
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.has(property.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const step = (delta: number) =>
    setPhoto((current) => wrapPhotoIndex(current + delta, property.photos.length));

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 bg-bgDark/40 text-xl leading-none text-ivory backdrop-blur-sm transition-colors hover:border-ivory/60 hover:bg-bgDark/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass";

  return (
    <article
      ref={ref}
      data-testid="property-stage"
      // Focus lands here when an arrow is used, which is what lets the key
      // handler take over from there.
      tabIndex={-1}
      aria-roledescription="Imóvel"
      aria-label={`${property.title} — ${position} de ${total}`}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      }}
      className="relative h-screen w-full overflow-hidden bg-bgDark focus:outline-none"
    >
      {property.photos.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`${property.title} — foto ${index + 1} de ${property.photos.length}`}
          fill
          sizes="100vw"
          quality={90}
          priority={eager && index === 0}
          className={`object-cover transition-opacity duration-700 ease-out ${
            index === photo ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Two scrims, one per layout: the copy sits at the bottom on a phone and
          at the left on a wide screen. Each plateau runs to the far edge of the
          copy it carries, because the brightest of the 24 photos blows out to
          luminance 1.0 right where the panel sits — at 0.9 the ivory clears
          6:1 and the brass price clears its 3:1 as large text. Past the copy
          both release quickly and the photograph is untouched. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to top, rgb(var(--bg-dark-rgb) / 0.96) 0%, rgb(var(--bg-dark-rgb) / 0.93) 66%, rgb(var(--bg-dark-rgb) / 0.6) 76%, rgb(var(--bg-dark-rgb) / 0.18) 88%, transparent 97%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgb(var(--bg-dark-rgb) / 0.94) 0%, rgb(var(--bg-dark-rgb) / 0.9) 38%, rgb(var(--bg-dark-rgb) / 0.6) 50%, rgb(var(--bg-dark-rgb) / 0.2) 66%, transparent 80%)",
        }}
      />

      <div className="absolute right-5 top-5 z-10 flex items-center gap-3 md:right-8 md:top-8">
        <span className="font-body text-xs tabular-nums tracking-[0.2em] text-ivory/70">
          {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(property.id)} />
      </div>

      <div className="relative flex h-full flex-col justify-end px-6 pb-28 md:justify-center md:px-14 md:pb-0 lg:px-20">
        <div className="max-w-md">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brassLight">
            {STATUS_LABELS[property.status]}
          </span>
          <h3 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ivory md:text-5xl lg:text-6xl">
            {property.title}
          </h3>
          <p className="mt-3 font-body text-base text-sand/85 md:text-lg">{property.location}</p>

          <p className="mt-6 font-display text-3xl text-brassLight md:text-4xl">
            {formatPrice(property.price, property.transaction)}
          </p>

          <div className="mt-5">
            <PropertyAttributes property={property} size="roomy" />
          </div>

          <a
            href={buildWhatsAppUrl(whatsappNumber, property)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-full bg-brass px-6 py-3 font-body font-semibold text-bgDark transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            Falar sobre este imóvel
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-6 px-6 pb-5 md:px-14 md:pb-8 lg:px-20">
        <PhotoBars
          total={property.photos.length}
          active={photo}
          onSelect={setPhoto}
          label={`Fotos de ${property.title}`}
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Foto anterior" className={arrowClass}>
            ‹
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Próxima foto" className={arrowClass}>
            ›
          </button>
        </div>
      </div>
    </article>
  );
});
