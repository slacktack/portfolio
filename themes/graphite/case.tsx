"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, type SystemCase } from "@/lib/site";
import { Gx, Tact } from "./lens";

// Pannable, zoomable architecture board built from the case's own pipeline.
function Schematic({ s }: { s: SystemCase }) {
  const [z, setZ] = useState(1);
  const [p, setP] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const zoom = (d: number) => setZ((v) => Math.min(2.4, Math.max(0.3, +(v + d).toFixed(2))));
  const n = s.architecture.length;
  const W = Math.max(1100, n * 250);
  const view = useRef<HTMLDivElement>(null);
  const fit = () => {
    const w = view.current?.clientWidth ?? W;
    setZ(Math.max(0.3, Math.min(1, +(w / W).toFixed(2))));
    setP({ x: 0, y: 0 });
  };
  useEffect(fit, [W]);

  return (
    <div className="gr-schem">
      <div className="gr-schem-bar">
        <span className="gr-kick">Schematic · {s.shortTitle}</span>
        <div className="gr-schem-ctl">
          <button type="button" onClick={() => zoom(-0.2)} aria-label="Zoom out">
            −
          </button>
          <output aria-live="polite">×{z.toFixed(1)}</output>
          <button type="button" onClick={() => zoom(0.2)} aria-label="Zoom in">
            +
          </button>
          <button
            type="button"
            onClick={fit}
          >
            Fit
          </button>
        </div>
      </div>
      <div
        ref={view}
        className="gr-schem-view"
        tabIndex={0}
        aria-label="Architecture schematic. Drag or use arrow keys to pan, plus and minus to zoom."
        data-lenis-prevent=""
        onPointerDown={(e) => {
          if ((e.target as Element).closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: p.x, py: p.y };
          e.currentTarget.dataset.drag = "";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) setP({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
        }}
        onPointerUp={(e) => {
          drag.current = null;
          delete e.currentTarget.dataset.drag;
        }}
        onWheel={(e) => zoom(e.deltaY > 0 ? -0.1 : 0.1)}
        onKeyDown={(e) => {
          const k: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
          if (k[e.key]) {
            e.preventDefault();
            setP((v) => ({ x: v.x + k[e.key][0], y: v.y + k[e.key][1] }));
          } else if (e.key === "+" || e.key === "=") zoom(0.2);
          else if (e.key === "-") zoom(-0.2);
        }}
      >
        <div className="gr-schem-board" style={{ width: W, transform: `translate(${p.x}px, ${p.y}px) scale(${z})` } as CSSProperties}>
          <svg className="gr-schem-wires" viewBox={`0 0 ${W} 520`} aria-hidden="true">
            {s.architecture.slice(1).map((_, i) => {
              const x1 = 60 + i * ((W - 240) / Math.max(1, n - 1)) + 180;
              const y1 = i % 2 ? 330 : 150;
              const x2 = 60 + (i + 1) * ((W - 240) / Math.max(1, n - 1));
              const y2 = (i + 1) % 2 ? 330 : 150;
              return <path key={i} d={`M${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`} />;
            })}
          </svg>
          {s.architecture.map((a, i) => (
            <div
              className="gr-node"
              key={a.label}
              style={{ left: 60 + i * ((W - 240) / Math.max(1, n - 1)), top: i % 2 ? 270 : 90 } as CSSProperties}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              <b>{a.label}</b>
              <span>{a.detail}</span>
            </div>
          ))}
          <ul className="gr-schem-rail">
            {s.rail.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <span className="gr-schem-scale" aria-hidden="true" />
      </div>
    </div>
  );
}

function Sec({ k, title, children }: { k: string; title: string; children: ReactNode }) {
  return (
    <section className="gr-sec" data-r="">
      <div className="gr-sec-side">
        <span className="gr-sec-k">{k}</span>
        <h2>{title}</h2>
      </div>
      <div className="gr-sec-body">{children}</div>
    </section>
  );
}

export function Case({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  let k = 0;
  const nk = () => String(++k).padStart(2, "0");
  return (
    <article className="gr-case">
      <header className="gr-case-head">
        <p className="gr-kick" data-r="">
          <Link href="/systems">Systems</Link> / {s.index} · {s.category} · {s.year}
        </p>
        <Gx
          label={s.title}
          className="gr-case-gx"
          xray={
            <div className="gx-arch">
              {s.architecture.map((a, i) => (
                <span key={a.label}>
                  <b>{a.label}</b>
                  {a.detail}
                  {i < s.architecture.length - 1 && <i>→</i>}
                </span>
              ))}
            </div>
          }
        >
          <Tact as="h1" className="gr-giant" text={s.title} />
          <p className="gr-case-promise">{s.promise}</p>
        </Gx>
        <dl className="gr-readouts">
          {s.metrics.map((m, i) => (
            <div key={m.label} data-r="" style={{ "--gi": i } as CSSProperties}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
              {m.note && <small>{m.note}</small>}
            </div>
          ))}
        </dl>
        <p className="gr-case-sum" data-r="">
          {s.summary}
        </p>
        <p className="gr-case-meta" data-r="">
          {s.role} · {s.stack.join(" / ")}
        </p>
      </header>

      <Schematic s={s} />

      <div className="gr-plate" data-r="">
        <span className="gr-kick">Specimen · live diagram</span>
        <div className="gr-plate-box">
          <SystemArtifact kind={s.artifact} />
        </div>
      </div>

      <div className="gr-read">
        <Sec k={nk()} title="Problem">
          {s.problem.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Sec>
        <Sec k={nk()} title="Constraints">
          <ol className="gr-list">
            {s.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </Sec>
        <Sec k={nk()} title="The hard part">
          <div className="gr-cards">
            {s.hardPart.map((h) => (
              <div key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </Sec>
        {s.broke && (
          <Sec k={nk()} title="What broke">
            <div className="gr-broke">
              <h3>{s.broke.title}</h3>
              <p>{s.broke.body}</p>
            </div>
          </Sec>
        )}
        {s.flaws && s.flaws.length > 0 && (
          <Sec k={nk()} title="Known flaws">
            <div className="gr-cards">
              {s.flaws.map((f) => (
                <div key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </Sec>
        )}
        <Sec k={nk()} title="What I'd do differently">
          <ol className="gr-list">
            {s.differently.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
        </Sec>
        <Sec k={nk()} title="What it proves">
          <ul className="gr-chips">
            {s.proves.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Sec>
        <Sec k={nk()} title="Receipts">
          <dl className="gr-receipts">
            {s.receipts.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
                <p>{r.detail}</p>
              </div>
            ))}
          </dl>
        </Sec>
      </div>

      {next && (
        <Link href={`/systems/${next.slug}`} className="gr-next">
          <span className="gr-kick">Next under the lens · {next.index}</span>
          <Tact className="gr-big" text={next.title} />
        </Link>
      )}
    </article>
  );
}
