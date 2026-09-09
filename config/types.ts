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

export interface ClientHero {
  mode: "video" | "static-image";
  /** The client's intro film. Played straight through, once, muted. */
  videoSrc: string;
  /** First frame of that film, shown until it has enough data to start. */
  posterImage: string;
  /** Still used instead of the film under reduced motion or a slow connection. */
  fallbackImage: string;
  /**
   * Fraction of the film after which the brand title reveals (0-1). The reveal
   * belongs to the closing seconds, once the camera has settled.
   */
  titleRevealAt: number;
}

/** Rectangle of the laptop screen in the final journey frame, in % of the frame. */
export interface JourneyScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClientJourney {
  /**
   * The walkthrough. Scrubbed by scroll rather than played, so it is encoded
   * all-intra — see `scripts/build-client-media.ts`.
   */
  videoSrc: string;
  posterImage: string;
  fallbackImage: string;
  /** width / height of the footage, so the screen overlay stays in register. */
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

export interface SocialLink {
  label: string;
  url: string;
}

export interface ClientContact {
  whatsapp: string;
  address: string;
  mapStyle: string;
  phone: string;
  email: string;
  businessHours: string;
  social: SocialLink[];
}

export interface ClientConfig {
  slug: string;
  brand: ClientBrand;
  theme: ClientTheme;
  hero: ClientHero;
  journey?: ClientJourney;
  contact: ClientContact;
}
