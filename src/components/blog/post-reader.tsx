"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// "Ouvir o post" com a Web Speech API (speechSynthesis): vozes do próprio
// sistema operacional, sem servidor nem dependência.
//
// O controle só aparece quando o navegador realmente consegue ler: tem a API
// E tem pelo menos uma voz em português. No servidor, e até as vozes
// carregarem, não renderiza nada — então nunca pisca um botão que não funciona.

const BODY_ID = "post-body";
const RATES = [1, 1.25, 1.5] as const;

// Blocos lidos, na ordem do documento. Código (pre/figure) fica de fora:
// lido em voz alta vira ruído.
const READABLE = ":scope > :is(p, h2, h3, h4, blockquote), :scope > :is(ul, ol) > li";

// O Chrome interrompe falas longas (~15 s) no meio; trechos curtos evitam isso.
const MAX_CHUNK = 220;

interface Chunk {
  element: HTMLElement;
  text: string;
}

export default function PostReader() {
  const voiceURI = usePortugueseVoice();
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);

  const chunks = useRef<Chunk[]>([]);
  const index = useRef(0);
  // Cada fala carrega o token da "sessão" que a criou; cancelar incrementa o
  // token, e o onend atrasado de uma fala cancelada vira no-op.
  const token = useRef(0);

  const highlight = useCallback((element: HTMLElement | null) => {
    document
      .querySelectorAll(`#${BODY_ID} [data-reading]`)
      .forEach((el) => el.removeAttribute("data-reading"));
    if (!element) return;
    element.setAttribute("data-reading", "");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, []);

  const stop = useCallback(() => {
    token.current++;
    window.speechSynthesis?.cancel();
    index.current = 0;
    highlight(null);
    setStatus("idle");
  }, [highlight]);

  const speakFrom = useCallback(
    (start: number, speed: number) => {
      const synth = window.speechSynthesis;
      const voice = synth.getVoices().find((v) => v.voiceURI === voiceURI);
      if (!voice) return;

      const session = ++token.current;
      synth.cancel();

      const speakAt = (i: number) => {
        if (session !== token.current) return;
        const chunk = chunks.current[i];
        if (!chunk) {
          stop();
          return;
        }
        index.current = i;
        highlight(chunk.element);

        const utterance = new SpeechSynthesisUtterance(chunk.text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = speed;
        utterance.onend = () => speakAt(i + 1);
        utterance.onerror = (event) => {
          // "interrupted"/"canceled" são o nosso próprio cancel(); o resto é
          // falha real — encerra em vez de travar no meio.
          if (event.error !== "interrupted" && event.error !== "canceled") stop();
        };
        synth.speak(utterance);
      };

      speakAt(start);
      setStatus("playing");
    },
    [voiceURI, highlight, stop],
  );

  const play = () => {
    if (status === "idle") {
      const body = document.getElementById(BODY_ID);
      chunks.current = body ? collectChunks(body) : [];
      index.current = 0;
    }
    speakFrom(index.current, rate);
  };

  // Pausa = cancelar e lembrar o trecho. O pause() nativo é instável (no
  // Chrome Android equivale a cancelar e perde a posição).
  const pause = () => {
    token.current++;
    window.speechSynthesis.cancel();
    setStatus("paused");
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    // Velocidade só vale para falas novas: recomeça o trecho atual.
    if (status === "playing") speakFrom(index.current, next);
  };

  // Sair da página no meio da leitura não pode deixar a voz tocando.
  useEffect(() => stop, [stop]);

  if (!voiceURI) return null;

  const button =
    "inline-flex h-9 items-center gap-2 border px-3 font-body text-[0.7rem] uppercase tracking-[0.25em] transition-colors";

  return (
    <div
      role="group"
      aria-label="Ouvir o post"
      className="flex flex-wrap items-center gap-2"
    >
      {status === "playing" ? (
        <button
          type="button"
          onClick={pause}
          className={`${button} border-primary text-primary`}
        >
          <PauseIcon /> Pausar
        </button>
      ) : (
        <button
          type="button"
          onClick={play}
          className={`${button} border-foreground/15 text-foreground hover:border-primary hover:text-primary`}
        >
          <PlayIcon /> {status === "paused" ? "Continuar" : "Ouvir o post"}
        </button>
      )}

      {status !== "idle" ? (
        <>
          <button
            type="button"
            onClick={stop}
            aria-label="Parar leitura"
            className={`${button} border-foreground/15 text-muted hover:border-primary hover:text-primary`}
          >
            <StopIcon />
          </button>
          <button
            type="button"
            onClick={cycleRate}
            aria-label={`Velocidade ${rate}x. Alterar velocidade`}
            className={`${button} border-foreground/15 tabular-nums text-muted hover:border-primary hover:text-primary`}
          >
            {rate.toLocaleString("pt-BR")}×
          </button>
        </>
      ) : null}

      {/* Anuncia o estado para leitor de tela sem roubar o foco. */}
      <span className="sr-only" aria-live="polite">
        {status === "playing" ? "Lendo o post" : status === "paused" ? "Leitura pausada" : ""}
      </span>
    </div>
  );
}

/**
 * Melhor voz em português disponível, ou "" se não houver (ou sem a API).
 *
 * As vozes chegam de forma assíncrona no Chrome (`voiceschanged`), então isto
 * é um store externo e não um efeito com setState. O snapshot é o voiceURI
 * (string), estável entre renders; o objeto da voz é buscado na hora de falar.
 */
function usePortugueseVoice(): string {
  return useSyncExternalStore(subscribeVoices, pickVoiceURI, () => "");
}

function subscribeVoices(onChange: () => void) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return () => {};
  synth.addEventListener("voiceschanged", onChange);
  return () => synth.removeEventListener("voiceschanged", onChange);
}

function pickVoiceURI(): string {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return "";
  }

  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("pt"));

  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best?.voiceURI ?? "";
}

// pt-BR antes de pt-PT; vozes "naturais"/neurais antes das robóticas. O
// macOS localiza o sufixo de qualidade ("Aprimorada", "Premium").
function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  if (voice.lang.replace("_", "-").toLowerCase() === "pt-br") score += 10;
  if (/natural|neural|enhanced|aprimorad|premium|online/i.test(voice.name)) score += 5;
  if (/luciana|francisca|thalita|google/i.test(voice.name)) score += 3;
  // Vozes de brincadeira da Apple (Grandma, Rocko…) funcionam, mas não para ler um post.
  if (/eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i.test(voice.name)) score -= 8;
  if (voice.localService) score += 1;
  return score;
}

function collectChunks(body: HTMLElement): Chunk[] {
  const chunks: Chunk[] = [];
  body.querySelectorAll<HTMLElement>(READABLE).forEach((element) => {
    const text = element.textContent?.replace(/\s+/g, " ").trim();
    if (!text) return;
    for (const part of splitText(text)) chunks.push({ element, text: part });
  });
  return chunks;
}

/** Quebra em frases e reagrupa até MAX_CHUNK caracteres. */
function splitText(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];
  const sentences = text.match(/[^.!?;:]+[.!?;:]*\s*/g) ?? [text];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && (current + sentence).length > MAX_CHUNK) {
      parts.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
      <path d="M2 1l9 5-9 5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
      <path d="M2 1h3v10H2zM7 1h3v10H7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
      <path d="M2 2h8v8H2z" />
    </svg>
  );
}
