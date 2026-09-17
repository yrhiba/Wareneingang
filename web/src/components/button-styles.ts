/**
 * Button classes, straight off the client's nav and their contact calls to
 * action: 1px indigo outline, indigo text, fully rounded, lowercase.
 *
 * This is a plain module with no "use client" directive, and that is the whole
 * reason it exists. `btn` used to live in ui.tsx, which is a client module - so
 * a Server Component importing it got a client reference rather than the object,
 * `btn.primary` came back undefined, and the link rendered with no class at all.
 * Three server pages were quietly shipping unstyled buttons that way. Classes
 * are data, not components, so they belong on this side of the boundary.
 *
 * The shape rule is the client's: containers square, controls round.
 */
const pill =
  "lc inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm transition disabled:opacity-40";

export const btn = {
  primary: `${pill} bg-brand font-semibold text-brand-ink hover:opacity-90`,
  secondary: `${pill} border border-brand/45 font-semibold text-brand hover:border-brand hover:bg-brand-soft`,
  sim: `${pill} border border-sim/40 bg-sim-soft font-semibold text-sim hover:border-sim`,
  danger: `${pill} border border-line bg-surface font-medium text-muted hover:border-faint`,
  /** The same outline pill at table scale, for a control that sits in a row. */
  small:
    "lc inline-flex items-center whitespace-nowrap rounded-full border border-brand/40 px-2.5 py-0.5 text-[11px] font-semibold text-brand transition hover:border-brand hover:bg-brand-soft",
};
