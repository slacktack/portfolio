import { labItems, notes, projects, stage, systems } from "@/lib/site";
import type { ArtifactKind, StageItem } from "@/lib/site";

export type Kind = "system" | "project" | "lab" | "note";
export type Cat = "all" | "systems" | "projects" | "lab" | "notes";

export type Work = {
  id: string;
  kind: Kind;
  slug: string;
  code: string;
  title: string;
  line: string;
  badge: string;
  year: string;
  thumb?: string;
  href?: string;
};

export const catOf: Record<Kind, Exclude<Cat, "all">> = { system: "systems", project: "projects", lab: "lab", note: "notes" };

export const cats: { id: Cat; label: string; href: string; tone: string }[] = [
  { id: "all", label: "All", href: "/", tone: "var(--nt-ink)" },
  { id: "systems", label: "Systems", href: "/systems", tone: "var(--nt-flare)" },
  { id: "projects", label: "Projects", href: "/projects", tone: "var(--nt-peri)" },
  { id: "lab", label: "Lab", href: "/lab", tone: "var(--nt-amber)" },
  { id: "notes", label: "Notes", href: "/notes", tone: "var(--nt-mint)" },
];

const pad = (i: number) => String(i + 1).padStart(2, "0");

// Production systems that have a real screen recording.
export const systemStage: Record<string, string> = {
  flights: "bh-flights",
  hotels: "bh-hotels",
  food: "bh-food",
  grocery: "bh-grocery",
};

export const stageBy = (slug?: string): StageItem | undefined => (slug ? stage.find((s) => s.slug === slug) : undefined);

export const labSystem: Record<string, { slug: string; artifact: ArtifactKind; title: string }> = {
  "cache-key": { slug: "flights", artifact: "flights", title: "Flight comparison" },
  deadlines: { slug: "hotels", artifact: "hotels", title: "Hotel comparison" },
  identity: { slug: "hotels", artifact: "hotels", title: "Hotel comparison" },
  logs: { slug: "observability", artifact: "observability", title: "OpenObserve platform" },
};

export const works: Work[] = [
  ...systems.map<Work>((s, i) => ({
    id: `system:${s.slug}`,
    kind: "system",
    slug: s.slug,
    code: `SYS·${pad(i)}`,
    title: s.title,
    line: s.promise,
    badge: s.category,
    year: s.year,
    thumb: stageBy(systemStage[s.slug])?.poster,
    href: `/systems/${s.slug}`,
  })),
  ...projects.map<Work>((p, i) => ({
    id: `project:${p.slug}`,
    kind: "project",
    slug: p.slug,
    code: `PRJ·${pad(i)}`,
    title: p.title,
    line: p.tagline,
    badge: p.category,
    year: p.year,
    thumb: stageBy(p.slug)?.poster ?? p.image,
  })),
  ...labItems.map<Work>((l, i) => ({
    id: `lab:${l.slug}`,
    kind: "lab",
    slug: l.slug,
    code: `LAB·${pad(i)}`,
    title: l.title,
    line: l.detail,
    badge: l.year,
    year: l.year,
  })),
  ...notes.map<Work>((n, i) => ({
    id: `note:${n.slug}`,
    kind: "note",
    slug: n.slug,
    code: `NTE·${pad(i)}`,
    title: n.title,
    line: n.dek,
    badge: `${n.category} · ${n.readTime}`,
    year: n.date,
    href: `/notes/${n.slug}`,
  })),
];

export const workBy = (kind: Kind, slug?: string) => works.find((w) => w.kind === kind && w.slug === slug);

export const inCat = (cat: Cat) => (cat === "all" ? works : works.filter((w) => catOf[w.kind] === cat));
