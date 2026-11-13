import type { Lang, Project } from "./types";

export const LANG_STORAGE_KEY = "portfolio-lang";

/** O projeto tem versão em português? Sem ela, o seletor de idioma some. */
export function hasTranslation(project: Project): boolean {
  return !!project.translations?.pt;
}

/** Aplica as traduções por cima do texto-base (inglês). Puro e sem I/O. */
export function localize(project: Project, lang: Lang): Project {
  const copy = lang === "pt" ? project.translations?.pt : undefined;
  if (!copy) return project;
  return {
    ...project,
    tagline: copy.tagline,
    description: copy.description,
    role: copy.role,
    features: copy.features,
    architecture: {
      ...project.architecture,
      summary: copy.architecture.summary,
      build: copy.architecture.build ?? project.architecture.build,
    },
    extras: copy.extras ?? project.extras,
    gallery: project.gallery?.map((item, i) => ({
      ...item,
      ...(copy.gallery?.[i] ?? {}),
    })),
  };
}

/** Rótulos fixos da página de detalhes (não vêm do JSON). */
export const UI_COPY = {
  en: {
    about: "About the project",
    overview: "Overview",
    features: "Features",
    whatItDoes: "What it does",
    architecture: "Architecture",
    underTheHood: "Under the hood",
    howBuilt: "How it was built",
    stack: "Stack",
    webCarousel: "Web",
    mobileCarousel: "Mobile",
    details: "Details",
    deepDive: "Deep dive",
    links: "Links",
    explore: "Explore the project",
    opensNewTab: "(opens in new tab)",
    back: "All projects",
    theApp: "The app",
    platform: "Platform",
    highlight: "Highlight",
    scroll: "Scroll",
    loading: "Loading",
    prev: "Previous",
    next: "Next",
    slide: "Go to slide",
    language: "Language",
  },
  pt: {
    about: "Sobre o projeto",
    overview: "Visão geral",
    features: "Funcionalidades",
    whatItDoes: "O que ele faz",
    architecture: "Arquitetura",
    underTheHood: "Por dentro",
    howBuilt: "Como foi construído",
    stack: "Stack",
    webCarousel: "Web",
    mobileCarousel: "Mobile",
    details: "Detalhes",
    deepDive: "Mergulho técnico",
    links: "Links",
    explore: "Explore o projeto",
    opensNewTab: "(abre em nova aba)",
    back: "Todos os projetos",
    theApp: "O app",
    platform: "Plataforma",
    highlight: "Destaque",
    scroll: "Role",
    loading: "Carregando",
    prev: "Anterior",
    next: "Próximo",
    slide: "Ir para o slide",
    language: "Idioma",
  },
} as const satisfies Record<Lang, Record<string, string>>;
