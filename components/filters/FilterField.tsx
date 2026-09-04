import type { ReactNode } from "react";

export const filterInputClass =
  "w-full rounded-full border border-ivory/15 bg-bgDark/70 px-3.5 py-2 font-body text-sm text-ivory placeholder:text-sand/50 transition-colors hover:border-brass/40 focus:border-brass focus-visible:outline-none";

/** appearance-none kills the OS arrow, which never matched the dark palette. */
export const filterSelectClass = `${filterInputClass} cursor-pointer appearance-none pr-8`;

/** Wraps a <select> so it can carry our own chevron instead of the native one. */
export function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
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
