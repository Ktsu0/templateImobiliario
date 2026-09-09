import { BrandLogo } from "@/components/ui/BrandLogo";
import type { ClientBrand } from "@/config/types";

interface JourneyScreenPreviewProps {
  brand: ClientBrand;
  /** Inline logo markup from `readBrandLogo`, drawn instead of a scaled image. */
  logoMarkup: string | null;
}

/**
 * What the laptop screen shows once the zoom lands on it: the client's mark, on
 * the client's own dark. Nothing else — the walkthrough has already said where
 * the visitor is, and the listings are the next thing they scroll into, so a
 * second brand line and a scroll prompt were repeating what the page states
 * twice over.
 *
 * Sized in container units so the lockup holds its proportion as the screen
 * grows from a laptop-sized rectangle to the whole viewport.
 */
export function JourneyScreenPreview({ brand, logoMarkup }: JourneyScreenPreviewProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        // A lit panel, not a hole cut in the frame: the glass carries a little
        // more light at the top than at the bottom, which is what separates a
        // screen that is on from one that is off.
        background:
          "linear-gradient(170deg, rgb(var(--ink-rgb) / 1) 0%, rgb(var(--bg-dark-rgb) / 1) 55%, rgb(var(--bg-dark-rgb) / 1) 100%)",
      }}
    >
      <BrandLogo
        markup={logoMarkup}
        src={brand.logoUrl}
        label={brand.name}
        className="h-auto w-[58cqw]"
      />
    </div>
  );
}
