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
    phases: [{ label: "Aproximação", scrollRange: [0, 1.0] }],
    autoplayDurationMs: 6000,
  },
  journey: {
    framesPath: "/clients/pioneira/journey-frames/",
    frameCount: 90,
    fallbackImage: "/clients/pioneira/journey-fallback.webp",
    frameAspectRatio: 1366 / 768,
    scrollHeightVh: 320,
    // Medido no último frame (ver README): a tela preta ocupa
    // x 32,5% / y 22,1% / 41,3% × 41,7%. Aqui vai levemente para dentro,
    // para o conteúdo ficar no vidro e não sobre o bezel.
    screenRect: { x: 34, y: 24, width: 38, height: 37 },
    zoomStartProgress: 0.7,
    // 3.0 leva a tela do notebook a cobrir a viewport com uma folga pequena;
    // acima disso o conteúdo passa do necessário e perde nitidez.
    zoomScale: 3,
    previewFadeStart: 0.2,
    headline: "Da sala de estar ao seu próximo endereço",
    subheadline: "Percorra o imóvel sem sair daqui — e encontre o seu na tela.",
  },
  contact: {
    whatsapp: "5541999999999",
    address: "Rua das Araucárias, 480 — Curitiba, PR",
    mapStyle: "dark-gold",
  },
} satisfies ClientConfig;
