"use client";
import { useFilterStore } from "@/stores/useFilterStore";

interface FloatingFilterBarProps {
  propertyTypes: string[];
}

const fieldClass =
  "rounded-full bg-ivory/10 px-3 py-1.5 font-body text-sm text-ivory placeholder:text-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass";

export function FloatingFilterBar({ propertyTypes }: FloatingFilterBarProps) {
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);

  return (
    <div className="sticky top-4 z-30 mx-auto hidden w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-3xl bg-ink/90 px-4 py-2 shadow-lg shadow-black/30 ring-1 ring-ivory/10 backdrop-blur md:flex">
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
        className={`w-36 ${fieldClass}`}
      />

      <input
        type="number"
        aria-label="Preço mínimo"
        placeholder="Mín."
        value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
        onChange={(event) =>
          setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
        }
        className={`w-24 ${fieldClass}`}
      />
      <input
        type="number"
        aria-label="Preço máximo"
        placeholder="Máx."
        value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
        onChange={(event) =>
          setFilter("priceRange", [filters.priceRange[0], Number(event.target.value) || Infinity])
        }
        className={`w-24 ${fieldClass}`}
      />

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
    </div>
  );
}
