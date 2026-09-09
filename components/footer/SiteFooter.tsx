import { BrandLogo } from "@/components/ui/BrandLogo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { ClientBrand, ClientContact } from "@/config/types";

interface SiteFooterProps {
  brand: ClientBrand;
  contact: ClientContact;
  /** Inline logo markup from `readBrandLogo`; falls back to the file when null. */
  logoMarkup: string | null;
}

const NAV_LINKS = [
  { href: "#jornada", label: "Conheça o imóvel" },
  { href: "#imoveis", label: "Imóveis" },
  { href: "#depoimentos", label: "Depoimentos" },
];

export function SiteFooter({ brand, contact, logoMarkup }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const linkClass =
    "text-sand/75 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass";

  return (
    <footer className="border-t border-ivory/10 bg-ink/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4 md:py-16">
        <div className="md:col-span-2">
          <BrandLogo
            markup={logoMarkup}
            src={brand.logoUrl}
            label={brand.name}
            className="w-48"
          />
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-sand/75">
            {brand.slogan}
          </p>
          <p className="mt-4 font-body text-xs uppercase tracking-[0.2em] text-brassLight">
            {brand.creci}
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="font-display text-lg text-ivory">Navegar</h2>
          <ul className="mt-4 flex flex-col gap-2 font-body text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-ivory">Contato</h2>
          <ul className="mt-4 flex flex-col gap-2 font-body text-sm text-sand/75">
            <li>
              <a
                href={buildWhatsAppLink(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phone.replace(/\D/g, "")}`} className={linkClass}>
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </li>
            <li className="pt-1">{contact.address}</li>
            <li className="text-sand/60">{contact.businessHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 px-6 py-6 font-body text-xs text-sand/60 md:flex-row md:justify-between">
          <p>
            © {year} {brand.name}. Todos os direitos reservados.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {contact.social.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {social.label}
              </a>
            ))}
            <a href="#privacidade" className={linkClass}>
              Política de privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
