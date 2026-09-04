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
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 rounded-xl border border-ivory/10 bg-ink/40 p-8 text-center">
        <p className="font-display text-xl text-ivory">Nenhum imóvel para esses filtros</p>
        <p className="max-w-sm font-body text-sm text-sand/75">
          Tente ampliar a faixa de preço ou remover a localização.
        </p>
      </div>
    );
  }

  const featured = resolveFeaturedProperty(properties);
  const rest = properties.filter((property) => property.id !== featured?.id);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {featured && (
        // Wide rather than tall: spanning two rows stretched the card into a
        // column far longer than its content.
        <div className="md:col-span-2">
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
