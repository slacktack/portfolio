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

  function toggle() {
    const next: Theme = theme === "night" ? "day" : "night";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("tg-theme", next);
    } catch {
      // no-op
    }
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
