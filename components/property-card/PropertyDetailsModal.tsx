"use client";
import { useEffect, useRef } from "react";
import { PropertyCarousel } from "./PropertyCarousel";
import { PropertyAttributes } from "./PropertyAttributes";
import { formatPrice } from "@/lib/format-price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Property } from "@/lib/content/types";

interface PropertyDetailsModalProps {
  property: Property;
  statusLabel: string;
  whatsappNumber: string;
  onClose: () => void;
}

export function PropertyDetailsModal({
  property,
  statusLabel,
  whatsappNumber,
  onClose,
}: PropertyDetailsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Keep the page behind from scrolling under the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      data-testid="property-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bgDark/80 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={property.title}
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-ink ring-1 ring-ivory/15 shadow-2xl shadow-black/50"
      >
        <div className="group relative aspect-[16/10] w-full bg-bgDark">
          <PropertyCarousel
            photos={property.photos}
            alt={property.title}
            sizes="(max-width: 896px) 100vw, 896px"
            alwaysShowControls
            priority
          />
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-bgDark/70 px-3 py-1 font-body text-xs font-semibold text-brassLight backdrop-blur">
            {statusLabel}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-bgDark/70 font-body text-lg leading-none text-ivory backdrop-blur transition-colors hover:bg-bgDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div>
            <h3 className="font-display text-2xl leading-snug text-ivory md:text-3xl">
              {property.title}
            </h3>
            <p className="mt-1 font-body text-sm text-sand/80">
              {property.type} · {property.location}
            </p>
          </div>

          <PropertyAttributes property={property} size="roomy" />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ivory/10 pt-4">
            <span className="font-display text-2xl text-brassLight">
              {formatPrice(property.price, property.transaction)}
            </span>
            <a
              href={buildWhatsAppUrl(whatsappNumber, property)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brass px-5 py-2.5 font-body font-semibold text-bgDark transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
