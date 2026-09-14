# Template Imobiliario Configuravel

Esqueleto Next.js config-driven para sites de imobiliarias: hero em video, secao de jornada controlada por scroll e vitrine de imoveis. Cada cliente e um deploy separado apontando para um clientConfig proprio - nenhum componente tem marca, cor ou conteudo fixo, entao um site novo sai duplicando um arquivo de configuracao.

**Demo:** https://template-imobiliario-swart.vercel.app

## Tecnologias

- Next.js
- TypeScript
- Video otimizado (hero e jornada scroll-driven) processado via ffmpeg

## Rodando localmente

    npm install
    npm run dev

## Testes

    npm test

## Onboarding de um novo cliente

1. Duplique `config/clients/meridiano.ts` como `config/clients/<slug>.ts` e preencha
   `brand`, `theme`, `hero` e `contact` com os dados reais do cliente.
2. Registre o novo config no mapa `clients` em `config/active-client.ts`.
3. Gere a mídia a partir dos vídeos do cliente (ver "Gerando a mídia"). Saem
   `hero.mp4`, `journey.mp4`, os posters e os fallbacks em `public/clients/<slug>/`.
4. No deploy desse cliente, defina a variável de ambiente `NEXT_PUBLIC_CLIENT_SLUG=<slug>`
   antes do build (veja `.env.example`).

## Gerando a mídia

Toda a mídia do cliente — os dois filmes e as 8 fotos dos imóveis — sai dos dois vídeos
originais, por um script só:

    npm run build:meridiano-media -- <hero.mp4> <jornada.mp4>

Os dois são codificados de formas diferentes porque são tocados de formas diferentes:

- **`hero.mp4`** roda do começo ao fim, então o bitstream do master passa **copiado**, sem
  reencode e sem perda de geração (~2 MB).
- **`journey.mp4`** é arrastado pelo scroll, ou seja, busca um quadro arbitrário várias
  vezes por segundo. Vai **all-intra** (`-g 1`): todo quadro é keyframe e nenhuma busca
  precisa decodificar uma cadeia até chegar lá. Isso dobra o tamanho (~5,3 MB) e é o que
  compra um scrub que não engasga.

Os dois levam `+faststart`, que põe o índice na frente para a reprodução começar nos
primeiros bytes em vez de esperar o arquivo inteiro.

Posters e fallbacks são recortados de frames sem perda dos mesmos masters. O poster **tem**
que ser o primeiro quadro, senão a imagem pula visivelmente quando o vídeo começa.

Isso substituiu uma versão que servia ~140 stills WebP por sequência, decodificados e
desenhados num canvas por JS: custava 23 MB e o hero só aparecia depois de baixar tudo.

**Limite do material de origem.** Os dois masters são 1024×768 e 1366×768 nativos. Nenhuma
dessas escolhas aumenta resolução — numa tela de 1920 qualquer uma estica ~1024 px reais
pela largura toda. Para ganhar detalhe de verdade é preciso passar os masters por um
upscaler de vídeo por IA antes desta etapa, ou refilmar em alta.

## Jornada (segundo vídeo, controlado por scroll)

`clientConfig.journey` liga a seção que fica entre o hero e os imóveis: uma caminhada pelo
interior, frame a frame conforme o scroll, que termina com um zoom na tela do notebook onde
as ofertas aparecem.

O filme fica em `public/clients/<slug>/journey.mp4` e o último quadro também é gravado como
`journey-fallback.webp` — tudo produzido pelo script da seção acima.

O ajuste que exige medição é o `screenRect`: onde fica a tela do notebook **no último frame**,
em % do quadro. Para medir, abra o último frame num editor de imagem, selecione a área preta
da tela e converta para porcentagem (`x / largura * 100`, `y / altura * 100`). Depois ajuste:

- `zoomScale` — quanto o quadro cresce até a tela cobrir a viewport (3 costuma bastar).
- `zoomStartProgress` — fração do scroll gasta caminhando antes do zoom começar.
- `previewFadeStart` — em que ponto do zoom a tela "liga" e mostra a marca.

A tela do notebook é posicionada por layout (`computeScreenBox`), fora do elemento
que sofre o `transform: scale`. Isso é deliberado: aquele elemento vira uma camada
de composição própria, que o navegador rasteriza uma vez no tamanho original e
depois estica — qualquer texto ou vetor dentro dele chegaria borrado pelo fator do
zoom. Não mova a tela para dentro do `journey-zoom`.

## Imóveis do cliente demo

`content/clients/meridiano/properties.json` tem 8 imóveis de exemplo. Cada imóvel aponta para 3
fotos; os caminhos são livres, os componentes só leem o array `photos`.

No cliente demo, as fotos em `public/clients/meridiano/photos/casa-{1..8}.webp` são quadros
tirados dos dois vídeos do próprio cliente (fachada e interior), distribuídos em rotação entre os
8 imóveis. Elas saem em 2048×1536 do mesmo script — o `next/image` reduz para o tamanho que
cada card pede. Para um cliente real, coloque as fotos de verdade em `public/clients/<slug>/` e
aponte cada imóvel para elas no JSON — nenhum componente precisa mudar.

Sem fotos ainda? `npm run generate:meridiano-properties` cria placeholders nas cores do tema em
`public/clients/meridiano/properties/<id>/photo-{1,2,3}.webp`; aponte o JSON para eles.

## Roadmap

Ver `ROADMAP.md` para funcionalidades fora do escopo do MVP.
