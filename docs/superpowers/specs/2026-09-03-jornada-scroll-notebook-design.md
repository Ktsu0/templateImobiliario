# Jornada Interativa — Scroll pelo Interior até a Tela do Notebook

## O que o usuário pediu

Um segundo vídeo, **abaixo do hero** (que já mostra a fachada e revela o nome
da imobiliária), agora **controlado por scroll** frame a frame: uma caminhada
em primeira pessoa pela sala em direção à cozinha. No fim do percurso há um
notebook sobre a mesa; ao chegar lá, a câmera **dá um zoom na tela do
notebook** e as ofertas de imóveis "abrem" dentro dela. Objetivo declarado:
"um ar de moderno e sofisticado" que faça imobiliárias quererem o site.

Decisão confirmada nesta sessão: dentro da tela aparece uma **prévia com
3 mini-cards**; o zoom continua até a tela preencher o navegador e então a
página entrega a seção real de imóveis (filtros + 8 cards). Efeito "portal".

## Como isso se encaixa no que já existe

O Bloco 1 originalmente tinha o hero preso ao scroll; nós trocamos por uma
intro em autoplay. A técnica de scroll-scrub não some — ela **muda de lugar**:
sai do hero (onde atrasava a chegada aos imóveis) e vira a ponte entre o hero
e o grid, que é exatamente onde ela vende.

Ordem final da home:

1. `HeroFrameSequence` — 100vh, intro automática da fachada, revela a marca.
2. `JourneySection` — **novo**, alto (scroll-scrub), termina no zoom da tela.
3. `#imoveis` — grid + filtros (Bloco 2), já existente.

`computeScrollProgress` e `useSectionScrollProgress` foram restaurados do
histórico (commit 643d36d) para `lib/scroll-progress.ts` e
`hooks/useSectionScrollProgress.ts`, agora com cobertura de teste ampliada
(incluindo o caso "mede a partir do offset da própria seção").

## Configuração por cliente

Nada disso pode ser fixo em componente — outra imobiliária vai filmar outro
notebook, em outra posição do quadro. Novo bloco opcional em `ClientConfig`:

```ts
export interface ClientJourney {
  enabled: boolean;
  framesPath: string;        // "/clients/<slug>/journey-frames/"
  frameCount: number;
  fallbackImage: string;     // último frame, para reduced-motion / rede lenta
  scrollHeightVh: number;    // altura do wrapper; 320 é o padrão
  /** Retângulo da tela do notebook no último frame, em % do quadro. */
  screenRect: { x: number; y: number; width: number; height: number };
  /** Fração do scroll em que o zoom começa (o resto é a caminhada). */
  zoomStartProgress: number; // 0.72 para o cliente demo
  /** Escala final do zoom — quanto a tela precisa crescer para preencher a viewport. */
  zoomScale: number;
  headline: string;          // texto que acompanha a caminhada
  subheadline: string;
}
```

Valores medidos para o cliente demo (detecção do maior blob escuro no último
frame, 1366×768): a tela ocupa **x 32,5% · y 22,1% · 41,3% × 41,7%**, centro em
(53,1%, 43%). O `screenRect` gravado na config vai levemente para dentro
(`x 34 · y 24 · 38 × 37`) para o conteúdo cair no vidro e não sobre o bezel.
`zoomScale: 3` cobre a viewport em telas de 375×812 até 2560×1080;
`previewFadeStart: 0.2` acende a tela cedo, para o visitante ver as ofertas
vindo em sua direção em vez de um retângulo preto crescendo.

## Mecânica do zoom (o ponto delicado)

O erro clássico aqui é animar o vídeo e o conteúdo da tela em duas camadas
separadas: elas saem de registro e o efeito quebra. Em vez disso, **uma única
camada transformada** contém os dois:

```
<div class="sticky top-0 h-screen overflow-hidden">      ← viewport fixa
  <div style="transform: scale(S); transform-origin: <centro da tela do notebook>">
    <canvas/>                                            ← frame da caminhada
    <div style="left/top/width/height = screenRect">     ← colado na tela do notebook
      <JourneyScreenPreview/>                            ← 3 mini-cards
    </div>
  </div>
</div>
```

Como o overlay é filho do mesmo elemento escalado e está posicionado nas
coordenadas da tela, ele cresce **junto** com a imagem, em registro perfeito,
sem nenhuma sincronia manual. `S` vai de 1 até `zoomScale` conforme o scroll
avança de `zoomStartProgress` até 1.

Curva do zoom: `easeInOutCubic` sobre a fração normalizada do trecho de zoom,
para o movimento não "arrancar" de forma abrupta ao cruzar o limiar.

A prévia dentro da tela aparece com fade a partir de ~35% do trecho de zoom
(antes disso a tela do notebook mostra só o próprio frame do vídeo).

## Fallback e acessibilidade

Mesma regra do hero, mesma função (`shouldShowHeroFallback`): com
`prefers-reduced-motion: reduce` ou conexão lenta, a jornada **não** faz
scroll-jacking — a seção encolhe para altura normal, mostra `fallbackImage`
com a headline e um link direto para `#imoveis`, e nenhum frame é baixado.
A decisão é travada uma vez após a montagem (mesmo padrão de `useHeroIntro`,
que corrigimos por causa da rede oscilante).

Mobile amostra metade dos frames, via o `computeFrameBlend` que já existe.

O botão "Ver imóveis" do hero continua indo direto para `#imoveis`, pulando a
jornada — quem quiser a experiência completa simplesmente rola.

## Componentes

```
/components/journey
  JourneySection.tsx        # wrapper alto + sticky + fallback; orquestra
  JourneyCanvas.tsx         # canvas com crossfade (reusa a lógica do hero)
  JourneyScreenPreview.tsx  # os 3 mini-cards dentro da tela do notebook
  useJourneyScroll.ts       # scroll → { frame, blend, zoomScale, previewOpacity }
/lib/journey.ts             # computeJourneyStage: matemática pura do zoom
```

`lib/journey.ts` concentra a parte testável: dada a progressão do scroll e a
config, devolve `{ walkProgress, zoomProgress, scale, previewOpacity }`.

## Testes

Puros (`lib/journey.ts`): antes do limiar não há zoom (`scale === 1`,
`previewOpacity === 0`); no fim `scale === zoomScale` e `previewOpacity === 1`;
a curva é monotônica; `walkProgress` satura em 1 quando o zoom começa.
Componentes: `JourneyScreenPreview` mostra 3 imóveis com preço formatado;
`JourneySection` renderiza o fallback (sem canvas, com link para `#imoveis`)
quando a decisão é fallback, e o canvas + overlay quando é play.
Verificação manual no navegador ao final, incluindo mobile.

## Assets

90 frames WebP 1600×900 em `public/clients/pioneira/journey-frames/`,
extraídos do vídeo enviado pelo usuário com o mesmo comando ffmpeg
documentado no README, mais `journey-fallback.webp` (último frame).

## Fora de escopo

Áudio, parallax de texto por fase, e trocar o conteúdo da prévia por dados
diferentes dos 3 primeiros imóveis do dataset — tudo fica no `ROADMAP.md`.
