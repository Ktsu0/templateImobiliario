import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/footer/SiteFooter";
import type { ClientBrand, ClientContact } from "@/config/types";

const brand: ClientBrand = {
  name: "Pioneira Imóveis",
  slogan: "Cada endereço, uma história para construir.",
  logoUrl: "/clients/pioneira/logo.svg",
  creci: "CRECI 12345-J",
};

const contact: ClientContact = {
  whatsapp: "5541999999999",
  address: "Rua das Araucárias, 480 — Curitiba, PR",
  mapStyle: "dark-gold",
  phone: "(41) 3333-0000",
  email: "contato@pioneiraimoveis.com.br",
  businessHours: "Seg a sex, 9h às 18h",
  social: [{ label: "Instagram", url: "https://instagram.com" }],
};

describe("SiteFooter", () => {
  it("shows the agency's identity and registration", () => {
    render(<SiteFooter brand={brand} contact={contact} />);
    expect(screen.getByRole("img", { name: brand.name })).toHaveAttribute("src", brand.logoUrl);
    expect(screen.getByText(brand.creci)).toBeInTheDocument();
    expect(screen.getByText(brand.slogan)).toBeInTheDocument();
  });

  it("makes every contact route actionable", () => {
    render(<SiteFooter brand={brand} contact={contact} />);

    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/5541999999999"
    );
    expect(screen.getByRole("link", { name: contact.phone })).toHaveAttribute(
      "href",
      "tel:4133330000"
    );
    expect(screen.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`
    );
    expect(screen.getByText(contact.address)).toBeInTheDocument();
    expect(screen.getByText(contact.businessHours)).toBeInTheDocument();
  });

  it("lists the configured social profiles and the privacy policy", () => {
    render(<SiteFooter brand={brand} contact={contact} />);
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com"
    );
    expect(screen.getByRole("link", { name: /política de privacidade/i })).toBeInTheDocument();
  });

  it("links back to the sections of the page", () => {
    render(<SiteFooter brand={brand} contact={contact} />);
    expect(screen.getByRole("link", { name: /imóveis/i })).toHaveAttribute("href", "#imoveis");
    expect(screen.getByRole("link", { name: /depoimentos/i })).toHaveAttribute("href", "#depoimentos");
  });
});
