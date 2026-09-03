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
  contact: ClientContact;
}
