# Template Imobiliário Configurável

Esqueleto Next.js config-driven para imobiliárias. Cada cliente é um deploy separado
apontando para um `clientConfig` — nenhum componente contém marca, cor ou conteúdo fixo.

## Rodando localmente

    npm install
    npm run dev

## Testes

    npm test

## Onboarding de um novo cliente

1. Duplique `config/clients/pioneira.ts` como `config/clients/<slug>.ts` e preencha
   `brand`, `theme`, `hero` e `contact` com os dados reais do cliente.
2. Registre o novo config no mapa `clients` em `config/active-client.ts`.
3. Gere ou produza os frames do hero (WebP, `frame-001.webp`...`frame-NNN.webp`) e a imagem
   de fallback, e coloque-os em `public/clients/<slug>/hero-frames/` e
   `public/clients/<slug>/hero-fallback.webp` conforme `hero.framesPath` e `hero.fallbackImage`.
4. No deploy desse cliente, defina a variável de ambiente `NEXT_PUBLIC_CLIENT_SLUG=<slug>`
   antes do build (veja `.env.example`).

## Gerando frames placeholder do cliente demo

    npm run generate:pioneira-frames

Gera 90 frames em gradiente (cores do tema) + 1 fallback para `pioneira` — só para validar a
mecânica do hero antes de haver fotos reais.

## Jornada (segundo vídeo, controlado por scroll)

`clientConfig.journey` liga a seção que fica entre o hero e os imóveis: uma caminhada pelo
interior, frame a frame conforme o scroll, que termina com um zoom na tela do notebook onde
as ofertas aparecem.

Frames em `public/clients/<slug>/journey-frames/frame-001.webp`... e o último frame copiado
como `journey-fallback.webp`. Extração igual à do hero (ver seção acima), trocando a pasta
de saída.

O ajuste que exige medição é o `screenRect`: onde fica a tela do notebook **no último frame**,
em % do quadro. Para medir, abra o último frame num editor de imagem, selecione a área preta
da tela e converta para porcentagem (`x / largura * 100`, `y / altura * 100`). Depois ajuste:

- `zoomScale` — quanto o quadro cresce até a tela cobrir a viewport (3 costuma bastar).
- `zoomStartProgress` — fração do scroll gasta caminhando antes do zoom começar.
- `previewFadeStart` — em que ponto do zoom a tela "liga" e mostra as ofertas.

## Imóveis do cliente demo

`content/clients/pioneira/properties.json` tem 8 imóveis de exemplo. Cada imóvel aponta para 3
fotos em `public/clients/pioneira/properties/<id>/photo-{1,2,3}.webp`.

Para gerar as fotos placeholder (cores do tema):

    npm run generate:pioneira-properties

Ao trocar `properties.json` por dados reais de um cliente, gere/produza fotos de verdade nesses
mesmos caminhos — nenhum componente precisa mudar.

## Roadmap

Ver `ROADMAP.md` para funcionalidades fora do escopo do MVP.
