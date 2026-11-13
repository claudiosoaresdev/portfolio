"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Pulsos neon que trafegam pelas linhas do grid HUD, como pacotes numa rede:
// cada pulso sai de uma interseção, anda 1–3 células e vira 90° na próxima,
// algumas vezes, até sumir. Cinco "faixas" em paralelo, cada uma com uma
// pausa aleatória entre um pulso e o próximo.
//
// Custo: a animação é CSS (stroke-dashoffset em SVG); o JS só roda ao medir o
// container e no `animationend` de cada pulso, para sortear a próxima rota.
// Fora da viewport as animações são pausadas; em `prefers-reduced-motion` o
// SVG some e nada anima. O CSS fica em globals.css (.hud-pulse).

const LANES = 5;
const DASH = 72; // comprimento do pulso, px
const SPEED = 220; // px/s
const INNER_MARGIN = 1; // células de folga até a borda (a vinheta as esconde)

type Pulse = {
  id: number;
  d: string;
  length: number;
  delay: number; // s
};

type Size = { cols: number; rows: number };

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const;

let nextId = 0;

// Random walk em coordenadas de interseção, preso à área interna do grid.
function makePulse({ cols, rows }: Size, cell: number, delay: number): Pulse {
  const minX = INNER_MARGIN;
  const minY = INNER_MARGIN;
  const maxX = Math.max(minX, cols - INNER_MARGIN);
  const maxY = Math.max(minY, rows - INNER_MARGIN);

  let x = randInt(minX, maxX);
  let y = randInt(minY, maxY);
  let dir = randInt(0, 3);
  const points: [number, number][] = [[x, y]];
  let length = 0;

  const segments = randInt(3, 6);
  for (let s = 0; s < segments; s++) {
    // Tenta a direção sorteada; se bater na borda, a oposta.
    for (const candidate of [dir, (dir + 2) % 4]) {
      const [dx, dy] = DIRS[candidate];
      const steps = randInt(1, 3);
      const tx = Math.min(maxX, Math.max(minX, x + dx * steps));
      const ty = Math.min(maxY, Math.max(minY, y + dy * steps));
      const moved = Math.abs(tx - x) + Math.abs(ty - y);
      if (moved > 0) {
        x = tx;
        y = ty;
        points.push([x, y]);
        length += moved * cell;
        dir = candidate;
        break;
      }
    }
    // Vira 90° na interseção: esquerda ou direita.
    dir = (dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
  }

  // +0.5 centraliza o traço de 1px sobre a linha do gradiente (pixel k*cell).
  const d = points
    .map(([px, py], i) => `${i ? "L" : "M"}${px * cell + 0.5} ${py * cell + 0.5}`)
    .join(" ");

  return { id: nextId++, d, length, delay };
}

export default function HudGridPulses({ cell }: { cell: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sizeRef = useRef<Size | null>(null);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;

    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const size = {
        cols: Math.floor(width / cell),
        rows: Math.floor(height / cell),
      };
      const prev = sizeRef.current;
      if (prev && prev.cols === size.cols && prev.rows === size.rows) return;
      sizeRef.current = size;
      // Faixas defasadas: dois ou três pulsos na tela ao mesmo tempo.
      setPulses(
        Array.from({ length: LANES }, (_, lane) =>
          makePulse(size, cell, 0.3 + lane * 0.7 + Math.random() * 0.8),
        ),
      );
    });
    resize.observe(host);

    const visibility = new IntersectionObserver(([entry]) =>
      setPaused(!entry.isIntersecting),
    );
    visibility.observe(host);

    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, [cell]);

  const respawn = (lane: number) => {
    const size = sizeRef.current;
    if (!size) return;
    setPulses((current) =>
      current.map((pulse, i) =>
        i === lane ? makePulse(size, cell, 0.2 + Math.random() * 1.3) : pulse,
      ),
    );
  };

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="hud-pulses absolute inset-0 h-full w-full motion-reduce:hidden"
      data-paused={paused || undefined}
    >
      {pulses.map((pulse, lane) => {
        const style = {
          "--len": `${pulse.length}px`,
          "--dash": `${DASH}px`,
          animationDuration: `${(pulse.length + DASH) / SPEED}s`,
          animationDelay: `${pulse.delay}s`,
        } as CSSProperties;
        return (
          <g key={pulse.id} style={style}>
            {/* Halo largo e fraco + núcleo fino: glow sem filtro (barato). */}
            <path d={pulse.d} className="hud-pulse hud-pulse-halo" />
            <path
              d={pulse.d}
              className="hud-pulse hud-pulse-core"
              onAnimationEnd={() => respawn(lane)}
            />
          </g>
        );
      })}
    </svg>
  );
}
