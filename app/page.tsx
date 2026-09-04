import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";
import { JourneySection } from "@/components/journey/JourneySection";
import { PropertyListingSection } from "@/components/property-grid/PropertyListingSection";
import { activeClientConfig } from "@/config/active-client";
import { getProperties } from "@/lib/content/properties";

export default function HomePage() {
  const properties = getProperties();
  const { brand, hero, journey, contact } = activeClientConfig;

  return (
    <main>
      <HeroFrameSequence brand={brand} hero={hero} />

      {journey && (
        <JourneySection journey={journey} brand={brand} />
      )}

      <section id="imoveis" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <h2 className="font-display text-3xl text-ivory md:text-4xl">Imóveis em destaque</h2>
        <div className="mt-8">
          <PropertyListingSection properties={properties} whatsappNumber={contact.whatsapp} />
        </div>
      </section>
    </main>
  );
}
