import HudGridPulses from "@/components/ui/hud-grid-pulses";

// Passo do grid em px. Os pulsos usam o mesmo valor para andar sobre as linhas.
export const HUD_GRID_CELL = 72;

// Grid técnico de 1px da atmosfera HUD. A camada estática é CSS puro (sai no
// HTML do servidor); os pulsos neon são um client component por cima dela,
// desligado em `prefers-reduced-motion`.
export default function HudGrid({ pulses = true }: { pulses?: boolean }) {
  return (
    <>
      {/* currentColor derives from the foreground token. */}
      <div
        className="absolute inset-0 text-foreground opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: `${HUD_GRID_CELL}px ${HUD_GRID_CELL}px`,
        }}
      />
      {pulses && <HudGridPulses cell={HUD_GRID_CELL} />}
    </>
  );
}
