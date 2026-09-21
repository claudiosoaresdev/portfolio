/**
 * Injeta um bloco JSON-LD no HTML.
 *
 * `JSON.stringify` do lado do servidor já escapa aspas e barras; o `<` é
 * escapado à mão porque uma string de conteúdo contendo "</script>" fecharia
 * a tag mais cedo e quebraria a página.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
