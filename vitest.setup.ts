import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL only auto-cleans between tests when `afterEach` is a global; this
// project runs Vitest without globals, so register it explicitly.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia. Tests that need specific match
// behavior (useMediaQuery, useConnectionType) install their own mock; this
// default stub just keeps any other code path that calls
// window.matchMedia() from crashing with "not a function".
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
