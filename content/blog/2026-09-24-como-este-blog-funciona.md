---
title: "Como este blog funciona"
description: "Posts em markdown versionados no repositório, convertidos em HTML estático no build e publicados no GitHub Pages."
date: 2026-09-24
tags: [nextjs, markdown, github-pages]
---

Este blog não tem CMS nem banco de dados. Cada post é um arquivo `.md` dentro
do próprio repositório do site, versionado no git como qualquer outro código.

## O fluxo

1. Escrevo um arquivo em `content/blog/`, com a data no nome e no frontmatter.
2. Faço commit e push para `main`.
3. O GitHub Actions roda `next build`, que lê os arquivos, converte o markdown
   em HTML e gera uma página estática por post.

## O frontmatter

A data de publicação fica no próprio arquivo, e não é derivada do histórico do
git: o checkout do CI é raso e não enxergaria a data real do commit.

```yaml
---
title: "Título do post"
description: "Resumo que aparece na listagem e nos buscadores."
date: 2026-09-24
updated: 2026-10-02 # opcional
tags: [android, kotlin]
draft: true # opcional — só aparece em `npm run dev`
---
```

## Por baixo

A conversão usa o ecossistema [unified](https://unifiedjs.com/): `remark`
lê o markdown (com tabelas e listas de tarefas do GFM), `rehype` monta o HTML
e o `shiki` colore os blocos de código no build — nenhum JavaScript extra vai
para o navegador.

```ts
const html = String(
  await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode)
    .use(rehypeStringify)
    .process(markdown),
);
```

Também há um [feed RSS](/blog/rss.xml) para quem prefere acompanhar por leitor.
