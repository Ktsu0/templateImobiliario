import type { ClientConfig } from "../types";

export const clientConfig = {
  slug: "pioneira",
  brand: {
    name: "Pioneira Imóveis",
    slogan: "Cada endereço, uma história para construir.",
    logoUrl: "/clients/pioneira/logo.svg",
    creci: "CRECI 12345-J",
  },
  theme: {
    bgDark: "#14201A",
    ivory: "#F6F1E7",
    sand: "#EAE1CB",
    brass: "#B08D57",
    brassLight: "#D9C7A3",
    ink: "#1F2420",
    inkSoft: "#54604F",
    fontDisplay: "Fraunces",
    fontBody: "Manrope",
  },
  hero: {
    mode: "frame-sequence",
    framesPath: "/clients/pioneira/hero-frames/",
    frameCount: 90,
    fallbackImage: "/clients/pioneira/hero-fallback.webp",
    phases: [
      { label: "Vista aérea", scrollRange: [0, 0.5] },
      { label: "Fachada", scrollRange: [0.5, 1.0] },
    ],
  },
  contact: {
    whatsapp: "5541999999999",
    address: "Rua das Araucárias, 480 — Curitiba, PR",
    mapStyle: "dark-gold",
  },
} satisfies ClientConfig;
