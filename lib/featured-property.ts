import type { Property } from "@/lib/content/types";

export function resolveFeaturedProperty(properties: Property[]): Property | undefined {
  if (properties.length === 0) return undefined;
  return properties.find((property) => property.featured) ?? properties[0];
}
