"use client";
import { useRef } from "react";
import { useJourneyScroll } from "./useJourneyScroll";
import { JourneyVideo } from "./JourneyVideo";
import { JourneyScreenPreview } from "./JourneyScreenPreview";
import { computeScreenBox } from "@/lib/journey";
import type { ClientBrand, ClientJourney } from "@/config/types";
import type { Property } from "@/lib/content/types";

interface JourneySectionProps {
  journey: ClientJourney;
  brand: ClientBrand;
  /** Inline logo markup from `readBrandLogo`, drawn on the laptop screen. */
  logoMarkup: string | null;
}

export function JourneySection({ journey, brand, logoMarkup }: JourneySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const state = useJourneyScroll(sectionRef, journey);

  const screenCenterX = journey.screenRect.x + journey.screenRect.width / 2;
  const screenCenterY = journey.screenRect.y + journey.screenRect.height / 2;
  const screenBox = computeScreenBox(journey.screenRect, state.scale);

  if (state.showFallback) {
    return (
      <section id="jornada" className="relative h-dvh w-full overflow-hidden bg-bgDark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journey.fallbackImage}
          alt={`Interior do imóvel — ${brand.name}`}
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
      id="jornada"
      ref={sectionRef}
      style={{ height: `${journey.scrollHeightVh}vh` }}
      className="relative bg-bgDark"
    >
      {/* svh, not dvh: this box is the pin/scrub region, held under an active
          scroll gesture. dvh would resize it — and jolt the frame mid-scrub —
          every time the mobile browser's chrome shows or hides. svh is fixed
          to the chrome-visible case, so it never moves once the pin starts. */}
      <div className="sticky top-0 h-svh w-full overflow-hidden">
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
            <JourneyVideo
              videoRef={state.videoRef}
              videoSrc={journey.videoSrc}
              posterImage={journey.posterImage}
            />
          </div>

          {/* Deliberately a sibling of the zoomed element, not a child. That
              element is composited on its own layer and its texture is
              stretched by the zoom, which would hand the screen a logo blurred
              3x. Here the screen is laid out at the size the zoom has reached,
              so it draws at 1:1 throughout. `computeScreenBox` is the same
              transform, resolved in layout instead of on the compositor. */}
          <div
            data-testid="journey-screen"
            className="absolute overflow-hidden"
            style={{
              left: `${screenBox.x}%`,
              top: `${screenBox.y}%`,
              width: `${screenBox.width}%`,
              height: `${screenBox.height}%`,
              opacity: state.previewOpacity,
              containerType: "inline-size",
            }}
          >
            <JourneyScreenPreview brand={brand} logoMarkup={logoMarkup} />
          </div>
        </div>

        {/* The hero fades to the brand dark at its bottom edge; this veil lifts
            over the first steps so the interior emerges from the same tone
            instead of cutting from cool daylight to warm indoor light. */}
        <div
          data-testid="journey-veil"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-bgDark"
          style={{ opacity: state.entryVeil }}
        />

        {/* The same black gradient the hero carries. Without it the headline
            sat on raw footage and measured 2.10:1 against the brightest frame;
            anchored to the bottom it only touches the strip the words occupy
            and leaves the walk itself alone. */}
        <div
          data-testid="journey-scrim"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(var(--bg-dark-rgb) / 0.92) 0%, rgb(var(--bg-dark-rgb) / 0.5) 18%, rgb(var(--bg-dark-rgb) / 0.12) 38%, transparent 60%)",
            opacity: 1 - state.zoomProgress,
          }}
        />

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
