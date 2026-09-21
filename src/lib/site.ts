/**
 * Configuração canônica do site — origem única para metadata, sitemap,
 * robots e JSON-LD.
 *
 * `url` precisa ser absoluta: é ela que resolve as URLs de imagem de Open
 * Graph e o canonical. Em build estático não há request para inferir o host,
 * então defina NEXT_PUBLIC_SITE_URL no ambiente de build (ex.: no workflow do
 * GitHub Actions) sempre que o domínio for diferente do padrão abaixo.
 */
/**
 * Prefixo de caminho quando o site não está na raiz do domínio — o caso do
 * GitHub Pages em repo de projeto (`usuario.github.io/<repo>`).
 *
 * Precisa bater com o `basePath` do next.config.ts; ambos leem esta mesma
 * variável. String vazia quando o site está na raiz.
 */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

export const site = {
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://claudiosoares.dev${basePath}`
  ).replace(/\/$/, ""),
  name: "Claudio Soares Dev",
  /** Pessoa por trás do site — vira o schema.org/Person e o meta `author`. */
  author: "Claudio Soares",
  locale: "pt_BR",
  /** Usado como `<html lang>` — formato BCP 47, diferente do locale do OG. */
  lang: "pt-BR",
  title: "Claudio Soares — Engenheiro de Software Fullstack",
  description:
    "Portfólio de Claudio Soares, engenheiro de software com 7 anos de " +
    "experiência em Android nativo (Kotlin), React Native, Flutter e iOS. " +
    "Projetos, arquitetura mobile e construção de interfaces.",
  /** Cor da barra do browser no mobile — token --color-background. */
  themeColor: "#0A0A0A",
} as const;

/** Monta uma URL absoluta a partir de um caminho de rota ou asset. */
export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Prefixa um caminho de `public/` com o basePath.
 *
 * `next/image` e `next/link` fazem isso sozinhos. Use esta função para as
 * URLs que a Next não toca: fetch manual, texturas do WebGL e o que for
 * escrito à mão no manifest.
 */
export function assetPath(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Imagem de Open Graph de uma rota.
 *
 * Os PNG são gerados por `npm run og` em public/og/ — arquivos estáticos com
 * extensão de verdade, e não a convenção `opengraph-image.tsx` da Next, que no
 * export emite rotas sem extensão que o GitHub Pages serve com o Content-Type
 * errado. A URL sai relativa: o `metadataBase` do layout raiz a torna absoluta.
 */
export function ogImage(name: string, alt: string) {
  return {
    // Absoluta de propósito: com basePath, resolver um caminho relativo
    // contra o metadataBase descartaria o prefixo do repo.
    url: absoluteUrl(`/og/${name}.png`),
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  };
}
