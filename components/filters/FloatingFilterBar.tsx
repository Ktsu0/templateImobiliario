"use client";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";
import { SearchIcon } from "@/components/ui/icons";
import { SelectShell, TransactionSegments, controlClass, selectClass } from "./FilterField";

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

  const priceInputClass =
    "w-[4.5rem] bg-transparent font-body text-sm text-ivory placeholder:text-sand/45 focus-visible:outline-none";

  return (
    <div className="sticky top-4 z-30 mx-auto hidden w-full max-w-5xl items-center gap-2 rounded-2xl border border-brass/20 bg-ink/90 p-2 shadow-xl shadow-black/40 backdrop-blur-md md:flex">
      <TransactionSegments />

      <span aria-hidden="true" className="h-6 w-px shrink-0 bg-ivory/10" />

      <SelectShell>
        <select
          aria-label="Tipo de imóvel"
          value={filters.propertyType}
          onChange={(event) => setFilter("propertyType", event.target.value)}
          className={selectClass}
        >
          <option value="todos">Tipo</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </SelectShell>

      <div className="relative min-w-[9rem] flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand/45" />
        <input
          type="text"
          aria-label="Localização"
          placeholder="Bairro ou cidade"
          value={filters.location}
          onChange={(event) => setFilter("location", event.target.value)}
          className={`w-full pl-9 ${controlClass}`}
        />
      </div>

      <div className={`flex shrink-0 items-center gap-1 ${controlClass} px-3`}>
        <span className="font-body text-xs text-sand/50">R$</span>
        <input
          type="number"
          aria-label="Preço mínimo"
          placeholder="mín"
          value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
          onChange={(event) =>
            setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
          }
          className={priceInputClass}
        />
        <span aria-hidden="true" className="text-sand/30">
          –
        </span>
        <input
          type="number"
          aria-label="Preço máximo"
          placeholder="máx"
          value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
          onChange={(event) =>
            setFilter("priceRange", [filters.priceRange[0], Number(event.target.value) || Infinity])
          }
          className={priceInputClass}
        />
      </div>

      <SelectShell>
        <select
          aria-label="Quartos"
          value={filters.bedrooms}
          onChange={(event) => setFilter("bedrooms", Number(event.target.value))}
          className={selectClass}
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
          aria-label="Limpar filtros"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-sand/60 transition-colors hover:bg-ivory/5 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        >
          ×
        </button>
      )}
    </div>
  );
}
