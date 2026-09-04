"use client";
import { useMemo } from "react";
import { useFilterStore } from "@/stores/useFilterStore";
import { filterProperties } from "@/lib/filters";
import { FloatingFilterBar } from "@/components/filters/FloatingFilterBar";
import { FilterBottomSheet } from "@/components/filters/FilterBottomSheet";
import { PropertyGrid } from "./PropertyGrid";
import type { Property } from "@/lib/content/types";

interface PropertyListingSectionProps {
  properties: Property[];
  whatsappNumber: string;
}

export function PropertyListingSection({ properties, whatsappNumber }: PropertyListingSectionProps) {
  const filters = useFilterStore((state) => state.filters);

  const propertyTypes = useMemo(
    () => Array.from(new Set(properties.map((property) => property.type))),
    [properties]
  );

  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  return (
    <div className="relative">
      <FloatingFilterBar propertyTypes={propertyTypes} />
      <FilterBottomSheet propertyTypes={propertyTypes} />
      <div className="mt-6">
        <PropertyGrid properties={filtered} whatsappNumber={whatsappNumber} />
      </div>
    </div>
  );
}
