import { stage, systems } from "@/lib/site";
import type { CosmosItem } from "./cosmos";

const caseOf: Record<string, string> = { "bh-flights": "flights", "bh-hotels": "hotels", "bh-food": "food", "bh-grocery": "grocery" };

export function stageHref(slug: string) {
  return caseOf[slug] ? `/systems/${caseOf[slug]}` : `/projects?work=${slug}`;
}

export function stageCase(slug: string) {
  return caseOf[slug];
}

const tiles: CosmosItem[] = stage.map((s) => ({
  id: `tile:${s.slug}`,
  kind: "tile",
  href: stageHref(s.slug),
  title: s.title,
  sub: caseOf[s.slug] ? `Recording · ${s.tag} · open the system` : `Recording · ${s.tag} · open the project`,
  poster: s.poster,
}));

const metrics: CosmosItem[] = systems.map((s) => ({
  id: `metric:${s.slug}`,
  kind: "metric",
  href: `/systems/${s.slug}`,
  title: s.title,
  sub: `${s.metrics[0]?.value} ${s.metrics[0]?.label} · open the system`,
  value: s.metrics[0]?.value,
  label: s.metrics[0]?.label,
}));

// Interleave recordings and metric stars along the flight path.
export const cosmosItems: CosmosItem[] = (() => {
  const out: CosmosItem[] = [];
  const n = Math.max(tiles.length, metrics.length);
  for (let i = 0; i < n; i++) {
    if (tiles[i]) out.push(tiles[i]);
    if (metrics[i]) out.push(metrics[i]);
  }
  return out;
})();
