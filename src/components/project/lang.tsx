"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import type { Lang, Project } from "@/data/types";
import {
  LANG_STORAGE_KEY,
  UI_COPY,
  hasTranslation,
  localize,
} from "@/data/localize";

// Idioma escolhido pelo visitante, guardado no localStorage. Store externa
// (não useState+effect): vários componentes leem o mesmo valor e o snapshot de
// servidor é sempre "en", o texto-base — então o HTML estático nunca diverge.
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === "pt" ? "pt" : "en";
  } catch {
    return "en";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function setLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Sem storage (modo privado): a escolha vale só até recarregar.
  }
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  listeners.forEach((cb) => cb());
}

/** Idioma ativo para este projeto: "en" se ele não tem tradução. */
export function useLang(project: Project): Lang {
  const stored = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);
  return hasTranslation(project) ? stored : "en";
}

/** Projeto já traduzido + rótulos da interface no idioma ativo. */
export function useLocalized(project: Project) {
  const lang = useLang(project);
  return { lang, project: localize(project, lang), t: UI_COPY[lang] };
}

export function LangToggle({ project }: { project: Project }) {
  const lang = useLang(project);
  if (!hasTranslation(project)) return null;
  return (
    <div
      role="group"
      aria-label={UI_COPY[lang].language}
      className="fixed right-6 top-[4.5rem] z-40 flex border border-foreground/20 bg-background/70 font-body text-[0.7rem] uppercase tracking-[0.25em] backdrop-blur"
    >
      {(["en", "pt"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l === "pt" ? "pt-BR" : "en"}
          className={`px-3 py-1.5 transition-colors ${
            lang === l
              ? "bg-primary text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l === "pt" ? "PT" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function BackLink({ project }: { project: Project }) {
  const { t } = useLocalized(project);
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-primary"
    >
      <span aria-hidden="true">←</span> {t.back}
    </Link>
  );
}
