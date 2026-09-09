import type { EffectiveConnectionType } from "@/hooks/useConnectionType";

/**
 * How much bandwidth a surface needs before it is worth playing at all.
 *
 * `streaming` is for a film played straight through: it begins on its first
 * bytes and the poster covers whatever is still arriving, so only a genuinely
 * crawling connection is better served by the still.
 *
 * `buffered` is for the scrubbed walkthrough, which is useless until enough of
 * it is in memory to seek around — a mid-tier connection there means dragging
 * the scroll against an empty buffer.
 */
export type PlaybackDemand = "streaming" | "buffered";

const TOO_SLOW: Record<PlaybackDemand, EffectiveConnectionType[]> = {
  streaming: ["slow-2g", "2g"],
  buffered: ["slow-2g", "2g", "3g"],
};

export function shouldShowHeroFallback(
  prefersReducedMotion: boolean,
  connection: { effectiveType?: EffectiveConnectionType } | undefined,
  demand: PlaybackDemand = "buffered"
): boolean {
  if (prefersReducedMotion) return true;
  const effectiveType = connection?.effectiveType;
  return effectiveType !== undefined && TOO_SLOW[demand].includes(effectiveType);
}
