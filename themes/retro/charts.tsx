"use client";

import { useId, useState, type CSSProperties, type PointerEvent } from "react";

type Ser = { label: string; color: string; data: number[] };

const W = 720;
const H = 220;
const PAD = { l: 44, r: 16, t: 16, b: 28 };

function smooth(points: [number, number][]) {
  if (points.length < 3) return points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function Spark({
  data,
  color = "var(--r-blue)",
  height = 34,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 120;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * (w - 4) + 2,
    height - 3 - ((v - min) / span) * (height - 8),
  ]);
  const line = smooth(pts);
  const area = `${line} L${w - 2},${height} L2,${height} Z`;
  const id = useId().replace(/:/g, "");
  return (
    <svg className="rt-spark" viewBox={`0 0 ${w} ${height}`} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        pathLength={1}
        className="rt-draw"
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color} className="rt-spark-dot" />
    </svg>
  );
}

export function LineChart({
  labels,
  series,
  height = 230,
  unit = "",
  animated = true,
  delay = 0,
}: {
  labels: string[];
  series: readonly Ser[];
  height?: number;
  unit?: string;
  animated?: boolean;
  delay?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const n = labels.length;
  const max = Math.max(...series.flatMap((s) => s.data)) * 1.15;
  const min = 0;
  const x = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round((max - (max - min) * t) * 10) / 10);
  const every = Math.max(1, Math.ceil(n / 6));

  const paths = series.map((s) => ({
    ...s,
    d: smooth(s.data.map((v, i) => [x(i), y(v)] as [number, number])),
  }));

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const raw = ((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1);
    setHover(Math.max(0, Math.min(n - 1, Math.round(raw))));
  };

  return (
    <div className="rt-chart" style={{ "--rt-chart-h": `${height}px` } as CSSProperties}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${series.map((s) => s.label).join(", ")} over time`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.label} id={`${uid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={i === 0 ? 0.2 : 0.08} />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="rt-grid" />
            <text x={PAD.l - 9} y={y(t) + 3.5} textAnchor="end" className="rt-axis">
              {t}
              {unit}
            </text>
            {i === ticks.length - 1 && null}
          </g>
        ))}
        {labels.map((l, i) =>
          i % every === 0 || i === n - 1 ? (
            <text key={l} x={x(i)} y={H - 8} textAnchor="middle" className="rt-axis">
              {l}
            </text>
          ) : null,
        )}
        {paths.map((s, i) => (
          <g key={s.label}>
            <path
              d={`${s.d} L${x(n - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`}
              fill={`url(#${uid}-g${i})`}
              className={animated ? "rt-area" : undefined}
              style={{ animationDelay: `${delay + i * 0.1}s` } as CSSProperties}
            />
            <path
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              pathLength={1}
              className={animated ? "rt-draw" : undefined}
              style={{ animationDelay: `${delay + i * 0.12}s` } as CSSProperties}
            />
          </g>
        ))}
        {hover != null && (
          <g className="rt-cross">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} />
            {series.map((s) => (
              <circle key={s.label} cx={x(hover)} cy={y(s.data[hover])} r="4" fill={s.color} stroke="var(--r-card)" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>
      {hover != null && (
        <div
          className="rt-tip"
          style={{ left: `${Math.min(84, Math.max(16, (x(hover) / W) * 100))}%` }}
        >
          <b>{labels[hover]}</b>
          {series.map((s) => (
            <span key={s.label}>
              <i style={{ background: s.color }} />
              {s.label}
              <em>
                {s.data[hover]}
                {unit}
              </em>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({
  segments,
  center,
  label,
}: {
  segments: { label: string; value: number; color: string }[];
  center: string;
  label: string;
}) {
  const size = 156;
  const r = 62;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const rings: { label: string; color: string; dash: string; off: number }[] = [];
  let acc = 0;
  for (const s of segments) {
    const len = (s.value / total) * c;
    const drawn = Math.max(0, len - 4);
    rings.push({ label: s.label, color: s.color, dash: `${drawn} ${c - drawn}`, off: -acc });
    acc += len;
  }
  return (
    <div className="rt-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="rt-donut" role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--r-line-soft)" strokeWidth="14" />
        {rings.map((s, i) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={s.dash}
            strokeDashoffset={s.off}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="rt-donut-seg"
            style={{ animationDelay: `${i * 0.12}s` } as CSSProperties}
          />
        ))}
      </svg>
      <div className="rt-donut-c">
        <b>{center}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}
