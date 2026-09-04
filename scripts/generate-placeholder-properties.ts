import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { clientConfig } from "../config/clients/pioneira";
import { getProperties } from "../lib/content/properties";

const WIDTH = 1200;
const HEIGHT = 800;
const PHOTOS_PER_PROPERTY = 3;

const PALETTE = [
  clientConfig.theme.bgDark,
  clientConfig.theme.brass,
  clientConfig.theme.sand,
  clientConfig.theme.inkSoft,
];

export function pickColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

async function generatePhoto(title: string, photoIndex: number, colorIndex: number): Promise<Buffer> {
  const background = pickColor(colorIndex);
  const label = `${title} — Foto ${photoIndex}`;
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${background}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="36" fill="${clientConfig.theme.ivory}">
        ${label}
      </text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).webp({ quality: 70 }).toBuffer();
}

async function main() {
  const properties = getProperties();

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const dir = path.join(process.cwd(), "public", "clients", "pioneira", "properties", property.id);
    await mkdir(dir, { recursive: true });

    for (let photoIndex = 1; photoIndex <= PHOTOS_PER_PROPERTY; photoIndex++) {
      const buffer = await generatePhoto(property.title, photoIndex, i);
      await writeFile(path.join(dir, `photo-${photoIndex}.webp`), buffer);
    }
  }

  console.log(`Generated ${properties.length * PHOTOS_PER_PROPERTY} placeholder property photos.`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-placeholder-properties.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
