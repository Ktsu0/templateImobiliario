/**
 * A video's timeline is only usable once metadata has loaded; before that
 * `duration` is NaN, and seeking exactly to the end leaves some browsers
 * showing nothing rather than the closing frame.
 */
const END_MARGIN_SECONDS = 0.04;

/** Whether a video element's duration is known and usable. */
export function hasUsableDuration(duration: number): boolean {
  return Number.isFinite(duration) && duration > 0;
}

/**
 * Maps a 0-1 progress onto a video's timeline. The last frame is held just
 * inside the end so a scrub that reaches the bottom still shows it.
 */
export function videoTimeFor(progress: number, duration: number): number {
  if (!hasUsableDuration(duration)) return 0;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const end = Math.max(duration - END_MARGIN_SECONDS, 0);
  return clamped * end;
}

/** How far through the film a given time is, as 0-1. */
export function videoProgressAt(currentTime: number, duration: number): number {
  if (!hasUsableDuration(duration)) return 0;
  return Math.min(Math.max(currentTime / duration, 0), 1);
}
