import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { clientConfig } from "../config/clients/meridiano";

const OUTPUT_DIR = path.join(process.cwd(), "public", "clients", "meridiano", "hero-frames");
const FALLBACK_PATH = path.join(process.cwd(), "public", "clients", "meridiano", "hero-fallback.webp");
const WIDTH = 1600;
const HEIGHT = 900;

export function lerpColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(from.replace("#", ""));
  const [r2, g2, b2] = parse(to.replace("#", ""));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

async function generateFrame(index: number, total: number): Promise<Buffer> {
  const t = total <= 1 ? 0 : index / (total - 1);
  const background = lerpColor(clientConfig.theme.bgDark, clientConfig.theme.brass, t);
  const label = `Frame ${String(index + 1).padStart(3, "0")} / ${total} — placeholder`;
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="42" fill="${clientConfig.theme.ivory}">
        ${label}
      </text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).webp({ quality: 70 }).toBuffer();
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const { frameCount } = clientConfig.hero;

  for (let i = 0; i < frameCount; i++) {
    const buffer = await generateFrame(i, frameCount);
    const fileName = `frame-${String(i + 1).padStart(3, "0")}.webp`;
    await writeFile(path.join(OUTPUT_DIR, fileName), buffer);
  }

  const fallback = await generateFrame(Math.floor(frameCount / 2), frameCount);
  await writeFile(FALLBACK_PATH, fallback);

  console.log(`Generated ${frameCount} placeholder frames + 1 fallback image.`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-placeholder-frames.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
