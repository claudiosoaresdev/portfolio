// Three.js material/light colors are not CSS, so the design tokens are mirrored
// here as literals. Keep in sync with globals.css @theme:
//   --color-primary   (lime)   #A9FE00
//   --color-secondary (indigo) #4E47E3
//   --color-background         #0A0A0A
export const LIME = "#A9FE00"; // --color-primary — rim light + accent edge strip
export const INDIGO = "#4E47E3"; // --color-secondary — atmospheric fill light
export const KEY_LIGHT = "#FFFFFF"; // neutral key light
export const BODY_COLOR = "#101014"; // chassis, a touch deeper than --color-background
export const BEZEL_COLOR = "#050506"; // screen surround, darkest
export const CUTOUT_COLOR = "#000000"; // camera punch-hole / dynamic island

// Metals take their reflection tint from the base color: a near-black base
// (BODY_COLOR) kills every highlight, so device shells use a graphite metal
// that reads dark but still mirrors the studio lights.
export const METAL_COLOR = "#4a4e57"; // graphite / space gray shell
export const METAL_LIGHT = "#7d828c"; // lighter frame band, hinge, buttons
