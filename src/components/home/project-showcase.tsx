"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent } from "react";

import type { Project } from "@/data/types";
import {
  FILTER_LABELS,
  PROJECT_FILTERS,
  isProjectFilter,
  matchesFilter,
  type ProjectFilter,
} from "@/data/platform";
import ProjectCarousel from "./project-carousel";

type Selection = ProjectFilter | "all";

const PARAM = "type";
const CHANGE_EVENT = "project-filter-change";

// O filtro vive na URL (`?type=web`). O site é export estático, então o HTML
// sai sempre com "all" e o cliente lê a query depois da hidratação — por isso
// useSyncExternalStore (snapshot de servidor = "all") em vez de useSearchParams,
// que exigiria um Suspense e tiraria o carrossel do HTML gerado.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readSelection(): Selection {
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return isProjectFilter(value) ? value : "all";
}

function writeSelection(next: Selection) {
  const url = new URL(window.location.href);
  if (next === "all") url.searchParams.delete(PARAM);
  else url.searchParams.set(PARAM, next);
  // replaceState: trocar de filtro não deve empilhar entradas no histórico.
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const CHIPS: { value: Selection; label: string }[] = [
  { value: "all", label: "All" },
  ...PROJECT_FILTERS.map((value) => ({ value, label: FILTER_LABELS[value] })),
];

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const fromUrl = useSyncExternalStore<Selection>(
    subscribe,
    readSelection,
    () => "all",
  );

  const counts = Object.fromEntries(
    CHIPS.map(({ value }) => [
      value,
      value === "all"
        ? projects.length
        : projects.filter((p) => matchesFilter(p, value)).length,
    ]),
  ) as Record<Selection, number>;

  // Um `?type=` que aponte para um chip vazio cai em "all".
  const selected: Selection = counts[fromUrl] > 0 ? fromUrl : "all";
  const visible =
    selected === "all"
      ? projects
      : projects.filter((p) => matchesFilter(p, selected));

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Toolbar com roving tabindex: Tab entra/sai do grupo, setas e Home/End
  // andam entre os chips habilitados.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = buttons.current.filter(
      (b): b is HTMLButtonElement => !!b && !b.disabled,
    );
    const current = enabled.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % enabled.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = enabled.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    enabled[next].focus();
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div
          role="toolbar"
          aria-label="Filter projects by platform"
          aria-controls="project-carousel"
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-2"
        >
          {CHIPS.map(({ value, label }, i) => {
            const active = value === selected;
            const empty = counts[value] === 0;
            return (
              <button
                key={value}
                ref={(node) => {
                  buttons.current[i] = node;
                }}
                type="button"
                aria-pressed={active}
                disabled={empty}
                tabIndex={active ? 0 : -1}
                onClick={() => writeSelection(value)}
                className={`border px-3 py-1.5 font-body text-xs uppercase tracking-[0.25em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:border-foreground/5 disabled:text-foreground/25 ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/15 text-muted hover:border-primary/60 hover:text-foreground"
                }`}
              >
                {label}
                <span
                  aria-hidden
                  className={`ml-2 ${active ? "text-primary/70" : "text-foreground/30"}`}
                >
                  {String(counts[value]).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {`Showing ${visible.length} ${visible.length === 1 ? "project" : "projects"}`}
        </p>
      </div>
      <div id="project-carousel">
        {/* key: remontar a cada filtro zera o scroll do Embla e refaz a medição
            de overflow (o track ocupa o viewport inteiro, então o
            ResizeObserver não percebe cards a menos). */}
        <ProjectCarousel key={selected} projects={visible} />
      </div>
    </>
  );
}
