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

export interface ClientJourney {
  /** The walkthrough. Its own first frame matches the hero film's last frame,
   *  so swapping from one to the other mid-scroll is seamless. Scrubbed by
   *  scroll via `scrolly-video` (WebCodecs where supported, playbackRate
   *  modulation otherwise), so it ships at its source quality — see
   *  `scripts/build-client-media.ts`. */
  videoSrc: string;
  posterImage: string;
  fallbackImage: string;
  scrollHeightVh: number;
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
