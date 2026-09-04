import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";
import { JourneySection } from "@/components/journey/JourneySection";
import { PropertyListingSection } from "@/components/property-grid/PropertyListingSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Reveal } from "@/components/ui/Reveal";
import { activeClientConfig } from "@/config/active-client";
import { getProperties } from "@/lib/content/properties";
import { getTestimonials } from "@/lib/content/testimonials";

export default function HomePage() {
  const properties = getProperties();
  const testimonials = getTestimonials();
  const { brand, hero, journey, contact } = activeClientConfig;

  return (
    <>
      <main>
        <HeroFrameSequence brand={brand} hero={hero} />

        {journey && <JourneySection journey={journey} brand={brand} />}

        {/* Everything past the two videos fades up on approach. */}
        <section id="imoveis" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <Reveal>
            <h2 className="font-display text-3xl text-ivory md:text-4xl">Imóveis em destaque</h2>
          </Reveal>
          <Reveal delayMs={120}>
            <div className="mt-8">
              <PropertyListingSection properties={properties} whatsappNumber={contact.whatsapp} />
            </div>
          </Reveal>
        </section>

        <Reveal>
          <TestimonialsSection testimonials={testimonials} title="O que dizem sobre nós" />
        </Reveal>
      </main>

      <Reveal>
        <SiteFooter brand={brand} contact={contact} />
      </Reveal>
    </>
  );
}
