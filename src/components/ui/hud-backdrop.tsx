// Atmosfera HUD do site: glows índigo/lime, grid técnico de 1px, vinheta e
// cantoneiras. Nasceu no hero da home e é reaproveitada no blog.
//
// `fixed` prende a atmosfera à viewport (páginas longas rolam por cima dela);
// sem ele, preenche o ancestral `relative` mais próximo, como no hero.
export default function HudBackdrop({ fixed = false }: { fixed?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none inset-0 overflow-hidden ${fixed ? "fixed -z-10" : "absolute"}`}
    >
      {/* Indigo glow, offset asymmetrically toward the top-right. */}
      <div className="absolute -top-40 -right-32 h-[38rem] w-[38rem] rounded-full bg-secondary/20 blur-[120px]" />
      {/* Lime glow near the headline, lower-left. */}
      <div className="absolute top-1/2 left-[6%] h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

      {/* 1px technical grid; currentColor derives from the foreground token. */}
      <div
        className="absolute inset-0 text-foreground opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* Vignette fades the grid + glows to the background token at the edges. */}
      <div
        className="absolute inset-0 text-background"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, transparent 35%, currentColor 92%)",
        }}
      />

      {/* Corner-bracket frame — two opposite corners for the HUD precision feel. */}
      <div className="absolute top-24 left-6 h-10 w-10 border-t border-l border-foreground/20 sm:left-10" />
      <div className="absolute right-6 bottom-6 h-10 w-10 border-r border-b border-foreground/20 sm:right-10" />
    </div>
  );
}
