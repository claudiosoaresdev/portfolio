# Claudio Soares — Portfólio

Portfólio pessoal de engenharia de software: home com apresentação em estética
HUD-futurista, carrossel de projetos e página por projeto com showcase 3D de
smartphone dirigido por scroll.

![Passeio pelo portfólio: scroll da home, abertura do primeiro projeto, showcase 3D e retorno à home](docs/assets/demo.gif)

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router, SSG) |
| UI        | React 19, Tailwind CSS v4 |
| Animação  | `motion` v12, View Transitions API |
| 3D        | `three` + `@react-three/fiber` + `@react-three/drei` |
| Carrossel | `embla-carousel-react` + auto-scroll |
| Linguagem | TypeScript |

## Rodando local

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

Gate de qualidade (não há test runner na v1):

```bash
npm run lint && npx tsc --noEmit && npm run build
```

## Estrutura

```
public/
  profile.json            # conteúdo do hero da home (texto, foto, skills, redes)
  images/profile.png      # retrato do hero
  projects/projects.json  # fonte de dados dos projetos
  projects/<slug>/        # cover.png (9:16) + screen.png (tela do app)
src/
  app/                    # rotas App Router (/ e /projects/[slug])
  components/home/        # hero + carrossel
  components/project/     # hero do projeto, seções, showcase 3D
  components/layout/      # header, footer, links sociais
  data/                   # loaders + tipos (profile.ts, projects.ts, types.ts)
scripts/
  generate-seed-assets.mjs  # gerador de arte placeholder (cover/screen)
  capture-demo.mjs          # captura os frames do GIF de demo
docs/assets/              # mídia usada neste README
```

## Editando o conteúdo

### Apresentação (home)

Tudo no hero vem de `public/profile.json`: `eyebrow`, `title.lines`,
`title.accent`, `description`, `photo`, `skills[]` e `social.{github,linkedin,instagram}`.

### Projetos

Adicionar/remover projeto = editar `public/projects/projects.json` e colocar os
assets em `public/projects/<slug>/`. Não existe registry em TypeScript.

Campos por projeto (`src/data/types.ts`):

- obrigatórios: `slug`, `name`, `tagline`, `description`, `cover`, `screenshot`,
  `device` (`"android"` | `"ios"`), `year`, `role`, `features[]`,
  `architecture.{summary,stack[]}`, `links`
- opcionais: `links.{github,playStore,appStore,website}`, `extras[]`

Assets esperados:

| Arquivo | Dimensão | Uso |
|---------|----------|-----|
| `cover.png`  | 1080×1920 (9:16) | card do carrossel e hero do projeto |
| `screen.png` | 1080×2340 | textura da tela do smartphone 3D |

Arte placeholder pode ser regerada com `node scripts/generate-seed-assets.mjs`
(macOS — usa `qlmanage`/`sips` para rasterizar os SVGs).

> As páginas são estáticas (SSG). Em dev o JSON é relido a cada request; em
> produção, editar o JSON exige `npm run build`.

## Regerando o GIF de demo

O `docs/assets/demo.gif` é gerado a partir da build de produção — o script
`scripts/capture-demo.mjs` (Playwright) percorre home → primeiro projeto →
showcase 3D → volta para a home, capturando um PNG por passo:

```bash
npm run build
npx next start -p 3111 &
BASE_URL=http://localhost:3111 node scripts/capture-demo.mjs --out /tmp/demo-frames

ffmpeg -y -framerate 20 -i /tmp/demo-frames/frame-%04d.png \
  -vf "fps=12,scale=800:-1:flags=lanczos,split[a][b];\
[a]palettegen=max_colors=96:stats_mode=diff[p];\
[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  -loop 0 docs/assets/demo.gif
```

Flags do script: `--out <dir>`, `--width` (padrão 1280), `--height` (padrão 800).
Subir `fps`/`scale`/`max_colors` melhora a imagem e engorda o arquivo — o preset
acima fica em ~3,7 MB para ~10 s.

## Deploy

Otimizado para Vercel — `npm run build` gera as páginas de projeto via
`generateStaticParams`.

## Changelog

Mudanças notáveis em [`CHANGELOG.md`](CHANGELOG.md) (Keep a Changelog + SemVer).
