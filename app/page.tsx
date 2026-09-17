import { HeroSection } from "@/components/hero/HeroSection";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { PropertyListingSection } from "@/components/property-showcase/PropertyListingSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Reveal } from "@/components/ui/Reveal";
import { activeClientConfig } from "@/config/active-client";
import { readBrandLogo } from "@/lib/brand-logo";
import { getProperties } from "@/lib/content/properties";
import { getTestimonials } from "@/lib/content/testimonials";

export default function HomePage() {
  const properties = getProperties();
  const testimonials = getTestimonials();
  const { brand, hero, journey, contact } = activeClientConfig;
  // Read once here, on the server, so the footer draws the logo as vector
  // instead of scaling an image of it.
  const logoMarkup = readBrandLogo(brand.logoUrl);

  return (
    <>
      <main>
        {journey ? (
          <ExperienceSection brand={brand} hero={hero} journey={journey} />
        ) : (
          <HeroSection brand={brand} hero={hero} />
        )}

        {/* Full bleed: each listing takes a viewport of its own, so there is no
            column to sit inside and no heading strip to cost a screen. The
            heading stays for structure and screen readers. */}
        <section id="imoveis" className="relative">
          <h2 className="sr-only">Imóveis</h2>
          <PropertyListingSection properties={properties} whatsappNumber={contact.whatsapp} />
        </section>

        <Reveal>
          <TestimonialsSection testimonials={testimonials} title="O que dizem sobre nós" />
        </Reveal>
      </main>

      <Reveal>
        <SiteFooter brand={brand} contact={contact} logoMarkup={logoMarkup} />
      </Reveal>
    </>
  );
}
