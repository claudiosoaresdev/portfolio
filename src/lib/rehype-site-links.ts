import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { assetPath } from "./site";

/**
 * Ajusta links e imagens do HTML gerado a partir do markdown dos posts.
 *
 * - Caminhos da raiz (`/blog/x/foto.webp`, `/projects/y`) ganham o basePath:
 *   o HTML do post é injetado cru, então nem `next/link` nem `next/image`
 *   passam por ele para fazer isso — e sob o GitHub Pages de repo de projeto
 *   o link sem prefixo cairia fora do site.
 * - Links externos abrem em outra aba, sem vazar `window.opener`.
 * - Imagens carregam sob demanda: o post é texto primeiro.
 */
export function rehypeSiteLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        const href = node.properties.href;
        if (typeof href !== "string") return;
        if (isRootPath(href)) {
          node.properties.href = assetPath(href);
        } else if (/^https?:\/\//.test(href)) {
          node.properties.target = "_blank";
          node.properties.rel = ["noopener", "noreferrer"];
        }
      }

      if (node.tagName === "img") {
        const src = node.properties.src;
        if (typeof src === "string" && isRootPath(src)) {
          node.properties.src = assetPath(src);
        }
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
    });
  };
}

/** `/algo`, mas não `//cdn.exemplo.com` (URL sem protocolo). */
function isRootPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
