import type { NextConfig } from "next";

// Prefixo do caminho quando o site não está na raiz do domínio — GitHub Pages
// em repo de projeto serve em /<repo>. Mesma variável lida por src/lib/site.ts,
// para que os caminhos que a Next não reescreve sozinha (textura do WebGL,
// manifest) fiquem alinhados com os que ela reescreve.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // HTML/CSS/JS estáticos em out/ — é o que o GitHub Pages serve.
  output: "export",
  // Não há otimizador de imagem em host estático; o pipeline de
  // scripts/optimize-images.mjs faz esse trabalho no build.
  images: { unoptimized: true },
  // Emite /rota/index.html em vez de /rota.html: o Pages não tem regra de
  // rewrite, então só a forma com diretório resolve sem 404.
  trailingSlash: true,
  ...(basePath && { basePath, assetPrefix: `${basePath}/` }),
  experimental: {
    viewTransition: true,
  },
  transpilePackages: ["three", "@react-three/drei"],
};

export default nextConfig;
