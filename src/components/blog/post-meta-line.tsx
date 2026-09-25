import type { PostMeta } from "@/data/types";
import { formatPostDate } from "@/data/posts";

// Linha HUD de metadados: data · tempo de leitura · rascunho (só em dev).
export default function PostMetaLine({ post }: { post: PostMeta }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs uppercase tracking-[0.25em] text-muted">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span aria-hidden="true" className="text-primary">
        /
      </span>
      <span>{post.readingMinutes} min de leitura</span>
      {post.draft ? (
        <span className="border border-secondary px-2 py-0.5 text-secondary">
          Rascunho
        </span>
      ) : null}
    </p>
  );
}
