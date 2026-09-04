"use client";
import type { ReactNode } from "react";
import { useFilterStore } from "@/stores/useFilterStore";
import type { FilterState } from "@/lib/filters";

/** One height for every control so the bar reads as a single toolbar. */
export const controlClass =
  "h-10 rounded-xl border border-ivory/10 bg-bgDark/60 px-3.5 font-body text-sm text-ivory placeholder:text-sand/45 transition-colors hover:border-brass/40 focus:border-brass/70 focus-visible:outline-none";

/** appearance-none kills the OS arrow, which never matched the dark palette. */
export const selectClass = `${controlClass} cursor-pointer appearance-none pr-9`;

/** Wraps a <select> so it can carry our own chevron instead of the native one. */
export function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative shrink-0">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brassLight"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

const TRANSACTIONS: { value: FilterState["transaction"]; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "venda", label: "Comprar" },
  { value: "aluguel", label: "Alugar" },
];

/**
 * Buy/rent is the first decision a visitor makes — a segmented control shows
 * both options at once instead of hiding them inside a dropdown.
 */
export function TransactionSegments({ className = "" }: { className?: string }) {
  const transaction = useFilterStore((state) => state.filters.transaction);
  const setFilter = useFilterStore((state) => state.setFilter);

  return (
    <div
      role="group"
      aria-label="Transação"
      className={`flex h-10 shrink-0 items-center gap-0.5 rounded-xl bg-bgDark/60 p-1 ${className}`}
    >
      {TRANSACTIONS.map(({ value, label }) => {
        const isActive = transaction === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setFilter("transaction", value)}
            className={`h-8 rounded-lg px-3 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass ${
              isActive
                ? "bg-brass font-semibold text-bgDark"
                : "text-sand/70 hover:bg-ivory/5 hover:text-ivory"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
