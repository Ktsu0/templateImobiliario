"use client";
import { useHeroIntro } from "./useHeroIntro";
import { useScrollTo } from "@/components/motion/useScrollTo";
import { HeroVideo } from "./HeroVideo";
import type { ClientBrand, ClientHero } from "@/config/types";

interface HeroIntroContentProps {
  brand: ClientBrand;
  hero: ClientHero;
  /**
   * Where the "Ver imóveis" CTA sends the visitor. Defaults to the journey
   * section if there is one, else the listings — for a caller embedding this
   * inside its own scroll-driven section (which already occupies "#jornada"),
   * pass a handler that scrolls further in instead of back to this content's
   * own top.
   */
  onContinue?: () => void;
}

/**
 * The video + title-card content of the hero, with no opinion on how much of
 * the viewport it fills or whether it sits in normal flow or inside a pinned
 * section — that's the caller's job (`HeroSection` for a standalone hero,
 * `ExperienceSection` when a journey continues from it).
 */
export function HeroIntroContent({ brand, hero, onContinue }: HeroIntroContentProps) {
  const intro = useHeroIntro(hero);
  const scrollTo = useScrollTo();

  const handleContinue =
    onContinue ??
    (() => {
      scrollTo(document.getElementById("jornada") ? "jornada" : "imoveis");
    });

  const handleSkip = () => {
    intro.skipIntro();
    scrollTo("imoveis");
  };

  const revealClasses = intro.isTitleVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-6 opacity-0";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <HeroVideo
        videoRef={intro.videoRef}
        videoSrc={hero.videoSrc}
        posterImage={hero.posterImage}
        introProgress={intro.introProgress}
        showFallback={intro.showFallback}
        fallbackImage={hero.fallbackImage}
        brandName={brand.name}
        onSkip={handleSkip}
      />

      <div
        data-testid="hero-title"
        aria-hidden={!intro.isTitleVisible}
        className={`absolute inset-0 transition-all duration-700 ease-out ${revealClasses}`}
      >
        {/* Rises from the bottom edge, the way a title card does over film. An
            earlier attempt scrimmed a band across the middle of the frame,
            which read as a stripe laid over the house rather than as part of
            the shot.
            No negative z-index here: the parent is positioned but sets no
            z-index, so it opens no stacking context, and a `-z-10` child would
            be painted below it — behind the video, which is where the previous
            scrim had been hiding. Paint order alone is enough, since the scrim
            is absolute and first and the copy is positioned and second. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            // Sized from the measured copy against the closing frames, where
            // the sunlit facade still blows out to luminance 1.0. The slogan
            // ends at 46% up and is small text, so the ramp holds 0.88 to
            // there (5.0:1); the title runs to 58% and is large text, which
            // needs only 3:1, so 0.80 covers it (3.5:1). Everything above 68%
            // — the house itself — is released.
            background:
              "linear-gradient(to top, rgb(var(--bg-dark-rgb) / 0.95) 0%, rgb(var(--bg-dark-rgb) / 0.88) 46%, rgb(var(--bg-dark-rgb) / 0.8) 59%, rgb(var(--bg-dark-rgb) / 0.5) 68%, rgb(var(--bg-dark-rgb) / 0.18) 80%, transparent 92%)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-ivory md:text-7xl">
            {brand.name}
          </h1>
          <p className="mt-4 max-w-xl font-body text-lg text-ivory/90 md:text-xl">
            {brand.slogan}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            tabIndex={intro.isTitleVisible ? 0 : -1}
            className="mt-8 rounded-full bg-brass px-6 py-3 font-body font-semibold text-bgDark shadow-lg transition-colors hover:bg-brassLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            Ver imóveis
          </button>
        </div>
      </div>
    </div>
  );
}
