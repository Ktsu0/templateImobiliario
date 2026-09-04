/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` share .next by default, so building while the
  // dev server runs overwrites the chunks it holds in memory and the running
  // site starts 500ing on missing modules. `npm run build` sets this to a
  // separate directory so the two can coexist.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
