"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import type { ArchiveYear } from "@/data/types";

// Layout da listagem do blog: uma linha flex com o arquivo (aside) à esquerda
// e o conteúdo à direita. Fechado, o aside é só o botão; aberto, ele cresce e
// empurra o conteúdo. Abaixo de `lg` não há largura para empurrar nada, então
// o painel vira gaveta sobreposta.
export default function BlogShell({
  archive,
  children,
}: {
  archive: ArchiveYear[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Esc fecha — importante na gaveta do mobile, que cobre o conteúdo.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex items-start justify-center gap-6 lg:gap-10">
      <aside
        aria-label="Arquivo do blog"
        className={`sticky top-24 z-40 shrink-0 lg:overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "w-12 lg:w-72" : "w-12"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Fechar arquivo de posts" : "Abrir arquivo de posts"}
          className={`relative flex h-12 w-12 lg:z-10 items-center justify-center border bg-background/70 backdrop-blur-md transition-colors ${
            open
              ? "border-primary text-primary"
              : "border-foreground/15 text-muted hover:border-primary hover:text-primary"
          }`}
        >
          <TreeIcon />
        </button>

        {/* Fundo escurecido só na gaveta do mobile; clicar nele fecha. */}
        {open ? (
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 bg-background/60 backdrop-blur-sm lg:hidden"
          />
        ) : null}

        <div
          id={panelId}
          hidden={!open}
          className="fixed inset-y-0 left-0 w-72 overflow-y-auto border-r border-foreground/10 bg-background/90 px-5 pt-20 pb-10 backdrop-blur-md lg:static lg:mt-4 lg:max-h-[calc(100svh-10rem)] lg:w-72 lg:border lg:bg-background/60 lg:px-4 lg:pt-4 lg:pb-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-body text-[0.7rem] uppercase tracking-[0.3em] text-primary">
              Arquivo
            </p>
            {/* Na gaveta do mobile o botão de abrir fica coberto — este fecha. */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar arquivo de posts"
              className="flex h-9 w-9 items-center justify-center border border-foreground/15 text-muted transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <ArchiveTree archive={archive} onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <div className="min-w-0 max-w-4xl flex-1">{children}</div>
    </div>
  );
}

// Três níveis de <details> nativos: expandir/recolher, teclado e leitor de
// tela sem JS extra. O ano e o mês mais recentes já vêm abertos.
function ArchiveTree({
  archive,
  onNavigate,
}: {
  archive: ArchiveYear[];
  onNavigate: () => void;
}) {
  if (archive.length === 0) {
    return <p className="font-body text-sm text-muted">Nenhum post ainda.</p>;
  }

  return (
    <ul className="archive-tree font-body text-sm">
      {archive.map((year, yi) => (
        <li key={year.year}>
          <details open={yi === 0}>
            <summary>
              <span className="font-display text-foreground">{year.year}</span>
              <Count n={year.count} />
            </summary>
            <ul>
              {year.months.map((month, mi) => (
                <li key={month.key}>
                  <details open={yi === 0 && mi === 0}>
                    <summary>
                      <span className="uppercase tracking-[0.2em]">
                        {month.label}
                      </span>
                      <Count n={month.count} />
                    </summary>
                    <ul>
                      {month.days.map((day) => (
                        <li key={day.key}>
                          <details open>
                            <summary>
                              <time dateTime={day.key} className="text-muted">
                                {day.label}
                              </time>
                            </summary>
                            <ul>
                              {day.posts.map((post) => (
                                <li key={post.slug}>
                                  <Link
                                    href={`/blog/${post.slug}`}
                                    title={post.title}
                                    onClick={onNavigate}
                                    className="block truncate py-1 text-muted transition-colors hover:text-primary"
                                  >
                                    {post.slug}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-auto text-[0.7rem] tabular-nums text-muted/60">
      {String(n).padStart(2, "0")}
    </span>
  );
}

// Ícone de árvore: um nó raiz com dois ramos.
function TreeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <rect x="3" y="3" width="6" height="5" />
      <rect x="14" y="10" width="7" height="4" />
      <rect x="14" y="17" width="7" height="4" />
      <path d="M6 8v11h8M6 12h8" />
    </svg>
  );
}
