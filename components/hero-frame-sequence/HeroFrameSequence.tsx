"use client";
import { useHeroIntro } from "./useHeroIntro";
import { HeroCanvas } from "./HeroCanvas";
import { FramePreloader } from "./FramePreloader";
import type { ClientBrand, ClientHero } from "@/config/types";

interface HeroFrameSequenceProps {
  brand: ClientBrand;
  hero: ClientHero;
}

function scrollTo(id: string) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

/**
 * The hero's own CTA continues the story into the walkthrough when there is
 * one — sending it straight to the listings would skip the whole journey,
 * which is the part that sells the site. "Pular introdução" still jumps
 * past everything to the listings.
 */
function scrollToNextSection() {
  scrollTo(document.getElementById("jornada") ? "jornada" : "imoveis");
}

export function HeroFrameSequence({ brand, hero }: HeroFrameSequenceProps) {
  const intro = useHeroIntro(hero);

  const handleSkip = () => {
    intro.skipIntro();
    scrollTo("imoveis");
  };

  const revealClasses = intro.isTitleVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-6 opacity-0";

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <HeroCanvas
        currentImage={intro.currentImage}
        nextImage={intro.nextImage}
        blend={intro.blend}
        introProgress={intro.introProgress}
        showFallback={intro.showFallback}
        fallbackImage={hero.fallbackImage}
        brandName={brand.name}
        onSkip={handleSkip}
      />
      <FramePreloader progress={intro.preloadProgress} />

      <div
        data-testid="hero-title"
        aria-hidden={!intro.isTitleVisible}
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-700 ease-out ${revealClasses}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 50%, rgb(var(--bg-dark-rgb) / 0.75) 0%, rgb(var(--bg-dark-rgb) / 0.4) 45%, transparent 78%)",
          }}
        />
        <p className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-brassLight">
          {brand.creci}
        </p>
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-ivory md:text-7xl">
          {brand.name}
        </h1>
        <p className="mt-4 max-w-xl font-body text-lg text-ivory/90 md:text-xl">{brand.slogan}</p>
        <button
          type="button"
          onClick={scrollToNextSection}
          tabIndex={intro.isTitleVisible ? 0 : -1}
          className="mt-8 rounded-full bg-brass px-6 py-3 font-body font-semibold text-bgDark shadow-lg transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
        >
          Ver imóveis
        </button>
      </div>
    </section>
  );
}
