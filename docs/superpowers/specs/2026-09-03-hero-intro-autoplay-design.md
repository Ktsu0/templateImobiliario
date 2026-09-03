# Hero — Intro Cinematográfica Automática — Design

## Motivação

Feedback do usuário após ver o hero com a filmagem real: o vídeo deve **rodar
sozinho** (com o zoom da própria filmagem), o nome da imobiliária deve
**aparecer perto do fim** da sequência (não desde o início) e o texto estava
**baixo demais** na tela. Referência visual: o repositório
`ingridalvesfarias/Spider-Man_DevArt` (canvas frame-sequence com crossfade
entre frames e textos revelados por fase). Objetivo: um hero que venda —
cinematográfico, profissional, e que leve rápido aos imóveis.

Decisão confirmada com o usuário: **intro automática, sem scroll-scrub**. Isso
substitui o mecanismo "frame por posição de scroll" do Bloco 1.

## Comportamento

1. O hero ocupa **100vh** (não mais 300vh com `sticky`). Não há scroll travado.
2. Enquanto os frames carregam, mostra o primeiro frame disponível + a barra de
   progresso sutil (`FramePreloader`).
3. Ao completar o preload, a sequência **toca sozinha** do frame 1 ao último em
   `hero.autoplayDurationMs` (novo campo opcional em `ClientHero`, padrão
   6000 ms), via `requestAnimationFrame`, e para no último frame.
4. **Crossfade**: cada quadro desenha o frame atual e, por cima, o próximo com
   `globalAlpha` igual à fração entre eles — suaviza os 15 fps da sequência.
5. **Ken Burns leve**: o canvas escala de 1.0 a 1.06 ao longo da intro,
   reforçando o zoom da filmagem.
6. **Título**: nome + slogan **centralizados** vertical e horizontalmente,
   fonte display grande, sobre um gradiente da cor `bgDark` (contraste sobre
   a foto). Ficam invisíveis até `introProgress >= 0.75`, então entram com
   fade + deslize de 24px (700 ms). Junto vem o CTA **"Ver imóveis"**, que rola
   até `#imoveis`.
7. **"Pular introdução"** continua sempre visível no canto superior direito:
   completa a intro imediatamente (último frame + título) e rola até
   `#imoveis`.
8. **Fallback** (`prefers-reduced-motion` ou conexão lenta, ou
   `hero.mode === "static-image"`): imagem estática, título e CTA visíveis de
   imediato, sem preload dos frames, sem escala.
9. Mobile continua amostrando metade dos frames (`computeFrameBlend` com
   `isMobile`).

## Fontes e cores

- As fontes do tema (`theme.fontDisplay`, `theme.fontBody`) passam a ser
  carregadas do Google Fonts por um `<link>` montado em runtime a partir do
  config (`buildGoogleFontsUrl(theme)`), com `preconnect`. Hoje `--font-display`
  aponta para "Fraunces" mas nada a carrega — cai no serif do sistema.
- `buildThemeCssVars` passa a emitir também `--<token>-rgb: "r g b"` e o
  Tailwind define as cores como `rgb(var(--x-rgb) / <alpha-value>)`, para que
  modificadores de opacidade (`bg-bgDark/85`, `text-ivory/90`, `bg-ink/90`)
  funcionem. Sem isso o Tailwind ignora silenciosamente o `/NN`.

## Componentes (o que muda no Bloco 1)

- `lib/hero-frames.ts`: `computeFrameBlend(progress, frameCount, isMobile)
  → { index, nextIndex, blend }` substitui `computeFrameIndex`;
  `computeScrollProgress` é removido (sem uso).
- `hooks/useSectionScrollProgress.ts` e
  `components/hero-frame-sequence/useScrollFrames.ts`: removidos.
- `hooks/useAutoplayProgress.ts` (novo): `(durationMs, enabled) → { progress,
  complete }`, rAF-driven, clamped em 1.
- `components/hero-frame-sequence/useHeroIntro.ts` (novo, substitui
  `useScrollFrames`): compõe preload + fallback + autoplay + blend; expõe
  `currentImage, nextImage, blend, preloadProgress, showFallback,
  introProgress, isTitleVisible, skipIntro`.
- `HeroCanvas`: recebe `nextImage`/`blend`/`introProgress`; desenha o crossfade;
  aplica a escala; adiciona o overlay em gradiente.
- `HeroFrameSequence`: 100vh, título centralizado com reveal, CTA "Ver
  imóveis", skip = `skipIntro()` + scroll.
- `config/types.ts`: `ClientHero.autoplayDurationMs?: number`.
- `app/layout.tsx`: `<link>` das fontes a partir do tema.

## Testes

Puros: `computeFrameBlend` (bordas, mobile, blend fracionário),
`buildGoogleFontsUrl`, `buildThemeCssVars` com `-rgb`. Hooks: `useAutoplayProgress`
com rAF mockado (progresso ao longo do tempo, clamp, `complete`),
`useHeroIntro` com sub-hooks mockados (fallback, título visível a partir de
0.75). Componentes: `HeroCanvas` desenha dois frames quando `blend > 0`
(`getContext` mockado); `HeroFrameSequence` esconde/mostra o título e liga
skip/CTA. Verificação manual no navegador ao final.

## Fora de escopo

Reduzir o preload em mobile (hoje carrega os 90 e amostra 45) fica anotado
no `ROADMAP.md`; não bloqueia esta entrega.
