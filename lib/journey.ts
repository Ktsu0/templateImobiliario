export interface JourneyStageConfig {
  /** Fraction of the section's scroll spent walking before the zoom starts. */
  zoomStartProgress: number;
  /** How much the frame grows so the laptop screen fills the viewport. */
  zoomScale: number;
  /** Where inside the zoom phase the screen content starts fading in. */
  previewFadeStart?: number;
}

export interface JourneyStage {
  walkProgress: number;
  zoomProgress: number;
  scale: number;
  previewOpacity: number;
}

// The laptop screen "wakes up" early in the zoom: waiting longer means the
// viewer watches a black rectangle grow instead of the offers coming at them.
const DEFAULT_PREVIEW_FADE_START = 0.2;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function computeJourneyStage(
  progress: number,
  config: JourneyStageConfig
): JourneyStage {
  const clamped = clamp01(progress);
  const zoomStart = clamp01(config.zoomStartProgress);
  const fadeStart = clamp01(config.previewFadeStart ?? DEFAULT_PREVIEW_FADE_START);

  const walkProgress = zoomStart <= 0 ? 1 : clamp01(clamped / zoomStart);

  const zoomSpan = 1 - zoomStart;
  const zoomRaw = zoomSpan <= 0 ? 0 : clamp01((clamped - zoomStart) / zoomSpan);
  const zoomProgress = easeInOutCubic(zoomRaw);

  const scale = 1 + (config.zoomScale - 1) * zoomProgress;

  const fadeSpan = 1 - fadeStart;
  const previewOpacity =
    fadeSpan <= 0 ? (zoomRaw >= 1 ? 1 : 0) : clamp01((zoomRaw - fadeStart) / fadeSpan);

  return { walkProgress, zoomProgress, scale, previewOpacity };
}
