import { labItems, systems, type SystemCase } from "@/lib/site";

export type PlantKind =
  | "cache"
  | "merge"
  | "fanout"
  | "cluster"
  | "pipeline"
  | "pulse"
  | "rack"
  | "pick"
  | "watch"
  | "race"
  | "ttl"
  | "route"
  | "flush";

export type Specimen = {
  id: string;
  latin: string;
  common: string;
  kind: "system" | "lab";
  plant: PlantKind;
  metric: { value: string; label: string };
  line: string;
  family: string;
  href: string;
  hue: Hue;
  system?: SystemCase;
  variant?: string;
};

export type Hue = "lime" | "sage" | "chart" | "coral" | "lilac" | "glass" | "mint";

const sysMeta: Record<string, { latin: string; plant: PlantKind; hue: Hue; variant?: string; metric?: number }> = {
  flights: { latin: "Cachea refinata", plant: "cache", hue: "lime" },
  hotels: { latin: "Hospitium unicum", plant: "merge", hue: "lilac", metric: 1 },
  food: { latin: "Culina septemplex", plant: "fanout", hue: "coral", variant: "apps" },
  grocery: { latin: "Mensura sarcinae", plant: "cluster", hue: "chart" },
  categorizer: { latin: "Nullum oraculum", plant: "pipeline", hue: "sage", variant: "nollm", metric: 2 },
  search: { latin: "Extractio fidelis", plant: "pipeline", hue: "mint", variant: "validate" },
  cabs: { latin: "Vehiculum ubique", plant: "fanout", hue: "glass", variant: "rides" },
  observability: { latin: "Silentium vigilans", plant: "pulse", hue: "lilac" },
  "local-llm": { latin: "Machina solitaria", plant: "rack", hue: "coral" },
  "best-way-to-pay": { latin: "Pecunia minima", plant: "pick", hue: "lime" },
  "deal-bots": { latin: "Vigil pretii", plant: "watch", hue: "sage", metric: 1 },
};

const labMeta: Record<string, { latin: string; plant: PlantKind; hue: Hue; variant?: string; from?: string }> = {
  "cache-key": { latin: "Clavis memoriae", plant: "cache", hue: "chart", variant: "key", from: "flights" },
  deadlines: { latin: "Tardigrada ultima", plant: "race", hue: "coral", from: "hotels" },
  identity: { latin: "Nomen fallax", plant: "merge", hue: "mint", variant: "impostors", from: "hotels" },
  logs: { latin: "Clamor absens", plant: "pulse", hue: "glass", variant: "rules", from: "observability" },
  memcached: { latin: "Memoria fugax", plant: "ttl", hue: "lilac" },
  "load-balancer": { latin: "Libra ponderata", plant: "route", hue: "lime" },
  "vortex-vault": { latin: "Vortex duplex", plant: "flush", hue: "sage" },
};

export const systemSpecimens: Specimen[] = systems.map((s) => {
  const m = sysMeta[s.slug] ?? { latin: "Systema ignotum", plant: "pipeline" as PlantKind, hue: "sage" as Hue };
  const metric = s.metrics[m.metric ?? 0] ?? s.metrics[0];
  return {
    id: s.slug,
    latin: s.title,
    common: s.category,
    kind: "system",
    plant: m.plant,
    metric: { value: metric.value, label: metric.label },
    line: s.promise,
    family: s.category,
    href: `/systems/${s.slug}`,
    hue: m.hue,
    system: s,
    variant: m.variant,
  };
});

export const labSpecimens: Specimen[] = labItems.map((l) => {
  const m = labMeta[l.slug] ?? { latin: "Experimentum", plant: "pipeline" as PlantKind, hue: "sage" as Hue };
  return {
    id: l.slug,
    latin: l.title,
    common: l.detail,
    kind: "lab",
    plant: m.plant,
    metric: { value: l.year, label: l.detail },
    line: l.detail,
    family: "Propagation bench",
    href: `/lab#${l.slug}`,
    hue: m.hue,
    variant: m.variant,
    system: m.from ? systems.find((s) => s.slug === m.from) : undefined,
  };
});

// Woven order for the wall so systems and experiments mix.
export const wall: Specimen[] = (() => {
  const out: Specimen[] = [];
  const a = [...systemSpecimens];
  const b = [...labSpecimens];
  while (a.length || b.length) {
    if (a.length) out.push(a.shift()!);
    if (a.length) out.push(a.shift()!);
    if (b.length) out.push(b.shift()!);
  }
  return out;
})();

export const latinFor = (slug: string) => systems.find((x) => x.slug === slug)?.title ?? slug;
export const specimenFor = (slug: string) => systemSpecimens.find((s) => s.id === slug);
export const labSpecimen = (slug: string) => labSpecimens.find((s) => s.id === slug);
