/**
 * The prototype's design tokens, lifted verbatim from `web/src/app/globals.css`.
 *
 * A PDF cannot read a CSS custom property, so the values are mirrored here and
 * this comment is the contract. Change globals.css and change this with it.
 *
 * Light theme only. A document is read on paper or on a white page, and the
 * dark palette would print as a black rectangle.
 *
 * The one convention that must survive: coral is "simulated", indigo is the
 * brand. Never colour a simulated thing indigo here.
 */
export const c = {
  background: "#e5e5e8", // trast - the grey field their blocks float on
  surface: "#ffffff",
  foreground: "#0e0e2e", // trast - primary-variant, their body colour
  muted: "#4e4e6a",
  faint: "#64647f",
  line: "#d2d2dc",
  brand: "#4520d1", // trast - primary. The hero block and every pill
  brandSoft: "#ebe8fb",
  brandInk: "#ffffff",
  accent: "#b45309", // a number that needs a decision
  accentSoft: "#fdf3e7",
  ok: "#047857", // settled
  okSoft: "#e9f7f1",
  sim: "#c2352a", // simulated, readable as text
  simHero: "#ff8072", // trast - sampled from the gradient
  simSoft: "#ffeeeb",
} as const;
