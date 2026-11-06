"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { type Specimen } from "./data";
import { benchFor, vortexParts } from "./demos";
import { Arrow, GrowDialog, Leaf, originOf, Unfurl, type Origin } from "./kit";
import { Plant } from "./plants";

export function SpecimenCard({ s, n, onOpen, i = 0 }: { s: Specimen; n: number; onOpen: (s: Specimen, o: Origin) => void; i?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const open = () => onOpen(s, originOf(ref.current));
  return (
    <Unfurl as="article" className="mo-spec" delay={(i % 4) * 70} style={{ "--ph": `${(n * 0.37) % 1}`, "--mo-i": i } as CSSProperties}>
      <div className="mo-spec-body" data-hue={s.hue} ref={ref}>
        <span className="mo-spec-pin" aria-hidden="true" />
        <Leaf className="mo-spec-leaf" />
        <header className="mo-spec-head">
          <span className="mo-k">
            № {String(n).padStart(2, "0")} · {s.kind === "system" ? "System" : "Experiment"}
          </span>
          <button type="button" className="mo-spec-name" onClick={open} aria-haspopup="dialog" data-cursor="Examine">
            <em>{s.latin}</em>
            <b>{s.common}</b>
          </button>
        </header>
        <Plant s={s} />
        <footer className="mo-spec-foot">
          <span className="mo-spec-metric">
            <b>{s.metric.value}</b>
            <span>{s.metric.label}</span>
          </span>
          <button type="button" className="mo-spec-open" onClick={open} aria-label={`Examine ${s.common}`} aria-haspopup="dialog">
            <Arrow up />
          </button>
        </footer>
      </div>
    </Unfurl>
  );
}

export function useSpecimenDialog() {
  const [cur, setCur] = useState<{ s: Specimen; o: Origin } | null>(null);
  const open = (s: Specimen, o: Origin) => setCur({ s, o });
  const node = (
    <GrowDialog open={!!cur} origin={cur?.o ?? null} onClose={() => setCur(null)} label={cur ? `${cur.s.common}, specimen` : "Specimen"} className={cur ? `mo-hue-${cur.s.hue}` : ""}>
      {cur && <SpecimenSheet s={cur.s} />}
    </GrowDialog>
  );
  return { open, node };
}

function SpecimenSheet({ s }: { s: Specimen }) {
  if (s.kind === "lab") {
    const b = benchFor(s.id);
    return (
      <div className="mo-sheet mo-sheet-lab">
        <header className="mo-sheet-head">
          <span className="mo-k">Experiment · {b?.label}</span>
          <h2>
            <em>{s.latin}</em>
          </h2>
          <p className="mo-sheet-common">{s.common}</p>
          <p className="mo-sheet-line">{b?.note}</p>
        </header>
        <div className="mo-sheet-demo">
          {b?.demo ?? (
            <div className="mo-vortex">
              <Plant s={s} big />
              <ol className="mo-parts">
                {vortexParts.map(([l, d], i) => (
                  <li key={l} style={{ "--i": i } as CSSProperties}>
                    <b>{l}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <div className="mo-sheet-cta">
          <Link className="mo-btn" href={`/lab#${s.id}`}>
            Open on the propagation bench <Arrow />
          </Link>
          {b?.from && (
            <Link className="mo-btn mo-btn-ghost" href={`/systems/${b.from.slug}`}>
              Grown from: {b.from.title} <Arrow />
            </Link>
          )}
        </div>
      </div>
    );
  }
  const c = s.system!;
  return (
    <div className="mo-sheet">
      <header className="mo-sheet-head">
        <span className="mo-k">
          Plate {c.index}
        </span>
        <h2>
          <em>{s.latin}</em>
        </h2>
        <p className="mo-sheet-common">{c.title}</p>
        <p className="mo-sheet-line">{c.promise}</p>
      </header>
      <div className="mo-sheet-grid">
        <div className="mo-sheet-play">
          <Plant s={s} big />
        </div>
        <div className="mo-sheet-copy">
          <p>{c.summary}</p>
          <dl className="mo-sheet-metrics">
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
          <ol className="mo-parts">
            {c.architecture.map((a, i) => (
              <li key={a.label} style={{ "--i": i } as CSSProperties}>
                <b>{a.label}</b>
                <span>{a.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mo-sheet-cta">
        <Link className="mo-btn" href={`/systems/${c.slug}`}>
          Read the full plate <Arrow />
        </Link>
        <span className="mo-sheet-role">
          {c.role} · {c.year}
        </span>
      </div>
    </div>
  );
}
