export interface ClientBrand {
  name: string;
  slogan: string;
  logoUrl: string;
  creci: string;
}

export interface ClientTheme {
  bgDark: string;
  ivory: string;
  sand: string;
  brass: string;
  brassLight: string;
  ink: string;
  inkSoft: string;
  fontDisplay: string;
  fontBody: string;
}

export interface HeroPhase {
  label: string;
  scrollRange: [number, number];
}

export interface ClientHero {
  mode: "frame-sequence" | "static-image";
  framesPath: string;
  frameCount: number;
  fallbackImage: string;
  phases: HeroPhase[];
  autoplayDurationMs?: number;
}

/** Rectangle of the laptop screen in the final journey frame, in % of the frame. */
export interface JourneyScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClientJourney {
  framesPath: string;
  frameCount: number;
  fallbackImage: string;
  /** width / height of the source frames, so the overlay stays in register. */
  frameAspectRatio: number;
  scrollHeightVh: number;
  screenRect: JourneyScreenRect;
  zoomStartProgress: number;
  zoomScale: number;
  /** Where inside the zoom the screen content fades in (0-1). */
  previewFadeStart?: number;
  headline: string;
  subheadline: string;
}

export interface ClientContact {
  whatsapp: string;
  address: string;
  mapStyle: string;
}

export interface ClientConfig {
  slug: string;
  brand: ClientBrand;
  theme: ClientTheme;
  hero: ClientHero;
  journey?: ClientJourney;
  contact: ClientContact;
}
