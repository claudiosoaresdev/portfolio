import { getPostMetas } from "@/data/posts";
import { absoluteUrl, blog, site } from "@/lib/site";

// Em `output: "export"` isto vira um /blog/rss.xml estático no build — com
// extensão de verdade, então o GitHub Pages serve com o Content-Type certo.
export const dynamic = "force-static";

export async function GET() {
  const posts = await getPostMetas();
  const blogUrl = absoluteUrl("/blog");

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Blog — ${site.name}`)}</title>
    <link>${blogUrl}</link>
    <atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(blog.description)}</description>
    <language>${site.lang}</language>
${posts[0] ? `    <lastBuildDate>${new Date(`${posts[0].updated ?? posts[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
