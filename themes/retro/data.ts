import { systems } from "@/lib/site";

export type Op = {
  slug: string;
  name: string;
  code: string;
  volume: number;
  success: number;
  errors: number;
  delay: number;
  spark: number[];
};

const scales = [478, 226, 190, 96, 610, 142, 84, 57, 33, 48, 61];

const spark = (seed: number, n = 24, base = 50, amp = 34) => {
  const out: number[] = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    v = Math.max(6, Math.min(100, v + (r - 0.48) * amp));
    out.push(Math.round(v * 10) / 10);
  }
  return out;
};

export const ops: Op[] = systems.map((s, i) => {
  const seed = 17 + i * 31;
  const errors = Math.round((0.3 + ((i * 13) % 17) / 10) * 100) / 100;
  return {
    slug: s.slug,
    name: s.shortTitle,
    code: `POS-${s.index}`,
    volume: scales[i] ?? 40,
    success: Math.round((100 - errors) * 100) / 100,
    errors,
    delay: 40 + ((i * 23) % 210),
    spark: spark(seed),
  };
});

export const onWatch = (o: { errors: number }) => o.errors > 1.5;
export const watchCount = ops.filter(onWatch).length;

export const opFor = (slug: string) => ops.find((o) => o.slug === slug) ?? ops[0];

export const fmt = (n: number) => n.toLocaleString("en-IN");

export const pct = (n: number) => `${n.toFixed(2)}%`;

export const totalVolume = ops.reduce((a, o) => a + o.volume, 0);

export function series(n: number, seed: number, base: number, amp: number, drift = 0): number[] {
  const out: number[] = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const wave = Math.sin(i / 3.4 + seed) * amp * 0.42;
    v = Math.max(2, v + (r - 0.5) * amp + wave * 0.3 + drift);
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

export const ranges = {
  "24H": { n: 24, labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`) },
  "7D": { n: 14, labels: Array.from({ length: 14 }, (_, i) => `D${i + 1}`) },
  "30D": { n: 30, labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`) },
} as const;

export type RangeKey = keyof typeof ranges;

export const trendSeries = [
  { id: "chrome", label: "Chrome", color: "var(--r-blue)" },
  { id: "android", label: "Android", color: "var(--r-orange)" },
  { id: "email", label: "Email", color: "var(--r-red)" },
] as const;

export function trendData(range: RangeKey, seed: number) {
  const n = ranges[range].n;
  return {
    labels: ranges[range].labels,
    series: [
      { ...trendSeries[0], data: series(n, seed + 3, range === "24H" ? 44 : 58, 26, -0.3) },
      { ...trendSeries[1], data: series(n, seed + 11, range === "24H" ? 28 : 34, 20, -0.2) },
      { ...trendSeries[2], data: series(n, seed + 23, range === "24H" ? 14 : 18, 14, -0.1) },
    ],
  };
}

export const eventSeries = [
  { id: "feed", label: "Feed updates", color: "var(--r-blue)" },
  { id: "received", label: "Feed received", color: "var(--r-teal)" },
  { id: "price", label: "Price updates", color: "var(--r-purple)" },
  { id: "push", label: "Push success", color: "var(--r-green)" },
  { id: "email", label: "Email success", color: "var(--r-orange)" },
] as const;

export function eventData(seed: number) {
  return eventSeries.map((s, i) => ({
    ...s,
    data: series(16, seed + i * 19, 62 - i * 7, 18, -0.15),
  }));
}

export const delivery = [
  { label: "Push delivered", value: 96.4, color: "var(--r-green)" },
  { label: "Email delivered", value: 92.1, color: "var(--r-blue)" },
  { label: "Delayed > 60s", value: 4.8, color: "var(--r-orange)" },
  { label: "Hard failures", value: 1.6, color: "var(--r-red)" },
];

export const alerts = [
  {
    id: "ALT-4821",
    severity: "critical" as const,
    title: "p99 breach · flight provider",
    body: "Skyscanner poll p99 crossed 940ms for 6 minutes. Failover cache serving.",
    system: "Flights",
    time: "2m ago",
  },
  {
    id: "ALT-4818",
    severity: "warning" as const,
    title: "Delayed notifications",
    body: "Android push queue is 74s behind. Auto-drain scheduled at 12:40.",
    system: "Notifications",
    time: "11m ago",
  },
  {
    id: "ALT-4813",
    severity: "resolved" as const,
    title: "Cache miss spike",
    body: "Hotel search cache key rotated. Hit rate recovered to 98.2%.",
    system: "Hotels",
    time: "26m ago",
  },
];

export const kpis = [
  {
    k: "Requests / day",
    v: `${(totalVolume / 1000).toFixed(2)}M`,
    delta: "+12.4%",
    dir: "up" as const,
    note: "across 11 surfaces",
    data: spark(91),
    color: "var(--r-blue)",
  },
  {
    k: "Result events / day",
    v: "3.79M",
    delta: "+8.1%",
    dir: "up" as const,
    note: "normalized & deduped",
    data: spark(57),
    color: "var(--r-purple)",
  },
  {
    k: "p99 latency",
    v: "20ms",
    delta: "-3.2%",
    dir: "down" as const,
    note: "hot path, edge cached",
    data: spark(23),
    color: "var(--r-green)",
  },
  {
    k: "Alert precision",
    v: "99.1%",
    delta: "+0.4%",
    dir: "up" as const,
    note: "1.18M labeled examples",
    data: spark(79),
    color: "var(--r-orange)",
  },
];
