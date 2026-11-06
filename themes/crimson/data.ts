import { getSystem, labItems, notes, projects, stage, systems } from "@/lib/site";

export type Chip = { id: string; value: string; label: string; href: string; title: string; tone: number };

// [system slug, "m" metric or "r" receipt, index]
const picks: [string, "m" | "r", number][] = [
  ["flights", "m", 0],
  ["categorizer", "r", 2],
  ["flights", "m", 1],
  ["hotels", "m", 1],
  ["best-way-to-pay", "m", 0],
  ["observability", "m", 1],
  ["categorizer", "m", 0],
  ["categorizer", "m", 3],
  ["observability", "m", 0],
  ["hotels", "m", 3],
  ["flights", "m", 2],
  ["cabs", "m", 0],
  ["food", "m", 0],
  ["grocery", "m", 0],
  ["search", "m", 0],
  ["local-llm", "m", 1],
  ["best-way-to-pay", "m", 2],
  ["observability", "m", 3],
  ["cabs", "m", 1],
  ["search", "m", 2],
];

export const chips: Chip[] = picks.flatMap(([slug, kind, i], n) => {
  const s = getSystem(slug);
  if (!s) return [];
  const m = kind === "m" ? s.metrics[i] : s.receipts[i];
  if (!m) return [];
  return [{ id: `chip-${n}`, value: m.value, label: m.label, href: `/systems/${slug}`, title: s.title, tone: n % 4 }];
});

export const recordingFor = (slug: string) => stage.find((x) => x.slug === `bh-${slug}`);

export const afterHours = stage.filter((x) => x.tag === "After hours");
export const dayJob = stage.filter((x) => x.tag !== "After hours");

export const projectFor = (slug: string) => projects.find((p) => p.slug === slug);

export const counts = {
  systems: systems.length,
  projects: projects.length,
  lab: labItems.length,
  notes: notes.length,
};

export const pad = (n: number) => String(n).padStart(2, "0");
