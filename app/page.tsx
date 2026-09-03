import { HeroFrameSequence } from "@/components/hero-frame-sequence/HeroFrameSequence";
import { activeClientConfig } from "@/config/active-client";

export default function HomePage() {
  return (
    <main>
      <HeroFrameSequence brand={activeClientConfig.brand} hero={activeClientConfig.hero} />
      <section id="imoveis" className="min-h-screen px-6 py-24">
        <h2 className="font-display text-3xl text-ivory">Imóveis em destaque</h2>
        <p className="mt-4 text-inkSoft">Grid de imóveis chega no próximo bloco.</p>
      </section>
    </main>
  );
}
