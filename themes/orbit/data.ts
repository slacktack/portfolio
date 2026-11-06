import { labItems, systems } from "@/lib/site";
import { skins } from "@/lib/skins";
import type { Route } from "../types";

export type MarkKey = "tower" | "hangar" | "dome" | "library" | "cottage" | "portal" | "void";

export type Mark = {
  key: MarkKey;
  name: string;
  section: string;
  href: string | null;
  lat: number;
  lon: number;
  color: string;
  height: number;
  blurb: string;
  hotkey: string;
};

export const marks: Mark[] = [
  { key: "tower", name: "Control Tower", section: "Systems", href: "/systems", lat: 16, lon: -8, color: "#0ea5e9", height: 3.1, blurb: `${systems.length} outposts in production`, hotkey: "1" },
  { key: "hangar", name: "Hangar Bay", section: "Projects", href: "/projects", lat: -14, lon: 38, color: "#f97316", height: 1.6, blurb: "Side builds, live and recorded", hotkey: "2" },
  { key: "dome", name: "Lab Dome", section: "Lab", href: "/lab", lat: 44, lon: 50, color: "#22c55e", height: 1.9, blurb: "Experiments you can break", hotkey: "3" },
  { key: "library", name: "Archive", section: "Notes", href: "/notes", lat: -30, lon: -50, color: "#8b5cf6", height: 1.8, blurb: "Field notes on fast systems", hotkey: "4" },
  { key: "cottage", name: "Home Cottage", section: "About", href: "/about", lat: 46, lon: -58, color: "#f43f5e", height: 1.6, blurb: "The pilot, the log, the rules", hotkey: "5" },
  { key: "portal", name: "Theme Portal", section: "Themes", href: null, lat: -48, lon: 14, color: "#d946ef", height: 2.2, blurb: "Step into another version of this site", hotkey: "6" },
  { key: "void", name: "Uncharted", section: "Lost", href: null, lat: -4, lon: 128, color: "#64748b", height: 0.6, blurb: "Nothing here yet", hotkey: "" },
];

export const flyMarks = marks.filter((m) => m.key !== "void");

export const getMark = (k: MarkKey) => marks.find((m) => m.key === k)!;

// Outposts ring the tower, one per system.
export const beaconColors = ["#38bdf8", "#fb923c", "#4ade80", "#facc15", "#f472b6", "#a78bfa", "#2dd4bf", "#f87171", "#60a5fa", "#fbbf24", "#34d399", "#e879f9"];

export type Target = { kind: "mark"; key: MarkKey } | { kind: "beacon"; slug: string };

export function routeTarget(route: Route): Target | null {
  switch (route.view) {
    case "systems":
      return { kind: "mark", key: "tower" };
    case "system":
      return systems.some((s) => s.slug === route.slug) ? { kind: "beacon", slug: route.slug! } : { kind: "mark", key: "void" };
    case "projects":
      return { kind: "mark", key: "hangar" };
    case "lab":
      return { kind: "mark", key: "dome" };
    case "notes":
    case "note":
      return { kind: "mark", key: "library" };
    case "about":
      return { kind: "mark", key: "cottage" };
    case "missing":
      return { kind: "mark", key: "void" };
    default:
      return null;
  }
}

export const targetId = (t: Target | null) => (t ? (t.kind === "mark" ? t.key : `b:${t.slug}`) : "");

export function targetHref(id: string): string | null {
  if (id.startsWith("b:")) return `/systems/${id.slice(2)}`;
  return marks.find((m) => m.key === id)?.href ?? null;
}

export function targetName(id: string): { name: string; section: string; color: string } {
  if (id.startsWith("b:")) {
    const i = systems.findIndex((s) => s.slug === id.slice(2));
    const s = systems[i];
    return { name: `${s?.shortTitle ?? "Outpost"} outpost`, section: "System", color: beaconColors[i % beaconColors.length] };
  }
  const m = marks.find((x) => x.key === id);
  return { name: m?.name ?? "", section: m?.section ?? "", color: m?.color ?? "#fb923c" };
}

// Real numbers only, read for the power-level scanner.
export function powerOf(id: string): { value: string; label: string } {
  if (id.startsWith("b:")) {
    const m = systems.find((s) => s.slug === id.slice(2))?.metrics[0];
    return m ? { value: m.value, label: m.label } : { value: "0", label: "" };
  }
  switch (id) {
    case "tower":
      return { value: systems[0].metrics[0].value, label: `${systems[0].metrics[0].label} · Flights` };
    case "hangar":
      return { value: "2,346", label: "Trains live · Train Tracker" };
    case "dome":
      return { value: String(labItems.length), label: "Interactive experiments" };
    case "library":
      return { value: "232ms", label: "Cold start, written up" };
    case "cottage":
      return { value: "20ms", label: "p99 · Rust hot path" };
    case "portal":
      return { value: String(skins.length), label: "Versions of this site" };
    default:
      return { value: "0", label: "Nothing here" };
  }
}
