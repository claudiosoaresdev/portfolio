/**
 * Moldura das imagens de Open Graph (1200x630).
 *
 * JavaScript puro com `createElement` em vez de JSX porque isto roda como
 * script Node, fora do build da Next — que é justamente o ponto: as imagens
 * viram PNG estáticos em public/og/, com extensão .png de verdade. A convenção
 * `opengraph-image.tsx` da Next gera rotas sem extensão, e o GitHub Pages
 * serve arquivo sem extensão como application/octet-stream, o que faz os
 * scrapers de rede social recusarem a imagem.
 *
 * Renderizado por Satori (via next/og), que suporta só um subconjunto de
 * flexbox: todo container com mais de um filho precisa de `display: "flex"`.
 */
import { createElement as h } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  background: "#0A0A0A",
  foreground: "#F2F2F0",
  muted: "#C9C7BB",
  primary: "#A9FE00",
  secondary: "#4E47E3",
};

/** Canto em "L" — o mesmo motivo de HUD usado no hero do site. */
function bracket(corner) {
  const top = corner[0] === "t";
  const left = corner[1] === "l";
  return h("div", {
    key: corner,
    style: {
      position: "absolute",
      width: 64,
      height: 64,
      ...(top ? { top: 40 } : { bottom: 40 }),
      ...(left ? { left: 48 } : { right: 48 }),
      ...(top
        ? { borderTop: `3px solid ${COLORS.primary}` }
        : { borderBottom: `3px solid ${COLORS.primary}` }),
      ...(left
        ? { borderLeft: `3px solid ${COLORS.primary}` }
        : { borderRight: `3px solid ${COLORS.primary}` }),
    },
  });
}

export function ogFrame({ eyebrow, title, subtitle, footer }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        backgroundColor: COLORS.background,
        // Grade técnica de 1px + brilho indigo no canto superior direito,
        // equivalentes aos gradientes do hero.
        backgroundImage: `radial-gradient(900px 500px at 88% -10%, ${COLORS.secondary}44, transparent 70%),
          linear-gradient(to right, ${COLORS.foreground}0D 1px, transparent 1px),
          linear-gradient(to bottom, ${COLORS.foreground}0D 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 72px 72px, 72px 72px",
        fontFamily: "Orbitron",
        padding: "0 96px",
      },
    },
    bracket("tl"),
    bracket("br"),
    h(
      "div",
      {
        style: {
          display: "flex",
          fontSize: 24,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: COLORS.primary,
        },
      },
      eyebrow,
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          marginTop: 28,
          fontSize: title.length > 24 ? 68 : 84,
          lineHeight: 1.05,
          letterSpacing: -1,
          textTransform: "uppercase",
          color: COLORS.foreground,
        },
      },
      title,
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          marginTop: 28,
          maxWidth: 880,
          fontSize: 30,
          lineHeight: 1.35,
          color: COLORS.muted,
        },
      },
      subtitle,
    ),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 96,
          bottom: 64,
          display: "flex",
          alignItems: "center",
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.muted,
        },
      },
      h("div", {
        style: {
          width: 40,
          height: 3,
          marginRight: 20,
          backgroundColor: COLORS.primary,
        },
      }),
      footer,
    ),
  );
}
