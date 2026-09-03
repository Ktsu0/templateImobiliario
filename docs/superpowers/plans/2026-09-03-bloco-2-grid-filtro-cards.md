# Bloco 2 — Grid de Imóveis, Filtro e Cards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the property grid with real hierarchy (one featured card + the rest), a filter shared between a desktop floating bar and a mobile bottom-sheet, and cards with a touch-first photo carousel — all driven by JSON content and Zustand state, nothing hardcoded in a component.

**Architecture:** Pure logic (filtering, price formatting, WhatsApp URL building, featured-property resolution) lives in `/lib`, fully unit-tested without any DOM. Two small Zustand stores (`useFilterStore`, `useFavoritesStore`) hold the only cross-component state. Presentational components (`PropertyCard`, `PropertyCarousel`, `FavoriteButton`, the icon set) take plain props and know nothing about stores or grid position. `PropertyListingSection` is the one client-component composition root that reads the store, filters the JSON dataset, and renders the filter bar/sheet + grid together.

**Tech Stack:** Same as Bloco 1 (Next.js 14 App Router, TypeScript, Tailwind, Vitest + @testing-library/react), plus Zustand for shared filter/favorites state and `next/image` for property photos (per the project's stack rule — `next/image` everywhere except the hero frame sequence).

## Global Constraints

- No property data, copy, or color may be hardcoded in a component — properties come from `content/clients/pioneira/properties.json` via `lib/content/properties.ts`; colors come from `clientConfig.theme` via the existing Tailwind CSS-variable tokens (`bg-bgDark`, `text-ivory`, etc. — already wired in Bloco 1).
- `next/image` is used for every property photo (the hero frame sequence is the only exception, and that's already built).
- The floating filter bar (desktop) and the bottom-sheet (mobile) read and write the **same** Zustand store (`useFilterStore`) — no duplicated filter state.
- Mobile filter button: circular, bottom-**left**, mirroring the WhatsApp button on the bottom-right (confirmed in the Bloco 2 brainstorming session).
- Carousel navigation must work by touch/swipe without depending on hover; hover-only arrows are a desktop bonus, never the only way to navigate.
- Favorites are in-memory only for this block (Zustand, no persistence, no email notification) — persistence and notifications stay on `ROADMAP.md`.
- The featured card is the property with `featured: true`; if the active filter excludes it, the first item of the filtered list becomes featured instead.
- `prefers-reduced-motion` and keyboard focus-visibility rules from Bloco 1 (`app/globals.css`) already apply globally — no new global CSS needed here.

---

### Task 1: Pure filter logic (`lib/filters.ts`)

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/filters.ts`
- Test: `lib/__tests__/filters.test.ts`

**Interfaces:**
- Consumes: `Property` type (defined in Task 5 — this task only needs the shape, so it imports the type once Task 5 exists; write this task's test against a locally-typed fixture object so the two tasks stay independent of execution order).
- Produces: `FilterState` type, `DEFAULT_FILTERS: FilterState`, `filterProperties(properties: Property[], filters: FilterState): Property[]` — consumed by `useFilterStore` (Task 2) and `PropertyListingSection` (Task 16).

Since `Property` doesn't exist yet at this point in the plan, this task defines a minimal local type alias for the fields `filterProperties` actually reads, and Task 5 later re-exports the full `Property` type that is structurally compatible (same field names/types) — `filterProperties` imports `Property` from `@/lib/content/types` directly, so once Task 5 lands, both tasks refer to the same type.

- [ ] **Step 1: Write the failing test**

`lib/__tests__/filters.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { filterProperties, DEFAULT_FILTERS } from "@/lib/filters";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho, Curitiba",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
    ...overrides,
  };
}

const properties: Property[] = [
  makeProperty({ id: "p1", transaction: "venda", type: "Casa", price: 500000, location: "Bigorrilho", bedrooms: 3 }),
  makeProperty({ id: "p2", transaction: "aluguel", type: "Apartamento", price: 3000, location: "Batel", bedrooms: 2 }),
  makeProperty({ id: "p3", transaction: "venda", type: "Cobertura", price: 1200000, location: "Água Verde", bedrooms: 4 }),
];

describe("filterProperties", () => {
  it("returns every property when filters are at their defaults", () => {
    expect(filterProperties(properties, DEFAULT_FILTERS)).toEqual(properties);
  });

  it("filters by transaction", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, transaction: "aluguel" });
    expect(result.map((p) => p.id)).toEqual(["p2"]);
  });

  it("filters by property type", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, propertyType: "Cobertura" });
    expect(result.map((p) => p.id)).toEqual(["p3"]);
  });

  it("filters by location as a case-insensitive substring", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, location: "batel" });
    expect(result.map((p) => p.id)).toEqual(["p2"]);
  });

  it("filters by price range (inclusive)", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, priceRange: [400000, 600000] });
    expect(result.map((p) => p.id)).toEqual(["p1"]);
  });

  it("filters by minimum bedrooms", () => {
    const result = filterProperties(properties, { ...DEFAULT_FILTERS, bedrooms: 4 });
    expect(result.map((p) => p.id)).toEqual(["p3"]);
  });

  it("combines multiple filters", () => {
    const result = filterProperties(properties, {
      ...DEFAULT_FILTERS,
      transaction: "venda",
      bedrooms: 3,
    });
    expect(result.map((p) => p.id)).toEqual(["p1", "p3"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/filters.test.ts`
Expected: FAIL — `Cannot find module '@/lib/filters'` (and `@/lib/content/types` doesn't exist yet either).

- [ ] **Step 3: Implement**

`lib/content/types.ts` (created here since Task 1's test needs it — Task 5 builds on top of this same file, it does not recreate it):
```ts
export interface Property {
  id: string;
  title: string;
  transaction: "venda" | "aluguel";
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  suites: number;
  area: number;
  parkingSpots: number;
  status: "venda" | "aluguel" | "lancamento" | "exclusivo";
  featured: boolean;
  photos: string[];
}
```

`lib/filters.ts`:
```ts
import type { Property } from "@/lib/content/types";

export interface FilterState {
  transaction: "todos" | "venda" | "aluguel";
  propertyType: string;
  location: string;
  priceRange: [number, number];
  bedrooms: number;
}

export const DEFAULT_FILTERS: FilterState = {
  transaction: "todos",
  propertyType: "todos",
  location: "",
  priceRange: [0, Infinity],
  bedrooms: 0,
};

export function filterProperties(properties: Property[], filters: FilterState): Property[] {
  return properties.filter((property) => {
    if (filters.transaction !== "todos" && property.transaction !== filters.transaction) {
      return false;
    }
    if (filters.propertyType !== "todos" && property.type !== filters.propertyType) {
      return false;
    }
    if (filters.location.trim() !== "") {
      const needle = filters.location.trim().toLowerCase();
      if (!property.location.toLowerCase().includes(needle)) return false;
    }
    if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
      return false;
    }
    if (property.bedrooms < filters.bedrooms) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/filters.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/filters.ts lib/content/types.ts lib/__tests__/filters.test.ts
git commit -m "$(cat <<'EOF'
Add Property type and pure filterProperties logic

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useFilterStore` (Zustand)

**Files:**
- Modify: `package.json` (add `zustand` dependency)
- Create: `stores/useFilterStore.ts`
- Test: `stores/__tests__/useFilterStore.test.ts`

**Interfaces:**
- Consumes: `FilterState`, `DEFAULT_FILTERS` (Task 1).
- Produces: `useFilterStore` — a Zustand hook exposing `{ filters: FilterState; setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]): void; resetFilters(): void }`. Consumed by `FloatingFilterBar` (Task 14), `FilterBottomSheet` (Task 15), and `PropertyListingSection` (Task 16).

- [ ] **Step 1: Add the dependency**

Add to `package.json` `dependencies`:
```json
"zustand": "^4.5.0"
```

Run: `npm install`

- [ ] **Step 2: Write the failing test**

`stores/__tests__/useFilterStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("useFilterStore", () => {
  it("starts with the default filters", () => {
    expect(useFilterStore.getState().filters).toEqual(DEFAULT_FILTERS);
  });

  it("updates a single field via setFilter", () => {
    useFilterStore.getState().setFilter("transaction", "aluguel");
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
    expect(useFilterStore.getState().filters.propertyType).toBe(DEFAULT_FILTERS.propertyType);
  });

  it("resets to the defaults", () => {
    useFilterStore.getState().setFilter("bedrooms", 3);
    useFilterStore.getState().resetFilters();
    expect(useFilterStore.getState().filters).toEqual(DEFAULT_FILTERS);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run stores/__tests__/useFilterStore.test.ts`
Expected: FAIL — `Cannot find module '@/stores/useFilterStore'`.

- [ ] **Step 4: Implement**

`stores/useFilterStore.ts`:
```ts
import { create } from "zustand";
import { DEFAULT_FILTERS, type FilterState } from "@/lib/filters";

interface FilterStore {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run stores/__tests__/useFilterStore.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json stores/useFilterStore.ts stores/__tests__/useFilterStore.test.ts
git commit -m "$(cat <<'EOF'
Add useFilterStore (Zustand) shared by the filter bar and bottom sheet

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `useFavoritesStore` (Zustand)

**Files:**
- Create: `stores/useFavoritesStore.ts`
- Test: `stores/__tests__/useFavoritesStore.test.ts`

**Interfaces:**
- Produces: `useFavoritesStore` exposing `{ favoriteIds: Set<string>; toggleFavorite(id: string): void; isFavorite(id: string): boolean }`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`stores/__tests__/useFavoritesStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("useFavoritesStore", () => {
  it("starts with no favorites", () => {
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(false);
  });

  it("toggles a property into and out of favorites", () => {
    useFavoritesStore.getState().toggleFavorite("p1");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);

    useFavoritesStore.getState().toggleFavorite("p1");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(false);
  });

  it("tracks multiple favorites independently", () => {
    useFavoritesStore.getState().toggleFavorite("p1");
    useFavoritesStore.getState().toggleFavorite("p2");
    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);
    expect(useFavoritesStore.getState().isFavorite("p2")).toBe(true);
    expect(useFavoritesStore.getState().isFavorite("p3")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run stores/__tests__/useFavoritesStore.test.ts`
Expected: FAIL — `Cannot find module '@/stores/useFavoritesStore'`.

- [ ] **Step 3: Implement**

`stores/useFavoritesStore.ts`:
```ts
import { create } from "zustand";

interface FavoritesStore {
  favoriteIds: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set(),
  toggleFavorite: (id) =>
    set((state) => {
      const next = new Set(state.favoriteIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { favoriteIds: next };
    }),
  isFavorite: (id) => get().favoriteIds.has(id),
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run stores/__tests__/useFavoritesStore.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add stores/useFavoritesStore.ts stores/__tests__/useFavoritesStore.test.ts
git commit -m "$(cat <<'EOF'
Add useFavoritesStore (Zustand, in-memory only)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Price formatting (`lib/format-price.ts`)

**Files:**
- Create: `lib/format-price.ts`
- Test: `lib/__tests__/format-price.test.ts`

**Interfaces:**
- Produces: `formatPrice(price: number, transaction: "venda" | "aluguel"): string`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/format-price.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format-price";

describe("formatPrice", () => {
  it("formats a sale price in BRL", () => {
    expect(formatPrice(450000, "venda")).toBe("R$ 450.000,00");
  });

  it("appends /mês for rentals", () => {
    expect(formatPrice(2500, "aluguel")).toBe("R$ 2.500,00/mês");
  });

  it("keeps two decimal places for non-round values", () => {
    expect(formatPrice(1999.9, "venda")).toBe("R$ 1.999,90");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/format-price.test.ts`
Expected: FAIL — `Cannot find module '@/lib/format-price'`.

- [ ] **Step 3: Implement**

`lib/format-price.ts`:
```ts
export function formatPrice(price: number, transaction: "venda" | "aluguel"): string {
  const numberFormatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const withCurrency = `R$ ${numberFormatted}`;
  return transaction === "aluguel" ? `${withCurrency}/mês` : withCurrency;
}
```

Formatting the number and currency prefix separately (rather than `Intl.NumberFormat` with
`style: "currency"`) sidesteps ICU versions that insert a non-breaking space between `R$` and
the number — the ASCII space here is exact and deterministic across environments.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/format-price.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/format-price.ts lib/__tests__/format-price.test.ts
git commit -m "$(cat <<'EOF'
Add formatPrice for BRL display with /mês suffix on rentals

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Property content — dataset + access layer

**Files:**
- Create: `content/clients/pioneira/properties.json`
- Create: `lib/content/properties.ts`
- Test: `lib/content/__tests__/properties.test.ts`

**Interfaces:**
- Consumes: `Property` (from `lib/content/types.ts`, created in Task 1).
- Produces: `getProperties(): Property[]` — consumed by `app/page.tsx` (Task 17) and by every test/script from here on that needs demo data.

- [ ] **Step 1: Write the failing test**

`lib/content/__tests__/properties.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getProperties } from "@/lib/content/properties";

describe("getProperties", () => {
  it("returns the 8 demo properties", () => {
    const properties = getProperties();
    expect(properties).toHaveLength(8);
  });

  it("gives every property the required shape", () => {
    for (const property of getProperties()) {
      expect(typeof property.id).toBe("string");
      expect(["venda", "aluguel"]).toContain(property.transaction);
      expect(property.photos).toHaveLength(3);
    }
  });

  it("has exactly one featured property", () => {
    const featuredCount = getProperties().filter((p) => p.featured).length;
    expect(featuredCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/content/__tests__/properties.test.ts`
Expected: FAIL — `Cannot find module '@/lib/content/properties'`.

- [ ] **Step 3: Implement**

`content/clients/pioneira/properties.json`:
```json
[
  {
    "id": "p1",
    "title": "Casa Contemporânea Bigorrilho",
    "transaction": "venda",
    "type": "Casa",
    "price": 1450000,
    "location": "Bigorrilho, Curitiba",
    "bedrooms": 4,
    "suites": 2,
    "area": 320,
    "parkingSpots": 3,
    "status": "exclusivo",
    "featured": true,
    "photos": [
      "/clients/pioneira/properties/p1/photo-1.webp",
      "/clients/pioneira/properties/p1/photo-2.webp",
      "/clients/pioneira/properties/p1/photo-3.webp"
    ]
  },
  {
    "id": "p2",
    "title": "Apartamento Batel 2 Quartos",
    "transaction": "aluguel",
    "type": "Apartamento",
    "price": 3200,
    "location": "Batel, Curitiba",
    "bedrooms": 2,
    "suites": 1,
    "area": 78,
    "parkingSpots": 1,
    "status": "aluguel",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p2/photo-1.webp",
      "/clients/pioneira/properties/p2/photo-2.webp",
      "/clients/pioneira/properties/p2/photo-3.webp"
    ]
  },
  {
    "id": "p3",
    "title": "Cobertura Duplex Água Verde",
    "transaction": "venda",
    "type": "Cobertura",
    "price": 2100000,
    "location": "Água Verde, Curitiba",
    "bedrooms": 3,
    "suites": 3,
    "area": 260,
    "parkingSpots": 2,
    "status": "venda",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p3/photo-1.webp",
      "/clients/pioneira/properties/p3/photo-2.webp",
      "/clients/pioneira/properties/p3/photo-3.webp"
    ]
  },
  {
    "id": "p4",
    "title": "Sobrado Novo Ecoville",
    "transaction": "venda",
    "type": "Sobrado",
    "price": 980000,
    "location": "Ecoville, Curitiba",
    "bedrooms": 3,
    "suites": 1,
    "area": 210,
    "parkingSpots": 2,
    "status": "lancamento",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p4/photo-1.webp",
      "/clients/pioneira/properties/p4/photo-2.webp",
      "/clients/pioneira/properties/p4/photo-3.webp"
    ]
  },
  {
    "id": "p5",
    "title": "Apartamento Compacto Centro",
    "transaction": "aluguel",
    "type": "Apartamento",
    "price": 1800,
    "location": "Centro, Curitiba",
    "bedrooms": 1,
    "suites": 0,
    "area": 42,
    "parkingSpots": 1,
    "status": "aluguel",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p5/photo-1.webp",
      "/clients/pioneira/properties/p5/photo-2.webp",
      "/clients/pioneira/properties/p5/photo-3.webp"
    ]
  },
  {
    "id": "p6",
    "title": "Casa em Condomínio Santa Felicidade",
    "transaction": "venda",
    "type": "Casa",
    "price": 1150000,
    "location": "Santa Felicidade, Curitiba",
    "bedrooms": 4,
    "suites": 1,
    "area": 280,
    "parkingSpots": 4,
    "status": "venda",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p6/photo-1.webp",
      "/clients/pioneira/properties/p6/photo-2.webp",
      "/clients/pioneira/properties/p6/photo-3.webp"
    ]
  },
  {
    "id": "p7",
    "title": "Apartamento Garden Cabral",
    "transaction": "venda",
    "type": "Apartamento",
    "price": 690000,
    "location": "Cabral, Curitiba",
    "bedrooms": 2,
    "suites": 1,
    "area": 95,
    "parkingSpots": 2,
    "status": "venda",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p7/photo-1.webp",
      "/clients/pioneira/properties/p7/photo-2.webp",
      "/clients/pioneira/properties/p7/photo-3.webp"
    ]
  },
  {
    "id": "p8",
    "title": "Studio Mobiliado Bigorrilho",
    "transaction": "aluguel",
    "type": "Studio",
    "price": 2200,
    "location": "Bigorrilho, Curitiba",
    "bedrooms": 1,
    "suites": 0,
    "area": 35,
    "parkingSpots": 0,
    "status": "aluguel",
    "featured": false,
    "photos": [
      "/clients/pioneira/properties/p8/photo-1.webp",
      "/clients/pioneira/properties/p8/photo-2.webp",
      "/clients/pioneira/properties/p8/photo-3.webp"
    ]
  }
]
```

`lib/content/properties.ts`:
```ts
import propertiesData from "@/content/clients/pioneira/properties.json";
import type { Property } from "./types";

export function getProperties(): Property[] {
  return propertiesData as Property[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/content/__tests__/properties.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add content/clients/pioneira/properties.json lib/content/properties.ts lib/content/__tests__/properties.test.ts
git commit -m "$(cat <<'EOF'
Add pioneira demo property dataset and content access layer

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: WhatsApp CTA URL builder

**Files:**
- Create: `lib/whatsapp.ts`
- Test: `lib/__tests__/whatsapp.test.ts`

**Interfaces:**
- Consumes: `Property` (Task 1/5).
- Produces: `buildWhatsAppUrl(whatsappNumber: string, property: Property): string`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/whatsapp.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Property } from "@/lib/content/types";

const property: Property = {
  id: "p1",
  title: "Casa Contemporânea Bigorrilho",
  transaction: "venda",
  type: "Casa",
  price: 1450000,
  location: "Bigorrilho, Curitiba",
  bedrooms: 4,
  suites: 2,
  area: 320,
  parkingSpots: 3,
  status: "exclusivo",
  featured: true,
  photos: ["/a.webp", "/b.webp", "/c.webp"],
};

describe("buildWhatsAppUrl", () => {
  it("points at wa.me with the configured number", () => {
    const url = buildWhatsAppUrl("5541999999999", property);
    expect(url.startsWith("https://wa.me/5541999999999?text=")).toBe(true);
  });

  it("encodes a message citing the property title and location", () => {
    const url = buildWhatsAppUrl("5541999999999", property);
    const query = url.split("?text=")[1];
    expect(decodeURIComponent(query)).toBe(
      "Olá! Tenho interesse no imóvel Casa Contemporânea Bigorrilho em Bigorrilho, Curitiba."
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/whatsapp.test.ts`
Expected: FAIL — `Cannot find module '@/lib/whatsapp'`.

- [ ] **Step 3: Implement**

`lib/whatsapp.ts`:
```ts
import type { Property } from "@/lib/content/types";

export function buildWhatsAppUrl(whatsappNumber: string, property: Property): string {
  const message = `Olá! Tenho interesse no imóvel ${property.title} em ${property.location}.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/whatsapp.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/__tests__/whatsapp.test.ts
git commit -m "$(cat <<'EOF'
Add buildWhatsAppUrl for the property card CTA

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Featured-property resolution

**Files:**
- Create: `lib/featured-property.ts`
- Test: `lib/__tests__/featured-property.test.ts`

**Interfaces:**
- Consumes: `Property` (Task 1/5).
- Produces: `resolveFeaturedProperty(properties: Property[]): Property | undefined`. Consumed by `PropertyGrid` (Task 13).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/featured-property.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { resolveFeaturedProperty } from "@/lib/featured-property";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
    ...overrides,
  };
}

describe("resolveFeaturedProperty", () => {
  it("returns the property flagged as featured", () => {
    const properties = [
      makeProperty({ id: "p1", featured: false }),
      makeProperty({ id: "p2", featured: true }),
    ];
    expect(resolveFeaturedProperty(properties)?.id).toBe("p2");
  });

  it("falls back to the first item when nothing is flagged featured", () => {
    const properties = [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })];
    expect(resolveFeaturedProperty(properties)?.id).toBe("p1");
  });

  it("returns undefined for an empty list", () => {
    expect(resolveFeaturedProperty([])).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/featured-property.test.ts`
Expected: FAIL — `Cannot find module '@/lib/featured-property'`.

- [ ] **Step 3: Implement**

`lib/featured-property.ts`:
```ts
import type { Property } from "@/lib/content/types";

export function resolveFeaturedProperty(properties: Property[]): Property | undefined {
  if (properties.length === 0) return undefined;
  return properties.find((property) => property.featured) ?? properties[0];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/featured-property.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/featured-property.ts lib/__tests__/featured-property.test.ts
git commit -m "$(cat <<'EOF'
Add resolveFeaturedProperty with first-item fallback

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Placeholder property photo generator

**Files:**
- Create: `scripts/generate-placeholder-properties.ts`
- Modify: `package.json` (add `generate:pioneira-properties` script)
- Test: `scripts/__tests__/generate-placeholder-properties.test.ts`

**Interfaces:**
- Consumes: `clientConfig` (from `config/clients/pioneira.ts`), `getProperties()` (Task 5).
- Produces: `public/clients/pioneira/properties/<id>/photo-{1,2,3}.webp` (24 files) and exports `pickColor(index: number): string` for testing.

- [ ] **Step 1: Write the failing test**

`scripts/__tests__/generate-placeholder-properties.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { pickColor } from "@/scripts/generate-placeholder-properties";
import { clientConfig } from "@/config/clients/pioneira";

describe("pickColor", () => {
  it("cycles through the theme palette", () => {
    const first = pickColor(0);
    const second = pickColor(1);
    expect(first).toBe(clientConfig.theme.bgDark);
    expect(second).toBe(clientConfig.theme.brass);
  });

  it("wraps around after the palette length", () => {
    expect(pickColor(4)).toBe(pickColor(0));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/__tests__/generate-placeholder-properties.test.ts`
Expected: FAIL — `Cannot find module '@/scripts/generate-placeholder-properties'`.

- [ ] **Step 3: Implement**

Add to `package.json` `scripts`:
```json
"generate:pioneira-properties": "tsx scripts/generate-placeholder-properties.ts"
```

`scripts/generate-placeholder-properties.ts`:
```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { clientConfig } from "../config/clients/pioneira";
import { getProperties } from "../lib/content/properties";

const WIDTH = 1200;
const HEIGHT = 800;
const PHOTOS_PER_PROPERTY = 3;

const PALETTE = [
  clientConfig.theme.bgDark,
  clientConfig.theme.brass,
  clientConfig.theme.sand,
  clientConfig.theme.inkSoft,
];

export function pickColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

async function generatePhoto(title: string, photoIndex: number, colorIndex: number): Promise<Buffer> {
  const background = pickColor(colorIndex);
  const label = `${title} — Foto ${photoIndex}`;
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="36" fill="${clientConfig.theme.ivory}">
        ${label}
      </text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).webp({ quality: 70 }).toBuffer();
}

async function main() {
  const properties = getProperties();

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const dir = path.join(process.cwd(), "public", "clients", "pioneira", "properties", property.id);
    await mkdir(dir, { recursive: true });

    for (let photoIndex = 1; photoIndex <= PHOTOS_PER_PROPERTY; photoIndex++) {
      const buffer = await generatePhoto(property.title, photoIndex, i);
      await writeFile(path.join(dir, `photo-${photoIndex}.webp`), buffer);
    }
  }

  console.log(`Generated ${properties.length * PHOTOS_PER_PROPERTY} placeholder property photos.`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-placeholder-properties.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/__tests__/generate-placeholder-properties.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Generate the demo photos and verify the count**

Run: `npm run generate:pioneira-properties`
Expected: prints `Generated 24 placeholder property photos.`

Run (Bash): `find public/clients/pioneira/properties -name '*.webp' | wc -l`
Expected: `24`

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/generate-placeholder-properties.ts scripts/__tests__/generate-placeholder-properties.test.ts public/clients/pioneira/properties
git commit -m "$(cat <<'EOF'
Add placeholder property photo generator and generate demo assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Attribute icons

**Files:**
- Create: `components/ui/icons.tsx`
- Test: `components/ui/__tests__/icons.test.tsx`

**Interfaces:**
- Produces: `BedIcon`, `SuiteIcon`, `AreaIcon`, `ParkingIcon` — each `(props: { className?: string }) => JSX.Element`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`components/ui/__tests__/icons.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BedIcon, SuiteIcon, AreaIcon, ParkingIcon } from "@/components/ui/icons";

describe("attribute icons", () => {
  it("each renders a single inline SVG", () => {
    for (const Icon of [BedIcon, SuiteIcon, AreaIcon, ParkingIcon]) {
      const { container } = render(<Icon className="h-4 w-4" />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("h-4", "w-4");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/__tests__/icons.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ui/icons'`.

- [ ] **Step 3: Implement**

`components/ui/icons.tsx`:
```tsx
interface IconProps {
  className?: string;
}

export function BedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SuiteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M4 11h16M4 11V7a1 1 0 0 1 1-1h4v5M4 11v7M20 11V7a1 1 0 0 0-1-1h-4v5M20 11v7M4 18h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AreaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4v3M4 9h3M20 15h-3M15 20v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ParkingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 16V7h3.5a2.5 2.5 0 0 1 0 5H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/__tests__/icons.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/icons.tsx components/ui/__tests__/icons.test.tsx
git commit -m "$(cat <<'EOF'
Add minimal inline icons for property attributes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `FavoriteButton`

**Files:**
- Create: `components/ui/FavoriteButton.tsx`
- Test: `components/ui/__tests__/FavoriteButton.test.tsx`

**Interfaces:**
- Produces: `FavoriteButton({ isFavorite: boolean; onToggle: () => void })`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`components/ui/__tests__/FavoriteButton.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

describe("FavoriteButton", () => {
  it("shows an outlined heart and calls onToggle when not favorited", () => {
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorite={false} onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: /adicionar aos favoritos/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows a filled heart when favorited", () => {
    render(<FavoriteButton isFavorite={true} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: /remover dos favoritos/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ui/__tests__/FavoriteButton.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ui/FavoriteButton'`.

- [ ] **Step 3: Implement**

`components/ui/FavoriteButton.tsx`:
```tsx
interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-lg leading-none text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ui/__tests__/FavoriteButton.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/FavoriteButton.tsx components/ui/__tests__/FavoriteButton.test.tsx
git commit -m "$(cat <<'EOF'
Add FavoriteButton presentational component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: `PropertyCarousel`

**Files:**
- Create: `components/property-card/PropertyCarousel.tsx`
- Test: `components/property-card/__tests__/PropertyCarousel.test.tsx`

**Interfaces:**
- Produces: `PropertyCarousel({ photos: string[]; alt: string })`. Consumed by `PropertyCard` (Task 12).

- [ ] **Step 1: Write the failing test**

`components/property-card/__tests__/PropertyCarousel.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyCarousel } from "@/components/property-card/PropertyCarousel";

const photos = ["/photo-1.webp", "/photo-2.webp", "/photo-3.webp"];

describe("PropertyCarousel", () => {
  it("shows the first photo initially", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });

  it("advances on next-arrow click, and wraps around", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    const next = screen.getByRole("button", { name: /próxima foto/i });

    fireEvent.click(next);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[1]);

    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });

  it("advances on a left swipe and goes back on a right swipe", () => {
    render(<PropertyCarousel photos={photos} alt="Casa Teste" />);
    const surface = screen.getByTestId("carousel-surface");

    fireEvent.touchStart(surface, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[1]);

    fireEvent.touchStart(surface, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 200 }] });
    expect(screen.getByAltText("Casa Teste")).toHaveAttribute("src", photos[0]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/property-card/__tests__/PropertyCarousel.test.tsx`
Expected: FAIL — `Cannot find module '@/components/property-card/PropertyCarousel'`.

- [ ] **Step 3: Implement**

`components/property-card/PropertyCarousel.tsx`:
```tsx
"use client";
import { useRef, useState } from "react";
import Image from "next/image";

interface PropertyCarouselProps {
  photos: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 40;

export function PropertyCarousel({ photos, alt }: PropertyCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (nextIndex: number) => {
    setIndex(((nextIndex % photos.length) + photos.length) % photos.length);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta <= -SWIPE_THRESHOLD_PX) goTo(index + 1);
    else if (delta >= SWIPE_THRESHOLD_PX) goTo(index - 1);
    touchStartX.current = null;
  };

  return (
    <div
      data-testid="carousel-surface"
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image src={photos[index]} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Foto anterior"
        className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Próxima foto"
        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        ›
      </button>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {photos.map((_, photoIndex) => (
          <span
            key={photoIndex}
            className={`h-1.5 w-1.5 rounded-full ${photoIndex === index ? "bg-brassLight" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/property-card/__tests__/PropertyCarousel.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/property-card/PropertyCarousel.tsx components/property-card/__tests__/PropertyCarousel.test.tsx
git commit -m "$(cat <<'EOF'
Add PropertyCarousel with touch-swipe and arrow navigation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `PropertyCard`

**Files:**
- Create: `components/property-card/PropertyCard.tsx`
- Test: `components/property-card/__tests__/PropertyCard.test.tsx`

**Interfaces:**
- Consumes: `PropertyCarousel` (Task 11), `FavoriteButton` (Task 10), icons (Task 9), `formatPrice` (Task 4), `buildWhatsAppUrl` (Task 6), `useFavoritesStore` (Task 3), `Property` (Task 1/5).
- Produces: `PropertyCard({ property: Property; variant: "featured" | "default"; whatsappNumber: string })`. Consumed by `PropertyGrid` (Task 13).

- [ ] **Step 1: Write the failing test**

`components/property-card/__tests__/PropertyCard.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyCard } from "@/components/property-card/PropertyCard";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Property } from "@/lib/content/types";

const property: Property = {
  id: "p1",
  title: "Casa Contemporânea Bigorrilho",
  transaction: "venda",
  type: "Casa",
  price: 1450000,
  location: "Bigorrilho, Curitiba",
  bedrooms: 4,
  suites: 2,
  area: 320,
  parkingSpots: 3,
  status: "exclusivo",
  featured: true,
  photos: ["/a.webp", "/b.webp", "/c.webp"],
};

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyCard", () => {
  it("renders title, status badge, price, and attribute counts", () => {
    render(<PropertyCard property={property} variant="featured" whatsappNumber="5541999999999" />);
    expect(screen.getByText("Casa Contemporânea Bigorrilho")).toBeInTheDocument();
    expect(screen.getByText("Exclusivo")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.450.000,00")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("320 m²")).toBeInTheDocument();
  });

  it("links the WhatsApp CTA to the correct wa.me URL", () => {
    render(<PropertyCard property={property} variant="default" whatsappNumber="5541999999999" />);
    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("https://wa.me/5541999999999?text="));
  });

  it("toggles the favorite state in the shared store", () => {
    render(<PropertyCard property={property} variant="default" whatsappNumber="5541999999999" />);
    const favoriteButton = screen.getByRole("button", { name: /adicionar aos favoritos/i });

    fireEvent.click(favoriteButton);

    expect(useFavoritesStore.getState().isFavorite("p1")).toBe(true);
    expect(screen.getByRole("button", { name: /remover dos favoritos/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/property-card/__tests__/PropertyCard.test.tsx`
Expected: FAIL — `Cannot find module '@/components/property-card/PropertyCard'`.

- [ ] **Step 3: Implement**

`components/property-card/PropertyCard.tsx`:
```tsx
"use client";
import { PropertyCarousel } from "./PropertyCarousel";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { BedIcon, SuiteIcon, AreaIcon, ParkingIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format-price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Property } from "@/lib/content/types";

const STATUS_LABELS: Record<Property["status"], string> = {
  venda: "Venda",
  aluguel: "Aluguel",
  lancamento: "Lançamento",
  exclusivo: "Exclusivo",
};

interface PropertyCardProps {
  property: Property;
  variant: "featured" | "default";
  whatsappNumber: string;
}

export function PropertyCard({ property, variant, whatsappNumber }: PropertyCardProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(property.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const aspectClass = variant === "featured" ? "aspect-[4/3]" : "aspect-[16/10]";
  const titleClass = variant === "featured" ? "text-xl" : "text-base";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-black/10">
      <div className={`relative ${aspectClass} w-full`}>
        <PropertyCarousel photos={property.photos} alt={property.title} />
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-ivory">
          {STATUS_LABELS[property.status]}
        </span>
        <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(property.id)} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className={`font-display text-ivory ${titleClass}`}>{property.title}</h3>
        <p className="text-sm text-inkSoft">{property.location}</p>

        <div className="flex flex-wrap gap-3 text-sm text-inkSoft">
          <span className="flex items-center gap-1">
            <BedIcon className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <SuiteIcon className="h-4 w-4" />
            {property.suites}
          </span>
          <span className="flex items-center gap-1">
            <AreaIcon className="h-4 w-4" />
            {property.area} m²
          </span>
          <span className="flex items-center gap-1">
            <ParkingIcon className="h-4 w-4" />
            {property.parkingSpots}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg text-brassLight">
            {formatPrice(property.price, property.transaction)}
          </span>
          <a
            href={buildWhatsAppUrl(whatsappNumber, property)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brass px-3 py-1.5 text-sm font-semibold text-bgDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/property-card/__tests__/PropertyCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/property-card/PropertyCard.tsx components/property-card/__tests__/PropertyCard.test.tsx
git commit -m "$(cat <<'EOF'
Add PropertyCard composing carousel, badge, attributes, price, and CTA

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: `PropertyGrid`

**Files:**
- Create: `components/property-grid/PropertyGrid.tsx`
- Test: `components/property-grid/__tests__/PropertyGrid.test.tsx`

**Interfaces:**
- Consumes: `PropertyCard` (Task 12), `resolveFeaturedProperty` (Task 7), `Property` (Task 1/5).
- Produces: `PropertyGrid({ properties: Property[]; whatsappNumber: string })`. Consumed by `PropertyListingSection` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/property-grid/__tests__/PropertyGrid.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyGrid } from "@/components/property-grid/PropertyGrid";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
    ...overrides,
  };
}

beforeEach(() => {
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyGrid", () => {
  it("renders the flagged property as featured, sized larger", () => {
    const properties = [
      makeProperty({ id: "p1", title: "Casa Um", featured: false }),
      makeProperty({ id: "p2", title: "Casa Destaque", featured: true }),
    ];
    render(<PropertyGrid properties={properties} whatsappNumber="5541999999999" />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("Casa Destaque");
    expect(headings[0]).toHaveClass("text-xl");
    expect(headings[1]).toHaveTextContent("Casa Um");
    expect(headings[1]).toHaveClass("text-base");
  });

  it("falls back to the first property when none is flagged featured", () => {
    const properties = [
      makeProperty({ id: "p1", title: "Primeira Casa" }),
      makeProperty({ id: "p2", title: "Segunda Casa" }),
    ];
    render(<PropertyGrid properties={properties} whatsappNumber="5541999999999" />);

    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent("Primeira Casa");
  });

  it("shows an empty-state message when the filtered list is empty", () => {
    render(<PropertyGrid properties={[]} whatsappNumber="5541999999999" />);
    expect(screen.getByText(/nenhum imóvel encontrado/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/property-grid/__tests__/PropertyGrid.test.tsx`
Expected: FAIL — `Cannot find module '@/components/property-grid/PropertyGrid'`.

- [ ] **Step 3: Implement**

`components/property-grid/PropertyGrid.tsx`:
```tsx
import { PropertyCard } from "@/components/property-card/PropertyCard";
import { resolveFeaturedProperty } from "@/lib/featured-property";
import type { Property } from "@/lib/content/types";

interface PropertyGridProps {
  properties: Property[];
  whatsappNumber: string;
}

export function PropertyGrid({ properties, whatsappNumber }: PropertyGridProps) {
  if (properties.length === 0) {
    return <p className="text-inkSoft">Nenhum imóvel encontrado para esses filtros.</p>;
  }

  const featured = resolveFeaturedProperty(properties);
  const rest = properties.filter((property) => property.id !== featured?.id);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {featured && (
        <div className="md:row-span-2">
          <PropertyCard property={featured} variant="featured" whatsappNumber={whatsappNumber} />
        </div>
      )}
      {rest.map((property) => (
        <PropertyCard key={property.id} property={property} variant="default" whatsappNumber={whatsappNumber} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/property-grid/__tests__/PropertyGrid.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/property-grid/PropertyGrid.tsx components/property-grid/__tests__/PropertyGrid.test.tsx
git commit -m "$(cat <<'EOF'
Add PropertyGrid with featured-card hierarchy and empty state

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: `FloatingFilterBar` (desktop)

**Files:**
- Create: `components/filters/FloatingFilterBar.tsx`
- Test: `components/filters/__tests__/FloatingFilterBar.test.tsx`

**Interfaces:**
- Consumes: `useFilterStore` (Task 2).
- Produces: `FloatingFilterBar({ propertyTypes: string[] })`. Consumed by `PropertyListingSection` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/filters/__tests__/FloatingFilterBar.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingFilterBar } from "@/components/filters/FloatingFilterBar";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("FloatingFilterBar", () => {
  it("updates the shared store when the transaction select changes", () => {
    render(<FloatingFilterBar propertyTypes={["Casa", "Apartamento"]} />);
    fireEvent.change(screen.getByLabelText(/transação/i), { target: { value: "aluguel" } });
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
  });

  it("updates the store when the location input changes", () => {
    render(<FloatingFilterBar propertyTypes={["Casa"]} />);
    fireEvent.change(screen.getByLabelText(/localização/i), { target: { value: "Batel" } });
    expect(useFilterStore.getState().filters.location).toBe("Batel");
  });

  it("updates the store when bedrooms changes", () => {
    render(<FloatingFilterBar propertyTypes={["Casa"]} />);
    fireEvent.change(screen.getByLabelText(/quartos/i), { target: { value: "3" } });
    expect(useFilterStore.getState().filters.bedrooms).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/filters/__tests__/FloatingFilterBar.test.tsx`
Expected: FAIL — `Cannot find module '@/components/filters/FloatingFilterBar'`.

- [ ] **Step 3: Implement**

`components/filters/FloatingFilterBar.tsx`:
```tsx
"use client";
import { useFilterStore } from "@/stores/useFilterStore";

interface FloatingFilterBarProps {
  propertyTypes: string[];
}

export function FloatingFilterBar({ propertyTypes }: FloatingFilterBarProps) {
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);

  return (
    <div className="sticky top-4 z-30 mx-auto hidden w-fit items-center gap-2 rounded-full bg-ink/90 px-4 py-2 shadow-lg md:flex">
      <select
        aria-label="Transação"
        value={filters.transaction}
        onChange={(event) => setFilter("transaction", event.target.value as typeof filters.transaction)}
        className="rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory"
      >
        <option value="todos">Comprar/Alugar</option>
        <option value="venda">Comprar</option>
        <option value="aluguel">Alugar</option>
      </select>

      <select
        aria-label="Tipo de imóvel"
        value={filters.propertyType}
        onChange={(event) => setFilter("propertyType", event.target.value)}
        className="rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory"
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
        className="w-32 rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory placeholder:text-inkSoft"
      />

      <input
        type="number"
        aria-label="Preço mínimo"
        placeholder="Mín."
        value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
        onChange={(event) =>
          setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
        }
        className="w-20 rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory placeholder:text-inkSoft"
      />
      <input
        type="number"
        aria-label="Preço máximo"
        placeholder="Máx."
        value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
        onChange={(event) =>
          setFilter("priceRange", [filters.priceRange[0], Number(event.target.value) || Infinity])
        }
        className="w-20 rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory placeholder:text-inkSoft"
      />

      <select
        aria-label="Quartos"
        value={filters.bedrooms}
        onChange={(event) => setFilter("bedrooms", Number(event.target.value))}
        className="rounded-full bg-inkSoft/30 px-3 py-1 text-sm text-ivory"
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/filters/__tests__/FloatingFilterBar.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/filters/FloatingFilterBar.tsx components/filters/__tests__/FloatingFilterBar.test.tsx
git commit -m "$(cat <<'EOF'
Add FloatingFilterBar (desktop) wired to useFilterStore

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: `FilterBottomSheet` (mobile)

**Files:**
- Create: `components/filters/FilterBottomSheet.tsx`
- Test: `components/filters/__tests__/FilterBottomSheet.test.tsx`

**Interfaces:**
- Consumes: `useFilterStore` (Task 2).
- Produces: `FilterBottomSheet({ propertyTypes: string[] })`. Consumed by `PropertyListingSection` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/filters/__tests__/FilterBottomSheet.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBottomSheet } from "@/components/filters/FilterBottomSheet";
import { useFilterStore } from "@/stores/useFilterStore";
import { DEFAULT_FILTERS } from "@/lib/filters";

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
});

describe("FilterBottomSheet", () => {
  it("is closed by default and opens when the floating button is clicked", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));
    expect(screen.getByRole("dialog", { name: /filtros/i })).toBeInTheDocument();
  });

  it("updates the shared store from within the sheet", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));

    fireEvent.change(screen.getByLabelText(/transação/i), { target: { value: "aluguel" } });
    expect(useFilterStore.getState().filters.transaction).toBe("aluguel");
  });

  it("closes when 'Aplicar filtros' is clicked", () => {
    render(<FilterBottomSheet propertyTypes={["Casa"]} />);
    fireEvent.click(screen.getByRole("button", { name: /abrir filtros/i }));
    fireEvent.click(screen.getByRole("button", { name: /aplicar filtros/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/filters/__tests__/FilterBottomSheet.test.tsx`
Expected: FAIL — `Cannot find module '@/components/filters/FilterBottomSheet'`.

- [ ] **Step 3: Implement**

`components/filters/FilterBottomSheet.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useFilterStore } from "@/stores/useFilterStore";

interface FilterBottomSheetProps {
  propertyTypes: string[];
}

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
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brass text-lg text-bgDark shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Filtros"
            onClick={(event) => event.stopPropagation()}
            className="w-full rounded-t-2xl bg-ink p-4"
          >
            <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-inkSoft" />

            <select
              aria-label="Transação"
              value={filters.transaction}
              onChange={(event) => setFilter("transaction", event.target.value as typeof filters.transaction)}
              className="mb-2 w-full rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory"
            >
              <option value="todos">Comprar/Alugar</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>

            <select
              aria-label="Tipo de imóvel"
              value={filters.propertyType}
              onChange={(event) => setFilter("propertyType", event.target.value)}
              className="mb-2 w-full rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory"
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
              className="mb-2 w-full rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory placeholder:text-inkSoft"
            />

            <div className="mb-2 flex gap-2">
              <input
                type="number"
                aria-label="Preço mínimo"
                placeholder="Mín."
                value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
                onChange={(event) =>
                  setFilter("priceRange", [Number(event.target.value) || 0, filters.priceRange[1]])
                }
                className="w-1/2 rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory placeholder:text-inkSoft"
              />
              <input
                type="number"
                aria-label="Preço máximo"
                placeholder="Máx."
                value={Number.isFinite(filters.priceRange[1]) ? filters.priceRange[1] : ""}
                onChange={(event) =>
                  setFilter("priceRange", [filters.priceRange[0], Number(event.target.value) || Infinity])
                }
                className="w-1/2 rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory placeholder:text-inkSoft"
              />
            </div>

            <select
              aria-label="Quartos"
              value={filters.bedrooms}
              onChange={(event) => setFilter("bedrooms", Number(event.target.value))}
              className="mb-3 w-full rounded-lg bg-inkSoft/30 px-3 py-2 text-ivory"
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
              className="w-full rounded-full bg-brass px-4 py-2 font-semibold text-bgDark"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/filters/__tests__/FilterBottomSheet.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/filters/FilterBottomSheet.tsx components/filters/__tests__/FilterBottomSheet.test.tsx
git commit -m "$(cat <<'EOF'
Add FilterBottomSheet (mobile) wired to useFilterStore

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: `PropertyListingSection` (composition root)

**Files:**
- Create: `components/property-grid/PropertyListingSection.tsx`
- Test: `components/property-grid/__tests__/PropertyListingSection.test.tsx`

**Interfaces:**
- Consumes: `useFilterStore` (Task 2), `filterProperties` (Task 1), `FloatingFilterBar` (Task 14), `FilterBottomSheet` (Task 15), `PropertyGrid` (Task 13), `Property` (Task 1/5).
- Produces: `PropertyListingSection({ properties: Property[]; whatsappNumber: string })`. Consumed by `app/page.tsx` (Task 17).

- [ ] **Step 1: Write the failing test**

`components/property-grid/__tests__/PropertyListingSection.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { PropertyListingSection } from "@/components/property-grid/PropertyListingSection";
import { useFilterStore } from "@/stores/useFilterStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { DEFAULT_FILTERS } from "@/lib/filters";
import type { Property } from "@/lib/content/types";

function makeProperty(overrides: Partial<Property>): Property {
  return {
    id: "p1",
    title: "Casa Teste",
    transaction: "venda",
    type: "Casa",
    price: 500000,
    location: "Bigorrilho",
    bedrooms: 3,
    suites: 1,
    area: 180,
    parkingSpots: 2,
    status: "venda",
    featured: false,
    photos: ["/a.webp", "/b.webp", "/c.webp"],
    ...overrides,
  };
}

const properties: Property[] = [
  makeProperty({ id: "p1", title: "Casa à Venda", transaction: "venda", featured: true }),
  makeProperty({ id: "p2", title: "Apto Aluguel", transaction: "aluguel" }),
];

beforeEach(() => {
  useFilterStore.setState({ filters: DEFAULT_FILTERS });
  useFavoritesStore.setState({ favoriteIds: new Set() });
});

describe("PropertyListingSection", () => {
  it("renders every property when no filter is active", () => {
    render(<PropertyListingSection properties={properties} whatsappNumber="5541999999999" />);
    expect(screen.getByText("Casa à Venda")).toBeInTheDocument();
    expect(screen.getByText("Apto Aluguel")).toBeInTheDocument();
  });

  it("re-renders with only the matching properties when the shared filter changes", () => {
    render(<PropertyListingSection properties={properties} whatsappNumber="5541999999999" />);

    act(() => {
      useFilterStore.getState().setFilter("transaction", "aluguel");
    });

    expect(screen.queryByText("Casa à Venda")).not.toBeInTheDocument();
    expect(screen.getByText("Apto Aluguel")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/property-grid/__tests__/PropertyListingSection.test.tsx`
Expected: FAIL — `Cannot find module '@/components/property-grid/PropertyListingSection'`.

- [ ] **Step 3: Implement**

`components/property-grid/PropertyListingSection.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/property-grid/__tests__/PropertyListingSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/property-grid/PropertyListingSection.tsx components/property-grid/__tests__/PropertyListingSection.test.tsx
git commit -m "$(cat <<'EOF'
Add PropertyListingSection composing filters and the grid

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Wire the listing into the home page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PropertyListingSection` (Task 16), `getProperties` (Task 5), `activeClientConfig` (Bloco 1).

- [ ] **Step 1: Replace the placeholder `#imoveis` section**

`app/page.tsx` (replace entirely):
```tsx
import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";
import { PropertyListingSection } from "@/components/property-grid/PropertyListingSection";
import { activeClientConfig } from "@/config/active-client";
import { getProperties } from "@/lib/content/properties";

export default function HomePage() {
  const properties = getProperties();

  return (
    <main>
      <HeroFrameSequence brand={activeClientConfig.brand} hero={activeClientConfig.hero} />
      <section id="imoveis" className="px-6 py-24">
        <h2 className="font-display text-3xl text-ivory">Imóveis em destaque</h2>
        <div className="mt-8">
          <PropertyListingSection
            properties={properties}
            whatsappNumber={activeClientConfig.contact.whatsapp}
          />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run the full test suite and the build**

Run: `npx vitest run`
Expected: all tests pass.

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "$(cat <<'EOF'
Wire PropertyListingSection into the home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Manual browser verification

No files change in this task — it validates Tasks 1–17 in a real browser.

- [ ] **Step 1: Start the dev server**

Use the Browser tool's `preview_start` with `name: "imobiliaria-template-dev"` (config already exists from Bloco 1 at `.claude/launch.json`), then navigate to `http://localhost:3000#imoveis` (or scroll down from `/`).

- [ ] **Step 2: Verify the grid hierarchy (desktop)**

Take a screenshot of the property section: confirm the featured property renders visibly larger
(spans two rows) to the left of a 2-column grid of smaller cards, matching the layout approved in
the Bloco 2 brainstorming session.

- [ ] **Step 3: Verify the carousel by touch**

Use `resize_window` with `preset: "mobile"` (this also enables touch-to-mouse translation per the
tool's description) and reload. On a card's photo, perform a left-drag gesture
(`left_click_drag` from the right side of the photo to the left) and confirm the photo advances;
confirm the position dots update.

- [ ] **Step 4: Verify the filter bar and bottom sheet**

On desktop viewport, confirm the floating filter pill is visible above the grid and that changing
"Transação" to "Alugar" immediately shrinks the grid to rental properties only.

Switch to mobile viewport again. Confirm:
- A circular filter button sits at the bottom-**left**, and the WhatsApp button (added in a later
  block) is expected at bottom-right — for now just confirm the filter button does not sit under
  where the skip-intro/WhatsApp corner would be.
- Tapping it opens a bottom-sheet with the same fields; changing one and tapping "Aplicar filtros"
  closes the sheet and updates the grid.

- [ ] **Step 5: Verify favoriting and the WhatsApp CTA**

Click a card's heart icon and confirm it fills in (♡ → ♥) with a visible focus ring on keyboard
`Tab` navigation. Confirm the "WhatsApp" link's `href` (inspect via `read_page` or
`read_network_requests`) points to `https://wa.me/<numero>?text=...` with the property's title
URL-encoded in the query string.

- [ ] **Step 6: Reset viewport and record the result**

Call `resize_window` with `preset: "desktop"`. If every check in Steps 2–5 passes, Bloco 2 is
validated. If anything fails, fix it in the relevant task's files and re-run this task's checks.

---

### Task 19: Documentation update

**Files:**
- Modify: `README.md`

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Document the property dataset and its generator**

Add this section to `README.md`, right after the existing "Gerando frames placeholder do cliente
demo" section:

```markdown
## Imóveis do cliente demo

`content/clients/pioneira/properties.json` tem 8 imóveis de exemplo. Cada imóvel aponta para 3
fotos em `public/clients/pioneira/properties/<id>/photo-{1,2,3}.webp`.

Para gerar as fotos placeholder (gradiente nas cores do tema):

    npm run generate:pioneira-properties

Ao trocar `properties.json` por dados reais de um cliente, gere/produza fotos de verdade nesses
mesmos caminhos — nenhum componente precisa mudar.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document the property dataset and placeholder photo generator

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
