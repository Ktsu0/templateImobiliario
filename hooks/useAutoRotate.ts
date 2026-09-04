"use client";
import { useCallback, useEffect, useState } from "react";

interface AutoRotate {
  index: number;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
}

/**
 * Cycles through `count` items every `intervalMs`. Manual navigation restarts
 * the timer, so a carousel never advances the instant someone clicks.
 */
export function useAutoRotate(count: number, intervalMs: number, enabled = true): AutoRotate {
  const [index, setIndex] = useState(0);
  const [restartToken, setRestartToken] = useState(0);

  const wrap = useCallback(
    (value: number) => (count <= 0 ? 0 : ((value % count) + count) % count),
    [count]
  );

  const goTo = useCallback(
    (value: number) => {
      setIndex(wrap(value));
      setRestartToken((token) => token + 1);
    },
    [wrap]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!enabled || count <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => wrap(current + 1)), intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, count, intervalMs, wrap, restartToken]);

  return { index: wrap(index), goTo, next, previous };
}
