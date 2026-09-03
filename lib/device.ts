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
