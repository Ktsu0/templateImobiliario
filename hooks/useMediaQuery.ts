"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  // Always start at false so the client's first render matches the
  // server-rendered HTML (window.matchMedia doesn't exist during SSR) —
  // the real value is resolved in the effect below, after hydration.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
