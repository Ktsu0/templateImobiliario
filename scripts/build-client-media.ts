/**
 * Builds every media asset a client ships from its two master videos.
 *
 * Both sequences used to be served as ~140 WebP stills each, decoded and
 * blitted onto a canvas from JS. That cost 23 MB and made the hero wait for the
 * whole download before its first frame. The browser already has a hardware
 * decoder for exactly this, so the videos ship as videos.
 *
 * The two are encoded differently because they are played differently:
 *
 * - The hero plays start to finish, so its master bitstream is copied through
 *   untouched — no re-encode, no generation loss, ~2 MB.
 * - The walkthrough is scrubbed by the scroll position, which means seeking to
 *   an arbitrary frame many times a second. It is encoded all-intra (`-g 1`)
 *   so every frame is a keyframe and a seek never decodes a chain. That roughly
 *   doubles its size against a normal GOP and is what buys a scrub that does
 *   not stutter.
 *
 * Stills (posters, reduced-motion fallbacks, property photos) are cut from
 * lossless frames of the same masters.
 *
 *   npx tsx scripts/build-client-media.ts <hero.mp4> <journey.mp4>
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const CLIENT = "meridiano";
const PUBLIC_DIR = path.join(process.cwd(), "public", "clients", CLIENT);

/** Stills are cut at 2x and resampled, so they carry a little sharpening to
 *  restore the edge the interpolation softens. */
const UPSCALE_SHARPEN = { sigma: 0.8 };

interface Sequence {
  name: string;
  video: string;
  /** Region of the source frame the stills should show. */
  crop?: { left: number; top: number; width: number; height: number };
  /** Output size for this sequence's stills. */
  stillSize: { width: number; height: number };
  /** 1-based frame the <video> poster is cut from — must be the first frame,
   *  or the poster visibly jumps when playback starts. */
  posterFrame: number;
  /** 1-based frame used as the reduced-motion / slow-connection still. */
  fallbackFrame: number;
  /** All-intra costs size and buys seek accuracy; only the scrubbed one needs it. */
  scrubbed: boolean;
}

interface PhotoCut {
  name: string;
  sequence: string;
  /** 1-based frame in that sequence's source video. */
  frame: number;
}

/** The photos are 16:9 cuts of the same footage — the shape of the stage
 *  they fill. The hero master is 4:3 and gives up its top and bottom. */
const PHOTO_SIZE = { width: 2048, height: 1152 };
const PHOTO_CROPS: Record<string, { left: number; top: number; width: number; height: number }> = {
  // 16:9, matching the full-viewport stage each photo now fills. The old 4:3
  // cut was sized for a card and lost the sides of the frame here.
  hero: { left: 0, top: 96, width: 1024, height: 576 },
  journey: { left: 0, top: 0, width: 1366, height: 768 },
};

const PHOTOS: PhotoCut[] = [
  // Three distinct cuts per listing, none reused. The showcase gives each
  // property a whole viewport, so two listings sharing a frame reads as a
  // broken site — which is exactly what the previous rotation of 8 cuts across
  // 8 properties produced. Frames are spaced ~12 apart so consecutive cuts are
  // visibly different moments of the move rather than near-duplicates.
  { name: "p1-a", sequence: "hero", frame: 1 },
  { name: "p1-b", sequence: "hero", frame: 13 },
  { name: "p1-c", sequence: "journey", frame: 1 },
  { name: "p2-a", sequence: "journey", frame: 13 },
  { name: "p2-b", sequence: "journey", frame: 25 },
  { name: "p2-c", sequence: "hero", frame: 25 },
  { name: "p3-a", sequence: "hero", frame: 37 },
  { name: "p3-b", sequence: "hero", frame: 49 },
  { name: "p3-c", sequence: "journey", frame: 37 },
  { name: "p4-a", sequence: "journey", frame: 49 },
  { name: "p4-b", sequence: "journey", frame: 61 },
  { name: "p4-c", sequence: "hero", frame: 61 },
  { name: "p5-a", sequence: "hero", frame: 73 },
  { name: "p5-b", sequence: "hero", frame: 85 },
  { name: "p5-c", sequence: "journey", frame: 73 },
  { name: "p6-a", sequence: "journey", frame: 85 },
  { name: "p6-b", sequence: "journey", frame: 97 },
  { name: "p6-c", sequence: "hero", frame: 97 },
  { name: "p7-a", sequence: "hero", frame: 109 },
  { name: "p7-b", sequence: "hero", frame: 121 },
  { name: "p7-c", sequence: "journey", frame: 109 },
  { name: "p8-a", sequence: "journey", frame: 121 },
  { name: "p8-b", sequence: "journey", frame: 133 },
  { name: "p8-c", sequence: "hero", frame: 133 },
];

function ffmpeg(args: string[]): void {
  if (!ffmpegPath) throw new Error("ffmpeg-static did not resolve a binary");
  execFileSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
}

function extractFrames(video: string, into: string): number {
  mkdirSync(into, { recursive: true });
  // -vsync 0 keeps every coded frame, one file each, with no duplication.
  ffmpeg(["-i", video, "-vsync", "0", path.join(into, "%03d.png"), "-y"]);
  return readdirSync(into).length;
}

function encodeVideo(source: string, target: string, scrubbed: boolean): void {
  const codec = scrubbed
    ? // Every frame a keyframe: the scroll seeks to arbitrary times and must
      // not wait on a decode chain to reach them.
      ["-c:v", "libx264", "-g", "1", "-keyint_min", "1", "-sc_threshold", "0",
       "-crf", "19", "-preset", "slow", "-pix_fmt", "yuv420p"]
    : // Played straight through, so the master's own bitstream is kept as-is.
      ["-c:v", "copy"];

  // -an: neither master carries audio, and an empty track only adds a stream.
  // +faststart moves the index to the front so playback can begin on the first
  // bytes instead of after the whole file has arrived.
  ffmpeg(["-i", source, "-an", ...codec, "-movflags", "+faststart", target, "-y"]);
}

async function encodeStill(
  source: string,
  target: string,
  size: { width: number; height: number },
  crop: Sequence["crop"] | undefined,
  quality: number
): Promise<number> {
  let pipeline = sharp(source);
  if (crop) pipeline = pipeline.extract(crop);
  const buffer = await pipeline
    .resize(size.width, size.height, { kernel: "lanczos3" })
    .sharpen(UPSCALE_SHARPEN)
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  await writeFile(target, buffer);
  return buffer.length;
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

async function buildSequence(sequence: Sequence, framesDir: string): Promise<void> {
  const video = path.join(PUBLIC_DIR, `${sequence.name}.mp4`);
  encodeVideo(sequence.video, video, sequence.scrubbed);

  const count = extractFrames(sequence.video, framesDir);
  const frame = (n: number) => path.join(framesDir, `${String(n).padStart(3, "0")}.png`);

  for (const [suffix, source] of [
    ["poster", frame(sequence.posterFrame)],
    ["fallback", frame(sequence.fallbackFrame)],
  ] as const) {
    await encodeStill(
      source,
      path.join(PUBLIC_DIR, `${sequence.name}-${suffix}.webp`),
      sequence.stillSize,
      sequence.crop,
      82
    );
  }

  console.log(
    `${sequence.name}: ${mb(statSync(video).size)} MB video ` +
      `(${sequence.scrubbed ? "all-intra, scrubbed" : "stream copy"}), ` +
      `${count} frames read for stills`
  );
}

async function buildPhotos(frameDirs: Record<string, string>): Promise<void> {
  const photosDir = path.join(PUBLIC_DIR, "photos");
  mkdirSync(photosDir, { recursive: true });
  let bytes = 0;
  for (const photo of PHOTOS) {
    const source = path.join(
      frameDirs[photo.sequence],
      `${String(photo.frame).padStart(3, "0")}.png`
    );
    bytes += await encodeStill(
      source,
      path.join(photosDir, `${photo.name}.webp`),
      PHOTO_SIZE,
      PHOTO_CROPS[photo.sequence],
      86
    );
  }
  console.log(`photos: ${PHOTOS.length} at ${PHOTO_SIZE.width}x${PHOTO_SIZE.height} — ${mb(bytes)} MB`);
}

async function main(): Promise<void> {
  const [heroVideo, journeyVideo] = process.argv.slice(2);
  if (!heroVideo || !journeyVideo) {
    throw new Error("usage: tsx scripts/build-client-media.ts <hero.mp4> <journey.mp4>");
  }
  for (const video of [heroVideo, journeyVideo]) {
    if (!existsSync(video)) throw new Error(`source video not found: ${video}`);
  }

  const work = mkdtempSync(path.join(tmpdir(), `${CLIENT}-media-`));
  try {
    const sequences: Sequence[] = [
      {
        name: "hero",
        video: heroVideo,
        // The master is 4:3; the hero frames the centred 16:9 band of it, which
        // `object-cover` reproduces at runtime. The stills are cut to match.
        crop: { left: 0, top: 96, width: 1024, height: 576 },
        stillSize: { width: 2048, height: 1152 },
        posterFrame: 1,
        fallbackFrame: 71,
        scrubbed: false,
      },
      {
        name: "journey",
        video: journeyVideo,
        stillSize: { width: 2049, height: 1152 },
        posterFrame: 1,
        // The walkthrough ends on the laptop; the fallback still has to be that
        // frame, because `screenRect` in the client config is measured on it.
        fallbackFrame: 141,
        scrubbed: true,
      },
    ];

    const frameDirs: Record<string, string> = {};
    for (const sequence of sequences) {
      frameDirs[sequence.name] = path.join(work, sequence.name);
      await buildSequence(sequence, frameDirs[sequence.name]);
    }
    await buildPhotos(frameDirs);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
