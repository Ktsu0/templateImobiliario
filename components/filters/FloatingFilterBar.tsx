"use client";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";
import { SelectShell, filterInputClass, filterSelectClass } from "./FilterField";

interface FloatingFilterBarProps {
  propertyTypes: string[];
}

export function FloatingFilterBar({ propertyTypes }: FloatingFilterBarProps) {
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  const hasActiveFilters =
    filters.transaction !== DEFAULT_FILTERS.transaction ||
    filters.propertyType !== DEFAULT_FILTERS.propertyType ||
    filters.location !== DEFAULT_FILTERS.location ||
    filters.bedrooms !== DEFAULT_FILTERS.bedrooms ||
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1];

  return (
    <div className="sticky top-4 z-30 mx-auto hidden w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-brass/20 bg-ink/85 p-2 shadow-xl shadow-black/40 backdrop-blur-md md:flex">
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
        className={`w-36 ${filterInputClass}`}
      />

      <div className="flex items-center gap-1 rounded-full border border-ivory/15 bg-bgDark/70 px-3 py-1">
        <span className="font-body text-xs uppercase tracking-wider text-sand/60">R$</span>
        <input
          type="number"
          aria-label="Preço mínimo"
          placeholder="mín"
          value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
          onChange={(event) =>
            setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
          }
          className="w-20 bg-transparent px-1 py-1 font-body text-sm text-ivory placeholder:text-sand/50 focus-visible:outline-none"
        />
        <span className="text-sand/40">–</span>
        <input
          type="number"
          aria-label="Preço máximo"
          placeholder="máx"
          value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
          onChange={(event) =>
            setFilter("priceRange", [filters.priceRange[0], Number(event.target.value) || Infinity])
          }
          className="w-20 bg-transparent px-1 py-1 font-body text-sm text-ivory placeholder:text-sand/50 focus-visible:outline-none"
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

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full px-3 py-2 font-body text-sm text-sand/70 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
