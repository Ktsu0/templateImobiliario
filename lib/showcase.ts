/**
 * Photo paging wraps in both directions, so neither arrow ever dead-ends on a
 * listing with only a handful of photos.
 */
export function wrapPhotoIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}
