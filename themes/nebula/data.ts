import { stage, systems } from "@/lib/site";
import type { ChartItem } from "./chart";

const caseOf: Record<string, string> = { "bh-flights": "flights", "bh-hotels": "hotels", "bh-food": "food", "bh-grocery": "grocery" };

export function stageHref(slug: string) {
  return caseOf[slug] ? `/systems/${caseOf[slug]}` : `/projects?work=${slug}`;
}

export function stageCase(slug: string) {
  return caseOf[slug];
}

export const chartItems: ChartItem[] = [
  ...stage.map<ChartItem>((s, i) => ({
    id: `tile:${s.slug}`,
    no: i + 1,
    kind: "tile",
    href: stageHref(s.slug),
    title: s.title,
    sub: `Recording · ${s.tag}`,
    poster: s.poster,
  })),
  ...systems.map<ChartItem>((s, i) => ({
    id: `metric:${s.slug}`,
    no: stage.length + i + 1,
    kind: "metric",
    href: `/systems/${s.slug}`,
    title: s.title,
    sub: `${s.metrics[0]?.value} ${s.metrics[0]?.label}`,
    value: s.metrics[0]?.value,
  })),
];

// Decorative sky coordinates for plate headers.
export function coords(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const ra = `${String(h % 24).padStart(2, "0")}h ${String((h >>> 5) % 60).padStart(2, "0")}m`;
  const dec = `${h % 2 ? "+" : "−"}${String((h >>> 9) % 90).padStart(2, "0")}° ${String((h >>> 3) % 60).padStart(2, "0")}′`;
  return `RA ${ra} · Dec ${dec}`;
}
