"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

type Theme = "day" | "night";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "night" ? "night" : "day";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle({ withLabel = false, className }: { withLabel?: boolean; className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "day" as Theme);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "night" ? "day" : "night";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("tg-theme", next);
      } catch {
        // no-op
      }
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc
      .startViewTransition(apply)
      .ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      className={className ?? (withLabel ? "palette-btn" : "icon-btn")}
      onClick={toggle}
      aria-label={theme === "night" ? "Switch to day shift" : "Switch to night shift"}
      title={theme === "night" ? "Day shift" : "Night shift"}
    >
      {theme === "night" ? <SunIcon width={15} height={15} /> : <MoonIcon width={15} height={15} />}
      {withLabel ? <span>{theme === "night" ? "Day shift" : "Night shift"}</span> : null}
    </button>
  );
}
