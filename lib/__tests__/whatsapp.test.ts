import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Property } from "@/lib/content/types";

const property: Property = {
  id: "p1",
  title: "Casa Contemporânea Bigorrilho",
  transaction: "venda",
  type: "Casa",
  price: 1450000,
  location: "Bigorrilho, Curitiba",
  bedrooms: 4,
  suites: 2,
  area: 320,
  parkingSpots: 3,
  status: "exclusivo",
  featured: true,
  photos: ["/a.webp", "/b.webp", "/c.webp"],
};

describe("buildWhatsAppUrl", () => {
  it("points at wa.me with the configured number", () => {
    const url = buildWhatsAppUrl("5541999999999", property);
    expect(url.startsWith("https://wa.me/5541999999999?text=")).toBe(true);
  });

  it("encodes a message citing the property title and location", () => {
    const url = buildWhatsAppUrl("5541999999999", property);
    const query = url.split("?text=")[1];
    expect(decodeURIComponent(query)).toBe(
      "Olá! Tenho interesse no imóvel Casa Contemporânea Bigorrilho em Bigorrilho, Curitiba."
    );
  });
});
