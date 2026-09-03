# Bloco 2 — Grid de Imóveis, Filtro e Cards — Design

## Objetivo

Segundo bloco do template imobiliário configurável (ver
[2026-09-02-imobiliaria-template-design.md](2026-09-02-imobiliaria-template-design.md)):
grid de imóveis com hierarquia visual real, filtro compartilhado entre desktop e
mobile, e cards com carrossel de fotos touch-first — tudo lendo de conteúdo
JSON por cliente, sem nada hardcoded em componente.

## Dados dos imóveis

Novo arquivo `content/clients/pioneira/properties.json` com 8 imóveis de
demonstração, cada um com:

```ts
interface Property {
  id: string;
  title: string;
  transaction: "venda" | "aluguel";
  type: string; // "Casa", "Apartamento", "Cobertura", ...
  price: number; // em reais, sem formatação
  location: string; // bairro/cidade, texto livre para o filtro de localização
  bedrooms: number;
  suites: number;
  area: number; // m²
  parkingSpots: number;
  status: "venda" | "aluguel" | "lancamento" | "exclusivo";
  featured: boolean; // exatamente um `true` no dataset demo
  photos: string[]; // caminhos para /clients/<slug>/properties/<id>/photo-N.webp
}
```

Acesso isolado via `lib/content/properties.ts` (`getProperties(): Property[]`),
lendo o JSON local hoje — trocar por chamada a um CMS headless no futuro não
deve exigir mudança em nenhum componente.

Fotos: placeholders gerados pelo mesmo esquema do hero (gradiente nas cores do
tema + rótulo), 3 fotos por imóvel (24 no total), geradas por
`scripts/generate-placeholder-properties.ts` em
`public/clients/pioneira/properties/<id>/photo-{1,2,3}.webp`.

## Hierarquia do grid

`PropertyGrid.tsx` monta um CSS grid de 3 colunas × 2 linhas no desktop; o
imóvel com `featured: true` ocupa a célula `linha 1–2, coluna 1` (dobro de
área), os demais preenchem as células restantes na ordem do array filtrado.
Em telas estreitas (`md:` breakpoint do Tailwind) colapsa para 1 coluna — o
destaque continua sendo o primeiro item renderizado, só que com uma altura
levemente maior (`aspect-[4/3]` vs `aspect-[16/10]` nos demais) em vez de
ocupar células extras.

`PropertyCard.tsx` recebe uma prop `variant: "featured" | "default"` que só
afeta classes de tamanho/tipografia — o card não sabe nada sobre a posição no
grid nem sobre quantas colunas existem. Se o array filtrado não tiver nenhum
`featured: true` (ex: o imóvel destaque foi filtrado para fora), o primeiro
resultado do filtro assume a variante `featured` — replicando a regra do
prompt original ("o primeiro resultado do filtro, ou o imóvel marcado como
destaque").

## Card do imóvel

- `PropertyCarousel.tsx`: troca de foto por swipe horizontal (`touchstart` /
  `touchmove` / `touchend`, sem biblioteca externa) e por clique em setas
  prev/next visíveis em hover (desktop) — nunca a única forma de navegar.
  Bolinhas de posição na parte inferior.
- `PropertyCard.tsx`: badge de status (cores do tema, nunca hardcoded), ícones
  minimalistas para quartos/suítes/m²/vagas (heroicons inline, sem lib extra),
  preço formatado em BRL via `Intl.NumberFormat("pt-BR", {style:"currency",
  currency:"BRL"})` (+ `"/mês"` quando `transaction === "aluguel"`), botão de
  favoritar (♥) e CTA de WhatsApp.
- Favoritar: estado em `useFavoritesStore` (Zustand), só toggle em memória —
  sem persistência em disco/localStorage e sem notificação por e-mail (isso
  fica no ROADMAP). Decisão tomada nesta sessão: incluir o botão agora porque
  é barato (não exige backend) e prepara terreno para o roadmap.
- CTA WhatsApp: monta a URL
  `https://wa.me/<clientConfig.contact.whatsapp>?text=<mensagem>` com uma
  mensagem fixa no código (não configurável por cliente nesta fase) citando
  título e localização do imóvel, ex: *"Olá! Tenho interesse no imóvel
  {title} em {location}."* — codificada com `encodeURIComponent`.

## Filtro

`useFilterStore` (Zustand) guarda `{ transaction, propertyType, location,
priceRange: [number, number], bedrooms }`, com uma action `setFilter` e
`resetFilters`. Tanto `FloatingFilterBar.tsx` (desktop, pílula fixa acima do
grid — confirmado no mockup) quanto `FilterBottomSheet.tsx` (mobile) leem e
escrevem no mesmo store, sem duplicar estado. A filtragem em si é uma função
pura `filterProperties(properties: Property[], filters: FilterState):
Property[]`, testável isoladamente.

Botão de filtro no mobile: círculo no canto inferior **esquerdo**, espelhando
o botão de WhatsApp (inferior direito) — confirmado visualmente na sessão de
brainstorming. Union de z-index: WhatsApp e filtro ficam em camadas
independentes (`z-40`/`z-40`, não se sobrepõem espacialmente, então não há
disputa de z-index real, só a garantia visual de não colidirem no layout).

## Testes

Lógica pura (Vitest, sem DOM):
- `filterProperties` — cada campo de filtro isolado + combinação de vários.
- `formatPrice` — BRL com e sem `/mês`.
- `buildWhatsAppUrl(property, whatsappNumber)` — encoding correto da mensagem.
- `resolveFeaturedProperty(properties)` — usa o `featured: true` se ele
  sobreviveu ao filtro, senão cai no primeiro item da lista filtrada.

Componentes (RTL): `PropertyCard` renderiza badge/preço/atributos corretos por
imóvel; `PropertyCarousel` avança de foto ao clicar nas setas e ao simular
swipe; `FloatingFilterBar`/`FilterBottomSheet` disparam `setFilter` no store
compartilhado. Validação manual no navegador (como no Bloco 1): swipe touch
real, abertura do bottom-sheet, posição dos dois botões flutuantes lado a
lado sem sobreposição, grid colapsando em mobile.

## Fora de escopo (permanece no ROADMAP)

Persistência de favoritos (localStorage/backend) e notificação por e-mail,
paginação/infinite-scroll do grid, busca por texto livre, comparador de
imóveis — nenhum desses é tocado neste bloco.

## Critério de sucesso

Filtrar por transação/tipo/localização/preço/quartos atualiza o grid
instantaneamente nos dois breakpoints; o card em destaque muda corretamente
quando o filtro exclui o imóvel `featured` original; o carrossel funciona por
touch sem depender de hover; nenhum componente importa cor, texto de marca ou
imóvel diretamente — tudo vem de `clientConfig` ou do JSON de conteúdo.
