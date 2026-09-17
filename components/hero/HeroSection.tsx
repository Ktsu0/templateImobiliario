"use client";
import { HeroIntroContent } from "./HeroIntroContent";
import type { ClientBrand, ClientHero } from "@/config/types";

interface HeroSectionProps {
  brand: ClientBrand;
  hero: ClientHero;
}

/** The hero on its own, for a client without a walkthrough to continue into. */
export function HeroSection({ brand, hero }: HeroSectionProps) {
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <HeroIntroContent brand={brand} hero={hero} />
    </section>
  );
}
