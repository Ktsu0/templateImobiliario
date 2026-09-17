/** Fraction of the walk, measured from its end, over which the caption fades
 *  out before the section hands off to the listings. */
export const CAPTION_FADE_SPAN = 0.15;

/** Opacity of the walkthrough caption at a given scroll progress (0-1). */
export function captionOpacityAt(progress: number): number {
  const fadeStart = 1 - CAPTION_FADE_SPAN;
  if (progress <= fadeStart) return 1;
  const faded = (progress - fadeStart) / CAPTION_FADE_SPAN;
  return Math.min(Math.max(1 - faded, 0), 1);
}
