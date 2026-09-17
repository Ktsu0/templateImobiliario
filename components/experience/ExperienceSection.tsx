"use client";
import { useRef } from "react";
import { HeroIntroContent } from "@/components/hero/HeroIntroContent";
import { ScrollyVideoLayer } from "@/components/journey/ScrollyVideoLayer";
import { useScrollTo } from "@/components/motion/useScrollTo";
import { useMediaFallback } from "@/hooks/useMediaFallback";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { captionOpacityAt } from "@/lib/experience";
import type { ClientBrand, ClientHero, ClientJourney } from "@/config/types";

interface ExperienceSectionProps {
  brand: ClientBrand;
  hero: ClientHero;
  journey: ClientJourney;
}

/**
 * Hero and walkthrough as one pinned stage.
 *
 * The intro film plays on its own clock and ends on the living room with the
 * title card up. The walkthrough's first frame is that same living room, so
 * the moment the visitor scrolls, the card fades and the walkthrough takes
 * over the very same pixels — a swap in place, not a section sliding away
 * under the next one. From there the scroll drives the walk to the end, and
 * the section releases straight into the listings.
 */
export function ExperienceSection({ brand, hero, journey }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const walkStartRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollTo();
  const showFallback = useMediaFallback("buffered");
  const scrollProgress = useSectionScrollProgress(sectionRef);

  if (showFallback) {
    // No pin and no scroll range to drag through: whoever asked for less
    // motion, or is on a connection that couldn't buffer the walk, gets the
    // hero alone and a CTA that goes straight to the listings.
    return (
      <section id="jornada" className="relative h-dvh w-full overflow-hidden">
        <HeroIntroContent brand={brand} hero={hero} onContinue={() => scrollTo("imoveis")} />
      </section>
    );
  }

  const isWalking = scrollProgress > 0;

  return (
    <section
      id="jornada"
      ref={sectionRef}
      style={{ height: `${journey.scrollHeightVh}vh` }}
      className="relative bg-bgDark"
    >
      {/* svh, not dvh: this box is pinned under an active scroll gesture, and
          dvh would resize it — and jolt the frame — every time the mobile
          browser's chrome shows or hides. */}
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* The walkthrough sits underneath from the start, so it has the whole
            intro to get ready, and its first frame is already the frame the
            intro ends on when the card above it lifts. The poster covers the
            beat before the engine has painted anything. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${journey.posterImage})` }}
        >
          <ScrollyVideoLayer src={journey.videoSrc} percentage={scrollProgress} />
        </div>

        <div
          data-testid="experience-intro"
          aria-hidden={isWalking}
          className={`absolute inset-0 transition-opacity duration-500 ${
            isWalking ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <HeroIntroContent
            brand={brand}
            hero={hero}
            onContinue={() => scrollTo(walkStartRef.current ?? "imoveis")}
          />
        </div>

        {/* Same bottom-anchored scrim and caption the hero carries, so the
            words never sit on raw footage. Both lift before the hand-off to
            the listings. */}
        <div
          data-testid="experience-caption"
          aria-hidden={!isWalking}
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: isWalking ? captionOpacityAt(scrollProgress) : 0 }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(var(--bg-dark-rgb) / 0.92) 0%, rgb(var(--bg-dark-rgb) / 0.5) 18%, rgb(var(--bg-dark-rgb) / 0.12) 38%, transparent 60%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-16 flex flex-col items-center px-6 text-center">
            <h2 className="max-w-2xl font-display text-3xl text-ivory drop-shadow-lg md:text-5xl">
              {journey.headline}
            </h2>
            <p className="mt-3 max-w-xl font-body text-ivory/90 drop-shadow-md">
              {journey.subheadline}
            </p>
          </div>
        </div>
      </div>

      {/* One viewport in: where "Ver imóveis" lands, so it starts the walk
          rather than scrolling to this section's own top. */}
      <div
        ref={walkStartRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[100vh] h-px"
      />
    </section>
  );
}
