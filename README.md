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

## Roadmap

Ver `ROADMAP.md` para funcionalidades fora do escopo do MVP.
