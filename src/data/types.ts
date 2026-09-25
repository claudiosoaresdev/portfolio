export type DeviceKind = "android" | "ios";

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectArchitecture {
  summary: string;
  stack: string[];
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
 * Os caminhos de asset (`cover`, `screenshot`) são relativos à raiz do site,
 * SEM o basePath. Quem entrega a URL ao browser — `<Image src>` e a textura do
 * WebGL — aplica `assetPath()`; o JSON-LD aplica `absoluteUrl()`. Guardar o
 * caminho cru aqui evita prefixar duas vezes.
 */
export interface Project {
  slug: string; // url-safe, unique
  name: string;
  tagline: string; // short hero line
  description: string; // 2-3 sentence paragraph
  cover: string; // "/projects/<slug>/cover.webp"  (9:16 portrait)
  screenshot: string; // "/projects/<slug>/screen.webp" (phone screen)
  device: DeviceKind; // which 3D phone model renders on its page
  year: string;
  role: string;
  features: ProjectFeature[]; // >= 1
  architecture: ProjectArchitecture;
  links: ProjectLinks; // all optional
  extras?: ProjectExtra[]; // optional, rendered after architecture
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
