import type { ClientConfig } from "../types";

export const clientConfig = {
  slug: "meridiano",
  brand: {
    name: "Meridiano Imóveis",
    slogan: "Cada endereço, uma história para construir.",
    logoUrl: "/clients/meridiano/logo.svg",
    creci: "CRECI-PR 28.417-J",
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
    mode: "video",
    videoSrc: "/clients/meridiano/hero.mp4",
    posterImage: "/clients/meridiano/hero-poster.webp",
    fallbackImage: "/clients/meridiano/hero-fallback.webp",
    // O filme tem 5,9s: 0.75 põe o nome no ar por volta dos 4,4s, ou seja
    // no último segundo e meio, depois que a câmera já assentou no imóvel.
    titleRevealAt: 0.75,
  },
  journey: {
    videoSrc: "/clients/meridiano/journey.mp4",
    posterImage: "/clients/meridiano/journey-poster.webp",
    fallbackImage: "/clients/meridiano/journey-fallback.webp",
    frameAspectRatio: 1366 / 768,
    scrollHeightVh: 320,
    // Medido no último frame (ver README): a tela preta ocupa
    // x 32,5% / y 22,1% / 41,3% × 41,7%. Aqui vai levemente para dentro,
    // para o conteúdo ficar no vidro e não sobre o bezel.
    screenRect: { x: 34, y: 24, width: 38, height: 37 },
    zoomStartProgress: 0.7,
    // 3.0 leva a tela do notebook a cobrir a viewport com uma folga pequena.
    // A tela é posicionada por layout, fora da camada que escala, então ela
    // continua nítida em qualquer fator — o limite aqui é de enquadramento.
    zoomScale: 3,
    previewFadeStart: 0.2,
    headline: "Da sala de estar ao seu próximo endereço",
    subheadline: "Percorra o imóvel sem sair daqui — e encontre o seu na tela.",
  },
  contact: {
    whatsapp: "5541999999999",
    address: "Rua das Araucárias, 480 — Curitiba, PR",
    mapStyle: "dark-gold",
    phone: "(41) 3333-0000",
    email: "contato@meridianoimoveis.com.br",
    businessHours: "Seg a sex, 9h às 18h · Sáb, 9h às 13h",
    social: [
      { label: "Instagram", url: "https://instagram.com" },
      { label: "Facebook", url: "https://facebook.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
    ],
  },
} satisfies ClientConfig;
