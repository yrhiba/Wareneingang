"use client";

import { useSyncExternalStore } from "react";

import { useT } from "./locale-provider";

const KEY = "c04-theme";

/**
 * The theme lives on <html data-theme>, not in React state - an inline script
 * in the layout sets it before first paint so a stored dark choice never
 * flashes white. This subscribes to that external value rather than mirroring
 * it, which is also what keeps server and client renders in step.
 *
 * Light is the default and the OS setting is ignored on purpose; see the note
 * in globals.css.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep other tabs in step.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getSnapshot = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

// The server cannot know a per-viewer choice, so it renders the default.
const getServerSnapshot = () => "light" as const;

export function ThemeToggle() {
  const t = useT();
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = theme === "dark";

  function toggle() {
    const el = document.documentElement;
    if (dark) el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", "dark");
    try {
      localStorage.setItem(KEY, dark ? "light" : "dark");
    } catch {
      // Blocked storage: the toggle still works, it just is not remembered.
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? t.chrome.toLight : t.chrome.toDark}
      title={dark ? t.chrome.toLight : t.chrome.toDark}
      className="flex size-7 items-center justify-center rounded-lg border border-line text-xs text-muted transition hover:border-faint hover:text-foreground"
    >
      <span aria-hidden>{dark ? "☀" : "☾"}</span>
    </button>
  );
}
