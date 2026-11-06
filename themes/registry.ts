import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ThemeAppProps } from "./types";

// Each theme is a whole site; only the active one is downloaded.
export const themeApps: Partial<Record<string, LazyExoticComponent<ComponentType<ThemeAppProps>>>> = {
  night: lazy(() => import("./night")),
  signal: lazy(() => import("./signal")),
  summit: lazy(() => import("./summit")),
  moss: lazy(() => import("./moss")),
  forge: lazy(() => import("./forge")),
  aurora: lazy(() => import("./aurora")),
  ember: lazy(() => import("./ember")),
  abyss: lazy(() => import("./abyss")),
  grid: lazy(() => import("./grid")),
  crimson: lazy(() => import("./crimson")),
  graphite: lazy(() => import("./graphite")),
  onyx: lazy(() => import("./onyx")),
  solar: lazy(() => import("./solar")),
  nebula: lazy(() => import("./nebula")),
  orbit: lazy(() => import("./orbit")),
};

export const hasThemeApp = (id: string) => id in themeApps;
