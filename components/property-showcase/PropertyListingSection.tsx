"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFilterStore } from "@/stores/useFilterStore";
import { filterProperties } from "@/lib/filters";
import { FloatingFilterBar } from "@/components/filters/FloatingFilterBar";
import { FilterBottomSheet } from "@/components/filters/FilterBottomSheet";
import { PropertyShowcase } from "./PropertyShowcase";
import { useShowcaseSnap } from "./useShowcaseSnap";
import { useScrollTo } from "@/components/motion/useScrollTo";
import type { Property } from "@/lib/content/types";

interface PropertyListingSectionProps {
  properties: Property[];
  whatsappNumber: string;
}

export function PropertyListingSection({ properties, whatsappNumber }: PropertyListingSectionProps) {
  const filters = useFilterStore((state) => state.filters);
  const rootRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLElement[]>([]);
  const exitRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollTo();

  const propertyTypes = useMemo(
    () => Array.from(new Set(properties.map((property) => property.type))),
    [properties]
  );

  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  // Filtering rebuilds the stages, so the snap has to be rebuilt with them —
  // its points are element positions, and the old elements are gone.
  stagesRef.current.length = filtered.length;
  useShowcaseSnap(rootRef, stagesRef, exitRef, filtered.length);

  // Each listing owns a viewport, so filtering eight down to two removes six
  // screens of height from under the visitor. Left alone the browser clamps
  // the scroll and drops them somewhere arbitrary — usually back in the
  // walkthrough. Returning to the first result is the only position that
  // still means something after the set changed.
  const resultKey = filtered.map((property) => property.id).join(",");
  const previousKey = useRef(resultKey);
  useEffect(() => {
    if (previousKey.current === resultKey) return;
    previousKey.current = resultKey;

    const root = rootRef.current;
    if (!root) return;
    const { top, bottom } = root.getBoundingClientRect();
    // Only reposition someone who is actually looking at the listings.
    if (bottom < 0 || top > window.innerHeight) return;
    scrollTo(root, { immediate: true });
  }, [resultKey, scrollTo]);

  return (
    <div ref={rootRef} className="relative">
      {/* Zero height on purpose: the bar floats over the first photo rather
          than reserving a strip above it, and taking no flow space means the
          first listing starts exactly at the section's top — which is the
          position the snap points are measured from. */}
      <div className="pointer-events-none sticky top-4 z-30 h-0 px-6">
        <div className="pointer-events-auto mx-auto max-w-5xl">
          <FloatingFilterBar propertyTypes={propertyTypes} />
        </div>
      </div>
      <FilterBottomSheet propertyTypes={propertyTypes} />

      <PropertyShowcase
        properties={filtered}
        whatsappNumber={whatsappNumber}
        stagesRef={stagesRef}
        exitRef={exitRef}
      />
    </div>
  );
}
