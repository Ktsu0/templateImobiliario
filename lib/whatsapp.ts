import type { Property } from "@/lib/content/types";

export function buildWhatsAppUrl(whatsappNumber: string, property: Property): string {
  const message = `Olá! Tenho interesse no imóvel ${property.title} em ${property.location}.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
