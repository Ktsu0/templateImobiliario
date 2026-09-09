/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` share .next by default, so building while the
  // dev server runs overwrites the chunks it holds in memory and the running
  // site starts 500ing on missing modules. `npm run build` sets this to a
  // separate directory so the two can coexist.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    // The property photos are already WebP, so the optimizer re-encodes a lossy
    // file: at the default quality of 75 that is a second generation loss on
    // top of the first. AVIF holds the same detail in fewer bytes, so it goes
    // first and WebP stays as the fallback.
    formats: ["image/avif", "image/webp"],
    // The photos are 2048px wide; without this the largest variant the
    // optimizer will emit for a `33vw` card on a wide monitor tops out below
    // what the source actually has.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
  },
};

export default nextConfig;
