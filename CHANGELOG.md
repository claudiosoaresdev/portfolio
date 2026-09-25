# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

> **Versão atual:** `0.1.0` — última release em `2026-07-03`.
> **Próxima versão prevista:** acumulando em `[Unreleased]`.

## [Unreleased]

### Added
- Workflow de CI em PRs para `main` e `develop` (e em push na `develop`): checagem de assets gerados, lint, `tsc` e build estático sob `basePath` — o mesmo gate do deploy, sem publicar — `.github/workflows/ci.yml`.
- "Ouvir o post": leitura em voz alta com a Web Speech API (`speechSynthesis`), usando as vozes do próprio sistema, sem servidor nem dependência. Lê parágrafo a parágrafo (pula blocos de código), destaca e centraliza o trecho atual, e tem pausar/continuar/parar e velocidade 1×/1,25×/1,5×. Só aparece quando o navegador tem a API **e** alguma voz em português: não sai no HTML estático e só é montado depois que as vozes carregam, então nunca aparece um botão que não funciona. Escolhe a melhor voz pt-BR (prioriza as neurais e as "Aprimorada") — `src/components/blog/post-reader.tsx`.
- Menu de arquivo na listagem do blog: um botão com ícone de árvore na lateral esquerda abre uma árvore com todos os posts por ano → mês → dia → slug (em `<details>` nativos; o ano e o mês mais recentes já vêm abertos). No desktop, o menu e o conteúdo formam uma linha flex, e o menu cresce empurrando o conteúdo para a direita; abaixo de `lg` ele abre como gaveta sobreposta, que fecha com Esc, clique fora ou ✕ — `src/components/blog/blog-shell.tsx`, `src/data/posts.ts` (`getPostArchive`), `src/app/globals.css` (`.archive-tree`).
- Paginação do blog, 10 posts por página: `/blog` é a página 1 e `/blog/page/<n>` as seguintes, todas HTML estático com canonical próprio, links reais de anterior/próxima e entradas no sitemap. Com até 10 posts o `generateStaticParams` emite um placeholder `/blog/page/2` que vira 404 com `noindex`, porque `output: "export"` recusa lista vazia — `src/app/blog/page/[page]/page.tsx`, `src/components/blog/blog-index.tsx`, `src/data/posts.ts` (`POSTS_PER_PAGE`, `getPostPage`).
- Blog em markdown versionado no repo: um `.md` por post em `content/blog/` (`YYYY-MM-DD-slug.md`) com frontmatter validado no build (`title`, `description`, `date` obrigatórios; `updated`, `tags`, `draft`, `cover` opcionais), convertido para HTML estático com unified (remark-gfm, rehype-slug, âncoras nos títulos, shiki via rehype-pretty-code — zero JS no browser). Data vem do frontmatter e não do git, porque o checkout raso do CI não tem histórico. Rascunhos só aparecem em `next dev`. Páginas `/blog` e `/blog/<slug>`, feed `/blog/rss.xml`, `Blog` + `BlogPosting` + `BreadcrumbList` em JSON-LD, sitemap com a data real de cada post e imagens de OG por post — `src/data/posts.ts`, `src/app/blog/`, `src/lib/rehype-site-links.ts`, `scripts/generate-og.mjs`.
- Deploy no GitHub Pages: workflow que builda e publica a cada push em `main`, com `basePath`/`assetPrefix` e URL canônica vindos do `actions/configure-pages` (nada fixado no código) — `.github/workflows/deploy.yml`, `next.config.ts`, `public/.nojekyll`.
- Imagens de Open Graph 1200×630 geradas como PNG estáticos — uma para a home, uma por projeto, no visual HUD do site, desenhadas com `next/og` e Orbitron versionada no repo. PNG estático em vez da convenção `opengraph-image.tsx` porque no export ela emite arquivos sem extensão, que o GitHub Pages serve como `application/octet-stream` e os scrapers sociais recusam — `scripts/generate-og.mjs`, `scripts/og-frame.mjs`, `assets/fonts/`.
- Metadata de SEO completa: Open Graph, Twitter Card, `metadataBase`, canonical por rota, `robots`/`googlebot`, `theme-color` e `color-scheme`, com origem única em `src/lib/site.ts` — `src/app/layout.tsx`, `src/app/projects/[slug]/page.tsx`.
- JSON-LD derivado dos mesmos JSON que alimentam a UI: `Person` + `WebSite` na home, `SoftwareApplication` + `BreadcrumbList` em cada projeto — `src/lib/structured-data.ts`, `src/components/seo/json-ld.tsx`.
- `/sitemap.xml`, `/robots.txt` e `/manifest.webmanifest` gerados a partir do registry de projetos — `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`.
- Identidade visual de ícone (moldura HUD chanfrada + barra lime) como fonte SVG única, rasterizada para favicon, apple-touch-icon e ícones 192/512 do manifest — `assets/icon.svg`, `scripts/generate-icons.mjs`.
- Pipeline de imagem PNG → WebP no tamanho de exibição, com o original arquivado fora de `public/` e modo `--check` para CI — `scripts/optimize-images.mjs`.
- Skip-link como primeiro tab-stop, pulando o header fixo — `src/app/layout.tsx`.

### Changed
- Blog com a mesma atmosfera HUD da home (glows, grid, vinheta, cantoneiras — presa à viewport) e o conteúdo num painel escuro translúcido com `backdrop-filter: blur` e bordas esfumadas por máscara. A atmosfera saiu do hero para um componente compartilhado — `src/components/ui/hud-backdrop.tsx`, `src/app/globals.css` (`.blur-panel`).
- Header ganha link "Blog"; o rótulo "Portfólio / ano" passa a aparecer só a partir de `sm` — `src/components/layout/site-header.tsx`.
- Skill "iOS nativo" do hero renomeada para "iOS / Swift" e movida para logo depois de "Android / Kotlin", inclusive na bio — `public/profile.json`.
- Assets do site otimizados de 5,7 MB para 288 KB (-95%): foto do hero 1,7 MB → 49 KB, capas ~780 KB → 18–29 KB. Em `output: "export"` não existe o otimizador da Next, então `public/` é literalmente o que o browser baixa — `public/images/`, `public/projects/`.
- Rajdhani reduzida de 5 pesos para 2 (400 e 700, os únicos usados no código): 6 preloads de fonte caíram para 3, liberando banda do caminho crítico do LCP — `src/app/layout.tsx`.
- Capas do carrossel não são mais pré-carregadas: ficam abaixo da dobra e nunca são o LCP, então o `preload` só competia com a foto do hero — `src/components/home/project-carousel.tsx`.
- Idioma do site corrigido de `en` para `pt-BR`, com toda a metadata reescrita em português — o conteúdo sempre foi pt-BR, o que sinalizava idioma errado aos buscadores — `src/app/layout.tsx`, `src/lib/site.ts`.
- Ano do header, do footer e do micro-label do hero derivado da data do build em vez de fixado em 2026 — `src/components/layout/`, `src/components/home/hero.tsx`.
- Hero da home virou apresentação de dev: headline "Engenheiro de Software Fullstack", descrição profissional, chips de skills, retrato em quadro HUD (zoom suave no hover) e ícones sociais — todo o conteúdo (eyebrow, título, descrição, foto, tags, redes) editável em `public/profile.json` via loader `src/data/profile.ts` — `src/components/home/hero.tsx`.
- Footer troca "Built with Next.js / Three.js" por ícones sociais pequenos (SVG inline, sem dependência) com URLs do `profile.json`; componente `SocialLinks` compartilhado entre footer (sm) e hero (md) — `src/components/layout/social-links.tsx`, `site-footer.tsx`.
- Fonte de dados dos projetos migrada do registry TypeScript para `public/projects/projects.json` — adicionar/remover projeto é editar só o JSON (+ assets); em dev o arquivo é relido a cada request, em produção exige rebuild (páginas são SSG) — `src/data/projects.ts` virou loader com validação.
- Carousel da home sem duplicação de slides: loop e auto-scroll agora só ativam quando a soma dos cards ultrapassa a viewport (medida via ResizeObserver); com poucos cards (ou 1) o track fica parado e centralizado, sem fades de borda — `src/components/home/project-carousel.tsx`.

### Fixed
- Imagens 404 sob `basePath`: com `images.unoptimized`, `next/image` não prefixa o basePath sozinho, então foto do hero e capas apontariam para fora do subcaminho do repo — `assetPath()` aplicado em cada `<Image>` — `src/lib/site.ts`.
- Textura do smartphone 3D 404 sob `basePath`: `useTexture` do drei faz fetch direto, fora do roteador da Next, e a falha caía silenciosamente no fallback estático — `src/components/project/device-scene.tsx`.
- Texto das animações de entrada invisível sem JavaScript: o HTML renderiza com `translateY(110%)` dentro de máscara `overflow-hidden`, então o conteúdo existia no DOM mas não na tela — inclusive para crawlers de IA, que em geral não executam JS — `src/app/layout.tsx`, `src/components/ui/`.
- Flash do frame do smartphone sumindo por alguns ms até o modelo 3D aparecer: o frame estático agora fica montado sob o canvas transparente e só faz fade-out quando a cena reporta o primeiro frame texturizado (`onReady` no carregamento da textura) — crossfade contínuo verificado por medição — `src/components/project/device-canvas.tsx`, `device-scene.tsx`.
- Capa "crua" durante a transição shared-element e conteúdo do hero "pipocando" depois: o scrim agora vive dentro do elemento compartilhado (card e hero) para o morph carregar a máscara junto; o texto do hero é revelado em stagger após o morph, com loader HUD animado enquanto a capa carrega — `src/components/project/project-hero.tsx`, `src/components/home/project-carousel.tsx`, `src/app/globals.css`.
- Fase "The app" reaparecendo no fim do showcase: motion compila `useTransform(scrollYProgress)` em keyframes WAAPI/ScrollTimeline, e range terminando antes de 1 ganha keyframe final implícito com o valor base (`opacity: 1`) — todos os ranges agora cobrem o domínio 0–1 com endpoints explícitos — `src/components/project/device-showcase.tsx`.
- Sobreposição de textos das fases ("The app" aparecendo sob "Platform") no showcase 3D durante o scroll — janelas de opacidade das camadas empilhadas agora são sequenciais, sem overlap — `src/components/project/device-showcase.tsx`.
- Warning de console `THREE.Clock: This module has been deprecated` — `three` fixado em `0.182.0` (última versão sem a deprecation; `@react-three/fiber` 9.x instancia `Clock` internamente e o fix upstream só existe no v10 canary).

## [0.1.0] - 2026-07-03

### Added
- Otimização de performance: cena 3D montada apenas quando a seção entra no viewport (Lighthouse projeto 72 → 100, TBT 920ms → 0ms) — `src/components/project/device-showcase.tsx`.
- Auditoria de acessibilidade e reduced-motion: contraste AA nos chips de stack, `h1` na página 404, aviso `sr-only` em links externos, scroll-cue com `motion-safe:` — Lighthouse a11y 100.
- Showcase 3D scroll-driven na página de projeto: smartphone procedural (Android/iOS por projeto) em `@react-three/fiber` com `frameloop="demand"`, screenshot do app como textura da tela, fases de conteúdo em cross-fade e trilho de progresso HUD — `src/components/project/device-showcase.tsx`, `device-scene.tsx`, `device-canvas.tsx`, `static-device-fallback.tsx` (fallback estático para WebGL indisponível e reduced-motion).
- Template de página de projeto dirigido por dados em `/projects/[slug]`: hero com shared element, seções About/Features/Architecture/Extras/Links com omissão graciosa de campos opcionais, `generateStaticParams` + 404 para slug desconhecido — `src/app/projects/[slug]/page.tsx`, `src/components/project/sections.tsx`, `project-hero.tsx`, `src/app/not-found.tsx`.
- Carousel infinito na home com Embla (`loop` + `dragFree` + auto-scroll com pausa no hover, desabilitado sob reduced-motion) e transição shared-element via View Transitions API (React `ViewTransition` + `experimental.viewTransition`) do card para o hero do projeto — `src/components/home/project-carousel.tsx`.
- Hero da home com reveal de texto mascarado palavra a palavra e estética HUD-futurista — `src/components/home/hero.tsx`, `src/components/ui/text-reveal.tsx`, `src/components/ui/reveal.tsx`.
- Registry tipado de projetos (fonte única para carousel, rotas e template) com 4 projetos seed e assets placeholder 9:16 gerados por script — `src/data/types.ts`, `src/data/projects.ts`, `scripts/generate-seed-assets.mjs`, `public/projects/`.
- Design system dark-only com tokens Tailwind v4 (`#A9FE00` primário, `#4E47E3` secundário, fundo `#0A0A0A`) e fontes Orbitron (display) + Rajdhani (corpo) via `next/font` — `src/app/globals.css`, `src/app/layout.tsx`.
- Stack de animação e 3D: `motion@12.42.2`, `embla-carousel-react@8.6.0` + `embla-carousel-auto-scroll@8.6.0`, `three@0.185.1`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`; View Transitions habilitadas em `next.config.ts`.
- Pipeline spec-driven do projeto em `.sdd/` (constitution, spec EARS, design, tasks, gates e execution log da feature `001-portfolio-core`).

[Unreleased]: https://github.com/claudiosoaresdev/portfolio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/claudiosoaresdev/portfolio/releases/tag/v0.1.0
