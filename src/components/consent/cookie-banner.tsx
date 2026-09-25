"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import {
  gaId,
  getServerSnapshot,
  getSnapshot,
  setConsent,
  subscribe,
} from "@/lib/consent";

// Aviso de cookies no rodapé da viewport. Aparece só enquanto o visitante não
// escolheu — e só quando o build tem um ID do GA, porque sem analytics não há
// cookie nenhum para pedir licença.
export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const open = Boolean(gaId) && consent === null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          key="cookie-banner"
          role="region"
          aria-label="Aviso de cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-[55] mx-auto max-w-6xl sm:inset-x-6 sm:bottom-6"
        >
          <div className="relative border border-foreground/15 bg-background/90 px-5 py-5 backdrop-blur-md sm:px-7">
            {/* Cantoneiras HUD — mesmo vocabulário do hero. */}
            <Corner className="-top-px -left-px border-t border-l" />
            <Corner className="-top-px -right-px border-t border-r" />
            <Corner className="-bottom-px -left-px border-b border-l" />
            <Corner className="-right-px -bottom-px border-r border-b" />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="max-w-3xl">
                <p className="font-body text-[0.7rem] uppercase tracking-[0.3em] text-primary">
                  {"// Cookies"}
                </p>
                <p className="mt-2 font-body text-base leading-relaxed text-muted">
                  Usamos cookies do Google Analytics para entender como o site
                  é usado. Nada de publicidade, nada de rastreamento entre
                  sites. Você pode recusar sem perder nenhuma funcionalidade.{" "}
                  <Link
                    href="/privacy"
                    className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => setConsent("denied")}
                  className="inline-flex h-11 flex-1 items-center justify-center border border-foreground/15 px-6 font-body text-sm font-bold uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary md:flex-none"
                >
                  Recusar
                </button>
                <button
                  type="button"
                  onClick={() => setConsent("granted")}
                  className="inline-flex h-11 flex-1 items-center justify-center border border-primary bg-primary px-6 font-body text-sm font-bold uppercase tracking-[0.25em] text-background transition-colors hover:bg-transparent hover:text-primary md:flex-none"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 border-primary ${className}`}
    />
  );
}
