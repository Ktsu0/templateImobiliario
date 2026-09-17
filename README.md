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

Os dois masters passam **copiados** (`-c:v copy`), sem reencode e sem perda de geração. O
`journey.mp4` já foi reencodado all-intra para um scrub feito na mão com `currentTime`
conseguir buscar qualquer quadro; isso custava uma geração de qualidade e dobrava o
arquivo. Hoje ele é tocado pelo [`scrolly-video`](https://github.com/dkaoster/scrolly-video),
que decodifica o stream original via WebCodecs onde dá e modula o `playbackRate` onde não
dá — então o bitstream do master é tudo de que ele precisa.

Os dois levam `+faststart`, que põe o índice na frente para a reprodução começar nos
primeiros bytes em vez de esperar o arquivo inteiro.

Posters e fallbacks são recortados de frames sem perda dos mesmos masters. O poster **tem**
que ser o primeiro quadro, senão a imagem pula visivelmente quando o vídeo começa.

**Os dois filmes precisam se emendar.** O último quadro do hero tem que ser o primeiro
quadro da jornada (mesmo enquadramento, mesma luz): é isso que permite trocar um pelo
outro no lugar, sem corte visível, no instante em que o visitante começa a rolar.

Isso substituiu uma versão que servia ~140 stills WebP por sequência, decodificados e
desenhados num canvas por JS: custava 23 MB e o hero só aparecia depois de baixar tudo.

**Limite do material de origem.** Os dois masters são 1024×768 e 1366×768 nativos. Nenhuma
dessas escolhas aumenta resolução — numa tela de 1920 qualquer uma estica ~1024 px reais
pela largura toda. Para ganhar detalhe de verdade é preciso passar os masters por um
upscaler de vídeo por IA antes desta etapa, ou refilmar em alta.

## Jornada (segundo vídeo, controlado por scroll)

Com `clientConfig.journey` definido, hero e jornada viram **um palco só**, fixo na viewport
(`ExperienceSection`). O filme do hero roda sozinho e termina com o nome da imobiliária no
ar. Na primeira rolada, o cartão some e a jornada assume os mesmos pixels — o primeiro
quadro dela é o último dele, então não há corte. Dali em diante o scroll arrasta a
caminhada até o fim, e a seção solta direto nos imóveis.

O filme fica em `public/clients/<slug>/journey.mp4`, produzido pelo script da seção acima.
O único ajuste é `scrollHeightVh`: quanto de scroll a caminhada ocupa (320 costuma bastar
para um filme de ~10 s).

Sob `prefers-reduced-motion` ou numa conexão que não daria para bufferizar a caminhada, a
seção deixa de fixar e de ocupar scroll: fica só o hero, com o CTA indo direto aos imóveis.

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
