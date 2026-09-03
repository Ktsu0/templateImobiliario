"use client";
import { useRef } from "react";
import { useScrollFrames } from "./useScrollFrames";
import { HeroCanvas } from "./HeroCanvas";
import { FramePreloader } from "./FramePreloader";
import type { ClientBrand, ClientHero } from "@/config/types";

interface HeroFrameSequenceProps {
  brand: ClientBrand;
  hero: ClientHero;
}

export function HeroFrameSequence({ brand, hero }: HeroFrameSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { currentImage, preloadProgress, showFallback } = useScrollFrames(sectionRef, hero);

  const handleSkip = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("imoveis")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen w-full">
        <HeroCanvas
          currentImage={currentImage}
          showFallback={showFallback}
          fallbackImage={hero.fallbackImage}
          brandName={brand.name}
          onSkip={handleSkip}
        />
        <FramePreloader progress={preloadProgress} />
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-4xl text-ivory drop-shadow-lg md:text-6xl">
            {brand.name}
          </h1>
          <p className="font-body text-lg text-ivory/90 drop-shadow-lg">{brand.slogan}</p>
        </div>
      </div>
    </section>
  );
}
