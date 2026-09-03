export interface FrameBlend {
  index: number;
  nextIndex: number;
  blend: number;
}

export function computeFrameBlend(
  progress: number,
  frameCount: number,
  isMobile: boolean
): FrameBlend {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  if (frameCount <= 1) return { index: 0, nextIndex: 0, blend: 0 };

  const step = isMobile ? 2 : 1;
  const effectiveCount = Math.ceil(frameCount / step);
  const position = clampedProgress * (effectiveCount - 1);
  const sampled = Math.floor(position);

  const index = Math.min(sampled * step, frameCount - 1);
  const nextIndex = Math.min((sampled + 1) * step, frameCount - 1);
  const blend = index === nextIndex ? 0 : position - sampled;

  return { index, nextIndex, blend };
}
