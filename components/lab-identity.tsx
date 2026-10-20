"use client";

import { useState } from "react";
import { PartnerLogo } from "@/components/partner-logo";

type Rec = { id: string; p: string; name: string; x: number; y: number; sim: number; truth: boolean };

// Positions are in metres from the real hotel; sim is a name-similarity score.
const records: Rec[] = [
  { id: "a", p: "mmt", name: "The Park Bangalore", x: 0, y: 0, sim: 0.98, truth: true },
  { id: "b", p: "booking", name: "The Park, Bengaluru", x: 40, y: -30, sim: 0.94, truth: true },
  { id: "c", p: "agoda", name: "Park Hotel Bangalore", x: -70, y: 50, sim: 0.82, truth: true },
  { id: "d", p: "goibibo", name: "THE PARK HOTEL", x: 110, y: 80, sim: 0.9, truth: true },
  { id: "e", p: "expedia", name: "The Park Residency", x: 620, y: -300, sim: 0.88, truth: false },
  { id: "f", p: "kayak", name: "The Park Hotel", x: 2400, y: 900, sim: 0.96, truth: false },
  { id: "g", p: "cleartrip", name: "Park Plaza", x: -450, y: 380, sim: 0.7, truth: false },
];

export function IdentityLab() {
  const [geo, setGeo] = useState(true);
  const [radius, setRadius] = useState(300);
  const [strict, setStrict] = useState(0.8);

  const merged = records.filter((r) => r.sim >= strict && (!geo || Math.hypot(r.x, r.y) <= radius));
  const wrong = merged.filter((r) => !r.truth).length;
  const missed = records.filter((r) => r.truth && !merged.includes(r)).length;
  const scale = 0.085;

  return (
    <div className="lab2">
      <div className="lab2-controls">
        <div className="lab2-chips">
          <button className={geo ? "is-on" : ""} onClick={() => setGeo(!geo)}>
            Geo gate {geo ? "on" : "off"}
          </button>
        </div>
        <div className="lab2-group">
          <span className="lab2-k">Distance gate · {radius} m</span>
          <input className="lab2-range" type="range" min={50} max={3000} step={50} value={radius} disabled={!geo} onChange={(e) => setRadius(Number(e.target.value))} />
        </div>
        <div className="lab2-group">
          <span className="lab2-k">Name strictness · {strict.toFixed(2)}</span>
          <input className="lab2-range" type="range" min={0.5} max={1} step={0.02} value={strict} onChange={(e) => setStrict(Number(e.target.value))} />
        </div>
      </div>

      <div className="lab2-grid">
        <div className="lab2-map">
          <svg viewBox="-260 -160 520 320" role="img" aria-label="Partner records around one real hotel">
            {geo ? <circle r={radius * scale} className="lab2-gate" /> : null}
            {merged.map((r) => (
              <line key={r.id} x1={0} y1={0} x2={r.x * scale} y2={r.y * scale} className={r.truth ? "lab2-link" : "lab2-link bad"} />
            ))}
            <circle r={9} className="lab2-hotel" />
            {records.map((r) => {
              const on = merged.includes(r);
              return (
                <g key={r.id} transform={`translate(${Math.max(-240, Math.min(240, r.x * scale))} ${Math.max(-145, Math.min(145, r.y * scale))})`} opacity={on ? 1 : 0.35}>
                  <foreignObject x={-13} y={-13} width={26} height={26}>
                    <PartnerLogo id={r.p} size={26} />
                  </foreignObject>
                  {on ? <circle r={16} className={r.truth ? "lab2-ring" : "lab2-ring bad"} /> : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="lab2-panel">
          <span className="lab2-k">Verdict</span>
          <div className={`lab2-verdict ${wrong ? "is-bad" : "is-hit"}`}>
            {wrong
              ? `Wrong merge: ${wrong} different hotel${wrong > 1 ? "s" : ""} joined this one.`
              : missed
                ? `Safe, but ${missed} real record${missed > 1 ? "s" : ""} left out.`
                : "Clean: every record is the same hotel."}
            <i />
          </div>
          <ul className="lab2-flights">
            {records.map((r) => (
              <li key={r.id} data-on={merged.includes(r) ? "" : undefined}>
                <PartnerLogo id={r.p} size={22} />
                <span>{r.name}</span>
                <em>
                  {Math.round(Math.hypot(r.x, r.y))} m · {r.sim.toFixed(2)}
                </em>
                <strong>{merged.includes(r) ? "merged" : "apart"}</strong>
              </li>
            ))}
          </ul>
          <p className="lab2-note">
            A name alone is not an identity: two different hotels can share one. A wrong merge shows the wrong price for the wrong place, so a missing partner is the cheaper mistake.
          </p>
        </div>
      </div>
    </div>
  );
}
