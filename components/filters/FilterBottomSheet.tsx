"use client";
import { useState } from "react";
import { useFilterStore } from "@/stores/useFilterStore";

interface FilterBottomSheetProps {
  propertyTypes: string[];
}

const fieldClass =
  "w-full rounded-lg bg-ivory/10 px-3 py-2 font-body text-ivory placeholder:text-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass";

export function FilterBottomSheet({ propertyTypes }: FilterBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir filtros"
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brass text-lg text-bgDark shadow-lg shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Filtros"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full flex-col gap-2 rounded-t-2xl bg-ink p-4 pb-6 shadow-2xl"
          >
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-sand/40" />

            <select
              aria-label="Transação"
              value={filters.transaction}
              onChange={(event) =>
                setFilter("transaction", event.target.value as typeof filters.transaction)
              }
              className={fieldClass}
            >
              <option value="todos">Comprar/Alugar</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>

            <select
              aria-label="Tipo de imóvel"
              value={filters.propertyType}
              onChange={(event) => setFilter("propertyType", event.target.value)}
              className={fieldClass}
            >
              <option value="todos">Tipo</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="text"
              aria-label="Localização"
              placeholder="Localização"
              value={filters.location}
              onChange={(event) => setFilter("location", event.target.value)}
              className={fieldClass}
            />

            <div className="flex gap-2">
              <input
                type="number"
                aria-label="Preço mínimo"
                placeholder="Mín."
                value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
                onChange={(event) =>
                  setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
                }
                className={fieldClass}
              />
              <input
                type="number"
                aria-label="Preço máximo"
                placeholder="Máx."
                value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
                onChange={(event) =>
                  setFilter("priceRange", [
                    filters.priceRange[0],
                    Number(event.target.value) || Infinity,
                  ])
                }
                className={fieldClass}
              />
            </div>

            <select
              aria-label="Quartos"
              value={filters.bedrooms}
              onChange={(event) => setFilter("bedrooms", Number(event.target.value))}
              className={fieldClass}
            >
              <option value={0}>Quartos</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
            </select>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full rounded-full bg-brass px-4 py-2.5 font-body font-semibold text-bgDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
