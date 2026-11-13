/** Tipo do projeto: decide a cena 3D da página e o rótulo de plataforma. */
export type ProjectType = "android" | "ios" | "web" | "fullstack";

/**
 * Categorias extras, além do tipo: hoje só `backend` (projeto com API/servidor
 * próprio). Fullstack já conta como backend sem precisar da tag.
 */
export type ProjectTag = "backend";

/** Estilo do celular 3D (punch-hole vs dynamic island). */
export type PhoneKind = "android" | "ios";

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectArchitecture {
  summary: string;
  /** "Como foi construído": parágrafos curtos, depois do resumo e do stack. */
  build?: string[];
  stack: string[];
}

/** Idiomas do conteúdo dos projetos. `en` é o texto-base do JSON; o padrão exibido é `pt`. */
export type Lang = "en" | "pt";

/**
 * O que a cena 3D (e o fallback estático) precisa saber, derivado do projeto
 * por `deviceSpec()` em src/data/platform.ts.
 */
export interface DeviceSpec {
  kind: ProjectType;
  phone: PhoneKind;
  screenshot: string;
  desktopScreenshot?: string;
}

export interface ProjectLinks {
  github?: string;
  playStore?: string;
  appStore?: string;
  website?: string;
}

export interface ProjectExtra {
  title: string;
  body: string;
}

/**
 * Item da galeria da página de detalhes (prints e vídeos em loop). Caminho
 * cru, sem basePath — mesma regra de `cover`/`screenshot`. `frame` decide a
 * moldura (janela de navegador ou celular) e a proporção reservada.
 */
export interface ProjectGalleryItem {
  src: string; // "/projects/<slug>/gallery/<arquivo>.webp" ou ".mp4"
  type: "image" | "video";
  frame: "desktop" | "mobile";
  caption: string;
  alt: string;
}

/** Legenda e alt de um item da galeria, na mesma ordem de `gallery`. */
export interface GalleryCopy {
  caption: string;
  alt: string;
}

/**
 * Versão traduzida dos textos de um projeto (o texto-base do JSON é inglês).
 * Só o que é texto vai aqui; caminhos, links e stack continuam no projeto.
 */
export interface ProjectCopy {
  tagline: string;
  description: string;
  role: string;
  features: ProjectFeature[];
  architecture: { summary: string; build?: string[] };
  extras?: ProjectExtra[];
  gallery?: GalleryCopy[];
}

/**
 * Os caminhos de asset (`cover`, `screenshot`, `desktopScreenshot`) são relativos à raiz do site,
 * SEM o basePath. Quem entrega a URL ao browser — `<Image src>` e a textura do
 * WebGL — aplica `assetPath()`; o JSON-LD aplica `absoluteUrl()`. Guardar o
 * caminho cru aqui evita prefixar duas vezes.
 */
export interface Project {
  slug: string; // url-safe, unique
  name: string;
  tagline: string; // short hero line
  description: string; // 2-3 sentence paragraph
  cover: string; // "/projects/<slug>/cover.webp"  (9:16 portrait) — card da home
  heroCover?: string; // "/projects/<slug>/hero.webp" (16:9) — capa da página de detalhes; padrão = cover
  screenshot: string; // "/projects/<slug>/screen.webp" (phone screen, 9:16 — all types)
  desktopScreenshot?: string; // "/projects/<slug>/desktop.webp" (16:10) — required for web/fullstack
  device: ProjectType; // which 3D scene renders on its page
  phone?: PhoneKind; // fullstack only: phone style; default "ios"
  tags?: ProjectTag[]; // extra categories for the home filter (e.g. "backend")
  year: string;
  role: string;
  features: ProjectFeature[]; // >= 1
  architecture: ProjectArchitecture;
  links: ProjectLinks; // all optional
  extras?: ProjectExtra[]; // optional, rendered after architecture
  gallery?: ProjectGalleryItem[]; // optional, carrosséis web/mobile dentro de Architecture
  translations?: { pt?: ProjectCopy }; // optional; sem isso o projeto fica só em inglês
}

/**
 * Metadados de um post — vêm do frontmatter de content/blog/<arquivo>.md.
 * O slug não vem do frontmatter: é o nome do arquivo sem a data do prefixo.
 * `cover` segue a mesma regra dos assets de projeto: caminho cru, sem basePath.
 */
export interface PostMeta {
  slug: string;
  title: string;
  description: string; // vira meta description e resumo na listagem
  date: string; // "YYYY-MM-DD" — data de publicação
  updated?: string; // "YYYY-MM-DD" — última revisão relevante
  tags: string[];
  draft: boolean; // só aparece em `next dev`
  cover?: string; // "/blog/<slug>/cover.webp"
  readingMinutes: number;
}

export interface Post extends PostMeta {
  html: string; // corpo já convertido; gerado no build a partir do markdown
}

/** Árvore do arquivo do blog: ano → mês → dia → posts. Mais recente primeiro. */
export interface ArchiveYear {
  year: string; // "2026"
  count: number;
  months: ArchiveMonth[];
}

export interface ArchiveMonth {
  key: string; // "2026-09" — id estável para o DOM
  label: string; // "setembro"
  count: number;
  days: ArchiveDay[];
}

export interface ArchiveDay {
  key: string; // "2026-09-24"
  label: string; // "24"
  posts: { slug: string; title: string }[];
}
