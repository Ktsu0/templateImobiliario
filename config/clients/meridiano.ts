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
    // O filme (CasaFora) tem 10s: a câmera entra pela porta e assenta na
    // sala por volta dos 7-8s. 0.8 põe o nome no ar nos últimos 2s, quando
    // o quadro já está parado — e é o mesmo quadro em que o CasaDentro
    // começa, então a jornada continua sem corte.
    titleRevealAt: 0.8,
  },
  journey: {
    videoSrc: "/clients/meridiano/journey.mp4",
    posterImage: "/clients/meridiano/journey-poster.webp",
    fallbackImage: "/clients/meridiano/journey-fallback.webp",
    // Quanto de scroll o caminhar pela casa ocupa antes de soltar a seção e
    // revelar os imóveis logo abaixo.
    scrollHeightVh: 320,
    headline: "Da sala de estar ao seu próximo endereço",
    subheadline: "Percorra o imóvel sem sair daqui.",
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
