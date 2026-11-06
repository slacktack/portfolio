"use client";

import { Suspense, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getSkin, skins, type Skin, type SkinId } from "@/lib/skins";
import { themeApps } from "@/themes/registry";
import { parseRoute } from "@/themes/types";

function read(): SkinId {
  return getSkin(document.documentElement.dataset.skin).id;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
  return () => observer.disconnect();
}

export function useSkin(): Skin {
  return getSkin(useSyncExternalStore(subscribe, read, () => "paper" as SkinId));
}

// "" on the server and first paint, so nothing skin-specific mounts before we know the skin.
function useSkinId(): SkinId | "" {
  return useSyncExternalStore(subscribe, read, () => "" as SkinId | "");
}

export function useThreeD(): boolean {
  const id = useSkinId();
  return id ? getSkin(id).threeD : false;
}

function commit(skin: Skin) {
  const d = document.documentElement;
  d.dataset.skin = skin.id;
  d.dataset.theme = skin.mode;
  if (skin.app) d.dataset.exp = "1";
  else delete d.dataset.exp;
  delete d.dataset.first;
  try {
    localStorage.setItem("tg-skin", skin.id);
    localStorage.setItem("tg-picked", "1");
    localStorage.setItem("tg-theme", skin.mode);
  } catch {
    // storage blocked
  }
  window.scrollTo(0, 0);
}

let busy = false;

export function applySkin(id: SkinId) {
  const skin = getSkin(id);
  if (!skin.ready || busy) return;
  if (document.documentElement.dataset.skin === skin.id) {
    commit(skin);
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    commit(skin);
    return;
  }
  busy = true;

  const veil = document.createElement("div");
  veil.className = "skin-veil";
  veil.dataset.for = skin.id;
  veil.style.background = skin.curtain;
  const n = String(skins.indexOf(skin) + 1).padStart(2, "0");
  veil.innerHTML = `<div class="skin-veil-grain"></div><div class="skin-veil-copy"><span class="skin-veil-k">Theme ${n} · ${skin.story}</span><b>${skin.name}</b><span class="skin-veil-line">${skin.line}</span><span class="skin-veil-sw">${skin.swatches.map((s) => `<i style="background:${s.hex}"></i><em>${s.hex}</em>`).join("")}</span></div>`;
  document.body.appendChild(veil);

  const ease = "cubic-bezier(0.77, 0, 0.175, 1)";
  const copy = veil.querySelector<HTMLElement>(".skin-veil-copy");
  veil
    .animate({ clipPath: ["inset(100% 0 0 0)", "inset(0 0 0 0)"] }, { duration: 620, easing: ease, fill: "forwards" })
    .finished.then(() => {
      commit(skin);
      copy?.animate(
        [
          { opacity: 0, transform: "translateY(24px)", filter: "blur(8px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      );
      return new Promise((r) => window.setTimeout(r, 900));
    })
    .then(
      () =>
        veil.animate({ clipPath: ["inset(0 0 0 0)", "inset(0 0 100% 0)"] }, { duration: 680, easing: ease, fill: "forwards" })
          .finished
    )
    .finally(() => {
      veil.remove();
      busy = false;
    });
}

// Any theme's nav can open the theme picker with this.
export function openThemes() {
  window.dispatchEvent(new Event("tg-open-themes"));
}

// Header button for Paper; themes build their own trigger and call openThemes().
export function SkinPicker() {
  const skin = useSkin();
  return (
    <button type="button" className="icon-btn skin-trigger" aria-haspopup="dialog" aria-label={`Change theme, now ${skin.name}`} title="Themes" onClick={openThemes}>
      {skin.swatches.map((s) => (
        <i key={s.hex} style={{ background: s.hex }} />
      ))}
    </button>
  );
}

type ThemeApp = NonNullable<(typeof themeApps)[string]>;

// Reads the URL inside Suspense, as Next requires for dynamic routes.
function ThemeRoute({ App }: { App: ThemeApp }) {
  const path = usePathname();
  return <App route={parseRoute(path)} />;
}

// Paper renders from the server; a full theme app replaces it once loaded.
export function ThemeFrame({ children }: { children: ReactNode }) {
  const id = useSkinId();
  const App = id ? themeApps[id] : undefined;

  if (!App) return <div className="paper-frame">{children}</div>;
  return (
    <Suspense fallback={<div className="theme-loading" aria-hidden="true" />}>
      <ThemeRoute App={App} />
    </Suspense>
  );
}
