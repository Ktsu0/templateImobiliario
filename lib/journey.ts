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
  /** Dark veil over the first steps, so the cut from the hero is a dip, not a jump. */
  entryVeil: number;
}

// The laptop screen "wakes up" early in the zoom: waiting longer means the
// viewer watches a black rectangle grow instead of the offers coming at them.
const DEFAULT_PREVIEW_FADE_START = 0.2;

// Fraction of the walk over which the entry veil lifts.
const ENTRY_FADE_SPAN = 0.22;

// The veil only tints the opening frames toward the brand dark — it never
// blacks them out, so the interior is already on screen when the section
// arrives instead of fading in from nothing.
const ENTRY_VEIL_MAX = 0.35;

/** Rectangle in % of the frame box, same shape as `JourneyScreenRect`. */
export interface ScreenBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where the laptop screen lands once the frame has been zoomed by `scale`.
 *
 * The screen content cannot ride inside the zoomed element: that element is
 * promoted to its own compositor layer, so the browser rasterises it once at
 * its original size and stretches the texture — text and vector art arrive
 * blurred by the full zoom factor. Laying the screen out at its final size
 * instead keeps it rendering at 1:1 the whole way.
 *
 * The zoom's transform-origin is the screen's own centre, so the centre is
 * fixed and only the size grows.
 */
export function computeScreenBox(rect: ScreenBox, scale: number): ScreenBox {
  const width = rect.width * scale;
  const height = rect.height * scale;
  return {
    x: rect.x + rect.width / 2 - width / 2,
    y: rect.y + rect.height / 2 - height / 2,
    width,
    height,
  };
}

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

  const entryVeil = ENTRY_VEIL_MAX * clamp01(1 - walkProgress / ENTRY_FADE_SPAN);

  return { walkProgress, zoomProgress, scale, previewOpacity, entryVeil };
}
