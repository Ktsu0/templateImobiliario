"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface AutoplayProgress {
  progress: number;
  complete: () => void;
}

export function useAutoplayProgress(durationMs: number, enabled: boolean): AutoplayProgress {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!enabled || doneRef.current) return;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const next = Math.min((now - startRef.current) / durationMs, 1);
      setProgress(next);
      if (next < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        doneRef.current = true;
        frameRef.current = null;
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, durationMs]);

  const complete = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    doneRef.current = true;
    setProgress(1);
  }, []);

  return { progress, complete };
}
