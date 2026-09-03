# Bloco 1 — ThemeProvider + ClientConfig + Hero Frame-Sequence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js project skeleton with a config-driven theme system and a scroll-driven frame-sequence hero (with mandatory fallbacks), validated end-to-end with the demo client `pioneira`.

**Architecture:** A `ClientConfig` object per client (typed, in `/config/clients/<slug>.ts`) drives everything. `ThemeProvider` is a server component that turns `clientConfig.theme` into inline CSS custom properties on a wrapper `<div>` — no flash, no client JS needed for colors. The hero is composed from small, independently testable pieces: pure functions (`lib/hero-frames.ts`, `lib/device.ts`, `lib/theme.ts`) for all the math/decision logic, small hooks (`useMediaQuery`, `useConnectionType`, `useSectionScrollProgress`, `useFramePreloader`) for browser-API glue, and a composition hook (`useScrollFrames`) that wires them together for the two presentational components (`HeroCanvas`, `FramePreloader`) rendered by the orchestrator (`HeroFrameSequence`).

**Tech Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS (CSS-variable-backed theme), Vitest + @testing-library/react (jsdom) for tests, `sharp` + `tsx` (dev-only) to generate placeholder hero frames.

## Global Constraints

- Next.js 14+, App Router, TypeScript — mandatory stack for the whole product.
- No brand color, copy, property data, or image may be hardcoded in a component — everything comes from `clientConfig` (or content JSON, in later blocks) / CSS variables (`var(--token)`).
- The hero must never scrub a `<video>` — only a static WebP frame sequence drawn to `<canvas>`.
- Mandatory, non-negotiable fallback (no scroll-jacking, title visible immediately) when `prefers-reduced-motion: reduce` is set, or `navigator.connection.effectiveType` reports `slow-2g`/`2g`/`3g`.
- "Pular introdução" button is always visible (never hover- or scroll-gated) with a visible keyboard focus ring.
- Mobile samples half the frame sequence (fewer images loaded, more clipped motion — accepted trade-off).
- `prefers-reduced-motion` must be respected everywhere in the app, not only in the hero.
- No Mapbox — it requires a linked credit card. (Not needed until Bloco 4; noted here so no task accidentally reaches for it.)
- Distribution model: single-tenant per deploy. The active client is resolved at build time from `NEXT_PUBLIC_CLIENT_SLUG`, defaulting to `pioneira` if unset or unknown.

---

### Task 1: Scaffold the Next.js + TypeScript + Tailwind project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Produces: a buildable Next.js App Router project other tasks add files into. No exported functions yet.

- [ ] **Step 1: Create the project files**

`package.json`:
```json
{
  "name": "imobiliaria-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "var(--bg-dark)",
        ivory: "var(--ivory)",
        sand: "var(--sand)",
        brass: "var(--brass)",
        brassLight: "var(--brass-light)",
        ink: "var(--ink)",
        inkSoft: "var(--ink-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`.gitignore`:
```
node_modules/
.next/
out/
.env*.local
*.tsbuildinfo
```

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
}

:focus-visible {
  outline: 2px solid var(--brass, #B08D57);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`app/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function HomePage() {
  return <main>Template Imobiliário</main>;
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `package-lock.json` and `node_modules/`.

- [ ] **Step 3: Verify the project builds**

Run: `npm run build`
Expected: ends with `Compiled successfully` and a route summary listing `/`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.mjs tailwind.config.ts postcss.config.js .gitignore app/globals.css app/layout.tsx app/page.tsx
git commit -m "$(cat <<'EOF'
Scaffold Next.js App Router project with Tailwind

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add the Vitest test harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: a working `npm test` command every later task's tests run under (jsdom environment, `@testing-library/jest-dom` matchers, `@/*` path alias).

- [ ] **Step 1: Add test dependencies to `package.json`**

Add to `devDependencies` (keep everything already listed from Task 1):
```json
"vitest": "^1.6.0",
"jsdom": "^24.0.0",
"@vitejs/plugin-react": "^4.2.0",
"@testing-library/react": "^15.0.0",
"@testing-library/jest-dom": "^6.4.0"
```

- [ ] **Step 2: Create the Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`lib/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Install and run**

Run: `npm install`
Run: `npx vitest run`
Expected: `1 passed` (the smoke test).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts lib/__tests__/smoke.test.ts
git commit -m "$(cat <<'EOF'
Add Vitest test harness with jsdom and testing-library

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: ClientConfig types + `pioneira` demo config + active-client resolver

**Files:**
- Create: `config/types.ts`
- Create: `config/clients/pioneira.ts`
- Create: `config/active-client.ts`
- Test: `config/__tests__/active-client.test.ts`

**Interfaces:**
- Produces: `ClientConfig`, `ClientBrand`, `ClientTheme`, `ClientHero`, `HeroPhase`, `ClientContact` types (from `config/types.ts`); `activeClientConfig: ClientConfig` (from `config/active-client.ts`) — the single source every later task reads brand/theme/hero/contact from.

- [ ] **Step 1: Write the failing test**

`config/__tests__/active-client.test.ts`:
```ts
import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("activeClientConfig", () => {
  it("resolves the pioneira config when no slug is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("pioneira");
  });

  it("falls back to pioneira for an unknown slug", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "does-not-exist");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("pioneira");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run config/__tests__/active-client.test.ts`
Expected: FAIL — `Cannot find module '@/config/active-client'`.

- [ ] **Step 3: Implement the config types, demo config, and resolver**

`config/types.ts`:
```ts
export interface ClientBrand {
  name: string;
  slogan: string;
  logoUrl: string;
  creci: string;
}

export interface ClientTheme {
  bgDark: string;
  ivory: string;
  sand: string;
  brass: string;
  brassLight: string;
  ink: string;
  inkSoft: string;
  fontDisplay: string;
  fontBody: string;
}

export interface HeroPhase {
  label: string;
  scrollRange: [number, number];
}

export interface ClientHero {
  mode: "frame-sequence" | "static-image";
  framesPath: string;
  frameCount: number;
  fallbackImage: string;
  phases: HeroPhase[];
}

export interface ClientContact {
  whatsapp: string;
  address: string;
  mapStyle: string;
}

export interface ClientConfig {
  slug: string;
  brand: ClientBrand;
  theme: ClientTheme;
  hero: ClientHero;
  contact: ClientContact;
}
```

`config/clients/pioneira.ts`:
```ts
import type { ClientConfig } from "../types";

export const clientConfig = {
  slug: "pioneira",
  brand: {
    name: "Pioneira Imóveis",
    slogan: "Cada endereço, uma história para construir.",
    logoUrl: "/clients/pioneira/logo.svg",
    creci: "CRECI 12345-J",
  },
  theme: {
    bgDark: "#14201A",
    ivory: "#F6F1E7",
    sand: "#EAE1CB",
    brass: "#B08D57",
    brassLight: "#D9C7A3",
    ink: "#1F2420",
    inkSoft: "#54604F",
    fontDisplay: "Fraunces",
    fontBody: "Manrope",
  },
  hero: {
    mode: "frame-sequence",
    framesPath: "/clients/pioneira/hero-frames/",
    frameCount: 90,
    fallbackImage: "/clients/pioneira/hero-fallback.webp",
    phases: [
      { label: "Vista aérea", scrollRange: [0, 0.5] },
      { label: "Fachada", scrollRange: [0.5, 1.0] },
    ],
  },
  contact: {
    whatsapp: "5541999999999",
    address: "Rua das Araucárias, 480 — Curitiba, PR",
    mapStyle: "dark-gold",
  },
} satisfies ClientConfig;
```

`config/active-client.ts`:
```ts
import type { ClientConfig } from "./types";
import { clientConfig as pioneira } from "./clients/pioneira";

const clients: Record<string, ClientConfig> = {
  pioneira,
};

function resolveActiveClientConfig(): ClientConfig {
  const slug = process.env.NEXT_PUBLIC_CLIENT_SLUG;
  if (slug && clients[slug]) {
    return clients[slug];
  }
  return pioneira;
}

export const activeClientConfig: ClientConfig = resolveActiveClientConfig();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run config/__tests__/active-client.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add config
git commit -m "$(cat <<'EOF'
Add ClientConfig types, pioneira demo config, and active-client resolver

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Theme → CSS-variable builder

**Files:**
- Create: `lib/theme.ts`
- Test: `lib/__tests__/theme.test.ts`

**Interfaces:**
- Consumes: `ClientTheme` (from `config/types.ts`, Task 3).
- Produces: `buildThemeCssVars(theme: ClientTheme): Record<string, string>` — used by `ThemeProvider` (Task 5).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/theme.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildThemeCssVars } from "@/lib/theme";
import type { ClientTheme } from "@/config/types";

const sampleTheme: ClientTheme = {
  bgDark: "#111111",
  ivory: "#eeeeee",
  sand: "#dddddd",
  brass: "#b08d57",
  brassLight: "#d9c7a3",
  ink: "#222222",
  inkSoft: "#333333",
  fontDisplay: "Fraunces",
  fontBody: "Manrope",
};

describe("buildThemeCssVars", () => {
  it("maps every theme token to its CSS custom property", () => {
    expect(buildThemeCssVars(sampleTheme)).toEqual({
      "--bg-dark": "#111111",
      "--ivory": "#eeeeee",
      "--sand": "#dddddd",
      "--brass": "#b08d57",
      "--brass-light": "#d9c7a3",
      "--ink": "#222222",
      "--ink-soft": "#333333",
      "--font-display": "Fraunces",
      "--font-body": "Manrope",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/theme.test.ts`
Expected: FAIL — `Cannot find module '@/lib/theme'`.

- [ ] **Step 3: Implement**

`lib/theme.ts`:
```ts
import type { ClientTheme } from "@/config/types";

const COLOR_KEY_TO_VAR: Record<
  "bgDark" | "ivory" | "sand" | "brass" | "brassLight" | "ink" | "inkSoft",
  string
> = {
  bgDark: "--bg-dark",
  ivory: "--ivory",
  sand: "--sand",
  brass: "--brass",
  brassLight: "--brass-light",
  ink: "--ink",
  inkSoft: "--ink-soft",
};

export function buildThemeCssVars(theme: ClientTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(COLOR_KEY_TO_VAR) as [
    keyof typeof COLOR_KEY_TO_VAR,
    string
  ][]) {
    vars[cssVar] = theme[key];
  }
  vars["--font-display"] = theme.fontDisplay;
  vars["--font-body"] = theme.fontBody;
  return vars;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/theme.ts lib/__tests__/theme.test.ts
git commit -m "$(cat <<'EOF'
Add pure theme-to-CSS-variables builder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `ThemeProvider` component + wire into the root layout

**Files:**
- Create: `components/theme/ThemeProvider.tsx`
- Test: `components/theme/__tests__/ThemeProvider.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `buildThemeCssVars` (Task 4), `ClientTheme`/`activeClientConfig` (Task 3).
- Produces: `ThemeProvider({ theme, children })` — every later section of the site renders inside this wrapper and can use Tailwind classes like `bg-bgDark`, `text-ivory`, `font-display`.

- [ ] **Step 1: Write the failing test**

`components/theme/__tests__/ThemeProvider.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { ClientTheme } from "@/config/types";

const theme: ClientTheme = {
  bgDark: "#111111",
  ivory: "#eeeeee",
  sand: "#dddddd",
  brass: "#b08d57",
  brassLight: "#d9c7a3",
  ink: "#222222",
  inkSoft: "#333333",
  fontDisplay: "Fraunces",
  fontBody: "Manrope",
};

describe("ThemeProvider", () => {
  it("injects theme tokens as CSS variables on its wrapper", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <p>conteúdo</p>
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--bg-dark")).toBe("#111111");
    expect(wrapper.style.getPropertyValue("--font-display")).toBe("Fraunces");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/theme/__tests__/ThemeProvider.test.tsx`
Expected: FAIL — `Cannot find module '@/components/theme/ThemeProvider'`.

- [ ] **Step 3: Implement and wire into the layout**

`components/theme/ThemeProvider.tsx`:
```tsx
import type { CSSProperties, ReactNode } from "react";
import type { ClientTheme } from "@/config/types";
import { buildThemeCssVars } from "@/lib/theme";

interface ThemeProviderProps {
  theme: ClientTheme;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVars = buildThemeCssVars(theme) as CSSProperties;

  return (
    <div style={cssVars} className="min-h-screen bg-bgDark font-body text-ivory">
      {children}
    </div>
  );
}
```

`app/layout.tsx` (replace entirely):
```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { activeClientConfig } from "@/config/active-client";
import "./globals.css";

export const metadata: Metadata = {
  title: activeClientConfig.brand.name,
  description: activeClientConfig.brand.slogan,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider theme={activeClientConfig.theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run test to verify it passes, then verify the build**

Run: `npx vitest run components/theme/__tests__/ThemeProvider.test.tsx`
Expected: PASS.

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/theme app/layout.tsx
git commit -m "$(cat <<'EOF'
Add ThemeProvider and wire it into the root layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `useMediaQuery` hook

**Files:**
- Create: `hooks/useMediaQuery.ts`
- Test: `hooks/__tests__/useMediaQuery.test.ts`

**Interfaces:**
- Produces: `useMediaQuery(query: string): boolean` — used for both mobile detection (`(max-width: 767px)`) and reduced-motion detection (`(prefers-reduced-motion: reduce)`) by `useScrollFrames` (Task 14).

- [ ] **Step 1: Write the failing test**

`hooks/__tests__/useMediaQuery.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<() => void> = [];
  let matches = initialMatches;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.push(listener),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  return {
    setMatches: (value: boolean) => {
      matches = value;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("returns the current match state and reacts to changes", () => {
    const { setMatches } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);

    act(() => setMatches(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/__tests__/useMediaQuery.test.ts`
Expected: FAIL — `Cannot find module '@/hooks/useMediaQuery'`.

- [ ] **Step 3: Implement**

`hooks/useMediaQuery.ts`:
```ts
"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/__tests__/useMediaQuery.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useMediaQuery.ts hooks/__tests__/useMediaQuery.test.ts
git commit -m "$(cat <<'EOF'
Add useMediaQuery hook for mobile and reduced-motion detection

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `useConnectionType` hook

**Files:**
- Create: `hooks/useConnectionType.ts`
- Test: `hooks/__tests__/useConnectionType.test.ts`

**Interfaces:**
- Produces: `useConnectionType(): EffectiveConnectionType | undefined`, and the exported type `EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g"` — consumed by `useScrollFrames` (Task 14) and by `shouldShowHeroFallback` (Task 8).

- [ ] **Step 1: Write the failing test**

`hooks/__tests__/useConnectionType.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConnectionType } from "@/hooks/useConnectionType";

afterEach(() => {
  // @ts-expect-error -- test-only cleanup of a non-standard Navigator field
  delete navigator.connection;
});

describe("useConnectionType", () => {
  it("reads the effective type from navigator.connection when present", () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "3g" },
    });

    const { result } = renderHook(() => useConnectionType());
    expect(result.current).toBe("3g");
  });

  it("returns undefined when navigator.connection is not available", () => {
    const { result } = renderHook(() => useConnectionType());
    expect(result.current).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/__tests__/useConnectionType.test.ts`
Expected: FAIL — `Cannot find module '@/hooks/useConnectionType'`.

- [ ] **Step 3: Implement**

`hooks/useConnectionType.ts`:
```ts
"use client";
import { useEffect, useState } from "react";

export type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";

interface NetworkInformation {
  effectiveType?: EffectiveConnectionType;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as NavigatorWithConnection).connection;
}

export function useConnectionType(): EffectiveConnectionType | undefined {
  const [effectiveType, setEffectiveType] = useState<EffectiveConnectionType | undefined>(
    () => getConnection()?.effectiveType
  );

  useEffect(() => {
    const connection = getConnection();
    if (!connection?.addEventListener) return;
    const handleChange = () => setEffectiveType(connection.effectiveType);
    connection.addEventListener("change", handleChange);
    return () => connection.removeEventListener?.("change", handleChange);
  }, []);

  return effectiveType;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/__tests__/useConnectionType.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useConnectionType.ts hooks/__tests__/useConnectionType.test.ts
git commit -m "$(cat <<'EOF'
Add useConnectionType hook for network-aware hero fallback

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `shouldShowHeroFallback` pure function

**Files:**
- Create: `lib/device.ts`
- Test: `lib/__tests__/device.test.ts`

**Interfaces:**
- Consumes: `EffectiveConnectionType` (Task 7).
- Produces: `shouldShowHeroFallback(prefersReducedMotion: boolean, connection: { effectiveType?: EffectiveConnectionType } | undefined): boolean` — consumed by `useScrollFrames` (Task 14).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/device.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { shouldShowHeroFallback } from "@/lib/device";

describe("shouldShowHeroFallback", () => {
  it("is true whenever the user prefers reduced motion, regardless of connection", () => {
    expect(shouldShowHeroFallback(true, { effectiveType: "4g" })).toBe(true);
    expect(shouldShowHeroFallback(true, undefined)).toBe(true);
  });

  it("is true on slow connections even without reduced motion", () => {
    expect(shouldShowHeroFallback(false, { effectiveType: "slow-2g" })).toBe(true);
    expect(shouldShowHeroFallback(false, { effectiveType: "2g" })).toBe(true);
    expect(shouldShowHeroFallback(false, { effectiveType: "3g" })).toBe(true);
  });

  it("is false on a fast connection with no reduced-motion preference", () => {
    expect(shouldShowHeroFallback(false, { effectiveType: "4g" })).toBe(false);
  });

  it("is false when connection info is unavailable and motion is not reduced", () => {
    expect(shouldShowHeroFallback(false, undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/device.test.ts`
Expected: FAIL — `Cannot find module '@/lib/device'`.

- [ ] **Step 3: Implement**

`lib/device.ts`:
```ts
import type { EffectiveConnectionType } from "@/hooks/useConnectionType";

const SLOW_CONNECTION_TYPES: EffectiveConnectionType[] = ["slow-2g", "2g", "3g"];

export function shouldShowHeroFallback(
  prefersReducedMotion: boolean,
  connection: { effectiveType?: EffectiveConnectionType } | undefined
): boolean {
  if (prefersReducedMotion) return true;
  if (connection?.effectiveType && SLOW_CONNECTION_TYPES.includes(connection.effectiveType)) {
    return true;
  }
  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/device.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/device.ts lib/__tests__/device.test.ts
git commit -m "$(cat <<'EOF'
Add shouldShowHeroFallback decision function

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Frame-index and scroll-progress math

**Files:**
- Create: `lib/hero-frames.ts`
- Test: `lib/__tests__/hero-frames.test.ts`

**Interfaces:**
- Produces: `computeFrameIndex(scrollProgress: number, frameCount: number, isMobile: boolean): number` and `computeScrollProgress(scrollY: number, sectionTop: number, scrollableHeight: number): number` — consumed by `useSectionScrollProgress` (Task 10) and `useScrollFrames` (Task 14).

- [ ] **Step 1: Write the failing test**

`lib/__tests__/hero-frames.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeFrameIndex, computeScrollProgress } from "@/lib/hero-frames";

describe("computeFrameIndex", () => {
  it("maps progress 0 to the first frame and progress 1 to the last frame on desktop", () => {
    expect(computeFrameIndex(0, 90, false)).toBe(0);
    expect(computeFrameIndex(1, 90, false)).toBe(89);
  });

  it("clamps out-of-range progress values", () => {
    expect(computeFrameIndex(-0.5, 90, false)).toBe(0);
    expect(computeFrameIndex(1.5, 90, false)).toBe(89);
  });

  it("samples every other frame on mobile, staying within bounds", () => {
    expect(computeFrameIndex(0, 90, true)).toBe(0);
    expect(computeFrameIndex(1, 90, true)).toBe(88);
    expect(computeFrameIndex(0.5, 90, true)).toBe(44);
  });

  it("always returns frame 0 for a single-frame sequence", () => {
    expect(computeFrameIndex(1, 1, false)).toBe(0);
  });
});

describe("computeScrollProgress", () => {
  it("is 0 before the section starts scrolling", () => {
    expect(computeScrollProgress(0, 0, 1000)).toBe(0);
  });

  it("is 1 once the scrollable height has been fully consumed", () => {
    expect(computeScrollProgress(1000, 0, 1000)).toBe(1);
  });

  it("is proportional in between", () => {
    expect(computeScrollProgress(500, 0, 1000)).toBe(0.5);
  });

  it("clamps to [0, 1] outside the section's range", () => {
    expect(computeScrollProgress(-100, 0, 1000)).toBe(0);
    expect(computeScrollProgress(2000, 0, 1000)).toBe(1);
  });

  it("returns 0 when the section has no scrollable height", () => {
    expect(computeScrollProgress(100, 0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/hero-frames.test.ts`
Expected: FAIL — `Cannot find module '@/lib/hero-frames'`.

- [ ] **Step 3: Implement**

`lib/hero-frames.ts`:
```ts
export function computeFrameIndex(
  scrollProgress: number,
  frameCount: number,
  isMobile: boolean
): number {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  if (frameCount <= 1) return 0;

  if (!isMobile) {
    return Math.floor(clampedProgress * (frameCount - 1));
  }

  const step = 2;
  const effectiveCount = Math.ceil(frameCount / step);
  const sampledIndex = Math.floor(clampedProgress * (effectiveCount - 1));
  return Math.min(sampledIndex * step, frameCount - 1);
}

export function computeScrollProgress(
  scrollY: number,
  sectionTop: number,
  scrollableHeight: number
): number {
  if (scrollableHeight <= 0) return 0;
  const raw = (scrollY - sectionTop) / scrollableHeight;
  return Math.min(Math.max(raw, 0), 1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/hero-frames.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/hero-frames.ts lib/__tests__/hero-frames.test.ts
git commit -m "$(cat <<'EOF'
Add pure frame-index and scroll-progress math for the hero

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `useSectionScrollProgress` hook

**Files:**
- Create: `hooks/useSectionScrollProgress.ts`
- Test: `hooks/__tests__/useSectionScrollProgress.test.ts`

**Interfaces:**
- Consumes: `computeScrollProgress` (Task 9).
- Produces: `useSectionScrollProgress(sectionRef: RefObject<HTMLElement>): number` — consumed by `useScrollFrames` (Task 14).

- [ ] **Step 1: Write the failing test**

`hooks/__tests__/useSectionScrollProgress.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";

describe("useSectionScrollProgress", () => {
  it("returns 0 for the initial measurement before any real scrolling happens", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useSectionScrollProgress(ref);
    });
    expect(result.current).toBe(0);
  });
});
```

This hook does real DOM measurement (`getBoundingClientRect`, scroll/resize listeners with rAF
throttling) that jsdom cannot meaningfully simulate — its scroll-driven behavior is verified
manually in the browser in Task 18. This test only locks in the safe initial value.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/__tests__/useSectionScrollProgress.test.ts`
Expected: FAIL — `Cannot find module '@/hooks/useSectionScrollProgress'`.

- [ ] **Step 3: Implement**

`hooks/useSectionScrollProgress.ts`:
```ts
"use client";
import { useEffect, useState, type RefObject } from "react";
import { computeScrollProgress } from "@/lib/hero-frames";

export function useSectionScrollProgress(sectionRef: RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId: number | null = null;

    const measure = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      setProgress(computeScrollProgress(window.scrollY, sectionTop, scrollableHeight));
    };

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [sectionRef]);

  return progress;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/__tests__/useSectionScrollProgress.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useSectionScrollProgress.ts hooks/__tests__/useSectionScrollProgress.test.ts
git commit -m "$(cat <<'EOF'
Add useSectionScrollProgress hook

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Placeholder hero-frame generator for the demo client

**Files:**
- Modify: `package.json`
- Create: `scripts/generate-placeholder-frames.ts`
- Test: `scripts/__tests__/generate-placeholder-frames.test.ts`

**Interfaces:**
- Consumes: `clientConfig` from `config/clients/pioneira.ts` (Task 3).
- Produces: `public/clients/pioneira/hero-frames/frame-001.webp` … `frame-090.webp` and
  `public/clients/pioneira/hero-fallback.webp` — consumed by `useFramePreloader` (Task 12) and
  `HeroCanvas`'s fallback `<img>` (Task 15). Exports `lerpColor(from: string, to: string, t: number): string` for testing.

- [ ] **Step 1: Add generator dependencies and the npm script**

Add to `package.json` `devDependencies`:
```json
"sharp": "^0.33.0",
"tsx": "^4.7.0"
```

Add to `package.json` `scripts`:
```json
"generate:pioneira-frames": "tsx scripts/generate-placeholder-frames.ts"
```

- [ ] **Step 2: Write the failing test for the pure color-interpolation helper**

`scripts/__tests__/generate-placeholder-frames.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { lerpColor } from "@/scripts/generate-placeholder-frames";

describe("lerpColor", () => {
  it("returns the start color at t=0", () => {
    expect(lerpColor("#000000", "#ffffff", 0)).toBe("rgb(0, 0, 0)");
  });

  it("returns the end color at t=1", () => {
    expect(lerpColor("#000000", "#ffffff", 1)).toBe("rgb(255, 255, 255)");
  });

  it("interpolates at the midpoint", () => {
    expect(lerpColor("#000000", "#ffffff", 0.5)).toBe("rgb(128, 128, 128)");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm install`
Run: `npx vitest run scripts/__tests__/generate-placeholder-frames.test.ts`
Expected: FAIL — `Cannot find module '@/scripts/generate-placeholder-frames'`.

- [ ] **Step 4: Implement the generator script**

`scripts/generate-placeholder-frames.ts`:
```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { clientConfig } from "../config/clients/pioneira";

const OUTPUT_DIR = path.join(process.cwd(), "public", "clients", "pioneira", "hero-frames");
const FALLBACK_PATH = path.join(process.cwd(), "public", "clients", "pioneira", "hero-fallback.webp");
const WIDTH = 1600;
const HEIGHT = 900;

export function lerpColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(from.replace("#", ""));
  const [r2, g2, b2] = parse(to.replace("#", ""));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

async function generateFrame(index: number, total: number): Promise<Buffer> {
  const t = total <= 1 ? 0 : index / (total - 1);
  const background = lerpColor(clientConfig.theme.bgDark, clientConfig.theme.brass, t);
  const label = `Frame ${String(index + 1).padStart(3, "0")} / ${total} — placeholder`;
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="42" fill="${clientConfig.theme.ivory}">
        ${label}
      </text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).webp({ quality: 70 }).toBuffer();
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const { frameCount } = clientConfig.hero;

  for (let i = 0; i < frameCount; i++) {
    const buffer = await generateFrame(i, frameCount);
    const fileName = `frame-${String(i + 1).padStart(3, "0")}.webp`;
    await writeFile(path.join(OUTPUT_DIR, fileName), buffer);
  }

  const fallback = await generateFrame(Math.floor(frameCount / 2), frameCount);
  await writeFile(FALLBACK_PATH, fallback);

  console.log(`Generated ${frameCount} placeholder frames + 1 fallback image.`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-placeholder-frames.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
```

The `process.argv[1]` guard keeps `main()` from running when the module is imported by the
Vitest test above — only direct execution via `tsx` triggers generation.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run scripts/__tests__/generate-placeholder-frames.test.ts`
Expected: PASS.

- [ ] **Step 6: Generate the demo assets and verify the count**

Run: `npm run generate:pioneira-frames`
Expected: prints `Generated 90 placeholder frames + 1 fallback image.`

Run (Bash, from project root): `ls public/clients/pioneira/hero-frames | wc -l`
Expected: `90`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts public/clients/pioneira
git commit -m "$(cat <<'EOF'
Add placeholder hero-frame generator and generate demo assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `useFramePreloader` hook

**Files:**
- Create: `hooks/useFramePreloader.ts`
- Test: `hooks/__tests__/useFramePreloader.test.ts`

**Interfaces:**
- Produces: `useFramePreloader(framesPath: string, frameCount: number): { images: HTMLImageElement[]; loadedCount: number; progress: number; isComplete: boolean }` — consumed by `useScrollFrames` (Task 14).

- [ ] **Step 1: Write the failing test**

`hooks/__tests__/useFramePreloader.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFramePreloader } from "@/hooks/useFramePreloader";

class MockImage {
  onload: (() => void) | null = null;
  private _src = "";
  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}

beforeEach(() => {
  vi.stubGlobal("Image", MockImage as unknown as typeof Image);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFramePreloader", () => {
  it("reports progress as frames finish loading and completes at 100%", async () => {
    const { result } = renderHook(() => useFramePreloader("/frames/", 3));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.loadedCount).toBe(3);
    expect(result.current.progress).toBe(1);
    expect(result.current.images).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run hooks/__tests__/useFramePreloader.test.ts`
Expected: FAIL — `Cannot find module '@/hooks/useFramePreloader'`.

- [ ] **Step 3: Implement**

`hooks/useFramePreloader.ts`:
```ts
"use client";
import { useEffect, useState } from "react";

interface FramePreloaderState {
  images: HTMLImageElement[];
  loadedCount: number;
  progress: number;
  isComplete: boolean;
}

export function useFramePreloader(framesPath: string, frameCount: number): FramePreloaderState {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const nextImages: HTMLImageElement[] = new Array(frameCount);
    setImages([]);
    setLoadedCount(0);

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const frameNumber = String(i + 1).padStart(3, "0");
      img.src = `${framesPath}frame-${frameNumber}.webp`;
      img.onload = () => {
        if (cancelled) return;
        nextImages[i] = img;
        setImages([...nextImages]);
        setLoadedCount((count) => count + 1);
      };
      nextImages[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, [framesPath, frameCount]);

  const progress = frameCount === 0 ? 1 : loadedCount / frameCount;

  return {
    images,
    loadedCount,
    progress,
    isComplete: frameCount > 0 && loadedCount >= frameCount,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run hooks/__tests__/useFramePreloader.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useFramePreloader.ts hooks/__tests__/useFramePreloader.test.ts
git commit -m "$(cat <<'EOF'
Add useFramePreloader hook for batched hero-frame loading

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: `FramePreloader` presentational component

**Files:**
- Create: `components/hero-frame-sequence/FramePreloader.tsx`
- Test: `components/hero-frame-sequence/__tests__/FramePreloader.test.tsx`

**Interfaces:**
- Produces: `FramePreloader({ progress: number })` — rendered by `HeroFrameSequence` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/hero-frame-sequence/__tests__/FramePreloader.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FramePreloader } from "@/components/hero-frame-sequence/FramePreloader";

describe("FramePreloader", () => {
  it("shows a progress bar with the current percentage while loading", () => {
    render(<FramePreloader progress={0.4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
  });

  it("renders nothing once loading is complete", () => {
    const { container } = render(<FramePreloader progress={1} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/hero-frame-sequence/__tests__/FramePreloader.test.tsx`
Expected: FAIL — `Cannot find module '@/components/hero-frame-sequence/FramePreloader'`.

- [ ] **Step 3: Implement**

`components/hero-frame-sequence/FramePreloader.tsx`:
```tsx
interface FramePreloaderProps {
  progress: number;
}

export function FramePreloader({ progress }: FramePreloaderProps) {
  if (progress >= 1) return null;
  const percent = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Carregando sequência do hero"
      className="absolute bottom-6 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-black/20"
    >
      <div
        className="h-full bg-brassLight transition-[width] duration-150"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/hero-frame-sequence/__tests__/FramePreloader.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hero-frame-sequence/FramePreloader.tsx components/hero-frame-sequence/__tests__/FramePreloader.test.tsx
git commit -m "$(cat <<'EOF'
Add FramePreloader progress indicator component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: `useScrollFrames` composition hook

**Files:**
- Create: `components/hero-frame-sequence/useScrollFrames.ts`
- Test: `components/hero-frame-sequence/__tests__/useScrollFrames.test.ts`

**Interfaces:**
- Consumes: `useMediaQuery` (Task 6), `useConnectionType` (Task 7), `useSectionScrollProgress` (Task 10), `useFramePreloader` (Task 12), `shouldShowHeroFallback` (Task 8), `computeFrameIndex` (Task 9), `ClientHero` (Task 3).
- Produces: `useScrollFrames(sectionRef: RefObject<HTMLElement>, hero: ClientHero): { frameIndex: number; currentImage: HTMLImageElement | undefined; preloadProgress: number; showFallback: boolean }` — consumed by `HeroFrameSequence` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/hero-frame-sequence/__tests__/useScrollFrames.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import type { ClientHero } from "@/config/types";

vi.mock("@/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(),
}));
vi.mock("@/hooks/useConnectionType", () => ({
  useConnectionType: vi.fn(() => undefined),
}));
vi.mock("@/hooks/useSectionScrollProgress", () => ({
  useSectionScrollProgress: vi.fn(() => 0.5),
}));
vi.mock("@/hooks/useFramePreloader", () => ({
  useFramePreloader: vi.fn(() => ({ images: [], loadedCount: 0, progress: 1, isComplete: true })),
}));

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollFrames } from "@/components/hero-frame-sequence/useScrollFrames";

const hero: ClientHero = {
  mode: "frame-sequence",
  framesPath: "/frames/",
  frameCount: 10,
  fallbackImage: "/fallback.webp",
  phases: [],
};

describe("useScrollFrames", () => {
  it("shows the fallback when the user prefers reduced motion", () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { result } = renderHook(() => useScrollFrames(useRef(null), hero));
    expect(result.current.showFallback).toBe(true);
  });

  it("computes a frame index from scroll progress when not falling back", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { result } = renderHook(() => useScrollFrames(useRef(null), hero));
    expect(result.current.showFallback).toBe(false);
    expect(result.current.frameIndex).toBe(4);
  });

  it("always shows the fallback for a static-image hero", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { result } = renderHook(() =>
      useScrollFrames(useRef(null), { ...hero, mode: "static-image" })
    );
    expect(result.current.showFallback).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/hero-frame-sequence/__tests__/useScrollFrames.test.ts`
Expected: FAIL — `Cannot find module '@/components/hero-frame-sequence/useScrollFrames'`.

- [ ] **Step 3: Implement**

`components/hero-frame-sequence/useScrollFrames.ts`:
```ts
"use client";
import type { RefObject } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useConnectionType } from "@/hooks/useConnectionType";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { shouldShowHeroFallback } from "@/lib/device";
import { computeFrameIndex } from "@/lib/hero-frames";
import type { ClientHero } from "@/config/types";

interface UseScrollFramesResult {
  frameIndex: number;
  currentImage: HTMLImageElement | undefined;
  preloadProgress: number;
  showFallback: boolean;
}

export function useScrollFrames(
  sectionRef: RefObject<HTMLElement>,
  hero: ClientHero
): UseScrollFramesResult {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const effectiveType = useConnectionType();
  const scrollProgress = useSectionScrollProgress(sectionRef);
  const { images, progress: preloadProgress } = useFramePreloader(
    hero.framesPath,
    hero.frameCount
  );

  const showFallback =
    hero.mode === "static-image" ||
    shouldShowHeroFallback(prefersReducedMotion, effectiveType ? { effectiveType } : undefined);

  const frameIndex = computeFrameIndex(scrollProgress, hero.frameCount, isMobile);

  return {
    frameIndex,
    currentImage: images[frameIndex],
    preloadProgress,
    showFallback,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/hero-frame-sequence/__tests__/useScrollFrames.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hero-frame-sequence/useScrollFrames.ts components/hero-frame-sequence/__tests__/useScrollFrames.test.ts
git commit -m "$(cat <<'EOF'
Add useScrollFrames composition hook wiring hero logic together

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: `HeroCanvas` presentational component

**Files:**
- Create: `components/hero-frame-sequence/HeroCanvas.tsx`
- Test: `components/hero-frame-sequence/__tests__/HeroCanvas.test.tsx`

**Interfaces:**
- Produces: `HeroCanvas({ currentImage, showFallback, fallbackImage, brandName, onSkip })` — rendered by `HeroFrameSequence` (Task 16).

- [ ] **Step 1: Write the failing test**

`components/hero-frame-sequence/__tests__/HeroCanvas.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroCanvas } from "@/components/hero-frame-sequence/HeroCanvas";

describe("HeroCanvas", () => {
  it("renders the fallback image and an always-visible skip button", () => {
    const onSkip = vi.fn();
    render(
      <HeroCanvas
        currentImage={undefined}
        showFallback={true}
        fallbackImage="/fallback.webp"
        brandName="Pioneira Imóveis"
        onSkip={onSkip}
      />
    );

    expect(screen.getByRole("img", { name: /pioneira imóveis/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("renders a canvas element when not showing the fallback", () => {
    const { container } = render(
      <HeroCanvas
        currentImage={undefined}
        showFallback={false}
        fallbackImage="/fallback.webp"
        brandName="Pioneira Imóveis"
        onSkip={() => {}}
      />
    );
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/hero-frame-sequence/__tests__/HeroCanvas.test.tsx`
Expected: FAIL — `Cannot find module '@/components/hero-frame-sequence/HeroCanvas'`.

- [ ] **Step 3: Implement**

`components/hero-frame-sequence/HeroCanvas.tsx`:
```tsx
"use client";
import { useEffect, useRef } from "react";

interface HeroCanvasProps {
  currentImage: HTMLImageElement | undefined;
  showFallback: boolean;
  fallbackImage: string;
  brandName: string;
  onSkip: () => void;
}

export function HeroCanvas({
  currentImage,
  showFallback,
  fallbackImage,
  brandName,
  onSkip,
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showFallback || !currentImage) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = currentImage.naturalWidth || canvas.clientWidth;
    canvas.height = currentImage.naturalHeight || canvas.clientHeight;
    context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
  }, [currentImage, showFallback]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bgDark">
      {showFallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackImage}
          alt={`${brandName} — fachada`}
          className="h-full w-full object-cover"
        />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full object-cover" aria-hidden="true" />
      )}
      <button
        type="button"
        onClick={onSkip}
        className="absolute right-6 top-6 z-10 rounded-full bg-black/40 px-4 py-2 text-sm text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
      >
        Pular introdução
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/hero-frame-sequence/__tests__/HeroCanvas.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hero-frame-sequence/HeroCanvas.tsx components/hero-frame-sequence/__tests__/HeroCanvas.test.tsx
git commit -m "$(cat <<'EOF'
Add HeroCanvas presentational component with fallback and skip button

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: `HeroFrameSequence` orchestrator

**Files:**
- Create: `components/hero-frame-sequence/HeroFrameSequence.tsx`
- Test: `components/hero-frame-sequence/__tests__/HeroFrameSequence.test.tsx`

**Interfaces:**
- Consumes: `useScrollFrames` (Task 14), `HeroCanvas` (Task 15), `FramePreloader` (Task 13), `ClientBrand`/`ClientHero` (Task 3).
- Produces: `HeroFrameSequence({ brand, hero })` — rendered by `app/page.tsx` (Task 17).

- [ ] **Step 1: Write the failing test**

`components/hero-frame-sequence/__tests__/HeroFrameSequence.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ClientBrand, ClientHero } from "@/config/types";

vi.mock("@/components/hero-frame-sequence/useScrollFrames", () => ({
  useScrollFrames: vi.fn(() => ({
    frameIndex: 0,
    currentImage: undefined,
    preloadProgress: 1,
    showFallback: false,
  })),
}));

import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";

const brand: ClientBrand = {
  name: "Pioneira Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/logo.svg",
  creci: "CRECI 12345-J",
};

const hero: ClientHero = {
  mode: "frame-sequence",
  framesPath: "/frames/",
  frameCount: 90,
  fallbackImage: "/fallback.webp",
  phases: [],
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '<div id="imoveis"></div>';
});

describe("HeroFrameSequence", () => {
  it("renders the brand name and slogan", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    expect(screen.getByText(brand.name)).toBeInTheDocument();
    expect(screen.getByText(brand.slogan)).toBeInTheDocument();
  });

  it("scrolls the properties section into view when skip is clicked", () => {
    render(<HeroFrameSequence brand={brand} hero={hero} />);
    fireEvent.click(screen.getByRole("button", { name: /pular introdução/i }));
    expect(document.getElementById("imoveis")?.scrollIntoView).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/hero-frame-sequence/__tests__/HeroFrameSequence.test.tsx`
Expected: FAIL — `Cannot find module '@/components/hero-frame-sequence/HeroFrameSequence'`.

- [ ] **Step 3: Implement**

`components/hero-frame-sequence/HeroFrameSequence.tsx`:
```tsx
"use client";
import { useRef } from "react";
import { useScrollFrames } from "./useScrollFrames";
import { HeroCanvas } from "./HeroCanvas";
import { FramePreloader } from "./FramePreloader";
import type { ClientBrand, ClientHero } from "@/config/types";

interface HeroFrameSequenceProps {
  brand: ClientBrand;
  hero: ClientHero;
}

export function HeroFrameSequence({ brand, hero }: HeroFrameSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { currentImage, preloadProgress, showFallback } = useScrollFrames(sectionRef, hero);

  const handleSkip = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("imoveis")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen w-full">
        <HeroCanvas
          currentImage={currentImage}
          showFallback={showFallback}
          fallbackImage={hero.fallbackImage}
          brandName={brand.name}
          onSkip={handleSkip}
        />
        <FramePreloader progress={preloadProgress} />
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-4xl text-ivory drop-shadow-lg md:text-6xl">
            {brand.name}
          </h1>
          <p className="font-body text-lg text-ivory/90 drop-shadow-lg">{brand.slogan}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/hero-frame-sequence/__tests__/HeroFrameSequence.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hero-frame-sequence/HeroFrameSequence.tsx components/hero-frame-sequence/__tests__/HeroFrameSequence.test.tsx
git commit -m "$(cat <<'EOF'
Add HeroFrameSequence orchestrator component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Wire the hero into the home page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `HeroFrameSequence` (Task 16), `activeClientConfig` (Task 3).

- [ ] **Step 1: Replace the placeholder home page**

`app/page.tsx` (replace entirely):
```tsx
import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";
import { activeClientConfig } from "@/config/active-client";

export default function HomePage() {
  return (
    <main>
      <HeroFrameSequence brand={activeClientConfig.brand} hero={activeClientConfig.hero} />
      <section id="imoveis" className="min-h-screen px-6 py-24">
        <h2 className="font-display text-3xl text-ivory">Imóveis em destaque</h2>
        <p className="mt-4 text-inkSoft">Grid de imóveis chega no próximo bloco.</p>
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
Wire HeroFrameSequence into the home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Manual browser verification

No files change in this task — it validates Tasks 1–17 in a real browser, which is required
before Bloco 1 can be considered done (automated tests cover the logic, not the lived experience).

- [ ] **Step 1: Create a launch config and start the dev server**

Create `.claude/launch.json` (if it doesn't already exist):
```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "imobiliaria-template-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

Start it with the Browser tool's `preview_start` using `name: "imobiliaria-template-dev"`, then
navigate to `http://localhost:3000`.

- [ ] **Step 2: Verify the desktop hero**

- Take a screenshot at the top of the page: the brand name "Pioneira Imóveis" and slogan should
  be visible over a placeholder frame, with the "Pular introdução" button visible in the top-right
  corner (not hidden, no hover needed).
- Scroll down slowly through the hero section and confirm the background visibly changes color
  (the placeholder frames interpolate from dark green to brass) as you scroll — this proves
  `scrollY → frameIndex` is wired correctly.
- Press `Tab` until the skip button receives focus; confirm a visible focus ring appears
  (the `:focus-visible` outline from `app/globals.css`).
- Click "Pular introdução" and confirm the page smooth-scrolls to the `#imoveis` section heading
  "Imóveis em destaque".

- [ ] **Step 3: Verify the mobile viewport**

Use `resize_window` with `preset: "mobile"`, reload, and repeat the scroll check. Confirm the page
still renders without horizontal overflow and the hero still tracks scroll (frames will jump in
larger steps — that is the intended mobile trade-off, not a bug).

Reset with `resize_window` `preset: "desktop"` when done.

- [ ] **Step 4: Verify the fallback path with the browser console**

In the page's JavaScript console (via `javascript_tool`), confirm the reduced-motion query is
readable:
```js
window.matchMedia("(prefers-reduced-motion: reduce)").matches
```
This should return `false` under normal settings. Reduced-motion and slow-connection emulation
require real browser DevTools (the "Rendering" panel's "Emulate CSS media feature
prefers-reduced-motion" and the Network panel's throttling presets) that this tool does not expose
— note in the task follow-up that the user should spot-check those two paths once in their own
browser DevTools, since `shouldShowHeroFallback` and its branch in `useScrollFrames` are already
covered by the Task 8 and Task 14 unit tests.

- [ ] **Step 5: Record the result**

If every check in Steps 2–3 passes, Bloco 1 is validated. If anything fails, fix it in the
relevant task's files (not with a new ad-hoc patch) and re-run this task's checks before moving on.

---

### Task 19: Onboarding docs and roadmap

**Files:**
- Create: `README.md`
- Create: `ROADMAP.md`
- Create: `.env.example`

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Write the files**

`.env.example`:
```
NEXT_PUBLIC_CLIENT_SLUG=pioneira
```

`README.md`:
```markdown
# Template Imobiliário Configurável

Esqueleto Next.js config-driven para imobiliárias. Cada cliente é um deploy separado
apontando para um `clientConfig` — nenhum componente contém marca, cor ou conteúdo fixo.

## Rodando localmente

    npm install
    npm run dev

## Testes

    npm test

## Onboarding de um novo cliente

1. Duplique `config/clients/pioneira.ts` como `config/clients/<slug>.ts` e preencha
   `brand`, `theme`, `hero` e `contact` com os dados reais do cliente.
2. Registre o novo config no mapa `clients` em `config/active-client.ts`.
3. Gere ou produza os frames do hero (WebP, `frame-001.webp`...`frame-NNN.webp`) e a imagem
   de fallback, e coloque-os em `public/clients/<slug>/hero-frames/` e
   `public/clients/<slug>/hero-fallback.webp` conforme `hero.framesPath` e `hero.fallbackImage`.
4. No deploy desse cliente, defina a variável de ambiente `NEXT_PUBLIC_CLIENT_SLUG=<slug>`
   antes do build (veja `.env.example`).

## Gerando frames placeholder do cliente demo

    npm run generate:pioneira-frames

Gera 90 frames em gradiente (cores do tema) + 1 fallback para `pioneira` — só para validar a
mecânica do hero antes de haver fotos reais.

## Roadmap

Ver `ROADMAP.md` para funcionalidades fora do escopo do MVP.
```

`ROADMAP.md`:
```markdown
# Roadmap (fora do escopo do MVP)

- Chat com IA para busca de imóveis
- Comparador de imóveis lado a lado
- Favoritos com notificação por e-mail
- Dashboard do corretor
- Modo "match" estilo swipe
- Multi-tenant por domínio único (um app servindo vários clientes via middleware/host,
  em vez do modelo atual de um deploy por cliente)
- Upgrade de mapa para MapTiler (estilos dark mais polidos que o filtro CSS sobre
  OpenStreetMap), caso um cliente futuro pague por isso
- Sessão de fotos maior com fases extras no hero (ex: "abrir a porta e entrar"), para
  clientes que topam pagar por uma captação mais longa
```

- [ ] **Step 2: Commit**

```bash
git add README.md ROADMAP.md .env.example
git commit -m "$(cat <<'EOF'
Add onboarding README, roadmap, and env example

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
