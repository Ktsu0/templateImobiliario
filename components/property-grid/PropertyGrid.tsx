import { PropertyCard } from "@/components/property-card/PropertyCard";
import { resolveFeaturedProperty } from "@/lib/featured-property";
import type { Property } from "@/lib/content/types";

interface PropertyGridProps {
  properties: Property[];
  whatsappNumber: string;
}

export function PropertyGrid({ properties, whatsappNumber }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <p className="rounded-xl bg-ink/40 p-8 text-center font-body text-sand/80">
        Nenhum imóvel encontrado para esses filtros.
      </p>
    );
  }

  const featured = resolveFeaturedProperty(properties);
  const rest = properties.filter((property) => property.id !== featured?.id);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {featured && (
        <div className="md:row-span-2">
          <PropertyCard property={featured} variant="featured" whatsappNumber={whatsappNumber} />
        </div>
      )}
      {rest.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant="default"
          whatsappNumber={whatsappNumber}
        />
      ))}
    </div>
  );
}
