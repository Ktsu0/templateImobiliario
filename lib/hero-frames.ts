export interface FrameBlend {
  index: number;
  nextIndex: number;
  blend: number;
}

/** Desktop plays every frame; mobile samples every other one to halve the load. */
export function frameStep(isMobile: boolean): number {
  return isMobile ? 2 : 1;
}

export function computeFrameBlend(
  progress: number,
  frameCount: number,
  isMobile: boolean
): FrameBlend {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  if (frameCount <= 1) return { index: 0, nextIndex: 0, blend: 0 };

  const step = frameStep(isMobile);
  const effectiveCount = Math.ceil(frameCount / step);
  const position = clampedProgress * (effectiveCount - 1);
  const sampled = Math.floor(position);

  const index = Math.min(sampled * step, frameCount - 1);
  const nextIndex = Math.min((sampled + 1) * step, frameCount - 1);

  // Cross-fading two frames superimposes two moments of a moving camera, which
  // measurably softens the image (~18% of edge detail at a half blend). It is
  // only worth that cost when frames are far apart: at the source's own frame
  // rate the sequence snaps as cleanly as film, so desktop gets no blend and
  // mobile — which skips every other frame — keeps it.
  const blend = step === 1 || index === nextIndex ? 0 : position - sampled;

  return { index, nextIndex, blend };
}
