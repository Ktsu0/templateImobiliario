export function computeFrameIndex(
  scrollProgress: number,
  frameCount: number,
  isMobile: boolean
): number {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
  if (frameCount <= 1) return 0;

  if (!isMobile) {
    return Math.floor(clampedProgress * (frameCount - 1));
  }

  const step = 2;
  const effectiveCount = Math.ceil(frameCount / step);
  const sampledIndex = Math.floor(clampedProgress * (effectiveCount - 1));
  return Math.min(sampledIndex * step, frameCount - 1);
}

export function computeScrollProgress(
  scrollY: number,
  sectionTop: number,
  scrollableHeight: number
): number {
  if (scrollableHeight <= 0) return 0;
  const raw = (scrollY - sectionTop) / scrollableHeight;
  return Math.min(Math.max(raw, 0), 1);
}
