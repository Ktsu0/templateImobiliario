"use client";
import { useRef } from "react";
import { useJourneyScroll } from "./useJourneyScroll";
import { JourneyCanvas } from "./JourneyCanvas";
import { JourneyScreenPreview } from "./JourneyScreenPreview";
import { FramePreloader } from "@/components/hero-frame-sequence/FramePreloader";
import type { ClientJourney } from "@/config/types";
import type { Property } from "@/lib/content/types";

interface JourneySectionProps {
  journey: ClientJourney;
  properties: Property[];
  brandName: string;
}

const PREVIEW_PROPERTY_COUNT = 3;

export function JourneySection({ journey, properties, brandName }: JourneySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const state = useJourneyScroll(sectionRef, journey);

  const previewProperties = properties.slice(0, PREVIEW_PROPERTY_COUNT);
  const screenCenterX = journey.screenRect.x + journey.screenRect.width / 2;
  const screenCenterY = journey.screenRect.y + journey.screenRect.height / 2;

  if (state.showFallback) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-bgDark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journey.fallbackImage}
          alt={`Interior do imóvel — ${brandName}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-dark) 0%, rgb(var(--bg-dark-rgb) / 0.5) 45%, rgb(var(--bg-dark-rgb) / 0.15) 75%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="max-w-2xl font-display text-3xl text-ivory drop-shadow-lg md:text-5xl">
            {journey.headline}
          </h2>
          <p className="mt-3 max-w-xl font-body text-ivory/90 drop-shadow-md">
            {journey.subheadline}
          </p>
          <a
            href="#imoveis"
            className="mt-8 rounded-full bg-brass px-6 py-3 font-body font-semibold text-bgDark shadow-lg transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            Ver imóveis
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={{ height: `${journey.scrollHeightVh}vh` }}
      className="relative bg-bgDark"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Frame box locked to the footage's aspect ratio and sized to cover the
            viewport, so the screen overlay stays in register at any window shape. */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `max(100%, ${100 * journey.frameAspectRatio}vh)`,
            aspectRatio: `${journey.frameAspectRatio}`,
          }}
        >
          <div
            data-testid="journey-zoom"
            className="relative h-full w-full will-change-transform"
            style={{
              transform: `scale(${state.scale})`,
              transformOrigin: `${screenCenterX}% ${screenCenterY}%`,
            }}
          >
            <JourneyCanvas
              currentImage={state.currentImage}
              nextImage={state.nextImage}
              blend={state.blend}
            />

            <div
              data-testid="journey-screen"
              className="absolute overflow-hidden"
              style={{
                left: `${journey.screenRect.x}%`,
                top: `${journey.screenRect.y}%`,
                width: `${journey.screenRect.width}%`,
                height: `${journey.screenRect.height}%`,
                opacity: state.previewOpacity,
                containerType: "inline-size",
              }}
            >
              <JourneyScreenPreview properties={previewProperties} brandName={brandName} />
            </div>
          </div>
        </div>

        <FramePreloader progress={state.preloadProgress} />

        <div
          data-testid="journey-headline"
          className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center px-6 text-center transition-opacity duration-300"
          style={{ opacity: 1 - state.zoomProgress }}
        >
          <h2 className="max-w-2xl font-display text-3xl text-ivory drop-shadow-lg md:text-5xl">
            {journey.headline}
          </h2>
          <p className="mt-3 max-w-xl font-body text-ivory/90 drop-shadow-md">
            {journey.subheadline}
          </p>
        </div>
      </div>
    </section>
  );
}
