import type { Property } from "@/lib/content/types";

/** Plain conversation link — used where there is no specific property in play. */
export function buildWhatsAppLink(whatsappNumber: string, message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildWhatsAppUrl(whatsappNumber: string, property: Property): string {
  return buildWhatsAppLink(
    whatsappNumber,
    `Olá! Tenho interesse no imóvel ${property.title} em ${property.location}.`
  );
}
