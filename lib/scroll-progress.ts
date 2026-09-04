export function computeScrollProgress(
  scrollY: number,
  sectionTop: number,
  scrollableHeight: number
): number {
  if (scrollableHeight <= 0) return 0;
  const raw = (scrollY - sectionTop) / scrollableHeight;
  return Math.min(Math.max(raw, 0), 1);
}
