/**
 * JSON-LD (schema.org) — o formato que buscadores e crawlers de IA leem para
 * entender *o que* a página é, em vez de inferir do texto.
 *
 * Os dados vêm dos mesmos JSON que alimentam a UI (public/profile.json e
 * public/projects/projects.json), então nunca saem de sincronia com o site.
 */
import { getProfile } from "@/data/profile";
import type { PostMeta, Project } from "@/data/types";
import { absoluteUrl, site } from "./site";

/** Ordem estável das redes, para o array `sameAs` não oscilar entre builds. */
const SOCIAL_KEYS = ["github", "linkedin", "instagram", "x"] as const;

export function personSchema() {
  const profile = getProfile();
  const social = profile.social ?? {};
  const sameAs = SOCIAL_KEYS.map((key) => social[key]).filter(
    (href): href is string => Boolean(href),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: site.author,
    url: site.url,
    image: absoluteUrl(profile.photo),
    jobTitle: [...profile.title.lines, profile.title.accent].join(" "),
    description: profile.description,
    knowsAbout: profile.skills,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** A home em si: um site de portfólio cujo autor é a Person acima. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.lang,
    author: { "@id": absoluteUrl("/#person") },
  };
}

/**
 * Cada projeto é um SoftwareApplication — o tipo que descreve um app, com
 * plataforma e link de loja, e não apenas "uma página com texto".
 */
export function projectSchema(project: Project) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const storeUrl =
    project.links.playStore ?? project.links.appStore ?? project.links.website;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: project.name,
    url,
    description: project.description,
    abstract: project.tagline,
    applicationCategory: "MobileApplication",
    operatingSystem: project.device === "ios" ? "iOS" : "Android",
    image: absoluteUrl(project.cover),
    screenshot: absoluteUrl(project.screenshot),
    dateCreated: project.year,
    inLanguage: site.lang,
    keywords: project.architecture.stack.join(", "),
    author: { "@id": absoluteUrl("/#person") },
    creator: { "@id": absoluteUrl("/#person") },
    ...(storeUrl && { downloadUrl: storeUrl }),
    ...(project.links.github && { codeRepository: project.links.github }),
  };
}

/**
 * Trilha de navegação da página de projeto — vira o breadcrumb que aparece
 * abaixo do título no resultado de busca.
 */
export function projectBreadcrumbSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: project.name,
        item: absoluteUrl(`/projects/${project.slug}`),
      },
    ],
  };
}

/**
 * O índice do blog: um Blog cujos itens são os BlogPosting abaixo. Nas
 * páginas 2+ da listagem, `blogPost` traz só os posts daquela página, mas o
 * `@id` continua o do blog — é a mesma entidade vista em outra página.
 */
export function blogSchema(posts: PostMeta[], path = "/blog") {
  const url = absoluteUrl("/blog");

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    mainEntityOfPage: absoluteUrl(path),
    name: `Blog — ${site.name}`,
    inLanguage: site.lang,
    author: { "@id": absoluteUrl("/#person") },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.date,
    })),
  };
}

/**
 * Cada post é um BlogPosting — com datas de publicação e revisão, que é o que
 * buscadores usam para mostrar a data no resultado.
 */
export function postSchema(post: PostMeta) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: site.lang,
    image: absoluteUrl(post.cover ?? `/og/blog/${post.slug}.png`),
    keywords: post.tags.join(", "),
    author: { "@id": absoluteUrl("/#person") },
    publisher: { "@id": absoluteUrl("/#person") },
    isPartOf: { "@id": absoluteUrl("/blog#blog") },
  };
}

/** Início › Blog › post. */
export function postBreadcrumbSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };
}
