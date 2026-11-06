import { labItems, notes, stage, systems, type Note, type SystemCase } from "@/lib/site";
import type { View } from "../types";

export type BoardFrame = { id: string; n: string; name: string; x: number; y: number; w: number; h: number };

export const WORLD = { w: 3000, h: 2050 };
export const HERO = { x: 960, y: 800, w: 1080, h: 360 };

export const boardFrames: BoardFrame[] = [
  { id: "flights", n: "01", name: "Flights", x: 300, y: 250, w: 480, h: 380 },
  { id: "hotels", n: "02", name: "Hotels", x: 860, y: 190, w: 420, h: 380 },
  { id: "doc", n: "03", name: "Doc", x: 1360, y: 150, w: 400, h: 520 },
  { id: "food", n: "04", name: "Food", x: 1840, y: 210, w: 420, h: 380 },
  { id: "grocery", n: "05", name: "Grocery", x: 2340, y: 270, w: 400, h: 380 },
  { id: "credits", n: "06", name: "Credits", x: 300, y: 740, w: 560, h: 500 },
  { id: "lab", n: "07", name: "Lab", x: 2140, y: 760, w: 600, h: 420 },
  { id: "board", n: "08", name: "Board", x: 300, y: 1360, w: 760, h: 520 },
  { id: "systems", n: "09", name: "All frames", x: 1140, y: 1290, w: 560, h: 590 },
  { id: "themes", n: "10", name: "Other files", x: 1780, y: 1300, w: 640, h: 560 },
  { id: "numbers", n: "11", name: "Numbers", x: 2500, y: 1290, w: 300, h: 600 },
];

export type Tool = { view: View; label: string; page: string; href: string; key: string };

export const tools: Tool[] = [
  { view: "home", label: "Move", page: "Canvas", href: "/", key: "V" },
  { view: "systems", label: "Frames", page: "Systems", href: "/systems", key: "F" },
  { view: "projects", label: "Board", page: "Projects", href: "/projects", key: "B" },
  { view: "lab", label: "Lab", page: "Prototypes", href: "/lab", key: "L" },
  { view: "notes", label: "Doc", page: "Notes", href: "/notes", key: "D" },
  { view: "about", label: "Credits", page: "About", href: "/about", key: "C" },
];

export const toolFor = (v: View): View | null => (v === "system" ? "systems" : v === "note" ? "notes" : v === "missing" ? null : v);

export type Layer = { label: string; href?: string; focus?: string; sub?: string };

export function systemSections(s: SystemCase): Layer[] {
  const out: Layer[] = [
    { label: "Problem", href: "#problem" },
    { label: "Constraints", href: "#constraints" },
    { label: "Architecture", href: "#architecture" },
    { label: "Hard parts", href: "#hard" },
  ];
  if (s.broke) out.push({ label: "What broke", href: "#broke" });
  if (s.flaws?.length) out.push({ label: "Known flaws", href: "#flaws" });
  if (s.differently.length) out.push({ label: "Next iteration", href: "#next" });
  out.push({ label: "Receipts", href: "#receipts" });
  return out;
}

export const noteId = (i: number) => `s-${i + 1}`;

export function noteSections(n: Note): Layer[] {
  return n.sections.flatMap((s, i) => (s.heading ? [{ label: s.heading, href: `#${noteId(i)}` }] : []));
}

export function layersFor(view: View, sys?: SystemCase, note?: Note): Layer[] {
  switch (view) {
    case "home":
      return boardFrames.map((f) => ({ label: f.name, focus: f.id, sub: f.n })).concat([{ label: "Hero", focus: "hero", sub: "00" }]);
    case "systems":
      return systems.map((s) => ({ label: s.shortTitle, href: `/systems/${s.slug}`, sub: s.index }));
    case "system":
      return sys ? systemSections(sys) : [];
    case "projects":
      return stage.map((s) => ({ label: s.title, href: `#p-${s.slug}`, sub: s.tag === "Buyhatke" ? "Work" : "Own" }));
    case "lab":
      return labItems.map((l, i) => ({ label: l.title, href: `/lab#${l.slug}`, sub: String(i + 1).padStart(2, "0") }));
    case "notes":
      return notes.map((n) => ({ label: n.title, href: `/notes/${n.slug}`, sub: n.date }));
    case "note":
      return note ? noteSections(note) : [];
    case "about":
      return [
        { label: "Credits", href: "#credits" },
        { label: "Version history", href: "#history" },
        { label: "Principles", href: "#principles" },
        { label: "Currently", href: "#currently" },
        { label: "Commit ledger", href: "#ledger" },
        { label: "Contact", href: "#contact" },
      ];
    default:
      return [];
  }
}
