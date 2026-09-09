interface BrandLogoProps {
  /** Inline SVG markup from `readBrandLogo`, when the client ships a vector logo. */
  markup: string | null;
  /** The configured file, used when there is no inline markup to draw. */
  src: string;
  label: string;
  /** Sizes the mark by width; height follows the logo's own ratio. */
  className?: string;
}

/**
 * Draws the client's logo into the page as vector rather than pointing an
 * `<img>` at it, so it picks up the theme's fonts and stays sharp at any size.
 * Clients whose logo is not a local SVG fall back to the plain image.
 */
export function BrandLogo({ markup, src, label, className = "" }: BrandLogoProps) {
  if (!markup) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={label} className={className} />;
  }

  return (
    <span
      role="img"
      aria-label={label}
      // First-party file read off disk at build time — same trust level as the
      // component itself. The stripped root `<svg>` keeps only its viewBox, so
      // a full width and an automatic height reproduce its intrinsic ratio.
      className={`inline-block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
