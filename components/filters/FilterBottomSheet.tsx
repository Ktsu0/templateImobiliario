"use client";
import { useState } from "react";
import { useFilterStore } from "@/stores/useFilterStore";
import { SelectShell, filterInputClass, filterSelectClass } from "./FilterField";

interface FilterBottomSheetProps {
  propertyTypes: string[];
}

export function FilterBottomSheet({ propertyTypes }: FilterBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);
  const resetFilters = useFilterStore((state) => state.resetFilters);

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
          className="fixed inset-0 z-50 flex items-end bg-bgDark/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Filtros"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full flex-col gap-3 rounded-t-3xl border-t border-brass/20 bg-ink p-5 pb-7 shadow-2xl shadow-black/50"
          >
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-sand/40" />

            <SelectShell>
              <select
                aria-label="Transação"
                value={filters.transaction}
                onChange={(event) =>
                  setFilter("transaction", event.target.value as typeof filters.transaction)
                }
                className={filterSelectClass}
              >
                <option value="todos">Comprar/Alugar</option>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
              </select>
            </SelectShell>

            <SelectShell>
              <select
                aria-label="Tipo de imóvel"
                value={filters.propertyType}
                onChange={(event) => setFilter("propertyType", event.target.value)}
                className={filterSelectClass}
              >
                <option value="todos">Tipo</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </SelectShell>

            <input
              type="text"
              aria-label="Localização"
              placeholder="Localização"
              value={filters.location}
              onChange={(event) => setFilter("location", event.target.value)}
              className={filterInputClass}
            />

            <div className="flex gap-2">
              <input
                type="number"
                aria-label="Preço mínimo"
                placeholder="Preço mín."
                value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
                onChange={(event) =>
                  setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
                }
                className={filterInputClass}
              />
              <input
                type="number"
                aria-label="Preço máximo"
                placeholder="Preço máx."
                value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
                onChange={(event) =>
                  setFilter("priceRange", [
                    filters.priceRange[0],
                    Number(event.target.value) || Infinity,
                  ])
                }
                className={filterInputClass}
              />
            </div>

            <SelectShell>
              <select
                aria-label="Quartos"
                value={filters.bedrooms}
                onChange={(event) => setFilter("bedrooms", Number(event.target.value))}
                className={filterSelectClass}
              >
                <option value={0}>Quartos</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
              </select>
            </SelectShell>

            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-ivory/15 px-4 py-2.5 font-body text-sm text-sand/80 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full bg-brass px-4 py-2.5 font-body font-semibold text-bgDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
