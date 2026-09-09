import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Reads a client's logo out of `public/` so it can be inlined into the page.
 *
 * An `<img src="logo.svg">` renders the file as an isolated document: it sees
 * neither the page's webfonts — so a wordmark set in the client's display face
 * silently falls back to Georgia — nor its CSS variables, and inside a scaled
 * compositor layer it is stretched as a bitmap. Inlined, the same file is
 * ordinary vector markup in the page and none of that applies.
 *
 * Server-side only; the result is passed to client components as a prop.
 */
export function readBrandLogo(logoUrl: string): string | null {
  // Only local, absolute paths under public/ — anything else (a CDN URL, a
  // raster logo) stays on the <img> path.
  if (!logoUrl.startsWith("/") || !logoUrl.toLowerCase().endsWith(".svg")) return null;

  try {
    const file = path.join(process.cwd(), "public", logoUrl);
    const markup = readFileSync(file, "utf8");
    // Drop the intrinsic size so CSS controls it; the viewBox keeps the ratio.
    return markup.replace(/<svg\b[^>]*>/, (tag) =>
      tag.replace(/\s(?:width|height)="[^"]*"/g, "")
    );
  } catch {
    return null;
  }
}
