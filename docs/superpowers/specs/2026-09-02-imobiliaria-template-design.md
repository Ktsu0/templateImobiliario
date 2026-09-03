# Template Imobiliário Configurável — Design

## Objetivo

Construir um produto template (não um site de cliente único) para imobiliárias:
um esqueleto Next.js onde onboardar um novo cliente significa preencher um
`clientConfig` + trocar assets de imagem — nunca editar componentes.

## Modelo de distribuição

**Single-tenant por deploy.** Cada imobiliária recebe seu próprio
build/deploy (ex: projeto Vercel separado), com o cliente ativo selecionado
via variável de ambiente de build (`NEXT_PUBLIC_CLIENT_SLUG`), que carrega
`config/clients/<slug>.ts`. Suporte a multi-tenant por domínio único (um app
servindo vários clientes via middleware/host) fica fora de escopo, registrado
em `ROADMAP.md`.

## Stack

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS, tema estendido lendo `clientConfig.theme` via CSS variables
  injetadas em runtime por um `ThemeProvider` (nenhum componente importa cor
  literal — sempre `var(--token)`)
- Framer Motion apenas para microinterações de UI (modais, expandir filtro)
- Zustand para estado de filtros e favoritos (mais simples que Context para
  estado lido/escrito por componentes desacoplados: filtro flutuante,
  bottom-sheet, cards)
- `next/image` em toda a aplicação, exceto na sequência de frames do hero
  (usa `<canvas>` por controle fino de performance)
- Conteúdo em JSON local, isolado atrás de uma camada de acesso
  (`/lib/content/*`) para permitir migração futura a um CMS headless
  (Directus/Payload/Sanity) sem tocar componentes

## Sistema de configuração por cliente

`ClientConfig` tipado em `/config/clients/<slug>.ts`, cobrindo `slug`,
`brand`, `theme`, `hero`, `contact` — conforme o exemplo já validado com o
usuário (cliente demo `pioneira`). Dados de imóveis, depoimentos e conteúdo
institucional ficam em JSON separado por cliente
(`/content/clients/<slug>/properties.json`, etc.), não dentro do
`clientConfig` de tema/marca.

## Hero — frame-sequence via scroll

Componentes: `HeroCanvas.tsx`, `useScrollFrames.ts` (scroll progress →
frame index), `FramePreloader.tsx`.

- Wrapper alto (250–300vh) com container `sticky` de altura de viewport;
  `<canvas>` desenha `frameIndex = Math.floor(scrollProgress * (frameCount - 1))`.
- Nunca `<video>` scrubado — sequência de imagens estáticas WebP,
  pré-carregadas em lote com indicador de progresso sutil.
- Fallback obrigatório (sem scroll-jacking, título já visível) quando:
  `prefers-reduced-motion: reduce`, ou `navigator.connection.effectiveType`
  indicar conexão lenta.
- Duas fases (vista aérea → fachada), não quatro.
- Botão "Pular introdução" sempre visível, foco de teclado visível, ancora
  na seção de imóveis.
- Mobile usa metade dos frames da sequência.

## Assets do cliente demo

Cliente demo `pioneira` usa **placeholders gerados** (gradientes/formas nas
cores do tema, nomeados `frame-001.webp`...`frame-NNN.webp`) só para provar
a mecânica de scroll→frame e o layout dos cards. Documentado no README como
placeholder a substituir por fotos reais no onboarding de cada cliente.

## Mapa (seção de contato)

Sem Mapbox — exige cartão de crédito vinculado, inviável para este produto.
Usa **Leaflet + tiles OpenStreetMap** (gratuito, sem chave de API), com um
filtro CSS (`hue-rotate` + `brightness`) aproximando o tom escuro/dourado
pedido em `contact.mapStyle`. Se um cliente futuro quiser um mapa mais
polido, MapTiler (free tier, sem cartão) fica documentado como alternativa
em `ROADMAP.md`.

## Grid de imóveis e cards

- Hierarquia real: primeiro resultado do filtro (ou imóvel marcado como
  destaque no dataset) ocupa card maior; demais são menores.
- Cada card: carrossel touch (swipe/tap, hover é bônus), badge de status
  (Venda/Aluguel/Lançamento/Exclusivo), atributos com ícones (quartos,
  suítes, m², vagas), preço formatado em BRL (+ "/mês" se aluguel), CTA
  WhatsApp com mensagem pré-preenchida citando o imóvel.
- Filtro flutuante: transação, tipo, localização, faixa de preço, quartos.
  Barra fixa em desktop; botão que abre bottom-sheet em mobile — nunca
  compete por espaço com o WhatsApp flutuante.

## Seções complementares

1. Institucional: texto curto + 2–3 estatísticas reais, sem numeração
   artificial de passos.
2. Simulador de financiamento/aluguel: cálculo simples, aviso explícito de
   que é estimativa, não proposta oficial.
3. Depoimentos: carrossel com estrelas, rotação automática + navegação
   manual.
4. Contato: formulário de agendamento de visita + mapa Leaflet/OSM.
5. Footer: links úteis, CRECI, endereço, redes sociais, política de
   privacidade.
6. WhatsApp flutuante: canto inferior direito, z-index explicitamente acima
   do filtro flutuante em mobile.

## Acessibilidade e performance (piso de qualidade)

Responsivo até telas pequenas; foco de teclado visível em todo elemento
interativo; `prefers-reduced-motion` respeitado em todas as animações (não
só no hero); contraste de texto garantido sobre fotos via overlay de
gradiente na cor de marca; validar cada bloco com throttling de rede
simulado antes de considerar "pronto".

## Organização de componentes

```
/config/clients/<slug>.ts
/content/clients/<slug>/{properties,testimonials,institutional}.json
/lib/content/*            # camada de acesso ao conteúdo (JSON hoje, CMS depois)
/components
  /hero-frame-sequence/{HeroCanvas,useScrollFrames,FramePreloader}.tsx
  /property-card/{PropertyCard,PropertyCarousel}.tsx
  /filters/{FloatingFilterBar,FilterBottomSheet}.tsx
  /theme/ThemeProvider.tsx
  /map/InteractiveMap.tsx   # Leaflet + OSM
  /ui/*                     # design system compartilhado
```

## Entrega em blocos (com checkpoint entre cada um)

1. `ThemeProvider` + `clientConfig` do cliente demo + Hero frame-sequence
   com fallback
2. Grid de imóveis + filtro + card com hierarquia e carrossel touch
3. Institucional + depoimentos + footer
4. Simulador + mapa Leaflet + formulário de contato + WhatsApp flutuante

Cada bloco deve funcionar isoladamente (testado no navegador, com
throttling simulado) antes de seguir para o próximo.

## Fora de escopo (roadmap, não construído agora)

Chat com IA para busca de imóveis, comparador lado a lado, favoritos com
notificação por e-mail, dashboard do corretor, modo "match" estilo swipe,
multi-tenant por domínio único, upgrade de mapa (MapTiler) — todos
documentados em `ROADMAP.md`.

## Critério de sucesso

Um novo cliente (outra imobiliária) deve poder ser configurado trocando
apenas `clientConfig` + JSON de conteúdo + assets de imagem, sem editar
nenhum componente.
