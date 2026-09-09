"use client";
import { useRef, type RefObject } from "react";
import { PropertyStage } from "./PropertyStage";
import type { Property } from "@/lib/content/types";

interface PropertyShowcaseProps {
  properties: Property[];
  whatsappNumber: string;
  /** Filled with each stage element so the snap can be told where they are. */
  stagesRef: RefObject<HTMLElement[]>;
  /** The marker just past the last listing; see `useShowcaseSnap`. */
  exitRef: RefObject<HTMLDivElement>;
}

export function PropertyShowcase({
  properties,
  whatsappNumber,
  stagesRef,
  exitRef,
}: PropertyShowcaseProps) {
  const assign = (index: number) => (node: HTMLElement | null) => {
    if (!stagesRef.current) return;
    if (node) stagesRef.current[index] = node;
  };

  if (properties.length === 0) {
    return (
      <div
        data-testid="showcase-empty"
        className="flex h-screen snap-start flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <p className="font-display text-2xl text-ivory md:text-3xl">
          Nenhum imóvel para esses filtros
        </p>
        <p className="max-w-sm font-body text-sm text-sand/75">
          Tente ampliar a faixa de preço ou remover a localização.
        </p>
      </div>
    );
  }

  return (
    <div>
      {properties.map((property, index) => (
        <PropertyStage
          key={property.id}
          ref={assign(index)}
          property={property}
          position={index + 1}
          total={properties.length}
          whatsappNumber={whatsappNumber}
          eager={index === 0}
        />
      ))}
      <div ref={exitRef} data-testid="showcase-exit" aria-hidden="true" className="h-0" />
    </div>
  );
}
